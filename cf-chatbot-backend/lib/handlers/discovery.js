// Discovery Mode handler — preserves the original chat flow:
//  intent detect -> full-text product search -> Gemini -> reply + products[] + lead flags.

const { detectIntent } = require('../intent');
const { searchProducts } = require('../search');
const { DISCOVERY_SYSTEM_PROMPT, buildDiscoveryUserMessage } = require('../prompt');
const ai = require('../gemini');

async function handle({ message, session, history }) {
  const intent = detectIntent(message);
  let products = [];
  if (intent === 'product_search' || intent === 'navigation' || intent === 'kitchen_planning' || intent === 'general') {
    products = await searchProducts(message, 5);
  }

  let reply;
  let tokensIn = 0, tokensOut = 0;
  try {
    const out = await ai.generate({
      systemPrompt: DISCOVERY_SYSTEM_PROMPT,
      userMessage: buildDiscoveryUserMessage({ userMessage: message, products, intent }),
      history,
    });
    reply = out.text;
    tokensIn = out.tokensIn;
    tokensOut = out.tokensOut;
  } catch (e) {
    console.error('Discovery AI error:', e.message);
    reply = products.length
      ? "Here are some options I found. Need help deciding? Call (408) 673-9999 or book a consultation."
      : "I couldn't find that in our catalog. Want to talk to a specialist? Call (408) 673-9999.";
  }

  const messageCount = (session.message_count || 0) + 1;
  const shouldAskLead = messageCount >= 5 && !session.lead_captured;
  const showBooking = intent === 'talk_to_expert' && !session.lead_captured;

  return {
    mode: 'discovery',
    reply,
    products,
    intent,
    ui: { kind: 'plain' },
    ask_for_lead: shouldAskLead,
    show_booking: showBooking,
    tokensIn,
    tokensOut,
  };
}

module.exports = { handle };
