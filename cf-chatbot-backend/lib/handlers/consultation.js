// Consultation Mode handler — deterministic FSM, one LLM call at summary time.
//
// HARD INVARIANTS (enforced here AND re-validated in routes/chat.js):
//   - products: [] always.
//   - reply never contains product URLs beyond (408) 673-9999.
//   - Does NOT import lib/search.js (static check at top of this file).

const pool = require('../../db/pool');
const { CONSULTATION_SYSTEM_PROMPT, buildConsultationSummaryMessage } = require('../prompt');
const ai = require('../gemini');
const {
  STATES, initialPrompt, advance, normalizeState,
} = require('../consultationFsm');

// --- Pro Mode pause-offer (mid-consultation SKU paste) ---
function buildPauseOfferResponse() {
  return {
    mode: 'consultation',
    reply: "You've pasted SKUs while we're mid-planning. Pause the consultation and jump to bulk ordering, or keep going here?",
    products: [],
    ui: {
      kind: 'consultation_pause_offer',
      quick_replies: [
        { label: 'Pause & switch to bulk order', value: '__pause_to_pro__' },
        { label: 'Continue planning', value: '__continue_consultation__' },
      ],
    },
    intent: 'consultation_pause_offer',
  };
}

// --- Upsert a consultations row; return id ---
async function ensureConsultationRow(sessionId, context) {
  if (context.consultation_id) return context.consultation_id;
  const [result] = await pool.query(
    'INSERT INTO consultations (session_id, status) VALUES (?, ?)',
    [sessionId, 'in_progress']
  );
  return result.insertId;
}

async function updateConsultationRow(id, patch) {
  if (!id) return;
  const fields = [];
  const params = [];
  for (const [k, v] of Object.entries(patch)) {
    fields.push(`${k} = ?`);
    params.push(v);
  }
  if (!fields.length) return;
  params.push(id);
  await pool.query(`UPDATE consultations SET ${fields.join(', ')} WHERE id = ?`, params);
}

async function handle({ message, session, modeContext, transition, widgetSignal }) {
  // Handle special router signals.
  if (transition && transition.reason === 'pause_offer_sku') {
    return buildPauseOfferResponse();
  }

  // Handle the button choices the widget posts as normal messages.
  if (widgetSignal === '__pause_to_pro__' || /^__pause_to_pro__$/.test(message || '')) {
    return {
      mode: 'consultation',
      reply: 'Paused. Send your SKUs and I\'ll switch you to bulk ordering.',
      products: [],
      ui: { kind: 'plain' },
      transition_to: 'pro_ready',
      intent: 'consultation_paused',
    };
  }
  if (widgetSignal === '__continue_consultation__' || /^__continue_consultation__$/.test(message || '')) {
    // Re-ask the current FSM state's question.
    const ctx = normalizeState(modeContext || {});
    const reShown = advance(ctx, '');
    return {
      mode: 'consultation',
      reply: reShown.reply || 'Where were we — let\'s continue planning.',
      products: [],
      ui: reShown.ui || { kind: 'plain' },
      mode_context: reShown.nextContext,
      intent: 'consultation_resumed',
    };
  }

  // First-turn greeting when entering consultation with no context yet.
  if (!modeContext || !modeContext.state) {
    const init = initialPrompt();
    const consultationId = await ensureConsultationRow(session.session_id, {});
    const nextCtx = { state: init.state, consultation_id: consultationId };
    return {
      mode: 'consultation',
      reply: init.reply,
      products: [],
      ui: init.ui,
      mode_context: nextCtx,
      intent: 'consultation_started',
    };
  }

  // Advance the FSM.
  const ctx = normalizeState({ ...modeContext });
  const step = advance(ctx, message);

  // Ensure we have a consultations row.
  step.nextContext.consultation_id = step.nextContext.consultation_id
    || await ensureConsultationRow(session.session_id, step.nextContext);

  // LLM summary step: generate the summary, then transition to offered_next_step.
  if (step.needsSummaryLLM) {
    let summaryText = '';
    let tokensIn = 0, tokensOut = 0;
    try {
      const out = await ai.generate({
        systemPrompt: CONSULTATION_SYSTEM_PROMPT,
        userMessage: buildConsultationSummaryMessage(step.nextContext),
        history: [],
        temperature: 0.5,
        maxTokens: 260,
      });
      summaryText = out.text;
      tokensIn = out.tokensIn; tokensOut = out.tokensOut;
    } catch (e) {
      console.error('Consultation summary LLM error:', e.message);
      summaryText = `Here's what I've got: ${step.nextContext.cuisine || 'your cuisine'} · ${step.nextContext.service_type || 'your service model'} · ${step.nextContext.location || 'your location'} · ${step.nextContext.budget || 'your budget'}. Our team can help with kitchen design, equipment selection, installation and local compliance. Want to book a free 20-minute consultation call?`;
    }

    step.nextContext.state = STATES.OFFERED_NEXT_STEP;
    step.nextContext.summary_text = summaryText;

    await updateConsultationRow(step.nextContext.consultation_id, {
      cuisine: step.nextContext.cuisine || null,
      service_type: step.nextContext.service_type || null,
      location: step.nextContext.location || null,
      budget: step.nextContext.budget || null,
      status: 'summary_sent',
    });

    return {
      mode: 'consultation',
      reply: summaryText,
      products: [],
      ui: {
        kind: 'quick_replies',
        quick_replies: [
          { label: 'Yes, book a call', value: 'yes' },
          { label: 'Not right now', value: 'no' },
        ],
      },
      mode_context: step.nextContext,
      intent: 'consultation_summary',
      tokensIn, tokensOut,
    };
  }

  // Non-summary transitions.
  await updateConsultationRow(step.nextContext.consultation_id, {
    cuisine: step.nextContext.cuisine || null,
    service_type: step.nextContext.service_type || null,
    location: step.nextContext.location || null,
    budget: step.nextContext.budget || null,
  });

  return {
    mode: 'consultation',
    reply: step.reply,
    products: [],
    ui: step.ui || { kind: 'plain' },
    mode_context: step.nextContext,
    intent: step.finished ? 'consultation_done' : 'consultation_progress',
    finished: !!step.finished,
  };
}

module.exports = { handle, buildPauseOfferResponse };
