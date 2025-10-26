import { Request, Response, NextFunction } from 'express';
import { redis } from '@database/client.js';
import { config } from '@core/config.js';
import { Logger } from '@core/logger.js';
import { AuthRequest } from './auth.middleware.js';

const logger = new Logger('RateLimitMiddleware');

export interface RateLimitOptions {
  windowMs?: number;
  maxRequests?: number;
  keyGenerator?: (req: Request) => string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

export class RateLimitMiddleware {
  /**
   * Create rate limit middleware
   */
  static create(options: RateLimitOptions = {}) {
    const windowMs = options.windowMs || config.rateLimitWindowMs;
    const maxRequests = options.maxRequests || config.rateLimitMaxRequests;
    const keyGenerator = options.keyGenerator || this.defaultKeyGenerator;

    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const key = `ratelimit:${keyGenerator(req)}`;
        const now = Date.now();
        const windowStart = now - windowMs;

        // Remove old entries and count current requests
        const multi = redis.getClient().multi();
        multi.zremrangebyscore(key, 0, windowStart);
        multi.zadd(key, now, `${now}`);
        multi.zcard(key);
        multi.expire(key, Math.ceil(windowMs / 1000));

        const results = await multi.exec();
        const count = results?.[2]?.[1] as number || 0;

        // Set rate limit headers
        res.setHeader('X-RateLimit-Limit', maxRequests);
        res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - count));
        res.setHeader('X-RateLimit-Reset', new Date(now + windowMs).toISOString());

        if (count > maxRequests) {
          const retryAfter = Math.ceil(windowMs / 1000);
          res.setHeader('Retry-After', retryAfter);

          logger.warn('Rate limit exceeded', {
            key,
            count,
            maxRequests,
            ip: req.ip,
          });

          res.status(429).json({
            error: 'Too Many Requests',
            message: `Rate limit exceeded. Try again in ${retryAfter} seconds.`,
            retryAfter,
          });
          return;
        }

        next();
      } catch (error) {
        logger.error('Rate limit error', error);
        // Fail open - allow request if rate limiting fails
        next();
      }
    };
  }

  /**
   * Default key generator (by user ID or IP)
   */
  private static defaultKeyGenerator(req: Request): string {
    const authReq = req as AuthRequest;
    if (authReq.user?.userId) {
      return `user:${authReq.user.userId}`;
    }
    return `ip:${req.ip || 'unknown'}`;
  }

  /**
   * Generate key by endpoint
   */
  static endpointKeyGenerator(req: Request): string {
    const authReq = req as AuthRequest;
    const userId = authReq.user?.userId || req.ip || 'anonymous';
    const endpoint = req.path;
    return `${userId}:${endpoint}`;
  }

  /**
   * Strict rate limit (by user + endpoint)
   */
  static strict(options: Omit<RateLimitOptions, 'keyGenerator'> = {}) {
    return this.create({
      ...options,
      keyGenerator: this.endpointKeyGenerator,
    });
  }

  /**
   * Global rate limit (by IP only)
   */
  static global(options: Omit<RateLimitOptions, 'keyGenerator'> = {}) {
    return this.create({
      ...options,
      keyGenerator: (req) => `ip:${req.ip || 'unknown'}`,
    });
  }

  /**
   * Check rate limit without incrementing
   */
  static async check(key: string, windowMs: number, maxRequests: number): Promise<{
    allowed: boolean;
    remaining: number;
    resetAt: Date;
  }> {
    const now = Date.now();
    const windowStart = now - windowMs;
    const rateLimitKey = `ratelimit:${key}`;

    const count = await redis.getClient().zcount(rateLimitKey, windowStart, now);

    return {
      allowed: count < maxRequests,
      remaining: Math.max(0, maxRequests - count),
      resetAt: new Date(now + windowMs),
    };
  }

  /**
   * Reset rate limit for a key
   */
  static async reset(key: string): Promise<void> {
    await redis.delete(`ratelimit:${key}`);
    logger.info('Rate limit reset', { key });
  }
}
