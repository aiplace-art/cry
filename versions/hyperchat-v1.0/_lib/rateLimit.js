/**
 * Rate Limiting for Serverless Functions
 * In-memory store (use Vercel KV/Upstash Redis for production)
 */

const rateLimitStore = new Map();

// Configuration
const WINDOW_MS = 60000; // 1 minute
const MAX_REQUESTS = 10; // 10 requests per minute per IP

/**
 * Check rate limit for client IP
 * @param {string} clientIP - Client IP address
 * @returns {Promise<{allowed: boolean, remaining: number, retryAfter: number}>}
 */
export async function rateLimit(clientIP) {
  const now = Date.now();
  const key = `rate:${clientIP}`;

  // Get or create rate limit record
  let record = rateLimitStore.get(key);

  if (!record) {
    record = {
      count: 0,
      resetTime: now + WINDOW_MS,
      firstRequest: now
    };
  }

  // Reset window if expired
  if (now >= record.resetTime) {
    record.count = 0;
    record.resetTime = now + WINDOW_MS;
    record.firstRequest = now;
  }

  // Increment counter
  record.count++;

  // Store updated record
  rateLimitStore.set(key, record);

  // Cleanup old entries periodically
  if (rateLimitStore.size > 10000) {
    cleanupExpiredEntries(now);
  }

  // Calculate remaining requests
  const remaining = Math.max(0, MAX_REQUESTS - record.count);
  const allowed = record.count <= MAX_REQUESTS;
  const retryAfter = Math.ceil((record.resetTime - now) / 1000);

  return {
    allowed,
    remaining,
    retryAfter
  };
}

/**
 * Cleanup expired entries from store
 */
function cleanupExpiredEntries(now) {
  for (const [key, record] of rateLimitStore.entries()) {
    if (now >= record.resetTime && record.count === 0) {
      rateLimitStore.delete(key);
    }
  }
}

/**
 * Clear rate limit for specific IP (admin function)
 */
export function clearRateLimit(clientIP) {
  rateLimitStore.delete(`rate:${clientIP}`);
}

/**
 * Get current rate limit info for IP
 */
export function getRateLimitInfo(clientIP) {
  const record = rateLimitStore.get(`rate:${clientIP}`);
  if (!record) {
    return {
      count: 0,
      remaining: MAX_REQUESTS,
      resetTime: null
    };
  }

  return {
    count: record.count,
    remaining: Math.max(0, MAX_REQUESTS - record.count),
    resetTime: new Date(record.resetTime).toISOString()
  };
}
