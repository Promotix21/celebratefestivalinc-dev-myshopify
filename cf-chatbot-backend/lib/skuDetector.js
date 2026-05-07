// Detect whether a message contains a bulk SKU list.
// New strategy (2026-04-23): extract SKU-shaped tokens from prose.
// Users type things like "I need SB-20, CB15, SPJL-206" — that should route to Pro.
// We split on any character that can't appear in a SKU, then filter tokens that:
//   (a) match the SKU shape regex (4–31 chars, leading alnum, then alnum/-./_ )
//   (b) contain at least one digit or punctuation (digit/-/./_ ) — this prevents
//       common English words like "CABLES", "HDMI", "USB" from being treated as SKUs.
// 2+ unique matches = SKU list.

const SKU_REGEX = /^[A-Z0-9][A-Z0-9\-_.]{3,30}$/;
const HAS_STRUCTURE = /[0-9\-_.]/; // SKU-like vs pure-letter word

function extractSkus(message) {
  if (!message || typeof message !== 'string') return [];
  // Split on anything that isn't a valid SKU character. This yanks SKUs out of
  // "I need SB-20, CB15, SPJL-206" cleanly, regardless of surrounding prose.
  const tokens = message.toUpperCase().split(/[^A-Z0-9\-_.]+/).filter(Boolean);
  const seen = new Set();
  const out = [];
  for (const t of tokens) {
    if (!SKU_REGEX.test(t)) continue;
    if (!HAS_STRUCTURE.test(t)) continue; // skip pure-letter words
    if (seen.has(t)) continue;
    seen.add(t);
    out.push(t);
  }
  return out;
}

function looksLikeSkuList(message) {
  const skus = extractSkus(message);
  const isSkuList = skus.length >= 2;
  return { isSkuList, skus: isSkuList ? skus : [], totalFound: skus.length };
}

module.exports = { looksLikeSkuList, extractSkus, SKU_REGEX };
