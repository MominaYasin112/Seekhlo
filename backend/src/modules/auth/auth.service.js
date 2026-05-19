const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const db = require('../../config/db');
const emailService = require('../../config/email');
require('dotenv').config();

async function registerUser(name, email, password) {
  const existing = await db.query('SELECT id FROM users WHERE email = $1', [email]);
  if (existing.rows.length > 0) {
    throw new Error('Email already registered');
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const verifyToken = crypto.randomBytes(32).toString('hex');

  await db.query(
    `INSERT INTO users (name, email, password_hash, verify_token)
     VALUES ($1, $2, $3, $4)`,
    [name, email, passwordHash, verifyToken]
  );

  await emailService.sendVerificationEmail(email, verifyToken);

  return { message: 'Registration successful. Please check your email to verify your account.' };
}

async function verifyEmail(token) {
  const result = await db.query(
    `UPDATE users SET is_verified = true, verify_token = null
     WHERE verify_token = $1 RETURNING id`,
    [token]
  );

  if (result.rows.length === 0) {
    throw new Error('Invalid or expired verification token');
  }

  const userId = result.rows[0].id;

  await db.query(
    `INSERT INTO user_stats (user_id) VALUES ($1) ON CONFLICT DO NOTHING`,
    [userId]
  );

  return { message: 'Email verified successfully. You can now log in.' };
}

async function loginUser(email, password) {
  const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
  const user = result.rows[0];

  if (!user) {
    throw new Error('Invalid email or password');
  }

  if (!user.is_verified) {
    throw new Error('Please verify your email before logging in');
  }

  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) {
    throw new Error('Invalid email or password');
  }

  const token = jwt.sign(
    { userId: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
}

async function requestPasswordReset(email) {
  const result = await db.query('SELECT id FROM users WHERE email = $1', [email]);

  if (result.rows.length === 0) {
    return { message: 'If that email exists, a reset link has been sent.' };
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  const expiry = new Date(Date.now() + 3600000);

  await db.query(
    `UPDATE users SET reset_token = $1, reset_token_expiry = $2 WHERE email = $3`,
    [resetToken, expiry, email]
  );

  await emailService.sendPasswordResetEmail(email, resetToken);

  return { message: 'If that email exists, a reset link has been sent.' };
}

async function resetPassword(token, newPassword) {
  const result = await db.query(
    `SELECT * FROM users WHERE reset_token = $1 AND reset_token_expiry > NOW()`,
    [token]
  );

  if (result.rows.length === 0) {
    throw new Error('Invalid or expired reset token');
  }

  const newHash = await bcrypt.hash(newPassword, 12);

  await db.query(
    `UPDATE users SET password_hash = $1, reset_token = null, reset_token_expiry = null
     WHERE reset_token = $2`,
    [newHash, token]
  ); 

  return { message: 'Password updated successfully. You can now log in.' };
}

module.exports = {
  registerUser,
  verifyEmail,
  loginUser,
  requestPasswordReset,
  resetPassword,
};