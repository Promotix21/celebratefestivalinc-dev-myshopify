// Deterministic consultation Q&A state machine.
// The FSM owns: what question to ask next, what shape of UI to render
// (quick_replies vs free text vs form), and validation of user input.
//
// States:
//   awaiting_cuisine -> awaiting_service_type -> awaiting_location -> awaiting_budget
//   -> summary (LLM call)
//   -> offered_next_step (await yes/no to book)
//   -> booking_slot (show /calendar-slots result)
//   -> done
//
// Context shape stored on sessions.mode_context:
//   { state, cuisine, service_type, location, budget,
//     consultation_id?, summary_text?, lead_id?, booking_slot_start? }

const STATES = {
  AWAITING_CUISINE: 'awaiting_cuisine',
  AWAITING_SERVICE_TYPE: 'awaiting_service_type',
  AWAITING_LOCATION: 'awaiting_location',
  AWAITING_BUDGET: 'awaiting_budget',
  SUMMARY: 'summary',
  OFFERED_NEXT_STEP: 'offered_next_step',
  BOOKING_SLOT: 'booking_slot',
  DONE: 'done',
};

const QUICK_REPLIES = {
  cuisine: [
    { label: 'Indian', value: 'Indian' },
    { label: 'Italian', value: 'Italian' },
    { label: 'American', value: 'American' },
    { label: 'Mexican', value: 'Mexican' },
    { label: 'Bakery / Café', value: 'Bakery / Café' },
    { label: 'Pizza', value: 'Pizza' },
    { label: 'Multi-cuisine', value: 'Multi-cuisine' },
    { label: 'Other (type below)', value: '__free_text__' },
  ],
  service_type: [
    { label: 'Dine-in', value: 'Dine-in' },
    { label: 'Takeaway / Delivery', value: 'Takeaway / Delivery' },
    { label: 'Cloud / Dark kitchen', value: 'Cloud / Dark kitchen' },
    { label: 'Catering / Events', value: 'Catering / Events' },
    { label: 'Mix of the above', value: 'Mix' },
  ],
  budget: [
    { label: 'Under $25k', value: 'Under $25k' },
    { label: '$25k–$75k', value: '$25k–$75k' },
    { label: '$75k–$150k', value: '$75k–$150k' },
    { label: '$150k+', value: '$150k+' },
    { label: 'Not sure yet', value: 'Not sure yet' },
  ],
};

function normalizeState(ctx) {
  if (!ctx || typeof ctx !== 'object') return { state: STATES.AWAITING_CUISINE };
  if (!ctx.state) ctx.state = STATES.AWAITING_CUISINE;
  return ctx;
}

// Validates a free-text answer for a slot and returns the trimmed value (or null).
function validate(slot, input) {
  const s = (input || '').trim();
  if (!s) return null;
  if (s.length > 120) return s.slice(0, 120);
  return s;
}

// Produces the first-turn greeting (when a user triggers consultation).
function initialPrompt() {
  return {
    state: STATES.AWAITING_CUISINE,
    reply: "Let's plan your kitchen. First — what cuisine will you serve?",
    ui: { kind: 'quick_replies', quick_replies: QUICK_REPLIES.cuisine, free_text_allowed: true },
  };
}

// Advances the FSM given the current context and the latest user message.
// Returns { nextContext, reply, ui, needsSummaryLLM: bool }.
function advance(ctx, message) {
  ctx = normalizeState({ ...ctx });
  const input = (message || '').trim();

  switch (ctx.state) {
    case STATES.AWAITING_CUISINE: {
      const v = validate('cuisine', input);
      if (!v || v === '__free_text__') {
        return {
          nextContext: ctx,
          reply: "What cuisine will you serve? You can pick one above or type your own.",
          ui: { kind: 'quick_replies', quick_replies: QUICK_REPLIES.cuisine, free_text_allowed: true },
        };
      }
      ctx.cuisine = v;
      ctx.state = STATES.AWAITING_SERVICE_TYPE;
      return {
        nextContext: ctx,
        reply: `${v} — great. How will you serve guests?`,
        ui: { kind: 'quick_replies', quick_replies: QUICK_REPLIES.service_type, free_text_allowed: true },
      };
    }

    case STATES.AWAITING_SERVICE_TYPE: {
      const v = validate('service_type', input);
      if (!v) {
        return {
          nextContext: ctx,
          reply: "How will you serve guests? Pick one or describe your model.",
          ui: { kind: 'quick_replies', quick_replies: QUICK_REPLIES.service_type, free_text_allowed: true },
        };
      }
      ctx.service_type = v;
      ctx.state = STATES.AWAITING_LOCATION;
      return {
        nextContext: ctx,
        reply: "Where will the kitchen be located? (City and state is enough.)",
        ui: { kind: 'plain' },
      };
    }

    case STATES.AWAITING_LOCATION: {
      const v = validate('location', input);
      if (!v) {
        return {
          nextContext: ctx,
          reply: "What city and state will the kitchen be in?",
          ui: { kind: 'plain' },
        };
      }
      ctx.location = v;
      ctx.state = STATES.AWAITING_BUDGET;
      return {
        nextContext: ctx,
        reply: "What's your equipment budget range?",
        ui: { kind: 'quick_replies', quick_replies: QUICK_REPLIES.budget, free_text_allowed: true },
      };
    }

    case STATES.AWAITING_BUDGET: {
      const v = validate('budget', input);
      if (!v) {
        return {
          nextContext: ctx,
          reply: "Roughly what's your equipment budget?",
          ui: { kind: 'quick_replies', quick_replies: QUICK_REPLIES.budget, free_text_allowed: true },
        };
      }
      ctx.budget = v;
      ctx.state = STATES.SUMMARY;
      // The handler will call the LLM for the summary step.
      return { nextContext: ctx, needsSummaryLLM: true };
    }

    case STATES.SUMMARY:
    case STATES.OFFERED_NEXT_STEP: {
      // Interpret the message as accept/decline the booking invitation.
      if (/\b(yes|yep|yeah|sure|okay|ok|book|let'?s do it|sounds good|please)\b/i.test(input)) {
        ctx.state = STATES.BOOKING_SLOT;
        return {
          nextContext: ctx,
          reply: "Great — pick a time that works for you. A specialist will call at that slot.",
          ui: { kind: 'form_booking' },
        };
      }
      if (/\b(no|not now|later|maybe later|pass)\b/i.test(input)) {
        ctx.state = STATES.DONE;
        return {
          nextContext: ctx,
          reply: "No worries. When you're ready, just say \"plan my kitchen\" and we'll pick up here. Anything else I can help with?",
          ui: { kind: 'plain' },
          finished: true,
        };
      }
      // Ambiguous: re-ask.
      ctx.state = STATES.OFFERED_NEXT_STEP;
      return {
        nextContext: ctx,
        reply: "Would you like to book a free 20-minute consultation call? (Yes or No)",
        ui: { kind: 'quick_replies', quick_replies: [
          { label: 'Yes, book a call', value: 'yes' },
          { label: 'Not right now', value: 'no' },
        ]},
      };
    }

    case STATES.BOOKING_SLOT: {
      // Booking slots are submitted via the widget's slot chips / form, not typed.
      // If the user types here, they've changed topic. Give them an off-ramp
      // instead of trapping them on "Pick one of the slots above".
      const looksLikeEscape = input && input.length >= 3;
      if (looksLikeEscape) {
        // Abandon booking; let the outer router re-dispatch on the next turn.
        ctx.state = STATES.DONE;
        return {
          nextContext: ctx,
          reply: "No problem — I've paused the booking. What would you like to do instead? You can paste SKUs, search for products, or say \"plan my kitchen\" to start over.",
          ui: { kind: 'plain' },
          finished: true,
        };
      }
      return {
        nextContext: ctx,
        reply: "Pick one of the slots above to confirm your call, or type anything else to go back.",
        ui: { kind: 'form_booking' },
      };
    }

    case STATES.DONE:
    default:
      // Finishing state — any further messages should have been routed out of
      // consultation mode by the router (it resets on 'done'). Safety fallback:
      return {
        nextContext: ctx,
        reply: "All set — is there anything else I can help you with?",
        ui: { kind: 'plain' },
        finished: true,
      };
  }
}

module.exports = { STATES, QUICK_REPLIES, initialPrompt, advance, normalizeState };
