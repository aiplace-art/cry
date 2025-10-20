// Sentry Client Configuration for HypeAI Private Sale
// This file configures Sentry error tracking for the browser/frontend

import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;
const ENVIRONMENT = process.env.NEXT_PUBLIC_ENVIRONMENT || 'development';

Sentry.init({
  // Data Source Name - Get this from sentry.io project settings
  dsn: SENTRY_DSN,

  // Environment (development, staging, production)
  environment: ENVIRONMENT,

  // Percentage of events to send to Sentry (0.0 to 1.0)
  // Use 1.0 in development, lower in production to reduce quota usage
  tracesSampleRate: ENVIRONMENT === 'production' ? 0.1 : 1.0,

  // Percentage of errors to send (1.0 = 100%)
  sampleRate: 1.0,

  // Enable debug mode in development
  debug: ENVIRONMENT === 'development',

  // Capture replay sessions for debugging
  // 10% of sessions, 100% of sessions with errors
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  integrations: [
    // Replay integration for session recording
    new Sentry.Replay({
      maskAllText: true, // Privacy: mask all text content
      blockAllMedia: true, // Privacy: block all media (images, videos)
    }),

    // Browser tracing for performance monitoring
    new Sentry.BrowserTracing({
      // Track navigation and page load performance
      tracePropagationTargets: [
        'localhost',
        /^https:\/\/hypeai\.io/,
        /^https:\/\/.*\.hypeai\.io/,
      ],
    }),

    // HTTP Client integration for API call tracking
    new Sentry.HttpClient(),
  ],

  // Ignore specific errors (reduce noise)
  ignoreErrors: [
    // Browser extensions
    'top.GLOBALS',
    'chrome-extension://',
    'moz-extension://',

    // MetaMask/wallet connection errors (expected)
    'MetaMask: User denied transaction signature',
    'User rejected the request',
    'User denied account authorization',

    // Network errors (expected in crypto apps)
    'Network request failed',
    'Failed to fetch',
    'NetworkError',

    // Random browser errors
    'ResizeObserver loop limit exceeded',
    'Non-Error promise rejection captured',
  ],

  // Before sending events, scrub sensitive data
  beforeSend(event, hint) {
    // Don't send events if no DSN configured
    if (!SENTRY_DSN) {
      return null;
    }

    // Scrub wallet addresses from error messages
    if (event.message) {
      event.message = event.message.replace(/0x[a-fA-F0-9]{40}/g, '0x[REDACTED]');
    }

    // Scrub email addresses
    if (event.message) {
      event.message = event.message.replace(/[\w.-]+@[\w.-]+\.\w+/g, '[EMAIL]');
    }

    // Scrub private keys (should never happen, but just in case)
    if (event.extra) {
      event.extra = JSON.parse(
        JSON.stringify(event.extra).replace(
          /"privateKey":\s*"[^"]+"/g,
          '"privateKey":"[REDACTED]"'
        )
      );
    }

    // Add additional context
    event.tags = {
      ...event.tags,
      browser: typeof window !== 'undefined' ? window.navigator.userAgent : 'unknown',
      screen_resolution:
        typeof window !== 'undefined'
          ? `${window.screen.width}x${window.screen.height}`
          : 'unknown',
    };

    return event;
  },

  // Before sending breadcrumbs (navigation trail)
  beforeBreadcrumb(breadcrumb, hint) {
    // Don't track console.log in production
    if (breadcrumb.category === 'console' && ENVIRONMENT === 'production') {
      return null;
    }

    // Scrub URLs with sensitive data
    if (breadcrumb.data && breadcrumb.data.url) {
      breadcrumb.data.url = breadcrumb.data.url.replace(/token=[^&]+/, 'token=[REDACTED]');
    }

    return breadcrumb;
  },

  // Release tracking (for deployment monitoring)
  release: process.env.NEXT_PUBLIC_SENTRY_RELEASE || 'unknown',

  // Distribution (for canary/blue-green deployments)
  dist: process.env.NEXT_PUBLIC_SENTRY_DIST,
});

// Custom error boundary for React components
export function logComponentError(error, errorInfo) {
  Sentry.withScope((scope) => {
    scope.setContext('react_error_boundary', {
      componentStack: errorInfo.componentStack,
    });
    Sentry.captureException(error);
  });
}

// Custom transaction tracking for Web3 operations
export function trackTransaction(transactionName, operation) {
  const transaction = Sentry.startTransaction({
    name: transactionName,
    op: 'web3.transaction',
  });

  return {
    finish: (status = 'ok') => {
      transaction.setStatus(status);
      transaction.finish();
    },
    setData: (key, value) => {
      transaction.setData(key, value);
    },
    setTag: (key, value) => {
      transaction.setTag(key, value);
    },
  };
}

// Track API calls with custom spans
export function trackAPICall(endpoint, method = 'GET') {
  const transaction = Sentry.getCurrentHub().getScope().getTransaction();
  if (transaction) {
    return transaction.startChild({
      op: 'http.client',
      description: `${method} ${endpoint}`,
    });
  }
  return null;
}

// Custom breadcrumb for business events
export function logBusinessEvent(category, message, data = {}) {
  Sentry.addBreadcrumb({
    category: `business.${category}`,
    message,
    level: 'info',
    data,
  });
}

// Example usage:
// logBusinessEvent('purchase', 'User completed purchase', {
//   amount: 1000,
//   paymentMethod: 'ETH',
//   tokens: 50000
// });
