// Resolve SKUs against variants_index + products_index.
//
// Match strategy (both queries executed; results merged with variant match preferred):
//   1. variants_index.sku IN (?) -> specific variant
//   2. products_index.default_sku IN (?) -> first-variant fallback
//
// For multi-variant products, the response includes all_variants so the widget
// can render a selector.

const pool = require('../db/pool');

const HIGH_VALUE_CENTS = Number(process.env.PRO_HIGH_VALUE_CENTS || 500000); // $5,000

function toUpper(sku) { return String(sku || '').trim().toUpperCase(); }

async function resolveSkus(skusInput) {
  const skus = Array.from(new Set(skusInput.map(toUpper).filter(Boolean)));
  if (!skus.length) return { resolved: [], missing: [] };

  // Variant-level matches.
  const [vRows] = await pool.query(
    `SELECT v.id AS variant_id, v.sku AS variant_sku, v.title AS variant_title,
            v.price AS v_price, v.compare_at_price AS v_compare, v.available AS v_available,
            v.inventory_quantity AS v_inventory,
            v.option1, v.option2, v.option3, v.image_url AS v_image,
            p.id AS product_id, p.title AS product_title, p.handle, p.vendor,
            p.url, p.image_url AS p_image, p.price AS p_price,
            p.compare_at_price AS p_compare, p.has_multiple_variants, p.default_sku
       FROM variants_index v
       JOIN products_index p ON p.id = v.product_id
      WHERE v.sku IN (?)`,
    [skus]
  );

  // Product-level fallback for SKUs not matched by any variant.
  const matchedVariantSkus = new Set(vRows.map(r => r.variant_sku));
  const stillMissing = skus.filter(s => !matchedVariantSkus.has(s));

  let pRows = [];
  if (stillMissing.length) {
    const [rows] = await pool.query(
      `SELECT p.id AS product_id, p.title AS product_title, p.handle, p.vendor, p.url,
              p.image_url AS p_image, p.price AS p_price, p.compare_at_price AS p_compare,
              p.has_multiple_variants, p.default_sku
         FROM products_index p
        WHERE p.default_sku IN (?)`,
      [stillMissing]
    );
    pRows = rows;
  }

  const matchedFallbackSkus = new Set(pRows.map(r => r.default_sku));

  // Collect product ids that need all_variants fetched.
  const productIdsNeedingVariants = new Set();
  for (const r of vRows) if (r.has_multiple_variants) productIdsNeedingVariants.add(r.product_id);
  for (const r of pRows) if (r.has_multiple_variants) productIdsNeedingVariants.add(r.product_id);

  let allVariantsByProduct = new Map();
  if (productIdsNeedingVariants.size) {
    const [avRows] = await pool.query(
      `SELECT id, product_id, sku, title, option1, option2, option3,
              price, compare_at_price, available, inventory_quantity, image_url
         FROM variants_index
        WHERE product_id IN (?)
        ORDER BY product_id, id`,
      [Array.from(productIdsNeedingVariants)]
    );
    for (const v of avRows) {
      if (!allVariantsByProduct.has(v.product_id)) allVariantsByProduct.set(v.product_id, []);
      allVariantsByProduct.get(v.product_id).push({
        id: v.id,
        sku: v.sku,
        title: v.title,
        option1: v.option1, option2: v.option2, option3: v.option3,
        price: Number(v.price || 0),
        compare_at_price: v.compare_at_price != null ? Number(v.compare_at_price) : null,
        available: !!v.available,
        inventory_quantity: v.inventory_quantity || 0,
        image: v.image_url,
      });
    }
  }

  const resolved = [];
  for (const r of vRows) {
    const price = Number(r.v_price || r.p_price || 0);
    const compare = r.v_compare != null ? Number(r.v_compare) : (r.p_compare != null ? Number(r.p_compare) : null);
    resolved.push({
      sku: r.variant_sku,
      variant_id: r.variant_id,
      product_id: r.product_id,
      product_title: r.product_title,
      variant_title: r.variant_title,
      handle: r.handle,
      vendor: r.vendor,
      url: r.url,
      image: r.v_image || r.p_image,
      price,
      compare_at_price: compare,
      available: !!r.v_available,
      inventory: r.v_inventory || 0,
      has_multiple_variants: !!r.has_multiple_variants,
      all_variants: r.has_multiple_variants ? (allVariantsByProduct.get(r.product_id) || []) : [],
      high_value: Math.round(price * 100) >= HIGH_VALUE_CENTS,
      match_type: 'variant',
    });
  }
  for (const r of pRows) {
    const price = Number(r.p_price || 0);
    const compare = r.p_compare != null ? Number(r.p_compare) : null;
    resolved.push({
      sku: r.default_sku,
      variant_id: null, // widget will read first available variant from all_variants
      product_id: r.product_id,
      product_title: r.product_title,
      variant_title: null,
      handle: r.handle,
      vendor: r.vendor,
      url: r.url,
      image: r.p_image,
      price,
      compare_at_price: compare,
      available: true,
      inventory: 0,
      has_multiple_variants: !!r.has_multiple_variants,
      all_variants: r.has_multiple_variants ? (allVariantsByProduct.get(r.product_id) || []) : [],
      high_value: Math.round(price * 100) >= HIGH_VALUE_CENTS,
      match_type: 'default_sku',
    });
  }

  const allMatched = new Set([...matchedVariantSkus, ...matchedFallbackSkus]);
  const missing = skus.filter(s => !allMatched.has(s));

  return { resolved, missing };
}

module.exports = { resolveSkus, HIGH_VALUE_CENTS };
