/**
 * Authentication Utilities for HypeAI Backend
 * JWT token management and Web3 signature verification
 */

import jwt from 'jsonwebtoken';
import { APIError, JWTPayload } from '../../types/api';

// ============================================================================
// Configuration
// ============================================================================

// SECURITY: JWT_SECRET is REQUIRED - fail if not set
if (!process.env.JWT_SECRET) {
  throw new Error('CRITICAL SECURITY ERROR: JWT_SECRET environment variable is required but not set. Application cannot start without secure JWT secret.');
}

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRY = '24h'; // Token expires in 24 hours
const SIGNATURE_REPLAY_WINDOW = 5 * 60 * 1000; // 5 minutes

// ============================================================================
// JWT Token Functions
// ============================================================================

/**
 * Generate JWT token for authenticated user
 */
export function generateToken(address: string): string {
  const payload: JWTPayload = {
    address: address.toLowerCase(),
    timestamp: Date.now(),
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRY,
  });
}

/**
 * Verify and decode JWT token
 */
export function verifyToken(token: string): JWTPayload {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;

    // Validate payload structure
    if (!decoded.address || !decoded.timestamp) {
      throw new Error('Invalid token payload');
    }

    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new APIError(401, 'Token expired', 'TOKEN_EXPIRED');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new APIError(401, 'Invalid token', 'INVALID_TOKEN');
    }
    throw new APIError(401, 'Authentication failed', 'AUTH_FAILED');
  }
}

/**
 * Extract token from Authorization header
 */
export function extractToken(authHeader?: string | null): string | null {
  if (!authHeader) return null;

  // Support both "Bearer <token>" and "<token>"
  const parts = authHeader.split(' ');

  if (parts.length === 2 && parts[0] === 'Bearer') {
    return parts[1];
  }

  if (parts.length === 1) {
    return parts[0];
  }

  return null;
}

/**
 * Get authenticated address from request headers
 */
export function getAuthenticatedAddress(authHeader?: string | null): string {
  const token = extractToken(authHeader);

  if (!token) {
    throw new APIError(401, 'No authentication token provided', 'NO_TOKEN');
  }

  const payload = verifyToken(token);
  return payload.address;
}

// ============================================================================
// Signature Replay Protection
// ============================================================================

interface SignatureCache {
  [key: string]: number; // signature hash -> timestamp
}

const signatureCache: SignatureCache = {};

/**
 * Clean up old signatures from cache
 */
function cleanSignatureCache(): void {
  const now = Date.now();
  const cutoff = now - SIGNATURE_REPLAY_WINDOW;

  for (const [sig, timestamp] of Object.entries(signatureCache)) {
    if (timestamp < cutoff) {
      delete signatureCache[sig];
    }
  }
}

/**
 * Check if signature has been used recently (replay attack protection)
 */
export function isSignatureReplay(signature: string): boolean {
  cleanSignatureCache();

  const hash = signature.toLowerCase();

  if (signatureCache[hash]) {
    return true; // Signature was used recently
  }

  // Mark signature as used
  signatureCache[hash] = Date.now();
  return false;
}

/**
 * Validate authentication message timestamp
 */
export function isTimestampValid(timestamp: number): boolean {
  const now = Date.now();
  const diff = Math.abs(now - timestamp);

  // Allow 5 minutes before or after current time
  return diff <= SIGNATURE_REPLAY_WINDOW;
}

// ============================================================================
// Session Management
// ============================================================================

interface Session {
  address: string;
  token: string;
  createdAt: number;
  lastUsed: number;
}

const sessions: Map<string, Session> = new Map();

/**
 * Create a new session
 */
export function createSession(address: string, token: string): void {
  const normalizedAddress = address.toLowerCase();
  const now = Date.now();

  sessions.set(normalizedAddress, {
    address: normalizedAddress,
    token,
    createdAt: now,
    lastUsed: now,
  });

  // Clean up old sessions
  cleanSessions();
}

/**
 * Update session last used timestamp
 */
export function updateSession(address: string): void {
  const normalizedAddress = address.toLowerCase();
  const session = sessions.get(normalizedAddress);

  if (session) {
    session.lastUsed = Date.now();
  }
}

/**
 * Get session by address
 */
export function getSession(address: string): Session | undefined {
  const normalizedAddress = address.toLowerCase();
  return sessions.get(normalizedAddress);
}

/**
 * Revoke session
 */
export function revokeSession(address: string): void {
  const normalizedAddress = address.toLowerCase();
  sessions.delete(normalizedAddress);
}

/**
 * Clean up expired sessions (24 hours)
 */
function cleanSessions(): void {
  const now = Date.now();
  const expiry = 24 * 60 * 60 * 1000; // 24 hours

  for (const [address, session] of sessions.entries()) {
    if (now - session.lastUsed > expiry) {
      sessions.delete(address);
    }
  }
}

// ============================================================================
// Security Utilities
// ============================================================================

/**
 * Sanitize address input
 */
export function sanitizeAddress(address: string): string {
  // Remove whitespace and convert to lowercase
  return address.trim().toLowerCase();
}

/**
 * Generate nonce for signature using cryptographically secure random
 */
export function generateNonce(): string {
  // Use crypto.randomBytes for secure random generation
  if (typeof window === 'undefined') {
    // Node.js environment
    const crypto = require('crypto');
    return crypto.randomBytes(16).toString('hex');
  } else {
    // Browser environment
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }
}

/**
 * Hash sensitive data for logging
 */
export function hashForLogging(data: string): string {
  if (data.length <= 10) return '***';
  return data.substring(0, 6) + '...' + data.substring(data.length - 4);
}

// ============================================================================
// Rate Limiting Helpers
// ============================================================================

/**
 * Get client identifier from request
 * In production, you might want to use IP address or other identifiers
 */
export function getClientId(address?: string, ip?: string): string {
  if (address) return `addr:${address.toLowerCase()}`;
  if (ip) return `ip:${ip}`;
  return 'unknown';
}

/**
 * Create rate limiter key
 */
export function getRateLimitKey(endpoint: string, identifier: string): string {
  return `${endpoint}:${identifier}`;
}
