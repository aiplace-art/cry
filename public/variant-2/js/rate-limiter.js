/**
 * Rate Limiter for API Calls and User Actions
 * Prevents brute force and DDoS attacks
 */

class RateLimiter {
  constructor(maxAttempts = 5, windowMs = 60000, options = {}) {
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
    this.attempts = new Map();
    this.blocklist = new Set();

    // Configuration
    this.config = {
      blockDuration: options.blockDuration || 300000, // 5 minutes
      enablePersistence: options.enablePersistence !== false,
      storageKey: options.storageKey || 'rate_limiter_data',
      cleanupInterval: options.cleanupInterval || 60000, // 1 minute
      enableLogging: options.enableLogging !== false
    };

    // Load persisted data
    if (this.config.enablePersistence) {
      this.loadFromStorage();
    }

    // Start cleanup interval
    this.startCleanup();
  }

  /**
   * Check if action is allowed for given key
   * @param {string} key - Identifier (e.g., IP, user ID, wallet address)
   * @returns {boolean} - True if allowed, false if rate limited
   */
  isAllowed(key) {
    // Check if blocked
    if (this.isBlocked(key)) {
      this.log('warn', `Blocked key attempted access: ${key}`);
      return false;
    }

    const now = Date.now();
    const userAttempts = this.attempts.get(key) || [];

    // Remove old attempts outside the time window
    const recentAttempts = userAttempts.filter(
      time => now - time < this.windowMs
    );

    // Check if limit exceeded
    if (recentAttempts.length >= this.maxAttempts) {
      this.log('warn', `Rate limit exceeded for key: ${key}`);
      this.block(key);
      return false;
    }

    // Add current attempt
    recentAttempts.push(now);
    this.attempts.set(key, recentAttempts);

    // Persist to storage
    if (this.config.enablePersistence) {
      this.saveToStorage();
    }

    return true;
  }

  /**
   * Block a key for specified duration
   */
  block(key) {
    const unblockTime = Date.now() + this.config.blockDuration;
    this.blocklist.add(JSON.stringify({ key, unblockTime }));

    this.log('warn', `Blocked key: ${key} until ${new Date(unblockTime).toISOString()}`);

    if (this.config.enablePersistence) {
      this.saveToStorage();
    }
  }

  /**
   * Check if key is blocked
   */
  isBlocked(key) {
    const now = Date.now();

    for (const item of this.blocklist) {
      const { key: blockedKey, unblockTime } = JSON.parse(item);

      // Remove expired blocks
      if (now > unblockTime) {
        this.blocklist.delete(item);
        continue;
      }

      if (blockedKey === key) {
        return true;
      }
    }

    return false;
  }

  /**
   * Manually unblock a key
   */
  unblock(key) {
    for (const item of this.blocklist) {
      const { key: blockedKey } = JSON.parse(item);
      if (blockedKey === key) {
        this.blocklist.delete(item);
        this.log('info', `Unblocked key: ${key}`);
      }
    }

    if (this.config.enablePersistence) {
      this.saveToStorage();
    }
  }

  /**
   * Reset attempts for a key
   */
  reset(key) {
    this.attempts.delete(key);
    this.unblock(key);

    if (this.config.enablePersistence) {
      this.saveToStorage();
    }
  }

  /**
   * Get remaining attempts for a key
   */
  getRemainingAttempts(key) {
    if (this.isBlocked(key)) return 0;

    const now = Date.now();
    const userAttempts = this.attempts.get(key) || [];
    const recentAttempts = userAttempts.filter(
      time => now - time < this.windowMs
    );

    return Math.max(0, this.maxAttempts - recentAttempts.length);
  }

  /**
   * Get time until next attempt allowed (in ms)
   */
  getTimeUntilReset(key) {
    if (this.isBlocked(key)) {
      const now = Date.now();
      for (const item of this.blocklist) {
        const { key: blockedKey, unblockTime } = JSON.parse(item);
        if (blockedKey === key) {
          return Math.max(0, unblockTime - now);
        }
      }
    }

    const userAttempts = this.attempts.get(key) || [];
    if (userAttempts.length === 0) return 0;

    const oldestAttempt = Math.min(...userAttempts);
    const resetTime = oldestAttempt + this.windowMs;
    return Math.max(0, resetTime - Date.now());
  }

  /**
   * Cleanup old data
   */
  cleanup() {
    const now = Date.now();

    // Cleanup attempts
    for (const [key, attempts] of this.attempts.entries()) {
      const recentAttempts = attempts.filter(
        time => now - time < this.windowMs
      );

      if (recentAttempts.length === 0) {
        this.attempts.delete(key);
      } else {
        this.attempts.set(key, recentAttempts);
      }
    }

    // Cleanup blocklist
    for (const item of this.blocklist) {
      const { unblockTime } = JSON.parse(item);
      if (now > unblockTime) {
        this.blocklist.delete(item);
      }
    }

    this.log('debug', `Cleanup completed. Attempts: ${this.attempts.size}, Blocked: ${this.blocklist.size}`);
  }

  /**
   * Start automatic cleanup
   */
  startCleanup() {
    this.cleanupTimer = setInterval(() => {
      this.cleanup();
      if (this.config.enablePersistence) {
        this.saveToStorage();
      }
    }, this.config.cleanupInterval);
  }

  /**
   * Stop automatic cleanup
   */
  stopCleanup() {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
  }

  /**
   * Save state to localStorage
   */
  saveToStorage() {
    try {
      const data = {
        attempts: Array.from(this.attempts.entries()),
        blocklist: Array.from(this.blocklist),
        timestamp: Date.now()
      };
      localStorage.setItem(this.config.storageKey, JSON.stringify(data));
    } catch (error) {
      this.log('error', 'Failed to save rate limiter data:', error);
    }
  }

  /**
   * Load state from localStorage
   */
  loadFromStorage() {
    try {
      const stored = localStorage.getItem(this.config.storageKey);
      if (!stored) return;

      const data = JSON.parse(stored);

      // Don't load data older than 1 hour
      if (Date.now() - data.timestamp > 3600000) {
        localStorage.removeItem(this.config.storageKey);
        return;
      }

      this.attempts = new Map(data.attempts);
      this.blocklist = new Set(data.blocklist);

      this.log('info', 'Loaded rate limiter data from storage');
    } catch (error) {
      this.log('error', 'Failed to load rate limiter data:', error);
    }
  }

  /**
   * Get statistics
   */
  getStats() {
    return {
      totalKeys: this.attempts.size,
      blockedKeys: this.blocklist.size,
      maxAttempts: this.maxAttempts,
      windowMs: this.windowMs,
      blockDuration: this.config.blockDuration
    };
  }

  /**
   * Logging helper
   */
  log(level, ...args) {
    if (!this.config.enableLogging) return;

    if (window.Logger) {
      window.Logger[level](...args);
    } else {
      console[level]('[RateLimiter]', ...args);
    }
  }

  /**
   * Destroy and cleanup
   */
  destroy() {
    this.stopCleanup();
    this.attempts.clear();
    this.blocklist.clear();

    if (this.config.enablePersistence) {
      localStorage.removeItem(this.config.storageKey);
    }
  }
}

// Export for ES6 modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = RateLimiter;
}

// Make available globally
if (typeof window !== 'undefined') {
  window.RateLimiter = RateLimiter;
}
