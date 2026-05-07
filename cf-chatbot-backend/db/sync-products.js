require('dotenv').config();
const pool = require('./pool');

const STORE = process.env.SHOPIFY_STORE;
const TOKEN = process.env.SHOPIFY_API_TOKEN;
const API_VERSION = process.env.SHOPIFY_API_VERSION || '2024-01';
const PAGE_SIZE = 250;

function stripHtml(html) {
  if (!html) return '';
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 2000);
}

async function fetchPage(pageInfo, attempt = 0) {
  const url = pageInfo
    ? `https://${STORE}/admin/api/${API_VERSION}/products.json?limit=${PAGE_SIZE}&page_info=${pageInfo}`
    : `https://${STORE}/admin/api/${API_VERSION}/products.json?limit=${PAGE_SIZE}`;
  const res = await fetch(url, { headers: { 'X-Shopify-Access-Token': TOKEN } });
  // Retry on 429 (rate limit) or 5xx (transient upstream errors).
  if (!res.ok) {
    const retriable = res.status === 429 || (res.status >= 500 && res.status < 600);
    if (retriable && attempt < 6) {
      const delayMs = Math.min(30000, 1000 * Math.pow(2, attempt));
      console.warn(`Shopify ${res.status} — retry ${attempt + 1}/6 in ${delayMs}ms`);
      await new Promise(r => setTimeout(r, delayMs));
      return fetchPage(pageInfo, attempt + 1);
    }
    throw new Error(`Shopify ${res.status}: ${(await res.text()).slice(0, 200)}`);
  }
  const link = res.headers.get('link') || '';
  const nextMatch = link.match(/<[^>]*[?&]page_info=([^&>]+)[^>]*>;\s*rel="next"/);
  return { products: (await res.json()).products, nextPageInfo: nextMatch ? nextMatch[1] : null };
}

function variantImageUrl(product, variant) {
  if (variant.image_id && Array.isArray(product.images)) {
    const img = product.images.find(i => i.id === variant.image_id);
    if (img) return img.src;
  }
  return product.image?.src || product.images?.[0]?.src || null;
}

(async () => {
  if (!STORE || !TOKEN) { console.error('Missing Shopify creds'); process.exit(1); }

  let pageInfo = null;
  let totalProducts = 0;
  let totalVariants = 0;
  let page = 0;

  do {
    page++;
    const { products, nextPageInfo } = await fetchPage(pageInfo);
    for (const p of products) {
      const variants = Array.isArray(p.variants) ? p.variants : [];
      const firstVariant = variants[0] || {};
      const firstImage = p.image?.src || p.images?.[0]?.src || null;
      const defaultSku = (firstVariant.sku || '').slice(0, 120) || null;
      const available = variants.some(v => (v.inventory_quantity > 0) || v.inventory_management === null) ? 1 : 0;

      const productRow = {
        id: p.id,
        shopify_id: p.id,
        title: p.title?.slice(0, 500) || '',
        handle: p.handle?.slice(0, 500) || '',
        description: stripHtml(p.body_html),
        vendor: p.vendor?.slice(0, 255) || '',
        product_type: p.product_type?.slice(0, 255) || '',
        tags: p.tags || '',
        price: Number(firstVariant.price || 0),
        compare_at_price: firstVariant.compare_at_price ? Number(firstVariant.compare_at_price) : null,
        available,
        url: `https://${STORE.replace('.myshopify.com', '.com')}/products/${p.handle}`,
        image_url: firstImage,
        default_sku: defaultSku,
        has_multiple_variants: variants.length > 1 ? 1 : 0,
        variant_count: variants.length || 1,
      };

      await pool.query(
        `INSERT INTO products_index
           (id, shopify_id, title, handle, description, vendor, product_type, tags,
            price, compare_at_price, available, url, image_url,
            default_sku, has_multiple_variants, variant_count)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
         ON DUPLICATE KEY UPDATE
           title=VALUES(title), handle=VALUES(handle), description=VALUES(description),
           vendor=VALUES(vendor), product_type=VALUES(product_type), tags=VALUES(tags),
           price=VALUES(price), compare_at_price=VALUES(compare_at_price),
           available=VALUES(available), url=VALUES(url), image_url=VALUES(image_url),
           default_sku=VALUES(default_sku),
           has_multiple_variants=VALUES(has_multiple_variants),
           variant_count=VALUES(variant_count)`,
        [
          productRow.id, productRow.shopify_id, productRow.title, productRow.handle,
          productRow.description, productRow.vendor, productRow.product_type, productRow.tags,
          productRow.price, productRow.compare_at_price, productRow.available, productRow.url, productRow.image_url,
          productRow.default_sku, productRow.has_multiple_variants, productRow.variant_count,
        ]
      );
      totalProducts++;

      for (const v of variants) {
        const vSku = (v.sku || '').slice(0, 120);
        if (!vSku) continue; // skip variants without SKU; they can't be looked up in Pro Mode
        const vAvailable = (v.inventory_quantity > 0 || v.inventory_management === null) ? 1 : 0;
        const vTitle = (v.title || '').slice(0, 500);
        const vImage = variantImageUrl(p, v);

        await pool.query(
          `INSERT INTO variants_index
             (id, product_id, sku, title, price, compare_at_price, available, inventory_quantity,
              option1, option2, option3, barcode, image_url)
           VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)
           ON DUPLICATE KEY UPDATE
             product_id=VALUES(product_id), sku=VALUES(sku), title=VALUES(title),
             price=VALUES(price), compare_at_price=VALUES(compare_at_price),
             available=VALUES(available), inventory_quantity=VALUES(inventory_quantity),
             option1=VALUES(option1), option2=VALUES(option2), option3=VALUES(option3),
             barcode=VALUES(barcode), image_url=VALUES(image_url)`,
          [
            v.id, p.id, vSku, vTitle,
            Number(v.price || 0),
            v.compare_at_price ? Number(v.compare_at_price) : null,
            vAvailable,
            Number.isFinite(v.inventory_quantity) ? v.inventory_quantity : 0,
            (v.option1 || '').slice(0, 255) || null,
            (v.option2 || '').slice(0, 255) || null,
            (v.option3 || '').slice(0, 255) || null,
            (v.barcode || '').slice(0, 120) || null,
            vImage,
          ]
        );
        totalVariants++;
      }
    }
    console.log(`Page ${page}: ${products.length} products (running total: ${totalProducts} products, ${totalVariants} variants)`);
    pageInfo = nextPageInfo;
  } while (pageInfo);

  console.log(`\nSynced ${totalProducts} products and ${totalVariants} variants.`);
  process.exit(0);
})().catch(err => { console.error('Sync failed:', err); process.exit(1); });
