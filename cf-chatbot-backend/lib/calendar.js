// Internal slot generator.
// Generates the next N business days (Mon–Fri) with three buckets each:
//   Morning 9am–12pm PT, Afternoon 12pm–4pm PT, Evening 4pm–6pm PT.
// Filters out slots already booked in the consultations table.
//
// Phase F2 will swap the internals for Google Calendar free/busy without
// changing the exported signature.

const pool = require('../db/pool');

const SLOT_DEFS = [
  { label: 'Morning (9am–12pm PT)',   startHour: 9,  endHour: 12 },
  { label: 'Afternoon (12pm–4pm PT)', startHour: 12, endHour: 16 },
  { label: 'Evening (4pm–6pm PT)',    startHour: 16, endHour: 18 },
];

// PT offset from UTC. PST = -08:00, PDT = -07:00. For slot generation we're
// producing calendar-local (PT) datetimes — stored as naive DATETIME strings
// which the admin will interpret in PT. Good enough for internal scheduling
// until Phase F2 swaps in Google Calendar (which handles TZ natively).
function toPtDateTime(date, hour) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const h = String(hour).padStart(2, '0');
  return `${y}-${m}-${d} ${h}:00:00`;
}

function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

function isWeekend(date) {
  const day = date.getDay();
  return day === 0 || day === 6;
}

async function listSlots({ days = 5 } = {}) {
  const out = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let cursor = addDays(today, 1); // start tomorrow
  let businessDays = 0;
  while (businessDays < days) {
    if (!isWeekend(cursor)) {
      for (const def of SLOT_DEFS) {
        out.push({
          start: toPtDateTime(cursor, def.startHour),
          end: toPtDateTime(cursor, def.endHour),
          label: `${cursor.toDateString()} — ${def.label}`,
        });
      }
      businessDays++;
    }
    cursor = addDays(cursor, 1);
  }

  // Filter out already-booked starts.
  if (out.length) {
    const starts = out.map(s => s.start);
    const [rows] = await pool.query(
      'SELECT booking_slot_start FROM consultations WHERE status = "booked" AND booking_slot_start IN (?)',
      [starts]
    );
    const bookedSet = new Set(rows.map(r => {
      const d = new Date(r.booking_slot_start);
      // Normalize to the same string format we produced.
      return toPtDateTime(d, d.getHours());
    }));
    for (const s of out) s.available = !bookedSet.has(s.start);
  }

  return out.filter(s => s.available !== false);
}

async function bookSlot({ consultationId, slotStart, slotEnd, leadId }) {
  if (!consultationId || !slotStart) throw new Error('consultationId and slotStart required');
  await pool.query(
    `UPDATE consultations
        SET booking_slot_start = ?, booking_slot_end = ?, status = 'booked', lead_id = ?
      WHERE id = ?`,
    [slotStart, slotEnd || null, leadId || null, consultationId]
  );
  return { ok: true };
}

module.exports = { listSlots, bookSlot };
