require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const chatRoute = require('./routes/chat');
const leadsRoute = require('./routes/leads');
const searchRoute = require('./routes/search');
const sessionsRoute = require('./routes/sessions');
const skuRoute = require('./routes/sku');
const calendarRoute = require('./routes/calendar');
const adminRoute = require('./routes/admin');

const app = express();
app.set('trust proxy', 1);

const allowedOrigins = (process.env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    if (allowedOrigins.length === 0 || allowedOrigins.includes(origin)) return cb(null, true);
    cb(null, false);
  },
  credentials: false,
}));

app.use(express.json({ limit: '32kb' }));

app.get('/health', (req, res) => res.json({ ok: true, t: Date.now() }));

// Rate limiters. Premium sessions (CPH/ROU/UMRP) get a higher cap so bulk SKU
// pastes don't trip the general limit. We identify premium via the widget-
// reported customer_tags OR the tags the router verified last request — since
// the limiter runs BEFORE the handler, we trust the client hint here (abuse
// still cannot bypass Pro Mode gating, which re-verifies server-side).
const PREMIUM_TAGS = new Set(['CPH', 'ROU', 'UMRP']);
function isPremiumHint(req) {
  const tags = Array.isArray(req.body?.customer_tags) ? req.body.customer_tags : [];
  return tags.some(t => PREMIUM_TAGS.has(String(t).trim()));
}

const chatLimiterGeneral = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.body?.session_id || req.ip,
  message: { error: 'Too many requests. Please wait a moment.' },
});

const chatLimiterPremium = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.body?.session_id || req.ip,
  message: { error: 'Too many requests. Please wait a moment.' },
});

function chatLimiterSwitch(req, res, next) {
  if (isPremiumHint(req)) return chatLimiterPremium(req, res, next);
  return chatLimiterGeneral(req, res, next);
}

const skuLookupLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.body?.session_id || req.ip,
  message: { error: 'Too many lookups. Please slow down.' },
});

app.use('/chat', chatLimiterSwitch, chatRoute);
app.use('/leads', leadsRoute);
app.use('/product-search', searchRoute);
app.use('/sessions', sessionsRoute);
app.use('/sku-lookup', skuLookupLimiter, skuRoute);
app.use('/calendar-slots', calendarRoute);
app.use('/admin', adminRoute);

app.use((err, req, res, next) => {
  console.error('Uncaught:', err);
  res.status(500).json({ error: 'server_error' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`CF chatbot backend on :${PORT}`));
