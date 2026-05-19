require('dotenv').config();

// Redis is optional - we use PostgreSQL fallback if Redis is unavailable
let client = null;

async function getRedisClient() {
  if (client) return client;
  try {
    const redis = require('redis');
    client = redis.createClient({ url: process.env.REDIS_URL });
    client.on('error', () => { client = null; });
    await client.connect();
    console.log('Connected to Redis');
    return client;
  } catch (err) {
    console.log('Redis not available, using PostgreSQL fallback for leaderboard');
    return null;
  }
}

module.exports = { getRedisClient };