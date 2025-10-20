/**
 * Web3 Authentication Endpoint
 * POST /api/auth/web3
 *
 * Authenticates user via Web3 wallet signature
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import {
  Web3AuthRequest,
  Web3AuthResponse,
  Web3AuthRequestSchema,
  APIError
} from '../../../types/api';
import { verifySignature, generateAuthMessage } from '../../../lib/backend/blockchain';
import {
  generateToken,
  isSignatureReplay,
  isTimestampValid,
  createSession,
  sanitizeAddress
} from '../../../lib/backend/auth';
import { withRateLimit } from '../../../lib/backend/rate-limiter';
import { markSignatureUsed, isSignatureUsed } from '../../../lib/backend/database';

// ============================================================================
// API Handler
// ============================================================================

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Web3AuthResponse>
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
    });
  }

  try {
    // Validate request body
    const validationResult = Web3AuthRequestSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request data',
      });
    }

    const { address, signature, message, timestamp } = validationResult.data;

    // Sanitize address
    const normalizedAddress = sanitizeAddress(address);

    // Check timestamp if provided
    if (timestamp && !isTimestampValid(timestamp)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired timestamp',
      });
    }

    // Check for signature replay (in-memory cache)
    if (isSignatureReplay(signature)) {
      return res.status(400).json({
        success: false,
        error: 'Signature already used',
      });
    }

    // Check signature in database (persistent storage)
    if (isSignatureUsed(signature)) {
      return res.status(400).json({
        success: false,
        error: 'Signature already used',
      });
    }

    // Verify the signature
    const isValid = await verifySignature(normalizedAddress, message, signature);

    if (!isValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid signature',
      });
    }

    // Mark signature as used
    markSignatureUsed({
      signature,
      address: normalizedAddress,
      message,
      timestamp: timestamp || Date.now(),
    });

    // Generate JWT token
    const token = generateToken(normalizedAddress);

    // Create session
    createSession(normalizedAddress, token);

    // Return success response
    return res.status(200).json({
      success: true,
      token,
      address: normalizedAddress,
      expiresIn: 86400, // 24 hours in seconds
    });

  } catch (error) {
    console.error('Authentication error:', error);

    if (error instanceof APIError) {
      return res.status(error.statusCode).json({
        success: false,
        error: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Authentication failed',
    });
  }
}

// ============================================================================
// Export with Rate Limiting
// ============================================================================

export default withRateLimit('auth', handler);
