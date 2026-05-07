const express = require('express');
const { searchProducts } = require('../lib/search');
const { sanitize } = require('../lib/guardrails');

const router = express.Router();

router.get('/', async (req, res) => {
  const q = sanitize(req.query.q || '');
  if (!q) return res.json({ products: [] });
  const products = await searchProducts(q, Number(req.query.limit) || 5);
  res.json({ products });
});

module.exports = router;
