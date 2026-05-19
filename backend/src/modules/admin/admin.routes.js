const router = require('express').Router();
const db = require('../../config/db');
const authMiddleware = require('../../middleware/auth');
const adminOnly = require('../../middleware/adminOnly');

router.use(authMiddleware, adminOnly);

router.get('/modules', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM modules ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/modules', async (req, res) => {
  try {
    const { title, topic, type, content, difficulty, xp_reward, prerequisites } = req.body;
    if (!title || !type) {
      return res.status(400).json({ error: 'Title and type are required' });
    }
    const result = await db.query(
      `INSERT INTO modules (title, topic, type, content, difficulty, xp_reward, prerequisites)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [title, topic, type, content, difficulty || 1, xp_reward || 50, prerequisites || []]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/modules/:id', async (req, res) => {
  try {
    const { title, topic, content, difficulty, xp_reward, is_published } = req.body;
    const result = await db.query(
      `UPDATE modules
       SET title = $1, topic = $2, content = $3, difficulty = $4,
           xp_reward = $5, is_published = $6
       WHERE id = $7 RETURNING *`,
      [title, topic, content, difficulty, xp_reward, is_published, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Module not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/modules/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM modules WHERE id = $1', [req.params.id]);
    res.json({ message: 'Module deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/users', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT u.id, u.name, u.email, u.role, u.is_verified, u.created_at,
              us.total_xp, us.level, us.streak
       FROM users u
       LEFT JOIN user_stats us ON u.id = us.user_id
       ORDER BY u.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/logs', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT al.*, u.name, u.email
       FROM activity_log al
       JOIN users u ON al.user_id = u.id
       ORDER BY al.created_at DESC
       LIMIT 100`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;