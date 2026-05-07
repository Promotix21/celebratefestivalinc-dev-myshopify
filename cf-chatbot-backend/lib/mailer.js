const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: false,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD },
});

async function sendLeadEmail(lead) {
  const to = process.env.ADMIN_EMAIL;
  const subject = `New AI Chatbot Lead: ${lead.name || lead.email}`;
  const html = `
    <h2>New Lead from AI Chatbot</h2>
    <table style="border-collapse:collapse">
      <tr><td><b>Name</b></td><td>${lead.name || '—'}</td></tr>
      <tr><td><b>Email</b></td><td>${lead.email}</td></tr>
      <tr><td><b>Phone</b></td><td>${lead.phone || '—'}</td></tr>
      <tr><td><b>Source</b></td><td>${lead.source || 'chatbot'}</td></tr>
      <tr><td><b>Session</b></td><td>${lead.session_id || '—'}</td></tr>
      <tr><td><b>Notes</b></td><td><pre>${lead.notes || ''}</pre></td></tr>
    </table>`;
  return transporter.sendMail({ from: process.env.SMTP_FROM, to, subject, html });
}

async function sendReportEmail({ subject, html, to }) {
  return transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: to || process.env.ADMIN_EMAIL,
    subject,
    html,
  });
}

module.exports = { sendLeadEmail, sendReportEmail, transporter };
