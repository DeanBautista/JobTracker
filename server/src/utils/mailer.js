const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

const escapeHtml = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

async function sendMail({ to, subject, html }) {
  if (!process.env.BREVO_API_KEY) {
    console.log(`[mail:dev] to=${to} subject="${subject}"\n${html}`);
    return;
  }

  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': process.env.BREVO_API_KEY,
      'content-type': 'application/json',
      accept: 'application/json',
    },
    body: JSON.stringify({
      sender: { name: process.env.MAIL_FROM_NAME || 'Job Tracker', email: process.env.MAIL_FROM },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    }),
  });

  if (!res.ok) throw new Error(`Brevo ${res.status}: ${await res.text()}`);
}

async function sendVerificationEmail({ to, name, token }) {
  const link = `${CLIENT_URL}/verify-email?token=${token}`;
  if (!process.env.BREVO_API_KEY) console.log(`[mail:dev] verify link: ${link}`);

  await sendMail({
    to,
    subject: 'Verify your Job Tracker email',
    html: `
      <p>Hi ${escapeHtml(name)},</p>
      <p>Confirm your email to finish creating your account. This link works for 24 hours.</p>
      <p><a href="${link}">Verify my email</a></p>
      <p>If you didn't sign up, you can ignore this email.</p>`,
  });
}

module.exports = { sendVerificationEmail };