const nodemailer = require('nodemailer');
require('dotenv').config();

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    return null;
  }
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
  return transporter;
}

async function sendVerificationEmail(email, token) {
  const link = `${process.env.CLIENT_URL || 'http://localhost:5173'}/verify/${token}`;
  const transport = getTransporter();
  if (!transport) {
    console.log('[Seekh Lo] Email not configured. Verify link:', link);
    return;
  }
  await transport.sendMail({
    from: `"Seekh Lo" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Verify your Seekh Lo account',
    html: `
      <h2>Welcome to Seekh Lo!</h2>
      <p>Click the link below to verify your account:</p>
      <a href="${link}">${link}</a>
      <p>This link expires in 24 hours.</p>
    `,
  });
}

async function sendPasswordResetEmail(email, token) {
  const link = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password/${token}`;
  const transport = getTransporter();
  if (!transport) {
    console.log('[Seekh Lo] Email not configured. Reset link:', link);
    return;
  }
  await transport.sendMail({
    from: `"Seekh Lo" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Reset your Seekh Lo password',
    html: `
      <h2>Password Reset</h2>
      <p>Click the link below to reset your password:</p>
      <a href="${link}">${link}</a>
      <p>This link expires in 1 hour.</p>
    `,
  });
}

module.exports = { sendVerificationEmail, sendPasswordResetEmail };
