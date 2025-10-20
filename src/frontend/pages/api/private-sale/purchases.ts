/**
 * Purchase History Endpoint
 * GET /api/private-sale/purchases
 *
 * Get user's purchase history with vesting information
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import {
  PurchaseHistoryResponse,
  APIError
} from '../../../types/api';
import { getAuthenticatedAddress } from '../../../lib/backend/auth';
import { getPurchasesByAddress } from '../../../lib/backend/database';
import { withRateLimit } from '../../../lib/backend/rate-limiter';

// ============================================================================
// API Handler
// ============================================================================

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PurchaseHistoryResponse>
) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
    });
  }

  try {
    // Authenticate user
    const authHeader = req.headers.authorization as string | undefined;
    const userAddress = getAuthenticatedAddress(authHeader);

    // Get purchases from database
    const purchases = getPurchasesByAddress(userAddress);

    // Calculate totals
    const totalInvested = purchases.reduce((sum, p) => sum + p.amount, 0);
    const totalTokens = purchases.reduce((sum, p) => sum + p.totalTokens, 0);

    // Return success response
    return res.status(200).json({
      success: true,
      purchases,
      totalInvested: Math.floor(totalInvested * 100) / 100, // Round to 2 decimals
      totalTokens: Math.floor(totalTokens),
    });

  } catch (error) {
    console.error('Purchase history error:', error);

    if (error instanceof APIError) {
      return res.status(error.statusCode).json({
        success: false,
        error: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Failed to fetch purchase history',
    });
  }
}

// ============================================================================
// Export with Rate Limiting
// ============================================================================

export default withRateLimit('query', handler);
