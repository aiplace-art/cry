const redis = require('redis');
const { logger } = require('./logger');

let redisClient = null;

const connectRedis = async () => {
  try {
    redisClient = redis.createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 10) {
            logger.error('Redis reconnection failed after 10 attempts');
            return new Error('Redis reconnection failed');
          }
          return Math.min(retries * 100, 3000);
        }
      }
    });

    redisClient.on('error', (err) => {
      logger.error(`Redis error: ${err.message}`);
    });

    redisClient.on('connect', () => {
      logger.info('✅ Redis connecting...');
    });

    redisClient.on('ready', () => {
      logger.info('✅ Redis connected and ready');
    });

    redisClient.on('reconnecting', () => {
      logger.warn('Redis reconnecting...');
    });

    await redisClient.connect();

    return redisClient;
  } catch (error) {
    logger.error(`❌ Redis connection failed: ${error.message}`);
    // Continue without Redis - fallback to in-memory cache
    return null;
  }
};

const getRedisClient = () => {
  return redisClient;
};

const cacheGet = async (key) => {
  if (!redisClient || !redisClient.isReady) {
    return null;
  }

  try {
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    logger.error(`Redis GET error: ${error.message}`);
    return null;
  }
};

const cacheSet = async (key, value, ttl = 300) => {
  if (!redisClient || !redisClient.isReady) {
    return false;
  }

  try {
    await redisClient.setEx(key, ttl, JSON.stringify(value));
    return true;
  } catch (error) {
    logger.error(`Redis SET error: ${error.message}`);
    return false;
  }
};

const cacheDel = async (key) => {
  if (!redisClient || !redisClient.isReady) {
    return false;
  }

  try {
    await redisClient.del(key);
    return true;
  } catch (error) {
    logger.error(`Redis DEL error: ${error.message}`);
    return false;
  }
};

const cacheFlush = async () => {
  if (!redisClient || !redisClient.isReady) {
    return false;
  }

  try {
    await redisClient.flushAll();
    return true;
  } catch (error) {
    logger.error(`Redis FLUSH error: ${error.message}`);
    return false;
  }
};

module.exports = {
  connectRedis,
  getRedisClient,
  cacheGet,
  cacheSet,
  cacheDel,
  cacheFlush
};
