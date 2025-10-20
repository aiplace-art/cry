/**
 * Secure Logger for Production Environments
 * Removes console.log in production, implements safe logging
 */

const Logger = {
  // Detect development environment
  isDev: window.location.hostname === 'localhost' ||
         window.location.hostname === '127.0.0.1' ||
         window.location.hostname.includes('dev') ||
         window.location.hostname.includes('test'),

  // Configuration
  config: {
    enableRemoteLogging: true,
    logEndpoint: '/api/logs',
    maxRetries: 3,
    batchSize: 10,
    batchInterval: 5000
  },

  // Log batch queue
  logQueue: [],
  batchTimer: null,

  /**
   * Development-only console logging
   */
  log(...args) {
    if (this.isDev) {
      console.log('[LOG]', ...args);
    }
  },

  /**
   * Development-only warnings
   */
  warn(...args) {
    if (this.isDev) {
      console.warn('[WARN]', ...args);
    }
  },

  /**
   * Always log errors (sanitized)
   */
  error(...args) {
    // Always log errors to console
    console.error('[ERROR]', ...args);

    // Send to remote logging in production
    if (!this.isDev) {
      this.logToService('error', args[0], {
        details: args.slice(1),
        userAgent: navigator.userAgent,
        url: window.location.href
      });
    }
  },

  /**
   * Debug logging (development only)
   */
  debug(...args) {
    if (this.isDev) {
      console.log('[DEBUG]', ...args);
    }
  },

  /**
   * Info logging
   */
  info(...args) {
    if (this.isDev) {
      console.info('[INFO]', ...args);
    }
  },

  /**
   * Performance logging
   */
  perf(label, duration) {
    if (this.isDev) {
      console.log(`[PERF] ${label}: ${duration}ms`);
    } else {
      this.logToService('performance', label, { duration });
    }
  },

  /**
   * User action tracking
   */
  track(action, data = {}) {
    const event = {
      action,
      data: this.sanitizeData(data),
      timestamp: Date.now(),
      session: this.getSessionId()
    };

    if (this.isDev) {
      console.log('[TRACK]', event);
    } else {
      this.addToQueue('track', event);
    }
  },

  /**
   * Production-safe logging to external service
   */
  logToService(level, message, data = {}) {
    if (this.isDev && !this.config.enableRemoteLogging) {
      return;
    }

    const logEntry = {
      level,
      message: String(message).substring(0, 1000), // Limit message length
      data: this.sanitizeData(data),
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent.substring(0, 200)
    };

    this.addToQueue('log', logEntry);
  },

  /**
   * Add log to batch queue
   */
  addToQueue(type, data) {
    this.logQueue.push({ type, data });

    // Send batch if queue is full
    if (this.logQueue.length >= this.config.batchSize) {
      this.flushQueue();
    } else {
      // Schedule batch send
      this.scheduleBatch();
    }
  },

  /**
   * Schedule batch sending
   */
  scheduleBatch() {
    if (this.batchTimer) return;

    this.batchTimer = setTimeout(() => {
      this.flushQueue();
    }, this.config.batchInterval);
  },

  /**
   * Send log batch to server
   */
  async flushQueue() {
    if (this.logQueue.length === 0) return;

    const batch = [...this.logQueue];
    this.logQueue = [];

    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
      this.batchTimer = null;
    }

    try {
      await fetch(this.config.logEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Client-Version': this.getVersion()
        },
        body: JSON.stringify({
          batch,
          client: 'hypeai-dashboard'
        }),
        // Don't wait for response
        keepalive: true
      });
    } catch (error) {
      // Silent fail in production, log in dev
      if (this.isDev) {
        console.error('Failed to send logs:', error);
      }
    }
  },

  /**
   * Sanitize data before logging
   */
  sanitizeData(data) {
    if (!data || typeof data !== 'object') return data;

    const sanitized = {};
    const sensitiveKeys = ['password', 'token', 'secret', 'key', 'apiKey', 'privateKey', 'seed'];

    for (const [key, value] of Object.entries(data)) {
      // Redact sensitive keys
      if (sensitiveKeys.some(sk => key.toLowerCase().includes(sk))) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = this.sanitizeData(value);
      } else if (typeof value === 'string' && value.length > 1000) {
        sanitized[key] = value.substring(0, 1000) + '... [TRUNCATED]';
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  },

  /**
   * Get or create session ID
   */
  getSessionId() {
    let sessionId = sessionStorage.getItem('logger_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('logger_session_id', sessionId);
    }
    return sessionId;
  },

  /**
   * Get application version
   */
  getVersion() {
    return document.querySelector('meta[name="version"]')?.content || '1.0.0';
  },

  /**
   * Catch and log global errors
   */
  setupGlobalErrorHandler() {
    window.addEventListener('error', (event) => {
      this.error('Global error:', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error?.stack
      });
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.error('Unhandled promise rejection:', {
        reason: event.reason,
        promise: event.promise
      });
    });
  },

  /**
   * Flush logs before page unload
   */
  setupUnloadHandler() {
    window.addEventListener('beforeunload', () => {
      this.flushQueue();
    });
  }
};

// Initialize error handlers
Logger.setupGlobalErrorHandler();
Logger.setupUnloadHandler();

// Export for ES6 modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Logger;
}

// Make available globally
if (typeof window !== 'undefined') {
  window.Logger = Logger;
}
