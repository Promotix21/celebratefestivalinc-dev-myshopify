#!/usr/bin/env node
// Weekly intelligence + cost report.
// Run via cron once per week (recommended: Monday 9:00 PT).
//
// Env vars:
//   ADMIN_EMAIL   — recipient (defaults to rajesh_kumar@hiraya.digital in .env)
//   SMTP_*        — existing SMTP2GO config
//   REPORT_WEEKS  — override the window, default 1 week (7 days)

require('dotenv').config();
const analytics = require('../lib/analytics');
const { sendReportEmail } = require('../lib/mailer');
const pool = require('../db/pool');

const DAYS = Math.max(1, Math.min(30, Number(process.env.REPORT_DAYS) || 7));

function money(n) { return '$' + Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 4 }); }
function fmt(n) { return Number(n || 0).toLocaleString('en-US'); }
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
function pct(a, b) { if (!b) return '—'; return (100 * a / b).toFixed(1) + '%'; }

async function run() {
  const [summary, modeMix, funnel, costByDay, costByModel, topQ, zeroQ, recentLeads] = await Promise.all([
    analytics.getSummary(DAYS),
    analytics.getModeMix(DAYS),
    analytics.getFunnel(DAYS),
    analytics.getCostByDay(DAYS),
    analytics.getCostByModel(DAYS),
    analytics.getTopQueries(DAYS, 15),
    analytics.getZeroResultQueries(DAYS, 15),
    analytics.getRecentLeads(15),
  ]);

  const html = buildHtml({ DAYS, summary, modeMix, funnel, costByDay, costByModel, topQ, zeroQ, recentLeads });
  const now = new Date();
  const stamp = now.toISOString().slice(0, 10);
  const subject = `CF Chatbot — weekly report (${stamp}) — ${money(summary.cost_usd)} LLM cost`;

  await sendReportEmail({ subject, html });
  console.log('Report sent for', DAYS, 'day window. Cost:', money(summary.cost_usd));

  // Also rollup daily_stats for each day in the window.
  for (let i = 0; i <= DAYS; i++) {
    const d = new Date(); d.setDate(d.getDate() - i);
    await analytics.aggregateDay(d.toISOString().slice(0, 10));
  }
  console.log('Daily rollups refreshed.');
  await pool.end();
}

function buildHtml({ DAYS, summary, modeMix, funnel, costByDay, costByModel, topQ, zeroQ, recentLeads }) {
  const totalModes = modeMix.reduce((a, m) => a + Number(m.count || 0), 0);
  const modeRows = modeMix.map(m => `<tr><td>${esc(m.mode)}</td><td align="right">${fmt(m.count)}</td><td align="right">${pct(m.count, totalModes)}</td></tr>`).join('');
  const costDayRows = costByDay.map(d => `<tr><td>${esc(d.day.toString().slice(0, 10))}</td><td align="right">${fmt(d.calls)}</td><td align="right">${fmt(Number(d.tokens_in) + Number(d.tokens_out))}</td><td align="right"><b>${money(d.cost_usd)}</b></td></tr>`).join('');
  const costModelRows = costByModel.map(m => `<tr><td>${esc(m.model)}</td><td align="right">${fmt(m.calls)}</td><td align="right">${fmt(m.tokens_in)}</td><td align="right">${fmt(m.tokens_out)}</td><td align="right"><b>${money(m.cost_usd)}</b></td></tr>`).join('');
  const topRows = topQ.map(r => `<tr><td>${esc(r.query)}</td><td align="right">${fmt(r.count)}</td></tr>`).join('') || '<tr><td colspan="2" style="color:#64748b">No repeated queries yet.</td></tr>';
  const zeroRows = zeroQ.map(r => `<tr><td>${esc(r.query)}</td><td align="right">${fmt(r.count)}</td></tr>`).join('') || '<tr><td colspan="2" style="color:#64748b">None — retrieval is matching.</td></tr>';
  const leadRows = recentLeads.map(l => `<tr><td>${esc(l.name || '—')}</td><td>${esc(l.email)}</td><td>${esc(l.source || '—')}</td><td style="color:#64748b">${esc(l.created_at)}</td></tr>`).join('') || '<tr><td colspan="4" style="color:#64748b">No leads in this window.</td></tr>';

  return `<!DOCTYPE html>
<html><body style="margin:0;padding:0;background:#f1f5f9;font-family:Inter,system-ui,sans-serif;color:#0f172a">
<div style="max-width:680px;margin:0 auto;padding:24px">
  <div style="background:linear-gradient(135deg,#1a365d,#2d5a87);color:#fff;padding:22px 24px;border-radius:12px 12px 0 0">
    <h1 style="margin:0;font-size:22px;font-family:Montserrat,sans-serif">CF AI Chatbot — Weekly Report</h1>
    <div style="opacity:.85;font-size:13px;margin-top:4px">Window: last ${DAYS} days</div>
  </div>
  <div style="background:#fff;border:1px solid #e2e8f0;border-top:0;border-radius:0 0 12px 12px;padding:22px 24px">

    <h2 style="margin:0 0 12px;font:700 14px Montserrat;color:#1a365d;text-transform:uppercase;letter-spacing:.06em">Highlights</h2>
    <table cellpadding="8" cellspacing="0" style="width:100%;border-collapse:collapse;font-size:13px">
      <tr style="background:#f8fafc"><td><b>LLM cost</b></td><td align="right" style="color:#ff6b6b;font-weight:700">${money(summary.cost_usd)}</td></tr>
      <tr><td><b>Sessions</b></td><td align="right">${fmt(summary.sessions_total)}</td></tr>
      <tr style="background:#f8fafc"><td><b>User messages</b></td><td align="right">${fmt(summary.user_messages)}</td></tr>
      <tr><td><b>LLM calls</b></td><td align="right">${fmt(summary.assistant_messages)}</td></tr>
      <tr style="background:#f8fafc"><td><b>Tokens in / out</b></td><td align="right">${fmt(summary.tokens_in)} / ${fmt(summary.tokens_out)}</td></tr>
      <tr><td><b>Leads captured</b></td><td align="right">${fmt(summary.leads)}</td></tr>
      <tr style="background:#f8fafc"><td><b>Consultations booked</b></td><td align="right" style="color:#10b981;font-weight:700">${fmt(summary.consultations_booked)}</td></tr>
      <tr><td><b>Pro bulk drafts</b></td><td align="right">${fmt(summary.pro_drafts)}</td></tr>
    </table>

    <h2 style="margin:22px 0 10px;font:700 14px Montserrat;color:#1a365d;text-transform:uppercase;letter-spacing:.06em">Funnel</h2>
    <table cellpadding="6" cellspacing="0" style="width:100%;border-collapse:collapse;font-size:13px">
      <tr><td>Sessions started</td><td align="right">${fmt(funnel.sessions)}</td><td align="right" style="color:#64748b">100%</td></tr>
      <tr><td>Engaged (2+ msgs)</td><td align="right">${fmt(funnel.engaged)}</td><td align="right" style="color:#64748b">${pct(funnel.engaged, funnel.sessions)}</td></tr>
      <tr><td>Leads</td><td align="right">${fmt(funnel.leads)}</td><td align="right" style="color:#64748b">${pct(funnel.leads, funnel.sessions)}</td></tr>
      <tr><td>Consultations booked</td><td align="right">${fmt(funnel.bookings)}</td><td align="right" style="color:#64748b">${pct(funnel.bookings, funnel.sessions)}</td></tr>
      <tr><td>Pro added-to-cart</td><td align="right">${fmt(funnel.pro_added)}</td><td align="right" style="color:#64748b">${pct(funnel.pro_added, funnel.sessions)}</td></tr>
    </table>

    <h2 style="margin:22px 0 10px;font:700 14px Montserrat;color:#1a365d;text-transform:uppercase;letter-spacing:.06em">Mode mix</h2>
    <table cellpadding="6" cellspacing="0" style="width:100%;border-collapse:collapse;font-size:13px">
      <tr style="background:#f1f5f9"><th align="left">Mode</th><th align="right">Count</th><th align="right">%</th></tr>
      ${modeRows || '<tr><td colspan="3" style="color:#64748b">No messages in window.</td></tr>'}
    </table>

    <h2 style="margin:22px 0 10px;font:700 14px Montserrat;color:#1a365d;text-transform:uppercase;letter-spacing:.06em">Cost by day</h2>
    <table cellpadding="6" cellspacing="0" style="width:100%;border-collapse:collapse;font-size:13px">
      <tr style="background:#f1f5f9"><th align="left">Day</th><th align="right">Calls</th><th align="right">Tokens</th><th align="right">Cost</th></tr>
      ${costDayRows || '<tr><td colspan="4" style="color:#64748b">No LLM calls.</td></tr>'}
    </table>

    <h2 style="margin:22px 0 10px;font:700 14px Montserrat;color:#1a365d;text-transform:uppercase;letter-spacing:.06em">Cost by model</h2>
    <table cellpadding="6" cellspacing="0" style="width:100%;border-collapse:collapse;font-size:13px">
      <tr style="background:#f1f5f9"><th align="left">Model</th><th align="right">Calls</th><th align="right">Tokens in</th><th align="right">Tokens out</th><th align="right">Cost</th></tr>
      ${costModelRows || '<tr><td colspan="5" style="color:#64748b">No data.</td></tr>'}
    </table>

    <h2 style="margin:22px 0 10px;font:700 14px Montserrat;color:#1a365d;text-transform:uppercase;letter-spacing:.06em">Top queries</h2>
    <table cellpadding="6" cellspacing="0" style="width:100%;border-collapse:collapse;font-size:13px">
      <tr style="background:#f1f5f9"><th align="left">Query</th><th align="right">Count</th></tr>
      ${topRows}
    </table>

    <h2 style="margin:22px 0 10px;font:700 14px Montserrat;color:#d4af37;text-transform:uppercase;letter-spacing:.06em">Zero-result queries (SEO/inventory gaps)</h2>
    <table cellpadding="6" cellspacing="0" style="width:100%;border-collapse:collapse;font-size:13px">
      <tr style="background:#fffbeb"><th align="left">Query</th><th align="right">Count</th></tr>
      ${zeroRows}
    </table>

    <h2 style="margin:22px 0 10px;font:700 14px Montserrat;color:#1a365d;text-transform:uppercase;letter-spacing:.06em">Recent leads</h2>
    <table cellpadding="6" cellspacing="0" style="width:100%;border-collapse:collapse;font-size:13px">
      <tr style="background:#f1f5f9"><th align="left">Name</th><th align="left">Email</th><th align="left">Source</th><th align="left">When</th></tr>
      ${leadRows}
    </table>

    <p style="margin-top:22px;font-size:11px;color:#94a3b8">
      Admin dashboard: <a href="https://cf-chatbot.hiraya.digital/admin" style="color:#2d5a87">cf-chatbot.hiraya.digital/admin</a><br>
      This report was generated automatically. Reply to this email if anything looks off.
    </p>
  </div>
</div>
</body></html>`;
}

run().catch(err => {
  console.error('weekly-report failed:', err);
  process.exit(1);
});
