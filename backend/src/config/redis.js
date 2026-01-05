const redis = require('redis');

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

const redisClient = redis.createClient({
  url: REDIS_URL,
  password: process.env.REDIS_PASSWORD || undefined,
});

redisClient.on('error', err => {
  console.error('❌ Redis Client Error:', err);
});

redisClient.on('connect', () => {
  console.log('✅ Redis connected successfully');
});

const connectRedis = async () => {
  try {
    await redisClient.connect();
  } catch (error) {
    console.error('❌ Redis connection failed:', error.message);
  }
};

module.exports = { redisClient, connectRedis };
