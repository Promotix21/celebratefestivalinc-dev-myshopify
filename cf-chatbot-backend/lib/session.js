const crypto = require('crypto');
const pool = require('../db/pool');

function newSessionId() {
  return crypto.randomBytes(24).toString('hex');
}

async function getOrCreateSession(sessionId, { userId, ip, ua }) {
  if (sessionId) {
    const [rows] = await pool.query('SELECT * FROM sessions WHERE session_id = ?', [sessionId]);
    if (rows.length) return rows[0];
  }
  const id = sessionId || newSessionId();
  await pool.query(
    'INSERT IGNORE INTO sessions (session_id, user_id, ip_address, user_agent) VALUES (?,?,?,?)',
    [id, userId || null, ip || null, ua?.slice(0, 500) || null]
  );
  const [rows] = await pool.query('SELECT * FROM sessions WHERE session_id = ?', [id]);
  return rows[0];
}

async function bumpSession(sessionId) {
  await pool.query('UPDATE sessions SET message_count = message_count + 1 WHERE session_id = ?', [sessionId]);
}

async function markLeadCaptured(sessionId) {
  await pool.query('UPDATE sessions SET lead_captured = 1 WHERE session_id = ?', [sessionId]);
}

async function getHistory(sessionId, limit = 6) {
  const [rows] = await pool.query(
    'SELECT role, content FROM chat_logs WHERE session_id = ? AND role IN ("user","assistant") ORDER BY id DESC LIMIT ?',
    [sessionId, limit]
  );
  return rows.reverse();
}

async function logMessage({ sessionId, role, content, intent = null, resultCount = 0, tokensIn = 0, tokensOut = 0 }) {
  await pool.query(
    'INSERT INTO chat_logs (session_id, role, content, intent, result_count, tokens_in, tokens_out) VALUES (?,?,?,?,?,?,?)',
    [sessionId, role, content, intent, resultCount, tokensIn, tokensOut]
  );
}

// ===== 3-mode helpers =====

async function setMode(sessionId, mode, context) {
  const locked = (mode === 'consultation' || mode === 'pro') ? new Date() : null;
  await pool.query(
    'UPDATE sessions SET mode = ?, mode_context = ?, mode_locked_at = ? WHERE session_id = ?',
    [mode, context ? JSON.stringify(context) : null, locked, sessionId]
  );
}

async function updateModeContext(sessionId, context) {
  await pool.query(
    'UPDATE sessions SET mode_context = ? WHERE session_id = ?',
    [context ? JSON.stringify(context) : null, sessionId]
  );
}

async function resetMode(sessionId) {
  await pool.query(
    "UPDATE sessions SET mode = 'discovery', mode_context = NULL, mode_locked_at = NULL WHERE session_id = ?",
    [sessionId]
  );
}

function parseModeContext(raw) {
  if (!raw) return null;
  if (typeof raw === 'object') return raw;
  try { return JSON.parse(raw); } catch { return null; }
}

async function setPremiumFlag(sessionId, { tags, isPremium }) {
  await pool.query(
    'UPDATE sessions SET customer_tags = ?, is_premium = ?, tags_verified_at = CURRENT_TIMESTAMP WHERE session_id = ?',
    [tags ? JSON.stringify(tags) : null, isPremium ? 1 : 0, sessionId]
  );
}

function parseCustomerTags(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  try { const v = JSON.parse(raw); return Array.isArray(v) ? v : []; } catch { return []; }
}

async function logModeTransition(sessionId, transition) {
  if (!transition) return;
  const tag = `mode_transition:${transition.from}>${transition.to}:${transition.reason || 'unknown'}`;
  await pool.query(
    'INSERT INTO chat_logs (session_id, role, content, intent) VALUES (?, "system", ?, ?)',
    [sessionId, tag.slice(0, 120), tag.slice(0, 50)]
  );
}

module.exports = {
  getOrCreateSession, bumpSession, markLeadCaptured, getHistory, logMessage,
  setMode, updateModeContext, resetMode, parseModeContext,
  setPremiumFlag, parseCustomerTags, logModeTransition,
};
