const pool = require('../db/pool');
const { extractSkus } = require('./skuDetector');

const STOPWORDS = new Set(['the','a','an','for','of','to','in','on','with','and','or','my','i','we','is','are','be','show','find','looking','need','want','get','please','buy']);

function tokenize(q) {
  return q.toLowerCase().replace(/[^\w\s]/g, ' ').split(/\s+/).filter(w => w.length >= 2 && !STOPWORDS.has(w));
}

// Direct SKU lookup — matches the exact SKU on variants_index.sku or products_index.default_sku.
// Runs first so "buy atosa MWF9010GR" surfaces the real product even when FULLTEXT
// has nothing (product title might not include the SKU string verbatim).
async function lookupBySku(skus, limit) {
  if (!skus.length) return [];
  const [rows] = await pool.query(
    `SELECT p.id, p.title, p.handle, p.vendor, p.product_type, p.price, p.compare_at_price, p.url, p.image_url,
            COALESCE(v.sku, p.default_sku) AS matched_sku
       FROM products_index p
       LEFT JOIN variants_index v ON v.product_id = p.id AND v.sku IN (?)
      WHERE p.default_sku IN (?)
         OR v.sku IN (?)
      LIMIT ?`,
    [skus, skus, skus, limit]
  );
  return rows;
}

async function searchProducts(query, limit = 5) {
  // 1) Exact SKU hit? Short-circuit.
  const skus = extractSkus(query);
  let skuRows = [];
  if (skus.length) {
    skuRows = await lookupBySku(skus, limit);
    // If we got exact matches, that's much higher signal than FULLTEXT.
    // Return them directly (with room to merge FULLTEXT if limit not filled).
    if (skuRows.length >= limit) return skuRows.slice(0, limit);
  }

  const tokens = tokenize(query);
  let textRows = [];
  if (tokens.length > 0) {
    try {
      const ftQuery = tokens.map(t => `+${t}*`).join(' ');
      const [rows] = await pool.query(
        `SELECT id, title, handle, vendor, product_type, price, compare_at_price, url, image_url,
                MATCH(title, description, tags, vendor, product_type) AGAINST (? IN BOOLEAN MODE) AS score
           FROM products_index
          WHERE MATCH(title, description, tags, vendor, product_type) AGAINST (? IN BOOLEAN MODE)
          ORDER BY score DESC
          LIMIT ?`,
        [ftQuery, ftQuery, limit]
      );
      textRows = rows;
    } catch (e) { /* fall through to LIKE */ }

    if (textRows.length === 0) {
      const likeConds = tokens.map(() => '(title LIKE ? OR tags LIKE ? OR vendor LIKE ? OR product_type LIKE ? OR default_sku LIKE ?)').join(' OR ');
      const params = [];
      for (const t of tokens) { const p = `%${t}%`; params.push(p, p, p, p, p); }
      params.push(limit);
      const [rows] = await pool.query(
        `SELECT id, title, handle, vendor, product_type, price, compare_at_price, url, image_url
           FROM products_index WHERE ${likeConds} LIMIT ?`,
        params
      );
      textRows = rows;
    }
  }

  // Merge: SKU exact matches first, then FULLTEXT matches, dedup by product id.
  const seen = new Set(skuRows.map(r => r.id));
  const merged = skuRows.slice();
  for (const r of textRows) {
    if (seen.has(r.id)) continue;
    seen.add(r.id);
    merged.push(r);
    if (merged.length >= limit) break;
  }
  return merged;
}

module.exports = { searchProducts };
