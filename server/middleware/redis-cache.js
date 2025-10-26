#!/usr/bin/env node

/**
 * Redis Caching Middleware
 * Target: 80%+ cache hit rate, <50ms response time
 */

import Redis from 'ioredis';

class RedisCacheMiddleware {
  constructor(options = {}) {
    this.redis = new Redis({
      host: options.host || process.env.REDIS_HOST || 'localhost',
      port: options.port || process.env.REDIS_PORT || 6379,
      password: options.password || process.env.REDIS_PASSWORD,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      lazyConnect: false
    });

    this.stats = {
      hits: 0,
      misses: 0,
      errors: 0,
      totalRequests: 0
    };

    this.defaultTTL = options.defaultTTL || 300; // 5 minutes
    this.keyPrefix = options.keyPrefix || 'cache:';

    this.redis.on('error', (err) => {
      console.error('Redis error:', err);
      this.stats.errors++;
    });

    this.redis.on('connect', () => {
      console.log('✅ Redis connected');
    });

    // Log stats every 5 minutes
    setInterval(() => this.logStats(), 300000);
  }

  /**
   * Generate cache key from request
   */
  generateKey(req) {
    const url = req.originalUrl || req.url;
    const query = JSON.stringify(req.query);
    const body = req.method === 'POST' ? JSON.stringify(req.body) : '';

    return `${this.keyPrefix}${req.method}:${url}:${query}:${body}`;
  }

  /**
   * Cache middleware factory
   */
  middleware(options = {}) {
    const ttl = options.ttl || this.defaultTTL;
    const keyGenerator = options.keyGenerator || this.generateKey.bind(this);
    const condition = options.condition || (() => true);

    return async (req, res, next) => {
      // Skip caching if condition not met
      if (!condition(req)) {
        return next();
      }

      // Skip non-GET requests by default
      if (req.method !== 'GET' && !options.cachePost) {
        return next();
      }

      const cacheKey = keyGenerator(req);
      this.stats.totalRequests++;

      try {
        // Try to get from cache
        const cached = await this.redis.get(cacheKey);

        if (cached) {
          this.stats.hits++;
          const data = JSON.parse(cached);

          // Add cache headers
          res.set('X-Cache', 'HIT');
          res.set('X-Cache-Key', cacheKey.substring(0, 50));

          return res.json(data);
        }

        this.stats.misses++;

        // Override res.json to cache response
        const originalJson = res.json.bind(res);
        res.json = (data) => {
          // Cache successful responses only
          if (res.statusCode >= 200 && res.statusCode < 300) {
            this.redis.setex(cacheKey, ttl, JSON.stringify(data)).catch(err => {
              console.error('Cache set error:', err);
            });
          }

          // Add cache headers
          res.set('X-Cache', 'MISS');
          res.set('X-Cache-TTL', ttl.toString());

          return originalJson(data);
        };

        next();

      } catch (error) {
        console.error('Cache middleware error:', error);
        this.stats.errors++;
        next(); // Continue without cache
      }
    };
  }

  /**
   * Invalidate cache by pattern
   */
  async invalidate(pattern) {
    try {
      const keys = await this.redis.keys(`${this.keyPrefix}${pattern}`);
      if (keys.length > 0) {
        await this.redis.del(...keys);
        console.log(`🗑️  Invalidated ${keys.length} cache keys matching: ${pattern}`);
      }
      return keys.length;
    } catch (error) {
      console.error('Cache invalidation error:', error);
      return 0;
    }
  }

  /**
   * Clear all cache
   */
  async clear() {
    try {
      const keys = await this.redis.keys(`${this.keyPrefix}*`);
      if (keys.length > 0) {
        await this.redis.del(...keys);
        console.log(`🗑️  Cleared ${keys.length} cache keys`);
      }
      return keys.length;
    } catch (error) {
      console.error('Cache clear error:', error);
      return 0;
    }
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const hitRate = this.stats.totalRequests > 0
      ? (this.stats.hits / this.stats.totalRequests * 100).toFixed(2)
      : 0;

    return {
      ...this.stats,
      hitRate: `${hitRate}%`,
      missRate: `${(100 - hitRate).toFixed(2)}%`
    };
  }

  /**
   * Log statistics
   */
  logStats() {
    const stats = this.getStats();
    console.log('📊 Redis Cache Stats:', stats);

    // Alert if hit rate is low
    if (parseFloat(stats.hitRate) < 50 && this.stats.totalRequests > 100) {
      console.warn('⚠️  Cache hit rate is below 50%! Consider increasing TTL or reviewing cache strategy.');
    }
  }

  /**
   * Reset statistics
   */
  resetStats() {
    this.stats = {
      hits: 0,
      misses: 0,
      errors: 0,
      totalRequests: 0
    };
  }

  /**
   * Health check
   */
  async healthCheck() {
    try {
      await this.redis.ping();
      return {
        status: 'healthy',
        stats: this.getStats()
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message
      };
    }
  }

  /**
   * Close Redis connection
   */
  async close() {
    await this.redis.quit();
    console.log('✅ Redis connection closed');
  }
}

// Export singleton instance
let cacheInstance = null;

export function getCacheInstance(options) {
  if (!cacheInstance) {
    cacheInstance = new RedisCacheMiddleware(options);
  }
  return cacheInstance;
}

export default RedisCacheMiddleware;
