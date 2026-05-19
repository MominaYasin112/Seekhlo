const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendVerificationEmail(email, token) {
  const link = `${process.env.CLIENT_URL}/verify/${token}`;
  await transporter.sendMail({
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
  const link = `${process.env.CLIENT_URL}/reset-password/${token}`;
  await transporter.sendMail({
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