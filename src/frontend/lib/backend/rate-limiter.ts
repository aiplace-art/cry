/**
 * Rate Limiting Middleware for HypeAI Backend
 * Production-ready rate limiting with in-memory storage
 */

import { RateLimiterMemory } from 'rate-limiter-flexible';
import { APIError, RateLimitConfig, RateLimits } from '../../types/api';
import { NextApiRequest } from 'next';

// ============================================================================
// Rate Limiter Instances
// ============================================================================

const limiters = {
  auth: new RateLimiterMemory(RateLimits.auth),
  purchase: new RateLimiterMemory(RateLimits.purchase),
  query: new RateLimiterMemory(RateLimits.query),
  stats: new RateLimiterMemory(RateLimits.stats),
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get client identifier from request
 */
export function getClientIdentifier(req: NextApiRequest): string {
  // Try to get authenticated user address from headers
  const authHeader = req.headers.authorization as string | undefined;

  if (authHeader) {
    try {
      // Extract address from token if available
      const token = authHeader.replace('Bearer ', '');
      // In production, decode token to get address
      // For now, use IP as fallback
    } catch (error) {
      // Continue to IP-based limiting
    }
  }

  // Fallback to IP address
  const forwarded = req.headers['x-forwarded-for'] as string | undefined;
  const ip = forwarded
    ? forwarded.split(',')[0].trim()
    : req.socket.remoteAddress || 'unknown';

  return ip;
}

/**
 * Get rate limiter by endpoint type
 */
function getRateLimiter(endpoint: keyof typeof limiters): RateLimiterMemory {
  return limiters[endpoint];
}

// ============================================================================
// Rate Limiting Functions
// ============================================================================

/**
 * Check rate limit for request
 */
export async function checkRateLimit(
  req: NextApiRequest,
  endpoint: keyof typeof limiters
): Promise<void> {
  const identifier = getClientIdentifier(req);
  const limiter = getRateLimiter(endpoint);

  try {
    const rateLimitResult = await limiter.consume(identifier, 1);

    // Add rate limit headers to response (will be set in API handler)
    (req as any).rateLimitInfo = {
      limit: RateLimits[endpoint].points,
      remaining: rateLimitResult.remainingPoints,
      reset: new Date(Date.now() + rateLimitResult.msBeforeNext),
    };
  } catch (error: any) {
    // Rate limit exceeded
    const msBeforeNext = error?.msBeforeNext || 60000;
    const retryAfter = Math.ceil(msBeforeNext / 1000);

    throw new APIError(
      429,
      `Too many requests. Please try again in ${retryAfter} seconds.`,
      'RATE_LIMIT_EXCEEDED'
    );
  }
}

/**
 * Apply rate limit middleware to API handler
 */
export function withRateLimit(
  endpoint: keyof typeof limiters,
  handler: (req: NextApiRequest, res: any) => Promise<void>
) {
  return async (req: NextApiRequest, res: any) => {
    try {
      // Check rate limit
      await checkRateLimit(req, endpoint);

      // Add rate limit headers
      const rateLimitInfo = (req as any).rateLimitInfo;
      if (rateLimitInfo) {
        res.setHeader('X-RateLimit-Limit', rateLimitInfo.limit);
        res.setHeader('X-RateLimit-Remaining', rateLimitInfo.remaining);
        res.setHeader('X-RateLimit-Reset', rateLimitInfo.reset.toISOString());
      }

      // Execute handler
      await handler(req, res);
    } catch (error) {
      if (error instanceof APIError) {
        return res.status(error.statusCode).json({
          success: false,
          error: error.message,
          code: error.code,
        });
      }

      console.error('Rate limit error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  };
}

// ============================================================================
// Penalty & Blocking
// ============================================================================

/**
 * Block identifier for specified duration
 */
export async function blockIdentifier(
  identifier: string,
  durationSeconds: number
): Promise<void> {
  // Block across all limiters
  await Promise.all(
    Object.values(limiters).map(limiter =>
      limiter.block(identifier, durationSeconds)
    )
  );
}

/**
 * Penalty for suspicious activity
 */
export async function applyPenalty(
  req: NextApiRequest,
  endpoint: keyof typeof limiters,
  points: number = 10
): Promise<void> {
  const identifier = getClientIdentifier(req);
  const limiter = getRateLimiter(endpoint);

  try {
    await limiter.penalty(identifier, points);
  } catch (error) {
    console.error('Failed to apply penalty:', error);
  }
}

// ============================================================================
// Monitoring
// ============================================================================

/**
 * Get rate limit statistics
 */
export function getRateLimitStats(): {
  [key: string]: {
    points: number;
    duration: number;
  };
} {
  return Object.entries(RateLimits).reduce((acc, [key, value]) => {
    acc[key] = {
      points: value.points,
      duration: value.duration,
    };
    return acc;
  }, {} as any);
}
