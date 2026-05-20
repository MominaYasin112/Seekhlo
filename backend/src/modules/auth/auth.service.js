const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const db = require('../../config/db');
const emailService = require('../../config/email');
require('dotenv').config();

const DEV_AUTO_VERIFY = process.env.DEV_AUTO_VERIFY === 'true';

function signToken(user) {
  return jwt.sign(
    { userId: user.id, role: user.role },
    process.env.JWT_SECRET || 'dev-secret-change-me',
    { expiresIn: '24h' }
  );
}

function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

async function registerUser(name, email, password) {
  const normalizedEmail = email.trim().toLowerCase();
  const existing = await db.query('SELECT id FROM users WHERE email = $1', [normalizedEmail]);
  if (existing.rows.length > 0) {
    throw new Error('Email already registered');
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const verifyToken = crypto.randomBytes(32).toString('hex');

  const insert = await db.query(
    `INSERT INTO users (name, email, password_hash, verify_token, is_verified)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [name, normalizedEmail, passwordHash, verifyToken, DEV_AUTO_VERIFY]
  );
  const user = insert.rows[0];

  await db.query(
    `INSERT INTO user_stats (user_id) VALUES ($1) ON CONFLICT (user_id) DO NOTHING`,
    [user.id]
  );

  if (DEV_AUTO_VERIFY) {
    return {
      message: 'Registration successful.',
      token: signToken(user),
      user: publicUser(user),
      devAutoVerified: true,
    };
  }

  try {
    await emailService.sendVerificationEmail(normalizedEmail, verifyToken);
  } catch (err) {
    console.error('Verification email failed:', err.message);
    throw new Error(
      'Account created but email could not be sent. Ask admin to set DEV_AUTO_VERIFY=true for local testing.'
    );
  }

  return { message: 'Registration successful. Please check your email to verify your account.' };
}

async function verifyEmail(token) {
  const result = await db.query(
    `UPDATE users SET is_verified = true, verify_token = null
     WHERE verify_token = $1 RETURNING *`,
    [token]
  );

  if (result.rows.length === 0) {
    throw new Error('Invalid or expired verification token');
  }

  const user = result.rows[0];
  await db.query(
    `INSERT INTO user_stats (user_id) VALUES ($1) ON CONFLICT (user_id) DO NOTHING`,
    [user.id]
  );

  return {
    message: 'Email verified successfully. You can now log in.',
    token: signToken(user),
    user: publicUser(user),
  };
}

async function loginUser(email, password) {
  const normalizedEmail = email.trim().toLowerCase();
  const result = await db.query('SELECT * FROM users WHERE email = $1', [normalizedEmail]);
  const user = result.rows[0];

  if (!user) {
    throw new Error('Invalid email or password');
  }

  if (!user.is_verified) {
    throw new Error('Please verify your email before logging in. Check your inbox or ask admin to enable DEV_AUTO_VERIFY.');
  }

  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) {
    throw new Error('Invalid email or password');
  }

  return {
    token: signToken(user),
    user: publicUser(user),
  };
}

async function requestPasswordReset(email) {
  const normalizedEmail = email.trim().toLowerCase();
  const result = await db.query('SELECT id FROM users WHERE email = $1', [normalizedEmail]);

  if (result.rows.length === 0) {
    return { message: 'If that email exists, a reset link has been sent.' };
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  const expiry = new Date(Date.now() + 3600000);

  await db.query(
    `UPDATE users SET reset_token = $1, reset_token_expiry = $2 WHERE email = $3`,
    [resetToken, expiry, normalizedEmail]
  );

  try {
    await emailService.sendPasswordResetEmail(normalizedEmail, resetToken);
  } catch (err) {
    console.error('Reset email failed:', err.message);
  }

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