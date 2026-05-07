// Professional admin portal for the CF Chatbot.
// Full login flow (bcrypt, CAPTCHA, rate-limit, lockout, session cookies, CSRF)
// plus a multi-page SPA-ish dashboard served from this same route.
//
// Routes:
//   GET  /admin/login                — login page
//   POST /admin/auth/captcha         — issue a new CAPTCHA
//   POST /admin/auth/login           — submit credentials + captcha
//   POST /admin/auth/logout          — revoke the active session
//   GET  /admin/auth/me              — current user + csrf
//   POST /admin/auth/password        — change own password (CSRF required)
//   POST /admin/auth/revoke-others   — revoke every other session for current user (CSRF required)
//   GET  /admin/api/summary
//   GET  /admin/api/top-queries
//   GET  /admin/api/zero-results
//   GET  /admin/api/sessions
//   GET  /admin/api/leads
//   GET  /admin/api/consultations
//   GET  /admin/api/pro-drafts
//   GET  /admin/api/cost-by-day
//   GET  /admin/api/config           — non-sensitive env snapshot
//   POST /admin/api/rollup           — backfill daily_stats (CSRF required)
//   GET  /admin                      — app shell (redirects to /admin/login if no session)

const express = require('express');
const pool = require('../db/pool');
const analytics = require('../lib/analytics');
const auth = require('../lib/adminAuth');
const { currentModel, PRICING } = require('../lib/cost');

const router = express.Router();

const COOKIE_NAME = 'cf_admin_sid';
const COOKIE_OPTS_BASE = 'HttpOnly; Secure; SameSite=Strict; Path=/admin';

// ---------- Security headers (applied to every /admin response) ----------
router.use((req, res, next) => {
  res.set('X-Frame-Options', 'DENY');
  res.set('X-Content-Type-Options', 'nosniff');
  res.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.set(
    'Content-Security-Policy',
    "default-src 'self'; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "font-src 'self' https://fonts.gstatic.com; " +
    "img-src 'self' data: https:; " +
    "script-src 'self' 'unsafe-inline'; " +
    "connect-src 'self'; " +
    "form-action 'self'; " +
    "frame-ancestors 'none'; " +
    "base-uri 'self'"
  );
  res.set('Cache-Control', 'no-store');
  next();
});

// ---------- Helpers ----------
function parseCookies(req) {
  const header = req.get('cookie') || '';
  const out = {};
  header.split(';').forEach(p => {
    const idx = p.indexOf('=');
    if (idx < 0) return;
    const k = p.slice(0, idx).trim();
    if (!k) return;
    out[k] = decodeURIComponent(p.slice(idx + 1).trim());
  });
  return out;
}

function setSessionCookie(res, token, expiresAt) {
  const exp = new Date(expiresAt).toUTCString();
  res.append('Set-Cookie', `${COOKIE_NAME}=${encodeURIComponent(token)}; ${COOKIE_OPTS_BASE}; Expires=${exp}`);
}

function clearSessionCookie(res) {
  res.append('Set-Cookie', `${COOKIE_NAME}=; ${COOKIE_OPTS_BASE}; Max-Age=0`);
}

async function requireSession(req, res, next) {
  const cookies = parseCookies(req);
  const token = cookies[COOKIE_NAME];
  const session = await auth.validateSession(token, { userAgent: req.get('user-agent') });
  if (!session) {
    const url = req.originalUrl || req.url || '';
    const wantsJson = (req.get('accept') || '').includes('application/json')
      || url.startsWith('/admin/api/')
      || url.startsWith('/admin/auth/');
    if (wantsJson) return res.status(401).json({ error: 'unauthenticated' });
    return res.redirect(302, '/admin/login');
  }
  req.adminSession = session;
  req.adminToken = token;
  next();
}

function requireCsrf(req, res, next) {
  if (!auth.verifyCsrfHeader(req, req.adminSession?.csrf)) {
    return res.status(403).json({ error: 'csrf_failed' });
  }
  next();
}

function clientIp(req) {
  return (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.ip || '';
}

// ========== AUTH ENDPOINTS ==========

router.post('/auth/captcha', async (req, res) => {
  try {
    const c = await auth.issueCaptcha();
    auth.pruneExpiredCaptchas().catch(() => {});
    res.json({ id: c.id, question: c.question, expires_at: c.expires });
  } catch (err) {
    console.error('captcha issue failed:', err);
    res.status(500).json({ error: 'captcha_failed' });
  }
});

router.post('/auth/login', async (req, res) => {
  const ip = clientIp(req);
  const ua = req.get('user-agent') || '';
  const username = String(req.body?.username || '').trim().slice(0, 64);
  const password = String(req.body?.password || '');
  const captchaId = String(req.body?.captcha_id || '');
  const captchaAnswer = String(req.body?.captcha_answer || '');

  try {
    // Always consume the CAPTCHA first so wrong captcha can't be brute-forced,
    // then check rate limits and creds. Consume-before-check also prevents an
    // attacker from getting unlimited tries on one captcha_id.
    const captchaOk = await auth.verifyAndConsumeCaptcha(captchaId, captchaAnswer);
    if (!captchaOk) {
      await auth.recordAttempt({ username, ip, success: false, reason: 'bad_captcha' });
      return res.status(400).json({ error: 'captcha_failed', message: 'Incorrect CAPTCHA — try again.' });
    }

    if (!username || !password) {
      await auth.recordAttempt({ username, ip, success: false, reason: 'missing_fields' });
      return res.status(400).json({ error: 'missing_fields', message: 'Username and password required.' });
    }

    const pre = await auth.preLoginCheck({ username, ip });
    if (pre.blocked) {
      await auth.recordAttempt({ username, ip, success: false, reason: pre.reason });
      const msg = pre.reason === 'account_locked'
        ? `Account temporarily locked. Try again in ${pre.retryAfterMin} minutes.`
        : `Too many attempts. Try again in ${pre.retryAfterMin} minutes.`;
      return res.status(429).json({ error: pre.reason, message: msg, retry_after_minutes: pre.retryAfterMin });
    }

    const user = await auth.findUserByUsername(username);
    if (!user) {
      // Timing-equivalent "compare" to keep response time steady vs. valid users.
      await auth.verifyPassword(password, '$2a$12$invalid.salt.invalid.salt.invalid.salt.invalid.salt.inva');
      await auth.recordAttempt({ username, ip, success: false, reason: 'unknown_user' });
      await auth.maybeLockUser(username);
      return res.status(401).json({ error: 'invalid_credentials', message: 'Invalid username or password.' });
    }

    if (!user.is_active) {
      await auth.recordAttempt({ username, ip, success: false, reason: 'inactive' });
      return res.status(403).json({ error: 'inactive', message: 'This account is disabled.' });
    }

    const ok = await auth.verifyPassword(password, user.password_hash);
    if (!ok) {
      await auth.recordAttempt({ username, ip, success: false, reason: 'bad_password' });
      await auth.maybeLockUser(username);
      return res.status(401).json({ error: 'invalid_credentials', message: 'Invalid username or password.' });
    }

    // Success.
    const { token, csrf, expiresAt } = await auth.createSession({ userId: user.id, userAgent: ua, ip });
    await pool.query(
      'UPDATE admin_users SET last_login_at = CURRENT_TIMESTAMP, last_login_ip = ?, locked_until = NULL WHERE id = ?',
      [ip, user.id]
    );
    await auth.recordAttempt({ username, ip, success: true, reason: 'ok' });
    auth.pruneExpiredSessions().catch(() => {});

    setSessionCookie(res, token, expiresAt);
    res.json({
      ok: true,
      user: { username: user.username, display_name: user.display_name, must_change_password: !!user.must_change_password },
      csrf,
      expires_at: expiresAt,
    });
  } catch (err) {
    console.error('login error:', err);
    res.status(500).json({ error: 'server_error' });
  }
});

router.post('/auth/logout', async (req, res) => {
  const cookies = parseCookies(req);
  const token = cookies[COOKIE_NAME];
  if (token) await auth.revokeSession(token).catch(() => {});
  clearSessionCookie(res);
  res.json({ ok: true });
});

router.get('/auth/me', requireSession, (req, res) => {
  res.json({
    user: req.adminSession.user,
    csrf: req.adminSession.csrf,
    expires_at: req.adminSession.expires_at,
  });
});

router.post('/auth/password', requireSession, requireCsrf, async (req, res) => {
  try {
    const current = String(req.body?.current_password || '');
    const next = String(req.body?.new_password || '');
    if (next.length < 12) {
      return res.status(400).json({ error: 'weak_password', message: 'New password must be at least 12 characters.' });
    }
    const [[user]] = await pool.query('SELECT id, password_hash FROM admin_users WHERE id = ? LIMIT 1', [req.adminSession.user.id]);
    if (!user) return res.status(404).json({ error: 'user_not_found' });
    const ok = await auth.verifyPassword(current, user.password_hash);
    if (!ok) return res.status(401).json({ error: 'invalid_current', message: 'Current password is incorrect.' });
    await auth.updatePassword(user.id, next);
    // Revoke every other session for this user.
    await auth.revokeAllSessionsForUser(user.id, { exceptTokenHash: auth.sha256(req.adminToken) });
    res.json({ ok: true, message: 'Password updated. Other sessions revoked.' });
  } catch (err) {
    console.error('password change error:', err);
    res.status(500).json({ error: 'server_error' });
  }
});

router.post('/auth/revoke-others', requireSession, requireCsrf, async (req, res) => {
  try {
    await auth.revokeAllSessionsForUser(req.adminSession.user.id, { exceptTokenHash: auth.sha256(req.adminToken) });
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: 'server_error' }); }
});

// ========== PROTECTED DATA API ==========

const protectedApi = express.Router();
protectedApi.use(requireSession);

protectedApi.get('/summary', async (req, res) => {
  try {
    const days = Number(req.query.days) || 7;
    const [summary, modeMix, funnel, costByDay, costByModel] = await Promise.all([
      analytics.getSummary(days), analytics.getModeMix(days), analytics.getFunnel(days),
      analytics.getCostByDay(days), analytics.getCostByModel(days),
    ]);
    res.json({ days, summary, mode_mix: modeMix, funnel, cost_by_day: costByDay, cost_by_model: costByModel });
  } catch (err) { console.error(err); res.status(500).json({ error: 'summary_failed' }); }
});

protectedApi.get('/top-queries', async (req, res) => {
  const days = Number(req.query.days) || 7;
  res.json({ days, rows: await analytics.getTopQueries(days, Number(req.query.limit) || 30) });
});
protectedApi.get('/zero-results', async (req, res) => {
  const days = Number(req.query.days) || 7;
  res.json({ days, rows: await analytics.getZeroResultQueries(days, Number(req.query.limit) || 30) });
});
protectedApi.get('/sessions', async (req, res) => {
  res.json({ rows: await analytics.getRecentSessions(Number(req.query.limit) || 50) });
});
protectedApi.get('/leads', async (req, res) => {
  res.json({ rows: await analytics.getRecentLeads(Number(req.query.limit) || 50) });
});
protectedApi.get('/consultations', async (req, res) => {
  res.json({ rows: await analytics.getRecentConsultations(Number(req.query.limit) || 50) });
});
protectedApi.get('/pro-drafts', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, session_id, customer_id, total_cents, added_to_cart, checked_out, created_at
         FROM pro_orders_draft ORDER BY id DESC LIMIT ?`,
      [Math.max(1, Math.min(200, Number(req.query.limit) || 50))]
    );
    res.json({ rows });
  } catch (err) { res.status(500).json({ error: 'pro_drafts_failed' }); }
});
protectedApi.get('/cost-by-day', async (req, res) => {
  const days = Number(req.query.days) || 30;
  res.json({ days, rows: await analytics.getCostByDay(days) });
});
protectedApi.get('/config', async (req, res) => {
  // Non-sensitive config snapshot for the Settings page.
  res.json({
    model: currentModel(),
    pricing: PRICING[currentModel()] || null,
    premium_tags: ['CPH', 'ROU', 'UMRP'],
    high_value_cents: Number(process.env.PRO_HIGH_VALUE_CENTS || 500000),
    report_days: Number(process.env.REPORT_DAYS || 7),
    admin_recipient: process.env.ADMIN_EMAIL || '',
    session_ttl_hours: auth.SESSION_TTL_HOURS,
    allowed_origins: (process.env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean),
    node_env: process.env.NODE_ENV || 'development',
    shopify_store: process.env.SHOPIFY_STORE || '',
  });
});
protectedApi.post('/rollup', requireCsrf, async (req, res) => {
  try {
    const days = Math.min(Math.max(Number(req.body?.days) || 30, 1), 180);
    for (let i = 0; i < days; i++) {
      const d = new Date(); d.setDate(d.getDate() - i);
      await analytics.aggregateDay(d.toISOString().slice(0, 10));
    }
    res.json({ ok: true, days });
  } catch (err) { res.status(500).json({ error: 'rollup_failed' }); }
});

router.use('/api', protectedApi);

// ========== HTML VIEWS ==========

router.get('/login', (req, res) => {
  // If already logged in, bounce to the app.
  const token = parseCookies(req)[COOKIE_NAME];
  if (token) {
    auth.validateSession(token).then(s => {
      if (s) return res.redirect(302, '/admin');
      res.set('Content-Type', 'text/html; charset=utf-8').send(LOGIN_HTML);
    }).catch(() => res.set('Content-Type', 'text/html; charset=utf-8').send(LOGIN_HTML));
    return;
  }
  res.set('Content-Type', 'text/html; charset=utf-8').send(LOGIN_HTML);
});

router.get('/', async (req, res) => {
  // Gate the shell itself behind a session.
  const token = parseCookies(req)[COOKIE_NAME];
  const session = await auth.validateSession(token, { userAgent: req.get('user-agent') });
  if (!session) return res.redirect(302, '/admin/login');
  res.set('Content-Type', 'text/html; charset=utf-8').send(APP_HTML);
});

// ========== TEMPLATES ==========
// Kept inline to avoid a separate views/ directory. CSP requires style-src/script-src 'self' 'unsafe-inline'.

const LOGIN_HTML = `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title>Sign in — CF Chatbot Admin</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Montserrat:wght@600;700;800&display=swap" rel="stylesheet">
<style>
:root {
  --deep:#1a365d; --navy:#2d5a87; --coral:#ff6b6b; --gold:#d4af37;
  --text:#0f172a; --muted:#64748b; --border:#e2e8f0; --bg:#f8fafc;
  --danger:#dc2626; --success:#10b981;
}
* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; }
body {
  font: 16px/1.55 Inter, system-ui, sans-serif; color: var(--text);
  min-height: 100vh; display: flex; align-items: center; justify-content: center;
  background: radial-gradient(1200px 600px at 20% -10%, rgba(255,107,107,.18), transparent 60%),
              radial-gradient(900px 500px at 120% 110%, rgba(45,90,135,.35), transparent 60%),
              linear-gradient(135deg, #0b1a33, #1a365d 40%, #2d5a87);
  padding: 24px;
}
.card {
  width: 100%; max-width: 480px;
  background: rgba(255,255,255,.98); border-radius: 18px;
  box-shadow: 0 30px 80px rgba(10,20,45,.45), 0 2px 0 rgba(255,255,255,.4) inset;
  overflow: hidden;
}
.brand {
  background: linear-gradient(135deg, var(--deep), var(--navy));
  color: #fff; padding: 28px 32px; position: relative;
}
.brand::after {
  content: ''; position: absolute; right: -40px; top: -40px; width: 160px; height: 160px;
  background: radial-gradient(closest-side, rgba(255,107,107,.45), transparent); border-radius: 50%;
}
.brand h1 { margin: 0; font: 800 24px/1.15 Montserrat, sans-serif; letter-spacing: -0.01em; }
.brand .sub { margin-top: 6px; opacity: .9; font-size: 14px; }
.body { padding: 28px 32px 32px; }
h2 { margin: 0 0 18px; font: 700 20px Montserrat, sans-serif; color: var(--deep); }
.row { margin-bottom: 18px; }
label { display: block; font-weight: 600; font-size: 14px; color: var(--muted); margin-bottom: 8px; letter-spacing: .02em; }
input[type="text"], input[type="password"], input[type="number"] {
  width: 100%; padding: 13px 15px; border: 1px solid var(--border); border-radius: 10px;
  font: 500 16px Inter, sans-serif; color: var(--text); outline: 0; background: #fff;
  transition: border-color .15s, box-shadow .15s;
}
input:focus { border-color: var(--navy); box-shadow: 0 0 0 3px rgba(45,90,135,.15); }
input:disabled { background: #f8fafc; color: var(--muted); }
.captcha {
  display: flex; gap: 12px; align-items: stretch;
  background: var(--bg); border: 1px dashed var(--border); border-radius: 10px; padding: 14px 16px;
}
.captcha__q { flex: 1; font: 700 20px Montserrat, sans-serif; color: var(--deep); display: flex; align-items: center; letter-spacing: .01em; }
.captcha button {
  background: transparent; color: var(--navy); border: 0; cursor: pointer;
  font: 600 13px Inter, sans-serif; padding: 6px 10px; border-radius: 6px;
}
.captcha button:hover { background: #fff; }
.submit {
  width: 100%; padding: 14px 18px; margin-top: 8px;
  background: linear-gradient(135deg, var(--coral), #ff5252);
  color: #fff; border: 0; border-radius: 10px; cursor: pointer;
  font: 700 16px Inter, sans-serif; letter-spacing: .02em;
  box-shadow: 0 8px 22px rgba(255,107,107,.35);
  transition: transform .12s, box-shadow .15s;
}
.submit:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 12px 28px rgba(255,107,107,.45); }
.submit:disabled { opacity: .6; cursor: not-allowed; transform: none; box-shadow: none; }
.error {
  margin-top: 8px; padding: 12px 14px; border-radius: 8px;
  background: #fef2f2; border: 1px solid #fecaca; color: var(--danger);
  font-size: 14.5px; display: none;
}
.error.is-visible { display: block; }
.footnote {
  margin-top: 22px; text-align: center; font-size: 13px; color: var(--muted);
}
.footnote b { color: var(--text); }
.lock-note { display: flex; align-items: center; gap: 6px; justify-content: center; margin-top: 14px; font-size: 13px; color: var(--muted); }
.lock-note::before { content: '🔒'; }
</style>
</head>
<body>
<div class="card">
  <div class="brand">
    <h1>Celebrate Festival — Admin</h1>
    <div class="sub">AI Chatbot operations & analytics portal</div>
  </div>
  <div class="body">
    <h2>Sign in to continue</h2>
    <form id="login-form" autocomplete="off" novalidate>
      <div class="row">
        <label for="username">Username</label>
        <input id="username" name="username" type="text" autocomplete="username" required maxlength="64" autofocus>
      </div>
      <div class="row">
        <label for="password">Password</label>
        <input id="password" name="password" type="password" autocomplete="current-password" required>
      </div>
      <div class="row">
        <label>Security check</label>
        <div class="captcha">
          <div class="captcha__q" id="captcha-q">Loading…</div>
          <button type="button" id="captcha-refresh" title="New question">↻ New</button>
        </div>
        <input id="captcha-answer" name="captcha_answer" type="number" inputmode="numeric" placeholder="Your answer" required style="margin-top:8px">
        <input id="captcha-id" type="hidden">
      </div>
      <button id="submit" type="submit" class="submit">Sign in</button>
      <div id="error" class="error" role="alert"></div>
    </form>
    <div class="lock-note">Protected by rate limiting, account lockout, and TLS.</div>
    <div class="footnote">Authorized personnel only. <b>All access is logged.</b></div>
  </div>
</div>
<script>
(function(){
  const $ = id => document.getElementById(id);
  const errEl = $('error');
  function showError(msg) { errEl.textContent = msg; errEl.classList.add('is-visible'); }
  function clearError() { errEl.textContent=''; errEl.classList.remove('is-visible'); }

  async function newCaptcha() {
    $('captcha-q').textContent = 'Loading…';
    $('captcha-answer').value = '';
    try {
      const r = await fetch('/admin/auth/captcha', { method: 'POST' });
      if (!r.ok) throw new Error('captcha_load');
      const data = await r.json();
      $('captcha-q').textContent = data.question;
      $('captcha-id').value = data.id;
    } catch (e) {
      $('captcha-q').textContent = 'Could not load security check. Try refresh.';
    }
  }
  $('captcha-refresh').addEventListener('click', newCaptcha);
  newCaptcha();

  $('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    clearError();
    const btn = $('submit');
    btn.disabled = true; btn.textContent = 'Signing in…';
    try {
      const payload = {
        username: $('username').value.trim(),
        password: $('password').value,
        captcha_id: $('captcha-id').value,
        captcha_answer: $('captcha-answer').value,
      };
      const r = await fetch('/admin/auth/login', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await r.json().catch(()=>({}));
      if (!r.ok) {
        showError(data.message || 'Sign-in failed. Please try again.');
        newCaptcha();
        $('password').value = '';
        return;
      }
      window.location.replace('/admin');
    } catch (err) {
      showError('Network error. Please retry.');
      newCaptcha();
    } finally {
      btn.disabled = false; btn.textContent = 'Sign in';
    }
  });
})();
</script>
</body></html>`;

const APP_HTML = `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title>CF Chatbot Admin</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Montserrat:wght@600;700;800&display=swap" rel="stylesheet">
<style>
:root {
  /* Primary brand */
  --deep:#1a365d; --navy:#2d5a87; --coral:#ff6b6b; --gold:#d4af37;
  /* On-white text colors — WCAG AA compliant on #fff and #f8fafc */
  --coral-text:#c7304d;   /* darker coral for readable text on white (4.7:1) */
  --success:#047857;      /* stronger green text on white (4.8:1) */
  --success-bar:#10b981;  /* brighter for accent bars / chips */
  --gold-text:#92400e;    /* bronze/amber text on white (6.7:1) */
  --danger:#b91c1c;       /* 6:1 on white */
  /* Text palette — darker muted per feedback */
  --text:#0b1220;
  --text-soft:#334155;    /* replaces old #64748b for most secondary copy */
  --muted:#475569;        /* passes AA on #fff (7:1) and #f8fafc */
  --muted-strong:#1f2937; /* for labels that were feeling too light */
  /* Surfaces */
  --border:#d8dee6;
  --border-soft:#e2e8f0;
  --bg:#eef2f7;           /* slightly darker app bg so cards pop */
  --card:#ffffff;
  --card-alt:#f8fafc;
  /* Sidebar */
  --sidebar:#0c1a33; --sidebar-text:#f1f5f9; --sidebar-muted:#a5b4c9; --sidebar-accent:#3d6a9f;
}
* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; height: 100%; background: var(--bg); }
body { font: 16px/1.55 Inter, system-ui, sans-serif; color: var(--text); -webkit-font-smoothing: antialiased; text-rendering: optimizeLegibility; }
button { font-family: inherit; }
a { color: var(--navy); text-decoration: none; }

.layout { display: grid; grid-template-columns: 260px 1fr; min-height: 100vh; }

/* Sidebar */
.sidebar { background: var(--sidebar); color: var(--sidebar-text); padding: 22px 0; display: flex; flex-direction: column; position: sticky; top: 0; height: 100vh; box-shadow: 4px 0 16px rgba(12,20,45,.08); }
.sidebar__brand { padding: 0 22px 20px; border-bottom: 1px solid rgba(255,255,255,.08); }
.sidebar__brand h1 { margin: 0; font: 800 20px Montserrat, sans-serif; letter-spacing: -0.01em; color: #fff; }
.sidebar__brand .sub { font-size: 12px; color: var(--sidebar-muted); margin-top: 4px; letter-spacing: .08em; }
.sidebar__nav { padding: 16px 12px; flex: 1; overflow-y: auto; }
.sidebar__group { margin-bottom: 18px; }
.sidebar__label { font: 700 11px/1 Inter, sans-serif; color: var(--sidebar-muted); letter-spacing: .14em; text-transform: uppercase; padding: 10px 12px 8px; }
.sidebar__link { display: flex; align-items: center; gap: 12px; padding: 11px 14px; color: var(--sidebar-text); border-radius: 9px; cursor: pointer; font-size: 15px; font-weight: 500; margin-bottom: 3px; transition: background .15s, color .15s; }
.sidebar__link:hover { background: rgba(255,255,255,.07); color: #fff; }
.sidebar__link.is-active { background: var(--sidebar-accent); color: #fff; font-weight: 600; box-shadow: 0 4px 12px rgba(61,106,159,.35); }
.sidebar__link svg { width: 18px; height: 18px; opacity: .9; flex: 0 0 auto; }
.sidebar__foot { padding: 16px 22px; border-top: 1px solid rgba(255,255,255,.08); font-size: 13px; color: var(--sidebar-muted); line-height: 1.5; }
.sidebar__foot b { color: #fff; font-weight: 600; }

/* Topbar */
.topbar { display: flex; justify-content: space-between; align-items: center; padding: 18px 32px; background: #fff; border-bottom: 1px solid var(--border); position: sticky; top: 0; z-index: 5; box-shadow: 0 2px 6px rgba(12,20,45,.04); }
.topbar__title { font: 700 20px Montserrat, sans-serif; color: var(--deep); }
.topbar__title .crumb { color: var(--muted); font-weight: 500; font-size: 15px; margin-left: 10px; }
.topbar__right { display: flex; align-items: center; gap: 14px; }
.window-select { padding: 10px 14px; border-radius: 9px; border: 1px solid var(--border); font: 500 14.5px Inter, sans-serif; background: #fff; cursor: pointer; color: var(--text); }
.window-select:focus { outline: 0; border-color: var(--navy); box-shadow: 0 0 0 3px rgba(45,90,135,.15); }
.topbar__user { display: flex; align-items: center; gap: 10px; padding: 7px 14px 7px 7px; background: var(--card-alt); border: 1px solid var(--border-soft); border-radius: 999px; font-size: 14px; font-weight: 600; color: var(--text); }
.topbar__user .avatar { width: 30px; height: 30px; border-radius: 50%; background: linear-gradient(135deg, var(--coral), var(--navy)); color: #fff; display: flex; align-items: center; justify-content: center; font: 800 13px Montserrat, sans-serif; }
.btn { padding: 10px 16px; border-radius: 9px; border: 1px solid var(--border); background: #fff; color: var(--text); cursor: pointer; font: 600 14px Inter, sans-serif; transition: all .15s; }
.btn:hover { border-color: var(--navy); color: var(--navy); }
.btn.danger { border-color: #fecaca; color: var(--danger); }
.btn.danger:hover { background: #fef2f2; }
.btn.primary { background: var(--navy); color: #fff; border-color: var(--navy); }
.btn.primary:hover { background: var(--deep); }
.btn:focus-visible { outline: 0; box-shadow: 0 0 0 3px rgba(45,90,135,.25); }

/* Content area */
.content { padding: 26px 32px 48px; }
.page-head { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 20px; gap: 14px; flex-wrap: wrap; }
.page-head h2 { margin: 0; font: 700 22px Montserrat, sans-serif; color: var(--deep); }
.page-head .desc { color: var(--muted); font-size: 14.5px; margin-top: 4px; }
.page-head .actions { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }

.kpis { display: grid; grid-template-columns: repeat(auto-fit, minmax(210px,1fr)); gap: 16px; margin-bottom: 24px; }
.kpi { background: var(--card); border: 1px solid var(--border); border-radius: 14px; padding: 20px 22px; position: relative; overflow: hidden; box-shadow: 0 1px 0 rgba(12,20,45,.03), 0 4px 14px rgba(12,20,45,.04); }
.kpi::before { content: ''; position: absolute; top: 0; left: 0; width: 5px; height: 100%; background: var(--navy); }
.kpi.coral::before { background: var(--coral); }
.kpi.success::before { background: var(--success-bar); }
.kpi.gold::before { background: var(--gold); }
.kpi__label { font: 700 12px/1.1 Inter, sans-serif; text-transform: uppercase; letter-spacing: .1em; color: var(--muted); }
.kpi__value { font: 800 30px/1.15 Montserrat, sans-serif; color: var(--deep); margin-top: 10px; letter-spacing: -0.01em; }
.kpi__value.coral { color: var(--coral-text); }
.kpi__value.success { color: var(--success); }
.kpi__note { font-size: 13px; color: var(--muted); margin-top: 6px; }

.grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
@media (max-width: 1100px) { .grid-2 { grid-template-columns: 1fr; } }

.card { background: var(--card); border: 1px solid var(--border); border-radius: 14px; overflow: hidden; box-shadow: 0 1px 0 rgba(12,20,45,.03), 0 4px 14px rgba(12,20,45,.04); }
.card__head { padding: 18px 22px; border-bottom: 1px solid var(--border-soft); display: flex; justify-content: space-between; align-items: center; background: var(--card); }
.card__title { font: 700 16px Montserrat, sans-serif; color: var(--deep); }
.card__meta { font: 500 13px Inter, sans-serif; color: var(--muted); }
.card__body { padding: 6px 0; max-height: 520px; overflow: auto; }

table { width: 100%; border-collapse: collapse; }
th, td { text-align: left; padding: 12px 22px; font-size: 14.5px; border-bottom: 1px solid var(--border-soft); vertical-align: top; }
th { background: var(--card-alt); font: 700 12.5px Inter, sans-serif; color: var(--muted-strong); letter-spacing: .06em; text-transform: uppercase; position: sticky; top: 0; border-bottom: 1px solid var(--border); }
tr:last-child td { border-bottom: 0; }
tbody tr:hover td { background: #fafcfe; }
td { color: var(--text); }
.num { text-align: right; font-variant-numeric: tabular-nums; font-feature-settings: "tnum"; }
.trunc { max-width: 420px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.tag { display: inline-block; padding: 4px 10px; border-radius: 999px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: .05em; line-height: 1.2; }
.tag.discovery { background: #dbe4ff; color: #2b2f77; }
.tag.consultation { background: #fbd7e4; color: #7a1040; }
.tag.pro { background: #d5f5e3; color: #064e3b; }
.tag.premium { background: #fde9b2; color: #7a3d00; }
.tag.booked { background: #c8f0d5; color: #0b4d2a; }
.tag.summary_sent { background: #cbdcfd; color: #162d6b; }
.tag.in_progress { background: #c5e4fb; color: #0b4a75; }
.tag.abandoned { background: #e6ebf2; color: #334155; }

.empty { padding: 36px 22px; text-align: center; color: var(--muted); font-size: 15px; }
.bar { display: inline-block; height: 10px; border-radius: 5px; background: linear-gradient(90deg, var(--coral), var(--navy)); vertical-align: middle; }
.muted { color: var(--muted); }
.toolbar { display: flex; gap: 10px; align-items: center; margin-bottom: 16px; flex-wrap: wrap; }
.toolbar .chip { font: 600 13.5px Inter, sans-serif; padding: 8px 14px; border-radius: 999px; background: #fff; border: 1px solid var(--border); cursor: pointer; color: var(--text-soft); transition: all .15s; }
.toolbar .chip:hover { border-color: var(--navy); color: var(--navy); }
.toolbar .chip.is-active { background: var(--navy); color: #fff; border-color: var(--navy); }
.search { padding: 10px 14px; border-radius: 9px; border: 1px solid var(--border); font: 500 14.5px Inter, sans-serif; min-width: 280px; color: var(--text); background: #fff; }
.search:focus { outline: 0; border-color: var(--navy); box-shadow: 0 0 0 3px rgba(45,90,135,.15); }

.settings-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
@media (max-width: 900px) { .settings-grid { grid-template-columns: 1fr; } }
.form-row { margin-bottom: 16px; }
.form-row label { display: block; font-weight: 700; font-size: 13px; color: var(--muted-strong); text-transform: uppercase; letter-spacing: .06em; margin-bottom: 7px; }
.form-row input {
  width: 100%; padding: 12px 14px; border: 1px solid var(--border); border-radius: 9px;
  font: 500 15px Inter, sans-serif; outline: 0; color: var(--text); background: #fff;
  transition: border-color .15s, box-shadow .15s;
}
.form-row input:focus { border-color: var(--navy); box-shadow: 0 0 0 3px rgba(45,90,135,.15); }
.form-row .hint { font-size: 13px; color: var(--muted); margin-top: 6px; }
.kv { display: grid; grid-template-columns: 220px 1fr; font-size: 14.5px; padding: 12px 22px; border-bottom: 1px solid var(--border-soft); align-items: baseline; }
.kv:last-child { border-bottom: 0; }
.kv__k { font-weight: 700; color: var(--muted-strong); font-size: 13.5px; text-transform: uppercase; letter-spacing: .04em; }
.kv__v { font-variant-numeric: tabular-nums; word-break: break-all; color: var(--text); }
.kv__v code { background: var(--card-alt); padding: 2px 6px; border-radius: 4px; font-size: 13.5px; }
.flash { margin: 10px 0; padding: 12px 14px; border-radius: 9px; font-size: 14.5px; display: none; font-weight: 500; }
.flash.is-visible { display: block; }
.flash.success { background: #dcfce7; border: 1px solid #86efac; color: #065f46; }
.flash.error { background: #fee2e2; border: 1px solid #fecaca; color: var(--danger); }

@media (max-width: 900px) {
  .layout { grid-template-columns: 1fr; }
  .sidebar { position: relative; height: auto; padding: 12px 0; }
  .sidebar__nav { display: flex; overflow-x: auto; padding: 10px; -webkit-overflow-scrolling: touch; }
  .sidebar__group { display: flex; margin: 0 6px 0 0; }
  .sidebar__link { white-space: nowrap; margin-right: 6px; font-size: 14px; padding: 9px 14px; }
  .sidebar__foot, .sidebar__brand, .sidebar__label { display: none; }
  .topbar { padding: 14px 18px; }
  .topbar__title { font-size: 18px; }
  .content { padding: 18px; }
  .kpis { grid-template-columns: repeat(auto-fit, minmax(160px,1fr)); gap: 12px; }
  .kpi__value { font-size: 26px; }
  th, td { padding: 10px 14px; font-size: 14px; }
  .kv { grid-template-columns: 140px 1fr; padding: 10px 16px; font-size: 14px; }
}

/* icon helpers */
.i { width: 18px; height: 18px; flex: 0 0 auto; }
</style>
</head>
<body>
<div class="layout">
  <aside class="sidebar">
    <div class="sidebar__brand">
      <h1>CF Admin</h1>
      <div class="sub">AI CHATBOT OPERATIONS</div>
    </div>
    <nav class="sidebar__nav" id="nav">
      <div class="sidebar__group">
        <div class="sidebar__label">Overview</div>
        <a class="sidebar__link" data-route="dashboard">
          <svg class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 13l9-9 9 9M5 10v10h14V10"/></svg>
          Dashboard
        </a>
        <a class="sidebar__link" data-route="cost">
          <svg class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 100 7h5a3.5 3.5 0 110 7H6"/></svg>
          Cost & Usage
        </a>
      </div>
      <div class="sidebar__group">
        <div class="sidebar__label">Activity</div>
        <a class="sidebar__link" data-route="sessions">
          <svg class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
          Sessions
        </a>
        <a class="sidebar__link" data-route="queries">
          <svg class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
          Queries
        </a>
      </div>
      <div class="sidebar__group">
        <div class="sidebar__label">Conversions</div>
        <a class="sidebar__link" data-route="leads">
          <svg class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          Leads
        </a>
        <a class="sidebar__link" data-route="consultations">
          <svg class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
          Consultations
        </a>
        <a class="sidebar__link" data-route="pro">
          <svg class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/></svg>
          Pro Bulk Drafts
        </a>
      </div>
      <div class="sidebar__group">
        <div class="sidebar__label">System</div>
        <a class="sidebar__link" data-route="settings">
          <svg class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.7 1.7 0 00-1.82-.33 1.7 1.7 0 00-1 1.51V21a2 2 0 11-4 0v-.09a1.7 1.7 0 00-1-1.51 1.7 1.7 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.7 1.7 0 00.33-1.82 1.7 1.7 0 00-1.51-1H3a2 2 0 110-4h.09a1.7 1.7 0 001.51-1 1.7 1.7 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.7 1.7 0 001.82.33h.05a1.7 1.7 0 001-1.51V3a2 2 0 114 0v.09a1.7 1.7 0 001 1.51 1.7 1.7 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.7 1.7 0 00-.33 1.82v.05a1.7 1.7 0 001.51 1H21a2 2 0 110 4h-.09a1.7 1.7 0 00-1.51 1z"/></svg>
          Settings
        </a>
      </div>
    </nav>
    <div class="sidebar__foot">
      Signed in as <b id="sidebar-user">…</b><br>
      <span id="sidebar-exp" class="muted"></span>
    </div>
  </aside>

  <main>
    <header class="topbar">
      <div class="topbar__title">
        <span id="page-title">Dashboard</span>
        <span class="crumb" id="page-crumb"></span>
      </div>
      <div class="topbar__right">
        <select class="window-select" id="window">
          <option value="1">Last 24 hours</option>
          <option value="7" selected>Last 7 days</option>
          <option value="14">Last 14 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
        </select>
        <button class="btn" id="refresh-btn">Refresh</button>
        <div class="topbar__user"><div class="avatar" id="avatar">?</div><span id="topbar-user">…</span></div>
        <button class="btn danger" id="logout-btn">Log out</button>
      </div>
    </header>
    <section class="content" id="view">
      <div class="empty">Loading…</div>
    </section>
  </main>
</div>
<script>
(function(){
  const $ = id => document.getElementById(id);
  const state = { me: null, csrf: null, days: Number($('window').value), route: null };

  function esc(s) { return String(s==null?'':s).replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c])); }
  function fmt(n) { return Number(n||0).toLocaleString('en-US'); }
  function money(n, digits) { digits = digits == null ? 4 : digits; return '$' + Number(n||0).toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits }); }
  function pct(a,b){ if(!b) return '—'; return (100*a/b).toFixed(1)+'%'; }
  function relTime(iso) { if(!iso) return '—'; const m = Math.round((Date.now()-new Date(iso).getTime())/60000); if(m<1)return 'just now'; if(m<60)return m+'m ago'; if(m<1440)return Math.round(m/60)+'h ago'; return Math.round(m/1440)+'d ago'; }
  function modeTag(m) { return '<span class="tag '+esc(m||'discovery')+'">'+esc(m||'discovery')+'</span>'; }
  function statusTag(s) { return '<span class="tag '+esc(s)+'">'+esc(s)+'</span>'; }
  function cents(n) { return '$' + (Number(n||0)/100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }

  async function api(path, opts) {
    opts = opts || {};
    opts.credentials = 'same-origin';
    if (opts.method && opts.method !== 'GET') {
      opts.headers = Object.assign({ 'Content-Type': 'application/json', 'X-CSRF-Token': state.csrf || '' }, opts.headers || {});
    }
    const r = await fetch(path, opts);
    if (r.status === 401) { window.location.replace('/admin/login'); throw new Error('unauth'); }
    const data = await r.json().catch(()=>({}));
    if (!r.ok) throw Object.assign(new Error(data.error||'api_error'), { data });
    return data;
  }

  async function bootstrap() {
    try {
      const me = await api('/admin/auth/me');
      state.me = me.user; state.csrf = me.csrf;
      const name = me.user.display_name || me.user.username;
      $('topbar-user').textContent = name;
      $('sidebar-user').textContent = name;
      $('avatar').textContent = (name[0]||'?').toUpperCase();
      const exp = new Date(me.expires_at);
      $('sidebar-exp').textContent = 'Session ends ' + exp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (err) { return; }
    attachEvents();
    routeTo(location.hash.replace(/^#\\/?/,'') || 'dashboard');
  }

  // ----- Routing -----
  const ROUTES = {
    dashboard: { title: 'Dashboard', render: renderDashboard },
    cost:      { title: 'Cost & Usage', render: renderCost },
    sessions:  { title: 'Sessions', render: renderSessions },
    queries:   { title: 'Queries', render: renderQueries },
    leads:     { title: 'Leads', render: renderLeads },
    consultations: { title: 'Consultations', render: renderConsultations },
    pro:       { title: 'Pro Bulk Drafts', render: renderProDrafts },
    settings:  { title: 'Settings', render: renderSettings },
  };
  function routeTo(name) {
    if (!ROUTES[name]) name = 'dashboard';
    state.route = name;
    document.querySelectorAll('.sidebar__link').forEach(el => {
      el.classList.toggle('is-active', el.getAttribute('data-route') === name);
    });
    $('page-title').textContent = ROUTES[name].title;
    $('page-crumb').textContent = name === 'dashboard' ? '' : '/ ' + ROUTES[name].title;
    $('view').innerHTML = '<div class="empty">Loading…</div>';
    ROUTES[name].render().catch(err => {
      $('view').innerHTML = '<div class="empty">Failed to load: ' + esc(err.message||'error') + '</div>';
    });
  }
  window.addEventListener('hashchange', () => routeTo(location.hash.replace(/^#\\/?/,'') || 'dashboard'));

  function attachEvents() {
    document.querySelectorAll('.sidebar__link').forEach(el => {
      el.addEventListener('click', () => { location.hash = '#/' + el.getAttribute('data-route'); });
    });
    $('window').addEventListener('change', () => { state.days = Number($('window').value); routeTo(state.route); });
    $('refresh-btn').addEventListener('click', () => routeTo(state.route));
    $('logout-btn').addEventListener('click', async () => {
      await fetch('/admin/auth/logout', { method: 'POST', credentials: 'same-origin' });
      window.location.replace('/admin/login');
    });
  }

  // ----- Renderers -----
  async function renderDashboard() {
    const data = await api('/admin/api/summary?days='+state.days);
    const s = data.summary, f = data.funnel, mm = data.mode_mix || [], cbd = data.cost_by_day || [], cbm = data.cost_by_model || [];
    const totalModes = mm.reduce((a,m)=>a+Number(m.count||0),0);
    const maxCost = Math.max(0.00001, ...cbd.map(d=>Number(d.cost_usd||0)));
    $('view').innerHTML = ''
      + '<div class="kpis">'
      + kpi('Sessions', fmt(s.sessions_total), 'navy')
      + kpi('User messages', fmt(s.user_messages), 'navy')
      + kpi('LLM calls', fmt(s.assistant_messages), 'navy')
      + kpi('Tokens (in / out)', fmt(s.tokens_in)+' / '+fmt(s.tokens_out), 'navy')
      + kpi('LLM cost (USD)', money(s.cost_usd), 'coral')
      + kpi('Leads', fmt(s.leads), 'gold')
      + kpi('Consultations booked', fmt(s.consultations_booked), 'success')
      + kpi('Pro drafts', fmt(s.pro_drafts), 'success')
      + '</div>'
      + '<div class="grid-2">'
      +   card('Mode Mix', totalModes===0
              ? '<div class="empty">No messages yet.</div>'
              : '<table><tr><th>Mode</th><th class="num">Count</th><th class="num">%</th><th></th></tr>'+
                mm.map(m=>{ const c=Number(m.count||0); return '<tr><td>'+modeTag(m.mode)+'</td><td class="num">'+fmt(c)+'</td><td class="num">'+pct(c,totalModes)+'</td><td>'+bar(c, mm[0].count)+'</td></tr>'; }).join('') +
                '</table>')
      +   card('Funnel', ''
              + '<table>'
              + row('Sessions started', fmt(f.sessions), '100%')
              + row('Engaged (2+ msgs)', fmt(f.engaged), pct(f.engaged,f.sessions))
              + row('Leads captured', fmt(f.leads), pct(f.leads,f.sessions))
              + row('Consultations booked', fmt(f.bookings), pct(f.bookings,f.sessions))
              + row('Pro added-to-cart', fmt(f.pro_added), pct(f.pro_added,f.sessions))
              + '</table>')
      + '</div>'
      + '<div class="grid-2" style="margin-top:16px">'
      +   card('Cost by day', cbd.length===0 ? '<div class="empty">No LLM calls.</div>'
              : '<table><tr><th>Day</th><th class="num">Calls</th><th class="num">Tokens</th><th class="num">Cost</th><th></th></tr>'+
                cbd.map(d=>'<tr><td>'+esc(String(d.day).slice(0,10))+'</td><td class="num">'+fmt(d.calls)+'</td><td class="num">'+fmt(Number(d.tokens_in)+Number(d.tokens_out))+'</td><td class="num">'+money(d.cost_usd)+'</td><td>'+bar(d.cost_usd,maxCost)+'</td></tr>').join('') +
                '</table>')
      +   card('Cost by model', cbm.length===0 ? '<div class="empty">No data yet.</div>'
              : '<table><tr><th>Model</th><th class="num">Calls</th><th class="num">Tokens in</th><th class="num">Tokens out</th><th class="num">Cost</th></tr>'+
                cbm.map(m=>'<tr><td>'+esc(m.model)+'</td><td class="num">'+fmt(m.calls)+'</td><td class="num">'+fmt(m.tokens_in)+'</td><td class="num">'+fmt(m.tokens_out)+'</td><td class="num">'+money(m.cost_usd)+'</td></tr>').join('') +
                '</table>')
      + '</div>';
  }

  async function renderCost() {
    const [sum, byDay] = await Promise.all([ api('/admin/api/summary?days='+state.days), api('/admin/api/cost-by-day?days='+state.days) ]);
    const days = byDay.rows || []; const maxCost = Math.max(0.00001, ...days.map(d=>Number(d.cost_usd||0)));
    const s = sum.summary;
    $('view').innerHTML = ''
      + '<div class="kpis">'
      + kpi('Tokens in', fmt(s.tokens_in), 'navy')
      + kpi('Tokens out', fmt(s.tokens_out), 'navy')
      + kpi('LLM calls', fmt(s.assistant_messages), 'navy')
      + kpi('Total cost', money(s.cost_usd), 'coral')
      + '</div>'
      + card('Cost by day (last '+state.days+'d)', days.length===0 ? '<div class="empty">No LLM calls yet.</div>'
          : '<table><tr><th>Day</th><th class="num">Calls</th><th class="num">Tokens in</th><th class="num">Tokens out</th><th class="num">Cost (USD)</th><th></th></tr>'+
            days.map(d=>'<tr><td>'+esc(String(d.day).slice(0,10))+'</td><td class="num">'+fmt(d.calls)+'</td><td class="num">'+fmt(d.tokens_in)+'</td><td class="num">'+fmt(d.tokens_out)+'</td><td class="num">'+money(d.cost_usd)+'</td><td>'+bar(d.cost_usd,maxCost)+'</td></tr>').join('') +
            '</table>')
      + '<div style="margin-top:16px">'+ card('Model pricing (current)', '<div id="pricing-body">Loading…</div>') +'</div>';
    const cfg = await api('/admin/api/config');
    const p = cfg.pricing || { in: 0, out: 0 };
    $('pricing-body').innerHTML = ''
      + '<div class="kv"><div class="kv__k">Current model</div><div class="kv__v">'+esc(cfg.model)+'</div></div>'
      + '<div class="kv"><div class="kv__k">Input price</div><div class="kv__v">'+money(p.in*1e6,2)+' per 1M tokens</div></div>'
      + '<div class="kv"><div class="kv__k">Output price</div><div class="kv__v">'+money(p.out*1e6,2)+' per 1M tokens</div></div>';
  }

  async function renderSessions() {
    const data = await api('/admin/api/sessions?limit=100');
    const rows = data.rows || [];
    $('view').innerHTML =
      '<div class="toolbar">'
      + '<input id="f-q" class="search" placeholder="Filter by first message / session ID…">'
      + '<button class="chip is-active" data-mode="">All modes</button>'
      + '<button class="chip" data-mode="discovery">Discovery</button>'
      + '<button class="chip" data-mode="consultation">Consultation</button>'
      + '<button class="chip" data-mode="pro">Pro</button>'
      + '</div>'
      + card('Recent sessions (' + rows.length + ')', '<div id="sess-body"></div>');
    let mode = ''; let q = '';
    function repaint() {
      const filtered = rows.filter(r =>
        (mode === '' || r.mode === mode) &&
        (q === '' || (String(r.first_message||'').toLowerCase().includes(q) || String(r.session_id).includes(q)))
      );
      $('sess-body').innerHTML = filtered.length === 0 ? '<div class="empty">No sessions match.</div>'
        : '<table><tr><th>Started</th><th>Mode</th><th>Premium</th><th>Msgs</th><th>User</th><th>First message</th><th>Session</th></tr>'+
          filtered.map(r=>'<tr><td class="muted">'+esc(relTime(r.created_at))+'</td><td>'+modeTag(r.mode)+'</td><td>'+(r.is_premium?'<span class="tag premium">Premium</span>':'')+'</td><td class="num">'+fmt(r.message_count)+'</td><td>'+esc(r.user_id||'guest')+'</td><td class="trunc muted">'+esc(r.first_message||'')+'</td><td class="muted" style="font-family:monospace;font-size:11px">'+esc(String(r.session_id).slice(0,12))+'…</td></tr>').join('') +
          '</table>';
    }
    repaint();
    document.querySelectorAll('.chip').forEach(c => c.addEventListener('click', () => {
      document.querySelectorAll('.chip').forEach(x=>x.classList.remove('is-active'));
      c.classList.add('is-active'); mode = c.getAttribute('data-mode'); repaint();
    }));
    $('f-q').addEventListener('input', e => { q = e.target.value.trim().toLowerCase(); repaint(); });
  }

  async function renderQueries() {
    const [top, zero] = await Promise.all([
      api('/admin/api/top-queries?days='+state.days+'&limit=50'),
      api('/admin/api/zero-results?days='+state.days+'&limit=50'),
    ]);
    $('view').innerHTML = '<div class="grid-2">'
      + card('Top queries', (top.rows||[]).length===0 ? '<div class="empty">No repeated queries in this window.</div>'
          : '<table><tr><th>Query</th><th class="num">Count</th></tr>'+top.rows.map(r=>'<tr><td class="trunc">'+esc(r.query)+'</td><td class="num">'+fmt(r.count)+'</td></tr>').join('')+'</table>')
      + card('Zero-result queries <span style="color:#d4af37">(SEO / inventory gaps)</span>', (zero.rows||[]).length===0 ? '<div class="empty">None — retrieval is matching.</div>'
          : '<table><tr><th>Query</th><th class="num">Count</th></tr>'+zero.rows.map(r=>'<tr><td class="trunc">'+esc(r.query)+'</td><td class="num">'+fmt(r.count)+'</td></tr>').join('')+'</table>')
      + '</div>';
  }

  async function renderLeads() {
    const data = await api('/admin/api/leads?limit=100');
    const rows = data.rows || [];
    $('view').innerHTML = card('Recent leads (' + rows.length + ')',
      rows.length === 0 ? '<div class="empty">No leads yet.</div>'
        : '<table><tr><th>When</th><th>Name</th><th>Email</th><th>Phone</th><th>Source</th><th>Notes</th></tr>'+
          rows.map(r=>'<tr><td class="muted">'+esc(relTime(r.created_at))+'</td><td>'+esc(r.name||'—')+'</td><td>'+esc(r.email)+'</td><td>'+esc(r.phone||'—')+'</td><td>'+esc(r.source||'—')+'</td><td class="trunc muted">'+esc(r.notes||'')+'</td></tr>').join('') +
          '</table>');
  }

  async function renderConsultations() {
    const data = await api('/admin/api/consultations?limit=100');
    const rows = data.rows || [];
    $('view').innerHTML = card('Consultations (' + rows.length + ')',
      rows.length === 0 ? '<div class="empty">None yet.</div>'
        : '<table><tr><th>Created</th><th>Status</th><th>Cuisine</th><th>Service</th><th>Location</th><th>Budget</th><th>Slot</th></tr>'+
          rows.map(r=>'<tr><td class="muted">'+esc(relTime(r.created_at))+'</td><td>'+statusTag(r.status)+'</td><td>'+esc(r.cuisine||'—')+'</td><td>'+esc(r.service_type||'—')+'</td><td>'+esc(r.location||'—')+'</td><td>'+esc(r.budget||'—')+'</td><td class="muted">'+esc(r.booking_slot_start||'—')+'</td></tr>').join('') +
          '</table>');
  }

  async function renderProDrafts() {
    const data = await api('/admin/api/pro-drafts?limit=100');
    const rows = data.rows || [];
    $('view').innerHTML = card('Pro bulk drafts (' + rows.length + ')',
      rows.length === 0 ? '<div class="empty">No Pro drafts yet.</div>'
        : '<table><tr><th>When</th><th>Customer</th><th class="num">Total</th><th>Added</th><th>Checked out</th><th>Session</th></tr>'+
          rows.map(r=>'<tr><td class="muted">'+esc(relTime(r.created_at))+'</td><td>'+esc(r.customer_id||'guest')+'</td><td class="num">'+cents(r.total_cents)+'</td><td>'+(r.added_to_cart?'<span class="tag booked">Yes</span>':'<span class="tag abandoned">No</span>')+'</td><td>'+(r.checked_out?'<span class="tag booked">Yes</span>':'<span class="tag abandoned">No</span>')+'</td><td class="muted" style="font-family:monospace;font-size:11px">'+esc(String(r.session_id).slice(0,12))+'…</td></tr>').join('') +
          '</table>');
  }

  async function renderSettings() {
    const cfg = await api('/admin/api/config');
    $('view').innerHTML = '<div class="settings-grid">'
      + card('Change password', ''
          + '<div style="padding:0 18px 14px"><div id="pw-flash" class="flash"></div>'
          + '<div class="form-row"><label>Current password</label><input id="cur-pass" type="password" autocomplete="current-password"></div>'
          + '<div class="form-row"><label>New password</label><input id="new-pass" type="password" autocomplete="new-password"><div class="hint">At least 12 characters. Updating will revoke every other session.</div></div>'
          + '<div class="form-row"><label>Confirm new password</label><input id="new-pass2" type="password" autocomplete="new-password"></div>'
          + '<button class="btn primary" id="pw-submit">Update password</button></div>')

      + card('Sessions', ''
          + '<div style="padding:0 18px 14px"><div id="sess-flash" class="flash"></div>'
          + '<div class="kv"><div class="kv__k">Signed in as</div><div class="kv__v">'+esc(state.me.username)+'</div></div>'
          + '<div class="kv"><div class="kv__k">Session TTL</div><div class="kv__v">'+esc(cfg.session_ttl_hours)+' hours</div></div>'
          + '<div class="kv"><div class="kv__k">Revoke others</div><div class="kv__v"><button class="btn danger" id="revoke-others">Sign out other sessions</button></div></div></div>')

      + card('System configuration', ''
          + '<div class="kv"><div class="kv__k">Environment</div><div class="kv__v">'+esc(cfg.node_env)+'</div></div>'
          + '<div class="kv"><div class="kv__k">Shopify store</div><div class="kv__v">'+esc(cfg.shopify_store||'—')+'</div></div>'
          + '<div class="kv"><div class="kv__k">LLM model</div><div class="kv__v">'+esc(cfg.model)+'</div></div>'
          + '<div class="kv"><div class="kv__k">Premium tags</div><div class="kv__v">'+(cfg.premium_tags||[]).map(t=>'<span class="tag premium" style="margin-right:4px">'+esc(t)+'</span>').join('')+'</div></div>'
          + '<div class="kv"><div class="kv__k">High-value threshold</div><div class="kv__v">'+cents(cfg.high_value_cents)+'</div></div>'
          + '<div class="kv"><div class="kv__k">Weekly report window</div><div class="kv__v">'+esc(cfg.report_days)+' days</div></div>'
          + '<div class="kv"><div class="kv__k">Report recipient</div><div class="kv__v">'+esc(cfg.admin_recipient||'—')+'</div></div>'
          + '<div class="kv"><div class="kv__k">CORS origins</div><div class="kv__v">'+(cfg.allowed_origins||[]).map(o=>esc(o)).join('<br>')+'</div></div>')

      + card('Data ops', ''
          + '<div style="padding:0 18px 14px"><div id="rollup-flash" class="flash"></div>'
          + '<p class="muted" style="font-size:12.5px">Manually refresh <code>daily_stats</code> rollups for the last 30 days. Also runs automatically in the weekly report.</p>'
          + '<button class="btn" id="rollup-btn">Run 30-day rollup</button></div>')
      + '</div>';

    // Hook up interactions.
    $('pw-submit').addEventListener('click', async () => {
      const flash = $('pw-flash'); flash.className = 'flash';
      const a = $('cur-pass').value, b = $('new-pass').value, c = $('new-pass2').value;
      if (b !== c) { flash.textContent = 'New password and confirmation do not match.'; flash.className = 'flash error is-visible'; return; }
      try {
        const r = await api('/admin/auth/password', { method: 'POST', body: JSON.stringify({ current_password: a, new_password: b }) });
        flash.textContent = r.message || 'Password updated.'; flash.className = 'flash success is-visible';
        $('cur-pass').value=''; $('new-pass').value=''; $('new-pass2').value='';
      } catch (err) { flash.textContent = (err.data && err.data.message) || 'Could not update password.'; flash.className = 'flash error is-visible'; }
    });
    $('revoke-others').addEventListener('click', async () => {
      const flash = $('sess-flash'); flash.className = 'flash';
      try { await api('/admin/auth/revoke-others', { method: 'POST' }); flash.textContent = 'Other sessions revoked.'; flash.className = 'flash success is-visible'; }
      catch { flash.textContent = 'Failed.'; flash.className = 'flash error is-visible'; }
    });
    $('rollup-btn').addEventListener('click', async () => {
      const flash = $('rollup-flash'); flash.className = 'flash';
      $('rollup-btn').disabled = true; $('rollup-btn').textContent = 'Running…';
      try { await api('/admin/api/rollup', { method: 'POST', body: JSON.stringify({ days: 30 }) }); flash.textContent = 'Daily stats refreshed for last 30 days.'; flash.className = 'flash success is-visible'; }
      catch { flash.textContent = 'Rollup failed.'; flash.className = 'flash error is-visible'; }
      $('rollup-btn').disabled = false; $('rollup-btn').textContent = 'Run 30-day rollup';
    });
  }

  // ----- Helpers (HTML) -----
  function kpi(label, value, style) {
    const cls = 'kpi ' + (style||'');
    const valueCls = style === 'coral' ? 'coral' : (style === 'success' ? 'success' : '');
    return '<div class="'+cls+'"><div class="kpi__label">'+esc(label)+'</div><div class="kpi__value '+valueCls+'">'+value+'</div></div>';
  }
  function card(title, bodyHtml, meta) {
    return '<div class="card"><div class="card__head"><div class="card__title">'+title+'</div>'+(meta?'<div class="card__meta">'+esc(meta)+'</div>':'')+'</div><div class="card__body">'+bodyHtml+'</div></div>';
  }
  function row(label, value, right) { return '<tr><td>'+esc(label)+'</td><td class="num">'+value+'</td><td class="num muted">'+right+'</td></tr>'; }
  function bar(value, max) { if (!max || !value) return ''; const p = Math.max(3, Math.round(100*value/max)); return '<span class="bar" style="width:'+p+'%"></span>'; }

  bootstrap();
})();
</script>
</body></html>`;

module.exports = router;
