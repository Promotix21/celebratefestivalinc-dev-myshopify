// Pro Mode handler — SKU resolution + draft persistence.
// No LLM call. High-value nudge uses a hand-written template.

const pool = require('../../db/pool');
const { looksLikeSkuList, extractSkus } = require('../skuDetector');
const { resolveSkus } = require('../skuLookup');

function buildReply({ resolved, missing }) {
  if (!resolved.length && missing.length) {
    return `I couldn't find any of those SKUs in our catalog: ${missing.join(', ')}. Double-check the spellings, or tap "Request expert review" and we'll sort it out.`;
  }
  if (missing.length) {
    return `Found ${resolved.length} of ${resolved.length + missing.length} SKUs. Not in catalog: ${missing.join(', ')}. Adjust quantities or variants below and add to cart.`;
  }
  return `Found all ${resolved.length} SKUs. Adjust quantities or variants below and add to cart.`;
}

async function recordDraft(sessionId, customerId, resolved) {
  if (!resolved.length) return null;
  const items = resolved.map(r => ({
    sku: r.sku,
    variant_id: r.variant_id,
    product_id: r.product_id,
    unit_price_cents: Math.round((r.price || 0) * 100),
  }));
  const totalCents = items.reduce((s, i) => s + (i.unit_price_cents || 0), 0);
  try {
    const [result] = await pool.query(
      'INSERT INTO pro_orders_draft (session_id, customer_id, items, total_cents) VALUES (?,?,?,?)',
      [sessionId, customerId || null, JSON.stringify(items), totalCents]
    );
    return result.insertId;
  } catch (err) {
    console.error('Pro draft insert failed:', err.message);
    return null;
  }
}

async function handle({ message, session, customerId }) {
  // Primary parse via skuDetector; if it's borderline, fall back to extractSkus.
  const det = looksLikeSkuList(message);
  const skus = det.isSkuList ? det.skus : extractSkus(message);

  if (!skus.length) {
    return {
      mode: 'pro',
      reply: "I didn't catch any SKUs there. Paste them separated by commas, e.g. MCF8722GR, MCF8723GR.",
      products: [],
      ui: { kind: 'plain' },
      intent: 'pro_no_skus',
    };
  }

  const { resolved, missing } = await resolveSkus(skus);

  const draftId = await recordDraft(session.session_id, customerId, resolved);

  const highValue = resolved.some(r => r.high_value);

  return {
    mode: 'pro',
    reply: buildReply({ resolved, missing }),
    products: [], // Pro items travel in ui.items; products[] reserved for Discovery shape
    ui: {
      kind: 'pro_cards',
      items: resolved,
      missing,
      actions: ['add_all', 'checkout', 'request_review'],
      high_value: highValue,
      draft_id: draftId,
    },
    intent: resolved.length ? 'pro_cards_rendered' : 'pro_all_missing',
  };
}

module.exports = { handle };
