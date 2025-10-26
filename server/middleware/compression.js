#!/usr/bin/env node

/**
 * Advanced Compression Middleware
 * Brotli + Gzip with smart compression levels
 */

import compression from 'compression';
import zlib from 'zlib';

/**
 * Smart compression middleware with Brotli and Gzip support
 */
export function smartCompression(options = {}) {
  const config = {
    threshold: options.threshold || 1024, // Only compress > 1KB
    level: options.level || 6, // Balance between speed and compression
    memLevel: options.memLevel || 8,
    ...options
  };

  return compression({
    // Compression level (0-9, higher = better compression but slower)
    level: config.level,

    // Memory level (1-9, higher = more memory but faster)
    memLevel: config.memLevel,

    // Only compress responses larger than threshold
    threshold: config.threshold,

    // Filter function to determine what to compress
    filter: (req, res) => {
      // Don't compress if explicitly disabled
      if (req.headers['x-no-compression']) {
        return false;
      }

      // Don't compress images, videos, archives
      const contentType = res.getHeader('Content-Type');
      if (contentType) {
        const noCompress = [
          'image/',
          'video/',
          'audio/',
          'application/zip',
          'application/x-rar',
          'application/pdf'
        ];

        if (noCompress.some(type => contentType.includes(type))) {
          return false;
        }
      }

      // Use default compression filter
      return compression.filter(req, res);
    },

    // Brotli configuration (better compression than gzip)
    brotli: {
      enabled: true,
      zlib: {
        params: {
          [zlib.constants.BROTLI_PARAM_QUALITY]: config.level,
          [zlib.constants.BROTLI_PARAM_SIZE_HINT]: zlib.constants.BROTLI_MAX_INPUT_BLOCK_BITS
        }
      }
    }
  });
}

/**
 * Pre-compression middleware for static assets
 * Serves pre-compressed .br and .gz files if available
 */
export function preCompression() {
  return async (req, res, next) => {
    // Only for static assets
    if (!req.path.match(/\.(js|css|html|svg|json|xml)$/)) {
      return next();
    }

    const acceptEncoding = req.headers['accept-encoding'] || '';

    // Try Brotli first (better compression)
    if (acceptEncoding.includes('br')) {
      const brPath = req.path + '.br';
      const fs = await import('fs/promises');

      try {
        await fs.access(brPath);
        res.set('Content-Encoding', 'br');
        res.set('Vary', 'Accept-Encoding');
        req.url = brPath;
        return next();
      } catch {
        // File doesn't exist, continue
      }
    }

    // Try Gzip
    if (acceptEncoding.includes('gzip')) {
      const gzPath = req.path + '.gz';
      const fs = await import('fs/promises');

      try {
        await fs.access(gzPath);
        res.set('Content-Encoding', 'gzip');
        res.set('Vary', 'Accept-Encoding');
        req.url = gzPath;
        return next();
      } catch {
        // File doesn't exist, continue
      }
    }

    next();
  };
}

/**
 * Compression stats middleware
 */
export function compressionStats() {
  const stats = {
    requests: 0,
    compressed: 0,
    totalOriginalSize: 0,
    totalCompressedSize: 0
  };

  const middleware = (req, res, next) => {
    stats.requests++;

    const originalWrite = res.write;
    const originalEnd = res.end;
    let originalSize = 0;
    let compressedSize = 0;

    res.write = function(chunk, ...args) {
      if (chunk) {
        originalSize += chunk.length || 0;
      }
      return originalWrite.call(this, chunk, ...args);
    };

    res.end = function(chunk, ...args) {
      if (chunk) {
        originalSize += chunk.length || 0;
      }

      const encoding = res.getHeader('Content-Encoding');
      if (encoding && encoding !== 'identity') {
        stats.compressed++;
        stats.totalOriginalSize += originalSize;

        const contentLength = res.getHeader('Content-Length');
        compressedSize = contentLength ? parseInt(contentLength) : originalSize * 0.7; // Estimate
        stats.totalCompressedSize += compressedSize;
      }

      return originalEnd.call(this, chunk, ...args);
    };

    next();
  };

  middleware.getStats = () => {
    const compressionRatio = stats.totalOriginalSize > 0
      ? ((1 - stats.totalCompressedSize / stats.totalOriginalSize) * 100).toFixed(2)
      : 0;

    return {
      ...stats,
      compressionRatio: `${compressionRatio}%`,
      averageSavings: stats.totalOriginalSize > 0
        ? ((stats.totalOriginalSize - stats.totalCompressedSize) / stats.compressed).toFixed(0)
        : 0
    };
  };

  return middleware;
}

export default {
  smartCompression,
  preCompression,
  compressionStats
};
