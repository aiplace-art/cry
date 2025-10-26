import { Request, Response, NextFunction } from 'express';
import { z, ZodError, ZodSchema } from 'zod';
import createDOMPurify from 'isomorphic-dompurify';
import { Logger } from '@core/logger.js';

const logger = new Logger('ValidationMiddleware');
const DOMPurify = createDOMPurify();

export class ValidationMiddleware {
  /**
   * Validate request body against Zod schema
   */
  static validateBody<T extends ZodSchema>(schema: T) {
    return (req: Request, res: Response, next: NextFunction): void => {
      try {
        const validated = schema.parse(req.body);
        req.body = validated;
        next();
      } catch (error) {
        if (error instanceof ZodError) {
          res.status(400).json({
            error: 'Validation Error',
            message: 'Invalid request body',
            details: error.errors.map(err => ({
              path: err.path.join('.'),
              message: err.message,
            })),
          });
          return;
        }
        logger.error('Validation error', error);
        res.status(500).json({
          error: 'Internal Server Error',
          message: 'Validation failed',
        });
      }
    };
  }

  /**
   * Validate request query parameters
   */
  static validateQuery<T extends ZodSchema>(schema: T) {
    return (req: Request, res: Response, next: NextFunction): void => {
      try {
        const validated = schema.parse(req.query);
        req.query = validated as any;
        next();
      } catch (error) {
        if (error instanceof ZodError) {
          res.status(400).json({
            error: 'Validation Error',
            message: 'Invalid query parameters',
            details: error.errors.map(err => ({
              path: err.path.join('.'),
              message: err.message,
            })),
          });
          return;
        }
        logger.error('Query validation error', error);
        res.status(500).json({
          error: 'Internal Server Error',
          message: 'Validation failed',
        });
      }
    };
  }

  /**
   * Validate request params
   */
  static validateParams<T extends ZodSchema>(schema: T) {
    return (req: Request, res: Response, next: NextFunction): void => {
      try {
        const validated = schema.parse(req.params);
        req.params = validated as any;
        next();
      } catch (error) {
        if (error instanceof ZodError) {
          res.status(400).json({
            error: 'Validation Error',
            message: 'Invalid path parameters',
            details: error.errors.map(err => ({
              path: err.path.join('.'),
              message: err.message,
            })),
          });
          return;
        }
        logger.error('Params validation error', error);
        res.status(500).json({
          error: 'Internal Server Error',
          message: 'Validation failed',
        });
      }
    };
  }

  /**
   * Sanitize HTML content to prevent XSS
   */
  static sanitizeHtml(req: Request, res: Response, next: NextFunction): void {
    if (req.body && typeof req.body === 'object') {
      req.body = ValidationMiddleware.deepSanitize(req.body);
    }
    next();
  }

  /**
   * Deep sanitize object recursively
   */
  private static deepSanitize(obj: any): any {
    if (typeof obj === 'string') {
      return DOMPurify.sanitize(obj, {
        ALLOWED_TAGS: [], // Strip all HTML tags
        ALLOWED_ATTR: [],
      });
    }

    if (Array.isArray(obj)) {
      return obj.map(item => ValidationMiddleware.deepSanitize(item));
    }

    if (obj !== null && typeof obj === 'object') {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(obj)) {
        sanitized[key] = ValidationMiddleware.deepSanitize(value);
      }
      return sanitized;
    }

    return obj;
  }

  /**
   * Trim whitespace from strings
   */
  static trimStrings(req: Request, res: Response, next: NextFunction): void {
    if (req.body && typeof req.body === 'object') {
      req.body = ValidationMiddleware.deepTrim(req.body);
    }
    next();
  }

  /**
   * Deep trim strings in object
   */
  private static deepTrim(obj: any): any {
    if (typeof obj === 'string') {
      return obj.trim();
    }

    if (Array.isArray(obj)) {
      return obj.map(item => ValidationMiddleware.deepTrim(item));
    }

    if (obj !== null && typeof obj === 'object') {
      const trimmed: any = {};
      for (const [key, value] of Object.entries(obj)) {
        trimmed[key] = ValidationMiddleware.deepTrim(value);
      }
      return trimmed;
    }

    return obj;
  }
}

// Common validation schemas
export const commonSchemas = {
  uuid: z.string().uuid(),
  email: z.string().email(),
  url: z.string().url(),
  pagination: z.object({
    limit: z.coerce.number().int().positive().max(100).default(50),
    offset: z.coerce.number().int().nonnegative().default(0),
  }),
  messageContent: z.string().min(1).max(10000),
  sessionTitle: z.string().min(1).max(255),
};
