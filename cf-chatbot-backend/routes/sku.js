// POST /sku-lookup  — incremental SKU resolution (used after the initial paste).
// Request:  { skus: [string, ...], session_id?, customer_id? }
// Response: { resolved: [...], missing: [...] }

const express = require('express');
const { resolveSkus } = require('../lib/skuLookup');
const { getOrCreateSession, parseCustomerTags } = require('../lib/session');
const { isPremiumCustomer } = require('../lib/premium');

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { skus, session_id } = req.body || {};
    if (!Array.isArray(skus) || !skus.length) {
      return res.status(400).json({ error: 'skus array required' });
    }
    if (skus.length > 50) {
      return res.status(400).json({ error: 'Too many SKUs (max 50)' });
    }

    // Gate: must be a premium session (is_premium flag set by first /chat call).
    if (session_id) {
      const sess = await getOrCreateSession(session_id, { ip: req.ip, ua: req.get('user-agent') });
      if (!sess.is_premium) {
        return res.status(403).json({ error: 'Pro Mode required' });
      }
    }

    const { resolved, missing } = await resolveSkus(skus);
    res.json({ resolved, missing });
  } catch (err) {
    console.error('SKU lookup error:', err);
    res.status(500).json({ error: 'sku_lookup_failed' });
  }
});

module.exports = router;
