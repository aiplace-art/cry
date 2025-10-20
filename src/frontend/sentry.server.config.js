// Sentry Server Configuration for HypeAI Private Sale
// This file configures Sentry error tracking for the Next.js server/API routes

import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;
const ENVIRONMENT = process.env.NEXT_PUBLIC_ENVIRONMENT || 'development';

Sentry.init({
  // Data Source Name - Get this from sentry.io project settings
  dsn: SENTRY_DSN,

  // Environment (development, staging, production)
  environment: ENVIRONMENT,

  // Percentage of transactions to send to Sentry
  tracesSampleRate: ENVIRONMENT === 'production' ? 0.1 : 1.0,

  // Enable debug mode in development
  debug: ENVIRONMENT === 'development',

  integrations: [
    // HTTP integration for API tracking
    new Sentry.Integrations.Http({ tracing: true }),

    // OnUncaughtException for unhandled errors
    new Sentry.Integrations.OnUncaughtException({
      exitEvenIfOtherHandlersAreRegistered: false,
    }),

    // OnUnhandledRejection for unhandled promise rejections
    new Sentry.Integrations.OnUnhandledRejection({ mode: 'warn' }),
  ],

  // Ignore specific errors
  ignoreErrors: [
    // Expected errors
    'ECONNREFUSED',
    'ETIMEDOUT',
    'ENOTFOUND',

    // Rate limiting (expected)
    'Too many requests',
    'Rate limit exceeded',

    // User errors (not application errors)
    'Invalid email format',
    'Insufficient balance',
    'Purchase limit exceeded',
  ],

  // Before sending events, scrub sensitive data
  beforeSend(event, hint) {
    // Don't send events if no DSN configured
    if (!SENTRY_DSN) {
      return null;
    }

    // Scrub environment variables
    if (event.extra && event.extra.environment) {
      const safeEnv = {};
      for (const key in event.extra.environment) {
        if (key.includes('SECRET') || key.includes('KEY') || key.includes('PASSWORD')) {
          safeEnv[key] = '[REDACTED]';
        } else {
          safeEnv[key] = event.extra.environment[key];
        }
      }
      event.extra.environment = safeEnv;
    }

    // Scrub wallet addresses from error messages
    if (event.message) {
      event.message = event.message.replace(/0x[a-fA-F0-9]{40}/g, '0x[REDACTED]');
    }

    // Scrub email addresses
    if (event.message) {
      event.message = event.message.replace(/[\w.-]+@[\w.-]+\.\w+/g, '[EMAIL]');
    }

    // Add server context
    event.tags = {
      ...event.tags,
      node_version: process.version,
      platform: process.platform,
    };

    return event;
  },

  // Release tracking
  release: process.env.NEXT_PUBLIC_SENTRY_RELEASE || 'unknown',

  // Distribution
  dist: process.env.NEXT_PUBLIC_SENTRY_DIST,
});

// Custom API error tracking
export function trackAPIError(endpoint, error, context = {}) {
  Sentry.withScope((scope) => {
    scope.setContext('api', {
      endpoint,
      method: context.method || 'GET',
      statusCode: context.statusCode || 500,
      requestBody: context.requestBody ? '[REDACTED]' : undefined,
      responseTime: context.responseTime,
    });

    scope.setTag('api.endpoint', endpoint);
    scope.setTag('api.method', context.method || 'GET');

    if (context.userId) {
      scope.setUser({ id: context.userId });
    }

    Sentry.captureException(error);
  });
}

// Track database query performance
export function trackDatabaseQuery(query, duration, error = null) {
  if (error) {
    Sentry.withScope((scope) => {
      scope.setContext('database', {
        query: query.replace(/VALUES\s*\([^)]+\)/gi, 'VALUES (...)'), // Redact values
        duration,
      });
      Sentry.captureException(error);
    });
  } else if (duration > 1000) {
    // Log slow queries (>1s)
    Sentry.captureMessage(`Slow database query: ${duration}ms`, {
      level: 'warning',
      contexts: {
        database: {
          query: query.replace(/VALUES\s*\([^)]+\)/gi, 'VALUES (...)'),
          duration,
        },
      },
    });
  }
}

// Track blockchain RPC calls
export function trackRPCCall(method, params, duration, error = null) {
  if (error) {
    Sentry.withScope((scope) => {
      scope.setContext('blockchain', {
        rpc_method: method,
        params: params ? '[REDACTED]' : undefined,
        duration,
      });
      Sentry.captureException(error);
    });
  } else if (duration > 5000) {
    // Log slow RPC calls (>5s)
    Sentry.captureMessage(`Slow RPC call: ${method} (${duration}ms)`, {
      level: 'warning',
      contexts: {
        blockchain: {
          rpc_method: method,
          duration,
        },
      },
    });
  }
}

// Track business metrics
export function trackBusinessMetric(metric, value, context = {}) {
  Sentry.addBreadcrumb({
    category: 'business.metric',
    message: `${metric}: ${value}`,
    level: 'info',
    data: {
      metric,
      value,
      ...context,
    },
  });
}

// Example usage:
// trackBusinessMetric('purchase_completed', 1000, {
//   paymentMethod: 'ETH',
//   tokens: 50000
// });

// Track security events
export function trackSecurityEvent(event, severity = 'warning', context = {}) {
  Sentry.captureMessage(`Security Event: ${event}`, {
    level: severity,
    tags: {
      security: true,
      event_type: event,
    },
    contexts: {
      security: context,
    },
  });
}

// Example usage:
// trackSecurityEvent('rate_limit_exceeded', 'warning', {
//   ip: '1.2.3.4',
//   endpoint: '/api/purchase',
//   attempts: 10
// });
