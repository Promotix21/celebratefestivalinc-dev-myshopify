// Admin authentication primitives.
// - bcrypt password hashing (cost 12)
// - server-side sessions in admin_sessions (HttpOnly cookie carries raw token, DB stores SHA-256 hash)
// - math CAPTCHA stored hashed with a 5-min TTL, single-use
// - rate limiting + per-user lockout
// - CSRF double-submit token for state-changing routes

const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const pool = require('../db/pool');

const SESSION_TTL_HOURS = Number(process.env.ADMIN_SESSION_TTL_HOURS || 12);
const CAPTCHA_TTL_MIN = 5;
const MAX_FAILED_PER_IP = 8;
const WINDOW_MIN_IP = 15;
const MAX_FAILED_PER_USER = 10;
const WINDOW_MIN_USER = 60;
const LOCKOUT_MIN = 60;

function randomHex(bytes) { return crypto.randomBytes(bytes).toString('hex'); }
function sha256(s) { return crypto.createHash('sha256').update(s).digest('hex'); }
function constTimeEq(a, b) {
  try { return crypto.timingSafeEqual(Buffer.from(String(a)), Buffer.from(String(b))); }
  catch { return false; }
}

// ===== Password =====
async function hashPassword(plain) { return bcrypt.hash(String(plain), 12); }
async function verifyPassword(plain, hash) {
  try { return await bcrypt.compare(String(plain), String(hash || '')); }
  catch { return false; }
}

// ===== Users =====
async function findUserByUsername(username) {
  const [rows] = await pool.query('SELECT * FROM admin_users WHERE username = ? LIMIT 1', [username]);
  return rows[0] || null;
}

async function userIsLocked(user) {
  if (!user) return true;
  if (!user.is_active) return true;
  if (user.locked_until && new Date(user.locked_until).getTime() > Date.now()) return true;
  return false;
}

async function createUser({ username, password, displayName, email, mustChangePassword = false }) {
  const hash = await hashPassword(password);
  const [res] = await pool.query(
    'INSERT INTO admin_users (username, password_hash, display_name, email, must_change_password) VALUES (?,?,?,?,?)',
    [username, hash, displayName || null, email || null, mustChangePassword ? 1 : 0]
  );
  return res.insertId;
}

async function updatePassword(userId, newPassword) {
  const hash = await hashPassword(newPassword);
  await pool.query(
    'UPDATE admin_users SET password_hash = ?, must_change_password = 0 WHERE id = ?',
    [hash, userId]
  );
}

async function countUsers() {
  const [[row]] = await pool.query('SELECT COUNT(*) AS n FROM admin_users');
  return row.n || 0;
}

// ===== Sessions =====
async function createSession({ userId, userAgent, ip }) {
  const rawToken = randomHex(32);
  const tokenHash = sha256(rawToken);
  const csrf = randomHex(24);
  const expiresAt = new Date(Date.now() + SESSION_TTL_HOURS * 3600 * 1000);
  await pool.query(
    'INSERT INTO admin_sessions (token_hash, user_id, csrf_token, user_agent, ip_address, expires_at) VALUES (?,?,?,?,?,?)',
    [tokenHash, userId, csrf, (userAgent || '').slice(0, 500), (ip || '').slice(0, 45), expiresAt]
  );
  return { token: rawToken, csrf, expiresAt };
}

async function validateSession(rawToken, { userAgent } = {}) {
  if (!rawToken || typeof rawToken !== 'string' || rawToken.length < 32) return null;
  const tokenHash = sha256(rawToken);
  const [rows] = await pool.query(
    `SELECT s.*, u.username, u.display_name, u.is_active, u.must_change_password, u.locked_until
       FROM admin_sessions s
       JOIN admin_users u ON u.id = s.user_id
      WHERE s.token_hash = ? LIMIT 1`,
    [tokenHash]
  );
  const row = rows[0];
  if (!row) return null;
  if (row.revoked_at) return null;
  if (new Date(row.expires_at).getTime() < Date.now()) return null;
  if (!row.is_active) return null;
  if (row.locked_until && new Date(row.locked_until).getTime() > Date.now()) return null;

  // Bind session to UA. Small extra friction for session theft.
  if (row.user_agent && userAgent && row.user_agent !== userAgent) {
    // Do not hard-fail on UA mismatch (mobile browsers can change UA) — log instead.
    // Real enforcement can be enabled by setting ADMIN_STRICT_UA=1.
    if (process.env.ADMIN_STRICT_UA === '1') return null;
  }

  // Sliding last_seen update.
  pool.query('UPDATE admin_sessions SET last_seen_at = CURRENT_TIMESTAMP WHERE token_hash = ?', [tokenHash])
    .catch(() => {});

  return {
    user: {
      id: row.user_id,
      username: row.username,
      display_name: row.display_name,
      must_change_password: !!row.must_change_password,
    },
    csrf: row.csrf_token,
    created_at: row.created_at,
    expires_at: row.expires_at,
  };
}

async function revokeSession(rawToken) {
  if (!rawToken) return;
  await pool.query(
    'UPDATE admin_sessions SET revoked_at = CURRENT_TIMESTAMP WHERE token_hash = ?',
    [sha256(rawToken)]
  );
}

async function revokeAllSessionsForUser(userId, { exceptTokenHash = null } = {}) {
  if (exceptTokenHash) {
    await pool.query(
      'UPDATE admin_sessions SET revoked_at = CURRENT_TIMESTAMP WHERE user_id = ? AND revoked_at IS NULL AND token_hash <> ?',
      [userId, exceptTokenHash]
    );
  } else {
    await pool.query(
      'UPDATE admin_sessions SET revoked_at = CURRENT_TIMESTAMP WHERE user_id = ? AND revoked_at IS NULL',
      [userId]
    );
  }
}

async function pruneExpiredSessions() {
  await pool.query('DELETE FROM admin_sessions WHERE expires_at < NOW() - INTERVAL 7 DAY');
}

// ===== Rate limit + lockout =====
async function ipFailedCount(ip) {
  const [[row]] = await pool.query(
    'SELECT COUNT(*) AS n FROM admin_login_attempts WHERE success = 0 AND ip_address = ? AND created_at >= NOW() - INTERVAL ? MINUTE',
    [ip, WINDOW_MIN_IP]
  );
  return row.n || 0;
}

async function userFailedCount(username) {
  if (!username) return 0;
  const [[row]] = await pool.query(
    'SELECT COUNT(*) AS n FROM admin_login_attempts WHERE success = 0 AND username = ? AND created_at >= NOW() - INTERVAL ? MINUTE',
    [username, WINDOW_MIN_USER]
  );
  return row.n || 0;
}

async function recordAttempt({ username, ip, success, reason }) {
  await pool.query(
    'INSERT INTO admin_login_attempts (username, ip_address, success, reason) VALUES (?,?,?,?)',
    [(username || '').slice(0, 64) || null, (ip || '').slice(0, 45), success ? 1 : 0, (reason || '').slice(0, 80) || null]
  );
}

async function maybeLockUser(username) {
  if (!username) return false;
  const n = await userFailedCount(username);
  if (n >= MAX_FAILED_PER_USER) {
    await pool.query(
      'UPDATE admin_users SET locked_until = NOW() + INTERVAL ? MINUTE WHERE username = ?',
      [LOCKOUT_MIN, username]
    );
    return true;
  }
  return false;
}

async function preLoginCheck({ username, ip }) {
  const ipN = await ipFailedCount(ip);
  if (ipN >= MAX_FAILED_PER_IP) {
    return { blocked: true, reason: 'too_many_attempts_ip', retryAfterMin: WINDOW_MIN_IP };
  }
  if (username) {
    const user = await findUserByUsername(username);
    if (user && user.locked_until && new Date(user.locked_until).getTime() > Date.now()) {
      return { blocked: true, reason: 'account_locked', retryAfterMin: LOCKOUT_MIN };
    }
  }
  return { blocked: false };
}

// ===== CAPTCHA =====
// Generates a simple math captcha. Answer is an integer. Stored SHA-256-hashed.
// Uses ASCII-only operators so nothing renders ambiguously across browsers/fonts.
// Only addition and subtraction (no multiplication) — easier for humans + still
// trivially blocks dumb bots. Always keeps answer positive (a >= b).
function generateCaptcha() {
  const a = Math.floor(Math.random() * 9) + 3; // 3..11
  const b = Math.floor(Math.random() * (a - 1)) + 1; // 1..a-1  (so a-b is always >= 1)
  const op = Math.random() < 0.5 ? '+' : '-';
  const answer = op === '+' ? (a + b) : (a - b);
  const question = `${a} ${op} ${b} = ?`;
  return { question, answer };
}

async function issueCaptcha() {
  const { question, answer } = generateCaptcha();
  const id = randomHex(16);
  const expires = new Date(Date.now() + CAPTCHA_TTL_MIN * 60 * 1000);
  await pool.query(
    'INSERT INTO admin_captchas (captcha_id, answer_hash, expires_at) VALUES (?,?,?)',
    [id, sha256(String(answer)), expires]
  );
  return { id, question, expires };
}

async function verifyAndConsumeCaptcha(id, userAnswer) {
  if (!id || !userAnswer) return false;
  const [rows] = await pool.query(
    'SELECT answer_hash, expires_at, consumed FROM admin_captchas WHERE captcha_id = ? LIMIT 1',
    [id]
  );
  const row = rows[0];
  if (!row) return false;
  if (row.consumed) return false;
  if (new Date(row.expires_at).getTime() < Date.now()) return false;
  const expected = row.answer_hash;
  const given = sha256(String(userAnswer).trim());
  const ok = constTimeEq(expected, given);
  // Mark consumed regardless of correctness to prevent answer-grinding on one captcha_id.
  await pool.query('UPDATE admin_captchas SET consumed = 1 WHERE captcha_id = ?', [id]);
  return ok;
}

async function pruneExpiredCaptchas() {
  await pool.query('DELETE FROM admin_captchas WHERE expires_at < NOW() - INTERVAL 1 HOUR');
}

// ===== CSRF =====
// Double-submit: server stores csrf token on session row; client reads via /admin/auth/me
// and sends in `X-CSRF-Token` header on all mutating requests.
function verifyCsrfHeader(req, sessionCsrf) {
  const header = req.get('x-csrf-token');
  if (!header || !sessionCsrf) return false;
  return constTimeEq(header, sessionCsrf);
}

module.exports = {
  hashPassword, verifyPassword,
  findUserByUsername, userIsLocked, createUser, updatePassword, countUsers,
  createSession, validateSession, revokeSession, revokeAllSessionsForUser,
  pruneExpiredSessions,
  ipFailedCount, userFailedCount, recordAttempt, maybeLockUser, preLoginCheck,
  issueCaptcha, verifyAndConsumeCaptcha, pruneExpiredCaptchas,
  verifyCsrfHeader, sha256,
  SESSION_TTL_HOURS,
};
