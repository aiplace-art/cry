import * as Sentry from '@sentry/node';
import { ProfilingIntegration } from '@sentry/profiling-node';
import { Express, Request, Response, NextFunction } from 'express';
import { config, isProduction } from '@core/config.js';
import { Logger } from '@core/logger.js';

const logger = new Logger('Sentry');

export class SentryService {
  private static instance: SentryService;
  private initialized = false;

  private constructor() {
    this.init();
  }

  static getInstance(): SentryService {
    if (!SentryService.instance) {
      SentryService.instance = new SentryService();
    }
    return SentryService.instance;
  }

  /**
   * Initialize Sentry
   */
  private init(): void {
    if (!config.sentryDsn) {
      logger.warn('Sentry DSN not configured, error tracking disabled');
      return;
    }

    try {
      Sentry.init({
        dsn: config.sentryDsn,
        environment: config.nodeEnv,
        enabled: isProduction,

        // Performance Monitoring
        tracesSampleRate: isProduction ? 0.1 : 1.0,
        profilesSampleRate: isProduction ? 0.1 : 1.0,

        integrations: [
          new ProfilingIntegration(),
        ],

        // Release tracking
        release: process.env.npm_package_version,

        // Before send hook to filter sensitive data
        beforeSend(event, hint) {
          // Remove sensitive headers
          if (event.request?.headers) {
            delete event.request.headers['authorization'];
            delete event.request.headers['cookie'];
            delete event.request.headers['x-api-key'];
          }

          // Remove sensitive query params
          if (event.request?.query_string) {
            const cleaned = event.request.query_string
              .replace(/token=[^&]*/gi, 'token=REDACTED')
              .replace(/key=[^&]*/gi, 'key=REDACTED')
              .replace(/secret=[^&]*/gi, 'secret=REDACTED');
            event.request.query_string = cleaned;
          }

          return event;
        },

        // Ignore specific errors
        ignoreErrors: [
          'NetworkError',
          'AbortError',
          'timeout',
          'ECONNRESET',
          'ETIMEDOUT',
        ],
      });

      this.initialized = true;
      logger.info('Sentry initialized', { environment: config.nodeEnv });
    } catch (error) {
      logger.error('Failed to initialize Sentry', error);
    }
  }

  /**
   * Express middleware for request tracking
   */
  requestHandler() {
    if (!this.initialized) {
      return (req: Request, res: Response, next: NextFunction) => next();
    }
    return Sentry.Handlers.requestHandler();
  }

  /**
   * Express middleware for error tracking
   */
  errorHandler() {
    if (!this.initialized) {
      return (err: Error, req: Request, res: Response, next: NextFunction) => next(err);
    }
    return Sentry.Handlers.errorHandler();
  }

  /**
   * Capture exception manually
   */
  captureException(error: Error, context?: Record<string, any>): void {
    if (!this.initialized) return;

    Sentry.captureException(error, {
      extra: context,
    });
  }

  /**
   * Capture message manually
   */
  captureMessage(message: string, level: Sentry.SeverityLevel = 'info', context?: Record<string, any>): void {
    if (!this.initialized) return;

    Sentry.captureMessage(message, {
      level,
      extra: context,
    });
  }

  /**
   * Set user context
   */
  setUser(user: { id: string; email?: string; username?: string }): void {
    if (!this.initialized) return;

    Sentry.setUser({
      id: user.id,
      email: user.email,
      username: user.username,
    });
  }

  /**
   * Clear user context
   */
  clearUser(): void {
    if (!this.initialized) return;
    Sentry.setUser(null);
  }

  /**
   * Add breadcrumb
   */
  addBreadcrumb(message: string, category: string, data?: Record<string, any>): void {
    if (!this.initialized) return;

    Sentry.addBreadcrumb({
      message,
      category,
      data,
      level: 'info',
      timestamp: Date.now() / 1000,
    });
  }

  /**
   * Start transaction for performance monitoring
   */
  startTransaction(name: string, op: string): Sentry.Transaction | null {
    if (!this.initialized) return null;

    return Sentry.startTransaction({
      name,
      op,
    });
  }

  /**
   * Wrap async function with error tracking
   */
  wrapAsync<T extends (...args: any[]) => Promise<any>>(fn: T): T {
    if (!this.initialized) return fn;

    return (async (...args: Parameters<T>) => {
      try {
        return await fn(...args);
      } catch (error) {
        this.captureException(error as Error);
        throw error;
      }
    }) as T;
  }

  /**
   * Flush pending events (for graceful shutdown)
   */
  async flush(timeout = 2000): Promise<boolean> {
    if (!this.initialized) return true;

    try {
      await Sentry.flush(timeout);
      return true;
    } catch (error) {
      logger.error('Failed to flush Sentry events', error);
      return false;
    }
  }

  /**
   * Close Sentry (for graceful shutdown)
   */
  async close(timeout = 2000): Promise<void> {
    if (!this.initialized) return;

    try {
      await Sentry.close(timeout);
      logger.info('Sentry closed');
    } catch (error) {
      logger.error('Failed to close Sentry', error);
    }
  }
}

export const sentry = SentryService.getInstance();
