/**
 * Rate Limiter
 * In-memory rate limiting for API endpoints
 */

class RateLimiter {
  constructor(maxRequests = 10, windowMs = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.requests = new Map();

    // Clean up old entries every minute
    setInterval(() => this.cleanup(), 60000);
  }

  /**
   * Check if request is allowed
   * @param {string} identifier - Client identifier (IP address)
   */
  checkLimit(identifier) {
    const now = Date.now();
    const clientData = this.requests.get(identifier) || {
      count: 0,
      resetAt: now + this.windowMs
    };

    // Reset if window expired
    if (now >= clientData.resetAt) {
      clientData.count = 0;
      clientData.resetAt = now + this.windowMs;
    }

    // Check limit
    const allowed = clientData.count < this.maxRequests;

    if (allowed) {
      clientData.count++;
      this.requests.set(identifier, clientData);
    }

    return {
      allowed: allowed,
      remaining: Math.max(0, this.maxRequests - clientData.count),
      resetIn: clientData.resetAt - now
    };
  }

  /**
   * Clean up expired entries
   */
  cleanup() {
    const now = Date.now();
    const expiredKeys = [];

    for (const [key, data] of this.requests.entries()) {
      if (now >= data.resetAt + this.windowMs) {
        expiredKeys.push(key);
      }
    }

    expiredKeys.forEach(key => this.requests.delete(key));

    if (expiredKeys.length > 0) {
      console.log(`[RateLimiter] Cleaned up ${expiredKeys.length} expired entries`);
    }
  }

  /**
   * Reset limits for a client
   * @param {string} identifier - Client identifier
   */
  reset(identifier) {
    this.requests.delete(identifier);
  }

  /**
   * Get current stats
   */
  getStats() {
    return {
      totalClients: this.requests.size,
      maxRequests: this.maxRequests,
      windowMs: this.windowMs
    };
  }
}

module.exports = { RateLimiter };
