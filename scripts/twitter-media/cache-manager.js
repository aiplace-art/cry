/**
 * Cache Manager for Generated Images
 * Reduces regeneration overhead by caching images
 */

import fs from 'fs';
import crypto from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class CacheManager {
  constructor(cacheDir = null) {
    this.cacheDir = cacheDir || path.join(__dirname, 'cache');

    // Ensure cache directory exists
    if (!fs.existsSync(this.cacheDir)) {
      fs.mkdirSync(this.cacheDir, { recursive: true });
    }
  }

  /**
   * Generate cache key from data and style
   */
  getCacheKey(data, style) {
    const hash = crypto.createHash('md5')
      .update(JSON.stringify({ data, style }))
      .digest('hex');
    return `${style}-${hash}.png`;
  }

  /**
   * Get cached image
   */
  get(key) {
    const filePath = path.join(this.cacheDir, key);

    if (fs.existsSync(filePath)) {
      // Check if cache is not too old (24 hours)
      const stats = fs.statSync(filePath);
      const age = Date.now() - stats.mtimeMs;
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours

      if (age < maxAge) {
        return fs.readFileSync(filePath);
      } else {
        // Remove stale cache
        fs.unlinkSync(filePath);
      }
    }

    return null;
  }

  /**
   * Store image in cache
   */
  set(key, buffer) {
    const filePath = path.join(this.cacheDir, key);
    fs.writeFileSync(filePath, buffer);
  }

  /**
   * Check if key exists in cache
   */
  has(key) {
    const filePath = path.join(this.cacheDir, key);
    return fs.existsSync(filePath);
  }

  /**
   * Clear all cache
   */
  clear() {
    const files = fs.readdirSync(this.cacheDir);
    files.forEach(file => {
      const filePath = path.join(this.cacheDir, file);
      fs.unlinkSync(filePath);
    });
  }

  /**
   * Clear old cache entries (older than maxAge)
   */
  clearOld(maxAge = 24 * 60 * 60 * 1000) {
    const files = fs.readdirSync(this.cacheDir);
    const now = Date.now();

    files.forEach(file => {
      const filePath = path.join(this.cacheDir, file);
      const stats = fs.statSync(filePath);
      const age = now - stats.mtimeMs;

      if (age > maxAge) {
        fs.unlinkSync(filePath);
      }
    });
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const files = fs.readdirSync(this.cacheDir);
    const totalSize = files.reduce((size, file) => {
      const filePath = path.join(this.cacheDir, file);
      return size + fs.statSync(filePath).size;
    }, 0);

    return {
      count: files.length,
      totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2),
      files: files
    };
  }
}

export default CacheManager;
