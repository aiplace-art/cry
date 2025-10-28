/**
 * Simple in-memory cache for serverless functions
 * For production: Use Vercel KV, Upstash Redis, or Cloudflare KV
 */

const cacheStore = new Map();

// Configuration
const MAX_CACHE_SIZE = 1000; // Max cached items
const DEFAULT_TTL = 3600; // 1 hour default

/**
 * Cache implementation
 */
export const cache = {
  /**
   * Get value from cache
   * @param {string} key - Cache key
   * @returns {Promise<any|null>} Cached value or null
   */
  async get(key) {
    const entry = cacheStore.get(key);

    if (!entry) {
      return null;
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      cacheStore.delete(key);
      return null;
    }

    // Update access time for LRU
    entry.lastAccessed = Date.now();

    return entry.value;
  },

  /**
   * Set value in cache
   * @param {string} key - Cache key
   * @param {any} value - Value to cache
   * @param {number} ttlSeconds - Time to live in seconds
   */
  async set(key, value, ttlSeconds = DEFAULT_TTL) {
    // Cleanup if cache is full
    if (cacheStore.size >= MAX_CACHE_SIZE) {
      await this.cleanup();
    }

    cacheStore.set(key, {
      value,
      expiresAt: Date.now() + (ttlSeconds * 1000),
      createdAt: Date.now(),
      lastAccessed: Date.now()
    });
  },

  /**
   * Delete value from cache
   * @param {string} key - Cache key
   */
  async delete(key) {
    cacheStore.delete(key);
  },

  /**
   * Clear entire cache
   */
  async clear() {
    cacheStore.clear();
  },

  /**
   * Cleanup expired entries and enforce size limit
   */
  async cleanup() {
    const now = Date.now();
    let cleaned = 0;

    // Remove expired entries
    for (const [key, entry] of cacheStore.entries()) {
      if (now > entry.expiresAt) {
        cacheStore.delete(key);
        cleaned++;
      }
    }

    // If still over limit, remove least recently used
    if (cacheStore.size >= MAX_CACHE_SIZE) {
      const entries = Array.from(cacheStore.entries())
        .sort((a, b) => a[1].lastAccessed - b[1].lastAccessed);

      const toRemove = entries.slice(0, Math.floor(MAX_CACHE_SIZE * 0.2)); // Remove 20%
      for (const [key] of toRemove) {
        cacheStore.delete(key);
        cleaned++;
      }
    }

    return cleaned;
  },

  /**
   * Get cache statistics
   */
  async stats() {
    const now = Date.now();
    let expired = 0;
    let totalSize = 0;

    for (const [, entry] of cacheStore.entries()) {
      if (now > entry.expiresAt) {
        expired++;
      }
      totalSize += JSON.stringify(entry.value).length;
    }

    return {
      size: cacheStore.size,
      expired,
      maxSize: MAX_CACHE_SIZE,
      totalSize,
      averageSize: cacheStore.size > 0 ? Math.round(totalSize / cacheStore.size) : 0
    };
  }
};

/**
 * Get cache hit rate for monitoring
 */
let hits = 0;
let misses = 0;

export function trackCacheHit() {
  hits++;
}

export function trackCacheMiss() {
  misses++;
}

export function getCacheMetrics() {
  const total = hits + misses;
  return {
    hits,
    misses,
    total,
    hitRate: total > 0 ? (hits / total * 100).toFixed(2) : 0
  };
}

// Auto-cleanup every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    cache.cleanup().catch(console.error);
  }, 300000);
}
