// Thin orchestrator for /chat.
//   sanitize -> guard -> session -> verify tags (once) -> router -> handler -> validate -> respond.

const express = require('express');
const { sanitize, isBlocked } = require('../lib/guardrails');
const {
  getOrCreateSession, bumpSession, getHistory, logMessage,
  setMode, updateModeContext, resetMode, parseModeContext,
  setPremiumFlag, parseCustomerTags, logModeTransition,
} = require('../lib/session');
const { resolveMode } = require('../lib/modeRouter');
const { isPremiumCustomer } = require('../lib/premium');
const { fetchCustomerTags } = require('../lib/shopifyCustomer');

const discoveryHandler = require('../lib/handlers/discovery');
const consultationHandler = require('../lib/handlers/consultation');
const proHandler = require('../lib/handlers/pro');
const pool = require('../db/pool');
const { costForMessage, currentModel } = require('../lib/cost');

const router = express.Router();

// How stale tags_verified_at can be before we re-verify against Shopify.
const TAGS_TTL_MS = 24 * 60 * 60 * 1000; // 24h

async function verifyTagsIfNeeded(sess, req) {
  const clientTags = Array.isArray(req.body?.customer_tags) ? req.body.customer_tags : null;
  const customerId = req.body?.user_id || sess.user_id;
  const verifiedAt = sess.tags_verified_at ? new Date(sess.tags_verified_at).getTime() : 0;
  const stale = !verifiedAt || (Date.now() - verifiedAt) > TAGS_TTL_MS;

  // Not logged in -> clear any prior premium flag, no API call.
  if (!customerId) {
    if (sess.is_premium) await setPremiumFlag(sess.session_id, { tags: [], isPremium: false });
    return { tags: [], isPremium: false, loggedIn: false };
  }

  // If we've verified recently AND client didn't claim a different tag set, trust cache.
  if (!stale && !clientTags) {
    return {
      tags: parseCustomerTags(sess.customer_tags),
      isPremium: !!sess.is_premium,
      loggedIn: true,
    };
  }

  // Verify with Shopify (authoritative). Fallback to client tags only as advisory UX.
  const authoritative = await fetchCustomerTags(customerId);
  const tags = authoritative != null ? authoritative : (clientTags || []);
  const isPremium = isPremiumCustomer(tags);
  await setPremiumFlag(sess.session_id, { tags, isPremium });
  return { tags, isPremium, loggedIn: true };
}

// Server-side invariant: consultation mode never returns products.
function enforceResponseInvariants(response) {
  if (response.mode === 'consultation') {
    if (response.products && response.products.length) {
      console.error('[invariant] consultation response returned products; stripping');
      response.products = [];
    }
  }
  if (response.mode === 'pro') {
    if (response.products && response.products.length) {
      response.products = [];
    }
  }
  return response;
}

router.post('/', async (req, res) => {
  try {
    const raw = req.body?.message;
    const message = sanitize(raw);
    if (!message) return res.status(400).json({ error: 'Empty message' });

    const sess = await getOrCreateSession(req.body?.session_id, {
      userId: req.body?.user_id,
      ip: req.ip,
      ua: req.get('user-agent'),
    });

    if (sess.blocked) return res.status(429).json({ error: 'Session blocked' });

    const guard = isBlocked(message);
    if (guard.blocked) {
      await logMessage({ sessionId: sess.session_id, role: 'user', content: message, intent: 'blocked_' + guard.reason });
      const reply = guard.reason === 'off_topic'
        ? "I can only help with commercial kitchen equipment and restaurant setup. What kitchen gear are you looking for?"
        : "I can only help with kitchen equipment. What can I help you find?";
      await logMessage({ sessionId: sess.session_id, role: 'assistant', content: reply });
      return res.json({
        session_id: sess.session_id,
        reply,
        products: [],
        intent: 'blocked',
        mode: sess.mode || 'discovery',
        ui: { kind: 'plain' },
        message_count: (sess.message_count || 0) + 1,
      });
    }

    // Verify customer tags (cached for 24h on the session row).
    const { tags, isPremium, loggedIn } = await verifyTagsIfNeeded(sess, req);

    // Resolve the mode for this message.
    const modeContext = parseModeContext(sess.mode_context);
    const resolution = resolveMode({
      session: sess,
      message,
      loggedIn,
      isPremium,
      modeHint: req.body?.mode_hint || null,
    });

    // Log the mode transition (if any) and persist the new mode on the session.
    if (resolution.transition) {
      await logModeTransition(sess.session_id, resolution.transition);
      // Reset mode_context when transitioning between top-level modes.
      if (resolution.transition.to !== sess.mode) {
        await setMode(sess.session_id, resolution.mode, null);
      }
    }

    const history = await getHistory(sess.session_id, 6);
    await logMessage({ sessionId: sess.session_id, role: 'user', content: message, intent: 'mode:' + resolution.mode });
    await bumpSession(sess.session_id);

    // Dispatch.
    let handlerResponse;
    if (resolution.mode === 'consultation') {
      // Carry forward modeContext unless the transition reset it above.
      const effectiveCtx = resolution.transition && resolution.transition.to !== sess.mode ? null : modeContext;
      handlerResponse = await consultationHandler.handle({
        message, session: sess,
        modeContext: effectiveCtx,
        transition: resolution.transition,
      });
    } else if (resolution.mode === 'pro') {
      handlerResponse = await proHandler.handle({
        message, session: sess,
        customerId: req.body?.user_id || sess.user_id,
      });
    } else {
      handlerResponse = await discoveryHandler.handle({ message, session: sess, history });
    }

    const response = enforceResponseInvariants({ ...handlerResponse, mode: handlerResponse.mode || resolution.mode });

    // Persist FSM context for consultation.
    if (response.mode === 'consultation' && response.mode_context) {
      await updateModeContext(sess.session_id, response.mode_context);
    }
    // Reset session mode when consultation finishes or user paused to pro.
    if (response.finished || response.transition_to === 'pro_ready') {
      await resetMode(sess.session_id);
    }

    await logMessage({
      sessionId: sess.session_id,
      role: 'assistant',
      content: (response.reply || '').slice(0, 4000),
      intent: response.intent || response.mode,
      tokensIn: response.tokensIn || 0,
      tokensOut: response.tokensOut || 0,
    });

    // Record cost-ledger entry when the handler invoked the LLM.
    if ((response.tokensIn || 0) + (response.tokensOut || 0) > 0) {
      const model = currentModel();
      const cost = costForMessage(model, response.tokensIn, response.tokensOut);
      pool.query(
        'INSERT INTO cost_ledger (session_id, model, tokens_in, tokens_out, cost_usd, mode) VALUES (?,?,?,?,?,?)',
        [sess.session_id, model, response.tokensIn || 0, response.tokensOut || 0, cost, response.mode]
      ).catch(err => console.error('cost_ledger insert failed:', err.message));
    }

    res.json({
      session_id: sess.session_id,
      reply: response.reply,
      products: response.products || [],
      intent: response.intent || response.mode,
      mode: response.mode,
      ui: response.ui || { kind: 'plain' },
      message_count: (sess.message_count || 0) + 1,
      ask_for_lead: response.ask_for_lead || false,
      show_booking: response.show_booking || false,
      is_premium: isPremium,
      logged_in: loggedIn,
    });
  } catch (err) {
    console.error('Chat error:', err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

module.exports = router;
