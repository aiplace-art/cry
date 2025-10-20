/**
 * Presale Statistics Endpoint
 * GET /api/private-sale/stats
 *
 * Get current presale statistics from blockchain and database
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import {
  PresaleStatsResponse,
  PresaleStats,
  APIError
} from '../../../types/api';
import {
  getTotalRaised,
  getTokenPrice,
  getBNBPriceUSD
} from '../../../lib/backend/blockchain';
import {
  getUniqueBuyersCount,
  getDatabaseStats
} from '../../../lib/backend/database';
import { withRateLimit } from '../../../lib/backend/rate-limiter';

// ============================================================================
// Configuration
// ============================================================================

const PRESALE_GOAL = 5_000_000; // $5M goal
const VESTING_MONTHS = 21; // 20% immediate + 3mo cliff + 18mo linear = 21 months total
const PRESALE_START_TIME = 1729324800000; // October 19, 2025

// Bonus tiers
const BONUS_TIERS = [
  { min: 50000, bonus: 30 },
  { min: 25000, bonus: 27 },
  { min: 10000, bonus: 25 },
  { min: 5000, bonus: 23 },
  { min: 1000, bonus: 20 },
];

// ============================================================================
// API Handler
// ============================================================================

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PresaleStatsResponse>
) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
    });
  }

  try {
    // Fetch data in parallel for better performance
    const [raisedData, tokenPrice, bnbPrice, dbStats] = await Promise.all([
      getTotalRaised(),
      getTokenPrice(),
      getBNBPriceUSD(),
      Promise.resolve(getDatabaseStats()),
    ]);

    // Use database stats for testnet (more accurate than blockchain events)
    const participantsCount = dbStats.uniqueBuyers;
    const totalRaised = dbStats.totalAmount;

    // Calculate progress percentage
    const progress = Math.min((totalRaised / PRESALE_GOAL) * 100, 100);

    // Build stats object
    const stats: PresaleStats = {
      totalRaised: Math.floor(totalRaised),
      totalUSDTRaised: Math.floor(raisedData.usdtRaised),
      totalBNBRaised: Math.floor(raisedData.bnbRaised * 100) / 100, // 2 decimals
      bnbPriceUSD: Math.floor(bnbPrice * 100) / 100, // 2 decimals
      goal: PRESALE_GOAL,
      progress: Math.floor(progress * 100) / 100, // 2 decimals
      participantsCount,
      tokenPrice,
      bonusTiers: BONUS_TIERS,
      vestingMonths: VESTING_MONTHS,
      startTime: PRESALE_START_TIME,
      isActive: true,
    };

    // Cache for 30 seconds
    res.setHeader('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=60');

    // Return success response
    return res.status(200).json({
      success: true,
      stats,
    });

  } catch (error) {
    console.error('Stats error:', error);

    if (error instanceof APIError) {
      return res.status(error.statusCode).json({
        success: false,
        error: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Failed to fetch presale statistics',
    });
  }
}

// ============================================================================
// Export with Rate Limiting
// ============================================================================

export default withRateLimit('stats', handler);
