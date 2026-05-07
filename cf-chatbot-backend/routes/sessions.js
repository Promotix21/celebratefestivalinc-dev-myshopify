const express = require('express');
const pool = require('../db/pool');

const router = express.Router();

router.get('/:id/history', async (req, res) => {
  const [rows] = await pool.query(
    'SELECT role, content, created_at FROM chat_logs WHERE session_id = ? AND role IN ("user","assistant") ORDER BY id ASC',
    [req.params.id]
  );
  res.json({ messages: rows });
});

router.get('/user/:userId', async (req, res) => {
  const [rows] = await pool.query(
    `SELECT s.session_id, s.created_at, s.message_count,
            (SELECT content FROM chat_logs WHERE session_id = s.session_id AND role='user' ORDER BY id ASC LIMIT 1) AS first_message
     FROM sessions s WHERE s.user_id = ? ORDER BY s.last_activity DESC LIMIT 25`,
    [req.params.userId]
  );
  res.json({ sessions: rows });
});

// Mode transition history for a session (admin/analytics view).
router.get('/:id/mode-timeline', async (req, res) => {
  const [rows] = await pool.query(
    `SELECT content, created_at FROM chat_logs
      WHERE session_id = ? AND role = 'system' AND intent LIKE 'mode_transition%'
      ORDER BY id ASC`,
    [req.params.id]
  );
  const transitions = rows.map(r => {
    // content format: "mode_transition:from>to:reason"
    const m = String(r.content).match(/^mode_transition:([^>]+)>([^:]+):(.+)$/);
    return m
      ? { from: m[1], to: m[2], reason: m[3], at: r.created_at }
      : { raw: r.content, at: r.created_at };
  });
  res.json({ session_id: req.params.id, transitions });
});

module.exports = router;
