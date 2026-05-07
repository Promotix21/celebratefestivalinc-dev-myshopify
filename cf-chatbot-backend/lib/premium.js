// Premium trade-account detection for Pro Mode gating.
// Per PRD, ONLY these three tags qualify for Pro Mode (comma-separated list).
const PREMIUM_TAGS = new Set(['CPH', 'ROU', 'UMRP']);

function normalizeTags(tags) {
  if (!tags) return [];
  if (Array.isArray(tags)) return tags.map(t => String(t).trim()).filter(Boolean);
  return String(tags).split(',').map(t => t.trim()).filter(Boolean);
}

function isPremiumCustomer(tags) {
  const list = normalizeTags(tags);
  for (const t of list) {
    if (PREMIUM_TAGS.has(t)) return true;
  }
  return false;
}

module.exports = { isPremiumCustomer, normalizeTags, PREMIUM_TAGS };
