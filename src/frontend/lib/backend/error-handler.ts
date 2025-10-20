/**
 * Error Handler and Sanitizer for Production
 * Prevents stack trace and sensitive information leaks
 */

import { APIError } from '../../types/api';

// ============================================================================
// Error Sanitization
// ============================================================================

/**
 * Sanitize error for client response
 * Removes stack traces and sensitive information in production
 */
export function sanitizeError(error: unknown): { message: string; code?: string } {
  // Development mode: Show detailed errors for debugging
  if (process.env.NODE_ENV === 'development') {
    if (error instanceof Error) {
      return {
        message: error.message,
        code: (error as any).code
      };
    }
    return { message: String(error) };
  }

  // Production mode: Sanitize all errors
  if (error instanceof APIError) {
    return {
      message: error.message,
      code: error.code
    };
  }

  if (error instanceof Error) {
    // Generic message for unknown errors
    return {
      message: 'An unexpected error occurred',
      code: 'INTERNAL_ERROR'
    };
  }

  return {
    message: 'An unexpected error occurred',
    code: 'UNKNOWN_ERROR'
  };
}

/**
 * Log error server-side with full details
 * Never expose these logs to client
 */
export function logError(error: unknown, context?: Record<string, any>): void {
  const timestamp = new Date().toISOString();
  const errorDetails = {
    timestamp,
    error: error instanceof Error ? {
      name: error.name,
      message: error.message,
      stack: error.stack,
    } : error,
    context
  };

  // Only use console.error for critical errors
  console.error('[ERROR]', JSON.stringify(errorDetails, null, 2));

  // In production, you should send to error tracking service:
  // - Sentry
  // - LogRocket
  // - DataDog
  // Example: Sentry.captureException(error, { extra: context });
}

/**
 * Safe error response wrapper for API routes
 */
export function createErrorResponse(
  statusCode: number,
  error: unknown,
  context?: Record<string, any>
): { statusCode: number; body: { success: false; error: string; code?: string } } {
  // Log the full error server-side
  logError(error, context);

  // Return sanitized error to client
  const sanitized = sanitizeError(error);

  return {
    statusCode,
    body: {
      success: false,
      error: sanitized.message,
      code: sanitized.code
    }
  };
}

// ============================================================================
// Error Type Guards
// ============================================================================

export function isAPIError(error: unknown): error is APIError {
  return error instanceof APIError;
}

export function isValidationError(error: unknown): boolean {
  if (error instanceof Error) {
    return error.name === 'ValidationError' ||
           error.message.includes('validation') ||
           error.message.includes('invalid');
  }
  return false;
}

export function isAuthenticationError(error: unknown): boolean {
  if (isAPIError(error)) {
    return error.statusCode === 401 || error.code?.includes('AUTH');
  }
  return false;
}

export function isRateLimitError(error: unknown): boolean {
  if (isAPIError(error)) {
    return error.statusCode === 429 || error.code === 'RATE_LIMIT_EXCEEDED';
  }
  return false;
}

// ============================================================================
// Error Response Helpers
// ============================================================================

export const ErrorResponses = {
  unauthorized: (message = 'Unauthorized') => ({
    statusCode: 401,
    body: { success: false, error: message, code: 'UNAUTHORIZED' }
  }),

  forbidden: (message = 'Forbidden') => ({
    statusCode: 403,
    body: { success: false, error: message, code: 'FORBIDDEN' }
  }),

  notFound: (message = 'Not found') => ({
    statusCode: 404,
    body: { success: false, error: message, code: 'NOT_FOUND' }
  }),

  badRequest: (message = 'Bad request') => ({
    statusCode: 400,
    body: { success: false, error: message, code: 'BAD_REQUEST' }
  }),

  rateLimited: (message = 'Too many requests') => ({
    statusCode: 429,
    body: { success: false, error: message, code: 'RATE_LIMIT_EXCEEDED' }
  }),

  internalError: (message = 'Internal server error') => ({
    statusCode: 500,
    body: { success: false, error: message, code: 'INTERNAL_ERROR' }
  }),

  methodNotAllowed: (message = 'Method not allowed') => ({
    statusCode: 405,
    body: { success: false, error: message, code: 'METHOD_NOT_ALLOWED' }
  })
};
