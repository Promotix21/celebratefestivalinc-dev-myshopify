// GET  /calendar-slots?days=5          -> { slots: [{ start, end, label, available }] }
// POST /calendar-slots/book             -> creates lead + marks consultation booked

const express = require('express');
const pool = require('../db/pool');
const { listSlots, bookSlot } = require('../lib/calendar');
const { sendLeadEmail } = require('../lib/mailer');
const { markLeadCaptured } = require('../lib/session');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const days = Math.min(Math.max(Number(req.query.days) || 5, 1), 14);
    const slots = await listSlots({ days });
    res.json({ slots });
  } catch (err) {
    console.error('Calendar slots error:', err);
    res.status(500).json({ error: 'calendar_slots_failed' });
  }
});

router.post('/book', async (req, res) => {
  try {
    const { session_id, consultation_id, slot_start, slot_end, name, email, phone, notes } = req.body || {};
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Valid email required' });
    }
    if (!slot_start) return res.status(400).json({ error: 'slot_start required' });

    // Insert lead row first (source = consultation_booking).
    const [result] = await pool.query(
      'INSERT INTO leads (session_id, name, email, phone, source, notes) VALUES (?,?,?,?,?,?)',
      [
        session_id || null,
        (name || '').slice(0, 255),
        email.slice(0, 255),
        (phone || '').slice(0, 50),
        'consultation_booking',
        `Slot: ${slot_start}${notes ? '\n' + notes : ''}`.slice(0, 2000),
      ]
    );
    const leadId = result.insertId;

    // Resolve or lazily create a consultation row so the booking has a parent.
    let cid = consultation_id;
    if (!cid && session_id) {
      const [rows] = await pool.query(
        'SELECT id FROM consultations WHERE session_id = ? ORDER BY id DESC LIMIT 1',
        [session_id]
      );
      cid = rows[0]?.id;
    }
    if (!cid) {
      const [ins] = await pool.query(
        'INSERT INTO consultations (session_id, status) VALUES (?, ?)',
        [session_id || null, 'summary_sent']
      );
      cid = ins.insertId;
    }

    await bookSlot({ consultationId: cid, slotStart: slot_start, slotEnd: slot_end, leadId });

    if (session_id) await markLeadCaptured(session_id);

    sendLeadEmail({
      session_id: session_id || null,
      name: name || '',
      email,
      phone: phone || '',
      source: 'consultation_booking',
      notes: `Slot: ${slot_start}\n${notes || ''}`,
    }).catch(err => console.error('Email send failed:', err.message));

    res.json({ ok: true, lead_id: leadId, consultation_id: cid });
  } catch (err) {
    console.error('Calendar book error:', err);
    res.status(500).json({ error: 'calendar_book_failed' });
  }
});

module.exports = router;
