import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '@core/config.js';
import { Logger } from '@core/logger.js';
import { redis } from '@database/client.js';

const logger = new Logger('AuthMiddleware');

export interface AuthPayload {
  userId: string;
  email: string;
  role: string;
  sessionId?: string;
}

export interface AuthRequest extends Request {
  user?: AuthPayload;
}

export class AuthMiddleware {
  /**
   * Verify JWT token from Authorization header
   */
  static async authenticate(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'Missing or invalid authorization header',
        });
        return;
      }

      const token = authHeader.substring(7);

      // Check if token is blacklisted
      const isBlacklisted = await redis.exists(`blacklist:${token}`);
      if (isBlacklisted) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'Token has been revoked',
        });
        return;
      }

      try {
        const decoded = jwt.verify(token, config.jwtSecret) as AuthPayload;
        req.user = decoded;

        logger.debug('User authenticated', { userId: decoded.userId });
        next();
      } catch (jwtError) {
        if (jwtError instanceof jwt.TokenExpiredError) {
          res.status(401).json({
            error: 'Unauthorized',
            message: 'Token has expired',
          });
          return;
        }

        if (jwtError instanceof jwt.JsonWebTokenError) {
          res.status(401).json({
            error: 'Unauthorized',
            message: 'Invalid token',
          });
          return;
        }

        throw jwtError;
      }
    } catch (error) {
      logger.error('Authentication error', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Authentication failed',
      });
    }
  }

  /**
   * Check if user has required role
   */
  static requireRole(...roles: string[]) {
    return (req: AuthRequest, res: Response, next: NextFunction): void => {
      if (!req.user) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'Authentication required',
        });
        return;
      }

      if (!roles.includes(req.user.role)) {
        res.status(403).json({
          error: 'Forbidden',
          message: 'Insufficient permissions',
        });
        return;
      }

      next();
    };
  }

  /**
   * Generate JWT token
   */
  static generateToken(payload: AuthPayload, expiresIn = '24h'): string {
    return jwt.sign(payload, config.jwtSecret, { expiresIn });
  }

  /**
   * Revoke token (add to blacklist)
   */
  static async revokeToken(token: string, expiryMs = 86400000): Promise<void> {
    await redis.set(`blacklist:${token}`, '1', expiryMs);
    logger.info('Token revoked', { token: token.substring(0, 20) + '...' });
  }

  /**
   * Verify token without throwing
   */
  static verifyToken(token: string): AuthPayload | null {
    try {
      return jwt.verify(token, config.jwtSecret) as AuthPayload;
    } catch {
      return null;
    }
  }

  /**
   * Extract token from request
   */
  static extractToken(req: Request): string | null {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }
    return null;
  }
}
