const router = require('express').Router();
const gamificationService = require('./gamification.service');
const authMiddleware = require('../../middleware/auth');

router.post('/activity', authMiddleware, async (req, res) => {
  try {
    const { activityType, result } = req.body;
    if (!activityType) {
      return res.status(400).json({ error: 'activityType is required' });
    }
    const data = await gamificationService.processActivity(
      req.user.userId,
      activityType,
      result || {}
    );
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/leaderboard/:type', async (req, res) => {
  try {
    const data = await gamificationService.getLeaderboard(req.params.type);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const data = await gamificationService.getUserStats(req.user.userId);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;