const express = require('express');
const pool = require('../db/pool');
const { markLeadCaptured } = require('../lib/session');
const { sendLeadEmail } = require('../lib/mailer');

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { session_id, name, email, phone, notes, source } = req.body || {};
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Valid email required' });
    }

    const lead = {
      session_id: session_id || null,
      name: (name || '').slice(0, 255),
      email: email.slice(0, 255),
      phone: (phone || '').slice(0, 50),
      source: (source || 'chatbot').slice(0, 50),
      notes: (notes || '').slice(0, 2000),
    };

    const [result] = await pool.query(
      'INSERT INTO leads (session_id, name, email, phone, source, notes) VALUES (?,?,?,?,?,?)',
      [lead.session_id, lead.name, lead.email, lead.phone, lead.source, lead.notes]
    );

    if (session_id) await markLeadCaptured(session_id);

    sendLeadEmail(lead).catch(err => console.error('Email send failed:', err.message));

    res.json({ ok: true, lead_id: result.insertId });
  } catch (err) {
    console.error('Lead error:', err);
    res.status(500).json({ error: 'Failed to save lead' });
  }
});

module.exports = router;
