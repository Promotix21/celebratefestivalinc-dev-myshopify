// Per-model pricing. Prices expressed in USD per 1 token.
// Sources: Google Gemini API pricing, Jan 2026 published rates.
// Updating this table adjusts go-forward cost calculations; historical
// cost_ledger rows keep their as-of-then cost.
const PRICING = {
  // gemini-2.5-flash: $0.30 / M input, $2.50 / M output
  'gemini-2.5-flash': { in: 0.30 / 1e6, out: 2.50 / 1e6 },
  // gemini-2.0-flash (retired): $0.10 / M input, $0.40 / M output
  'gemini-2.0-flash': { in: 0.10 / 1e6, out: 0.40 / 1e6 },
  // gemini-1.5-flash: $0.075 / M input, $0.30 / M output
  'gemini-1.5-flash': { in: 0.075 / 1e6, out: 0.30 / 1e6 },
  // gemini-1.5-pro: $1.25 / M input, $5.00 / M output
  'gemini-1.5-pro': { in: 1.25 / 1e6, out: 5.00 / 1e6 },
};

// Fallback for an unrecognized model — conservative (gemini-2.5-flash rates).
const FALLBACK = PRICING['gemini-2.5-flash'];

function currentModel() {
  return process.env.GEMINI_MODEL || 'gemini-2.5-flash';
}

function costForMessage(model, tokensIn, tokensOut) {
  const rate = PRICING[model] || FALLBACK;
  const cost = (Number(tokensIn) || 0) * rate.in + (Number(tokensOut) || 0) * rate.out;
  // Round to 8 decimal places (matches DB DECIMAL(18,8)).
  return Math.round(cost * 1e8) / 1e8;
}

module.exports = { costForMessage, currentModel, PRICING };
