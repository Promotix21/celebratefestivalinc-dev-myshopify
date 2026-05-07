// Mode router: decides which handler owns a given /chat message.
// Returns { mode, transition: { from, to, reason } | null }.
//
// Decision order (first match wins):
//   1. Hard exit/reset pattern           -> discovery, clear mode_context
//   2. Currently in consultation         -> stay consultation  (sticky)
//      EXCEPT: premium user pastes SKUs  -> emit 'pause_offer' transition signal
//                                          so the handler can show Pause/Continue buttons.
//   3. Premium + logged-in + SKU list    -> pro
//   4. Consultation trigger keywords     -> consultation (enter)
//   5. Default                           -> discovery

const { looksLikeSkuList } = require('./skuDetector');

const EXIT_PATTERNS = [
  /^(exit|cancel|stop|quit|start over|restart|reset|nevermind|never mind)\b/i,
];

const CONSULTATION_TRIGGERS = [
  /\bplan\s+(my|a|the|our)?\s*kitchen\b/i,
  /\b(start|open|opening|setup|set\s*up|design)\s+(my|a|the|our|new)?\s*(restaurant|kitchen|cloud kitchen|dark kitchen|bakery|cafe|caf[eé])\b/i,
  /\bkitchen\s+planning\b/i,
  /\brestaurant\s+setup\b/i,
];

const STICKY_TTL_MS = 30 * 60 * 1000; // 30 min

function isExit(msg) {
  return EXIT_PATTERNS.some(r => r.test(msg));
}

function isConsultationTrigger(msg) {
  return CONSULTATION_TRIGGERS.some(r => r.test(msg));
}

function hasStickyExpired(session) {
  if (!session.mode_locked_at) return false;
  const locked = new Date(session.mode_locked_at).getTime();
  if (!Number.isFinite(locked)) return false;
  return (Date.now() - locked) > STICKY_TTL_MS;
}

function resolveMode({ session, message, loggedIn, isPremium, modeHint }) {
  const current = session.mode || 'discovery';
  const transition = (to, reason) => ({ mode: to, transition: { from: current, to, reason } });

  // 0. Explicit widget hint (used by "Book a consult" button, "Pause consultation" button etc.)
  if (modeHint === 'consultation') return transition('consultation', 'widget_hint');
  if (modeHint === 'pro' && loggedIn && isPremium) return transition('pro', 'widget_hint');
  if (modeHint === 'discovery') return transition('discovery', 'widget_hint');

  // 1. Exit words always win.
  if (isExit(message)) return transition('discovery', 'exit_keyword');

  // TTL: if a sticky mode expired, fall through to fresh routing below.
  const expired = hasStickyExpired(session);

  // 2. Consultation stickiness (unless expired).
  if (current === 'consultation' && !expired) {
    // Mid-consultation SKU paste by a premium user -> don't auto-switch; emit a signal
    // so the consultation handler can render a Pause/Continue prompt.
    if (loggedIn && isPremium && looksLikeSkuList(message).isSkuList) {
      return { mode: 'consultation', transition: { from: current, to: 'consultation', reason: 'pause_offer_sku' } };
    }
    return { mode: 'consultation', transition: null };
  }

  // 3. Pro Mode entry (premium + logged-in + SKU-shaped list).
  if (loggedIn && isPremium && looksLikeSkuList(message).isSkuList) {
    return transition('pro', 'sku_list_detected');
  }

  // 4. Consultation triggers.
  if (isConsultationTrigger(message)) {
    return transition('consultation', 'consultation_keyword');
  }

  // 5. Default: discovery. If the previous mode was pro and context is empty,
  //    also fall back here on the next message without SKUs.
  if (current === 'pro') {
    // Pro is only semi-sticky; revert to discovery when the next message isn't a SKU list.
    return transition('discovery', 'pro_exit_no_sku');
  }

  return { mode: 'discovery', transition: current === 'discovery' ? null : { from: current, to: 'discovery', reason: 'default' } };
}

module.exports = { resolveMode, STICKY_TTL_MS };
