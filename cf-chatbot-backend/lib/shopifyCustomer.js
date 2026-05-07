// Server-side customer tag verification against Shopify Admin API.
// Called once per session (cached on sessions.tags_verified_at) to prevent a
// forged customer_tags payload from the widget unlocking Pro Mode.

const STORE = process.env.SHOPIFY_STORE;
const TOKEN = process.env.SHOPIFY_API_TOKEN;
const API_VERSION = process.env.SHOPIFY_API_VERSION || '2024-01';

async function fetchCustomerTags(customerId) {
  if (!customerId || !STORE || !TOKEN) return null;
  const url = `https://${STORE}/admin/api/${API_VERSION}/customers/${encodeURIComponent(customerId)}.json`;
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: { 'X-Shopify-Access-Token': TOKEN, 'Content-Type': 'application/json' },
    });
    if (!res.ok) {
      // 404 = customer not found (deleted, wrong ID); 401/403 = perms; treat as unknown.
      return null;
    }
    const data = await res.json();
    const raw = data?.customer?.tags;
    if (!raw) return [];
    return String(raw).split(',').map(t => t.trim()).filter(Boolean);
  } catch (err) {
    console.error('Shopify customer fetch failed:', err.message);
    return null;
  }
}

module.exports = { fetchCustomerTags };
