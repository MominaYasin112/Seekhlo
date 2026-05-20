const db = require('../../config/db');
const { getRedisClient } = require('../../config/redis');

const XP_MAP = {
  lesson: 50,
  quiz: 30,
  coding_challenge: 100,
};

function calculateXP(activityType, score) {
  const base = XP_MAP[activityType] || 30;
  const bonus = score !== undefined ? Math.floor(score * 0.5) : 0;
  return base + bonus;
}

async function processActivity(userId, activityType, result) {
  const xpEarned = calculateXP(activityType, result.score);

  await db.query(
    `UPDATE user_stats SET total_xp = total_xp + $1 WHERE user_id = $2`,
    [xpEarned, userId]
  );

  await db.query(
    `INSERT INTO activity_log (user_id, action, metadata)
     VALUES ($1, $2, $3)`,
    [userId, `completed_${activityType}`, JSON.stringify(result)]
  );

  const statsResult = await db.query(
    `SELECT * FROM user_stats WHERE user_id = $1`,
    [userId]
  );
  const stats = statsResult.rows[0];

  const leveledUp = await checkLevelUp(userId, stats);
  const newBadges = await checkBadges(userId, stats);
  const streakCount = await updateStreak(userId, stats);

  const freshStats = await db.query(`SELECT * FROM user_stats WHERE user_id = $1`, [userId]);
  const current = freshStats.rows[0];

  // Try Redis leaderboard, silently skip if unavailable
  try {
    const redis = await getRedisClient();
    if (redis) {
      await redis.zAdd('leaderboard:alltime', [
        { score: stats.total_xp, value: userId }
      ]);
      const today = new Date().toISOString().split('T')[0];
      await redis.zAdd(`leaderboard:daily:${today}`, [
        { score: xpEarned, value: userId }
      ]);
    }
  } catch (err) {
    // Redis unavailable, PostgreSQL fallback handles leaderboard
  }

  return {
    xpEarned,
    totalXP: current.total_xp,
    level: current.level,
    leveledUp,
    newBadges,
    streakCount,
  };
}

async function checkLevelUp(userId, stats) {
  const threshold = stats.level * 500;
  if (stats.total_xp >= threshold) {
    await db.query(
      `UPDATE user_stats SET level = level + 1 WHERE user_id = $1`,
      [userId]
    );
    return true;
  }
  return false;
}

async function checkBadges(userId, stats) {
  const allBadges = await db.query('SELECT * FROM badges');
  const userBadgesResult = await db.query(
    `SELECT badge_id FROM user_badges WHERE user_id = $1`,
    [userId]
  );

  const alreadyEarned = new Set(userBadgesResult.rows.map((r) => r.badge_id));
  const newBadges = [];

  for (const badge of allBadges.rows) {
    if (alreadyEarned.has(badge.id)) continue;

    let conditionMet = false;
    if (badge.condition_type === 'xp' && stats.total_xp >= badge.condition_value) conditionMet = true;
    if (badge.condition_type === 'level' && stats.level >= badge.condition_value) conditionMet = true;
    if (badge.condition_type === 'streak' && stats.streak >= badge.condition_value) conditionMet = true;

    if (conditionMet) {
      await db.query(
        `INSERT INTO user_badges (user_id, badge_id) VALUES ($1, $2)`,
        [userId, badge.id]
      );
      newBadges.push(badge);
    }
  }

  return newBadges;
}

async function updateStreak(userId, stats) {
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  const lastActive = stats.last_active_date
    ? new Date(stats.last_active_date).toISOString().split('T')[0]
    : null;

  let newStreak = stats.streak;

  if (lastActive === today) {
    // Already counted today — don't change anything
    return newStreak;
  } else if (lastActive === yesterday) {
    // Consecutive day — increment streak
    newStreak = stats.streak + 1;
  } else if (lastActive === null) {
    // Very first activity ever — start streak at 1
    newStreak = 1;
  } else {
    // Missed a day — reset to 1 (starting fresh today)
    newStreak = 1;
  }

  await db.query(
    `UPDATE user_stats SET streak = $1, last_active_date = $2 WHERE user_id = $3`,
    [newStreak, today, userId]
  );

  return newStreak;
}

async function getLeaderboard(type = 'alltime', limit = 50) {
  // Always use PostgreSQL (works without Redis)
  const result = await db.query(
    `SELECT u.id, u.name, us.total_xp, us.level, us.streak
     FROM users u
     JOIN user_stats us ON u.id = us.user_id
     ORDER BY us.total_xp DESC
     LIMIT $1`,
    [limit]
  );
  return result.rows.map((row, index) => ({
    rank: index + 1,
    userId: row.id,
    name: row.name,
    xp: row.total_xp,
    level: row.level,
    streak: row.streak,
  }));
}

async function getUserStats(userId) {
  const result = await db.query(
    `SELECT us.total_xp, us.level, us.streak, us.last_active_date,
            COALESCE(
              json_agg(
                json_build_object('id', b.id, 'name', b.name, 'description', b.description)
              ) FILTER (WHERE b.id IS NOT NULL),
              '[]'
            ) as badges
     FROM user_stats us
     LEFT JOIN user_badges ub ON us.user_id = ub.user_id
     LEFT JOIN badges b ON ub.badge_id = b.id
     WHERE us.user_id = $1
     GROUP BY us.user_id, us.total_xp, us.level, us.streak, us.last_active_date`,
    [userId]
  );
  return result.rows[0];
}

module.exports = {
  processActivity,
  getLeaderboard,
  getUserStats,
};