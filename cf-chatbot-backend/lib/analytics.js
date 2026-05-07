// Aggregation queries for the admin dashboard and weekly report.
// All queries take a `days` window (default 7) and return plain JSON rows.

const pool = require('../db/pool');

function clampDays(d) {
  const n = Number(d);
  if (!Number.isFinite(n) || n <= 0) return 7;
  return Math.min(Math.max(Math.floor(n), 1), 365);
}

async function getSummary(days) {
  const d = clampDays(days);
  const [[row]] = await pool.query(
    `SELECT
       (SELECT COUNT(*) FROM sessions s WHERE s.created_at >= NOW() - INTERVAL ? DAY) AS sessions_total,
       (SELECT COUNT(*) FROM chat_logs c WHERE c.role = 'user' AND c.created_at >= NOW() - INTERVAL ? DAY) AS user_messages,
       (SELECT COUNT(*) FROM chat_logs c WHERE c.role = 'assistant' AND c.created_at >= NOW() - INTERVAL ? DAY) AS assistant_messages,
       (SELECT COALESCE(SUM(tokens_in),0) FROM cost_ledger WHERE created_at >= NOW() - INTERVAL ? DAY) AS tokens_in,
       (SELECT COALESCE(SUM(tokens_out),0) FROM cost_ledger WHERE created_at >= NOW() - INTERVAL ? DAY) AS tokens_out,
       (SELECT COALESCE(SUM(cost_usd),0) FROM cost_ledger WHERE created_at >= NOW() - INTERVAL ? DAY) AS cost_usd,
       (SELECT COUNT(*) FROM leads WHERE created_at >= NOW() - INTERVAL ? DAY) AS leads,
       (SELECT COUNT(*) FROM consultations WHERE status = 'booked' AND updated_at >= NOW() - INTERVAL ? DAY) AS consultations_booked,
       (SELECT COUNT(*) FROM pro_orders_draft WHERE created_at >= NOW() - INTERVAL ? DAY) AS pro_drafts`,
    [d, d, d, d, d, d, d, d, d]
  );
  return row;
}

async function getModeMix(days) {
  const d = clampDays(days);
  const [rows] = await pool.query(
    `SELECT
       SUBSTRING_INDEX(intent, ':', -1) AS mode,
       COUNT(*) AS count
       FROM chat_logs
      WHERE role = 'user' AND intent LIKE 'mode:%' AND created_at >= NOW() - INTERVAL ? DAY
      GROUP BY mode
      ORDER BY count DESC`,
    [d]
  );
  return rows;
}

async function getTopQueries(days, limit = 20) {
  const d = clampDays(days);
  const [rows] = await pool.query(
    `SELECT
       LOWER(TRIM(content)) AS query,
       COUNT(*) AS count
       FROM chat_logs
      WHERE role = 'user' AND created_at >= NOW() - INTERVAL ? DAY AND CHAR_LENGTH(content) BETWEEN 3 AND 80
      GROUP BY query
      HAVING count >= 2
      ORDER BY count DESC, query ASC
      LIMIT ?`,
    [d, Math.max(1, Math.min(200, limit))]
  );
  return rows;
}

async function getZeroResultQueries(days, limit = 20) {
  const d = clampDays(days);
  const [rows] = await pool.query(
    `SELECT LOWER(TRIM(content)) AS query, COUNT(*) AS count
       FROM chat_logs
      WHERE role = 'user'
        AND result_count = 0
        AND (intent LIKE 'mode:discovery%' OR intent = 'product_search')
        AND created_at >= NOW() - INTERVAL ? DAY
        AND CHAR_LENGTH(content) BETWEEN 3 AND 80
      GROUP BY query
      HAVING count >= 1
      ORDER BY count DESC, query ASC
      LIMIT ?`,
    [d, Math.max(1, Math.min(200, limit))]
  );
  return rows;
}

async function getCostByDay(days) {
  const d = clampDays(days);
  const [rows] = await pool.query(
    `SELECT DATE(created_at) AS day,
            COALESCE(SUM(tokens_in), 0) AS tokens_in,
            COALESCE(SUM(tokens_out), 0) AS tokens_out,
            COALESCE(SUM(cost_usd), 0) AS cost_usd,
            COUNT(*) AS calls
       FROM cost_ledger
      WHERE created_at >= NOW() - INTERVAL ? DAY
      GROUP BY day
      ORDER BY day ASC`,
    [d]
  );
  return rows;
}

async function getCostByModel(days) {
  const d = clampDays(days);
  const [rows] = await pool.query(
    `SELECT model,
            COALESCE(SUM(tokens_in), 0) AS tokens_in,
            COALESCE(SUM(tokens_out), 0) AS tokens_out,
            COALESCE(SUM(cost_usd), 0) AS cost_usd,
            COUNT(*) AS calls
       FROM cost_ledger
      WHERE created_at >= NOW() - INTERVAL ? DAY
      GROUP BY model
      ORDER BY cost_usd DESC`,
    [d]
  );
  return rows;
}

async function getFunnel(days) {
  const d = clampDays(days);
  const [[row]] = await pool.query(
    `SELECT
       (SELECT COUNT(*) FROM sessions WHERE created_at >= NOW() - INTERVAL ? DAY) AS sessions,
       (SELECT COUNT(*) FROM sessions WHERE message_count >= 2 AND created_at >= NOW() - INTERVAL ? DAY) AS engaged,
       (SELECT COUNT(*) FROM leads WHERE created_at >= NOW() - INTERVAL ? DAY) AS leads,
       (SELECT COUNT(*) FROM consultations WHERE status = 'booked' AND updated_at >= NOW() - INTERVAL ? DAY) AS bookings,
       (SELECT COUNT(*) FROM pro_orders_draft WHERE added_to_cart = 1 AND created_at >= NOW() - INTERVAL ? DAY) AS pro_added`,
    [d, d, d, d, d]
  );
  return row;
}

async function getRecentSessions(limit = 25) {
  const [rows] = await pool.query(
    `SELECT s.session_id, s.user_id, s.mode, s.is_premium, s.message_count,
            s.created_at, s.last_activity, s.lead_captured,
            (SELECT content FROM chat_logs WHERE session_id = s.session_id AND role = 'user' ORDER BY id ASC LIMIT 1) AS first_message
       FROM sessions s
      ORDER BY s.last_activity DESC
      LIMIT ?`,
    [Math.max(1, Math.min(200, limit))]
  );
  return rows;
}

async function getRecentLeads(limit = 25) {
  const [rows] = await pool.query(
    `SELECT id, session_id, name, email, phone, source, notes, created_at
       FROM leads
      ORDER BY id DESC
      LIMIT ?`,
    [Math.max(1, Math.min(200, limit))]
  );
  return rows;
}

async function getRecentConsultations(limit = 25) {
  const [rows] = await pool.query(
    `SELECT id, session_id, cuisine, service_type, location, budget, status,
            booking_slot_start, created_at, updated_at
       FROM consultations
      ORDER BY id DESC
      LIMIT ?`,
    [Math.max(1, Math.min(200, limit))]
  );
  return rows;
}

// Compute or refresh a daily_stats row for a given date (YYYY-MM-DD).
async function aggregateDay(ymd) {
  await pool.query(
    `INSERT INTO daily_stats (
       stat_date, sessions_total, messages_total, llm_calls,
       tokens_in, tokens_out, cost_usd,
       discovery_msgs, consultation_msgs, pro_msgs,
       zero_result_queries, leads_captured, consultations_booked, pro_drafts
     )
     SELECT ? AS stat_date,
       (SELECT COUNT(*) FROM sessions WHERE DATE(created_at) = ?) AS sessions_total,
       (SELECT COUNT(*) FROM chat_logs WHERE role = 'user' AND DATE(created_at) = ?) AS messages_total,
       (SELECT COUNT(*) FROM cost_ledger WHERE DATE(created_at) = ?) AS llm_calls,
       (SELECT COALESCE(SUM(tokens_in),0) FROM cost_ledger WHERE DATE(created_at) = ?) AS tokens_in,
       (SELECT COALESCE(SUM(tokens_out),0) FROM cost_ledger WHERE DATE(created_at) = ?) AS tokens_out,
       (SELECT COALESCE(SUM(cost_usd),0) FROM cost_ledger WHERE DATE(created_at) = ?) AS cost_usd,
       (SELECT COUNT(*) FROM chat_logs WHERE role = 'user' AND intent = 'mode:discovery' AND DATE(created_at) = ?) AS discovery_msgs,
       (SELECT COUNT(*) FROM chat_logs WHERE role = 'user' AND intent = 'mode:consultation' AND DATE(created_at) = ?) AS consultation_msgs,
       (SELECT COUNT(*) FROM chat_logs WHERE role = 'user' AND intent = 'mode:pro' AND DATE(created_at) = ?) AS pro_msgs,
       (SELECT COUNT(*) FROM chat_logs WHERE role = 'user' AND result_count = 0 AND intent LIKE 'mode:discovery%' AND DATE(created_at) = ?) AS zero_result_queries,
       (SELECT COUNT(*) FROM leads WHERE DATE(created_at) = ?) AS leads_captured,
       (SELECT COUNT(*) FROM consultations WHERE status = 'booked' AND DATE(updated_at) = ?) AS consultations_booked,
       (SELECT COUNT(*) FROM pro_orders_draft WHERE DATE(created_at) = ?) AS pro_drafts
     ON DUPLICATE KEY UPDATE
       sessions_total = VALUES(sessions_total),
       messages_total = VALUES(messages_total),
       llm_calls = VALUES(llm_calls),
       tokens_in = VALUES(tokens_in),
       tokens_out = VALUES(tokens_out),
       cost_usd = VALUES(cost_usd),
       discovery_msgs = VALUES(discovery_msgs),
       consultation_msgs = VALUES(consultation_msgs),
       pro_msgs = VALUES(pro_msgs),
       zero_result_queries = VALUES(zero_result_queries),
       leads_captured = VALUES(leads_captured),
       consultations_booked = VALUES(consultations_booked),
       pro_drafts = VALUES(pro_drafts)`,
    [ymd, ymd, ymd, ymd, ymd, ymd, ymd, ymd, ymd, ymd, ymd, ymd, ymd, ymd]
  );
}

module.exports = {
  getSummary, getModeMix, getTopQueries, getZeroResultQueries,
  getCostByDay, getCostByModel, getFunnel,
  getRecentSessions, getRecentLeads, getRecentConsultations,
  aggregateDay,
};
