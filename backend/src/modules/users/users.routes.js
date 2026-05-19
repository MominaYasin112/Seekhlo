const router = require('express').Router();
const db = require('../../config/db');
const authMiddleware = require('../../middleware/auth');

router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT u.id, u.name, u.email, u.role, u.created_at,
              us.total_xp, us.level, us.streak, us.last_active_date
       FROM users u
       LEFT JOIN user_stats us ON u.id = us.user_id
       WHERE u.id = $1`,
      [req.user.userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/badges', authMiddleware, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT b.*, ub.earned_at
       FROM user_badges ub
       JOIN badges b ON ub.badge_id = b.id
       WHERE ub.user_id = $1
       ORDER BY ub.earned_at DESC`,
      [req.user.userId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/progress', authMiddleware, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT qr.*, m.title as module_title, m.topic
       FROM quiz_results qr
       JOIN modules m ON qr.module_id = m.id
       WHERE qr.user_id = $1
       ORDER BY qr.completed_at DESC`,
      [req.user.userId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;