import type { NextApiRequest, NextApiResponse } from 'next';
import { ethers } from 'ethers';
import { Pool } from 'pg';
import { PrivateSaleService } from '../../../backend/services/privateSaleService';

interface RemainingLimitResponse {
  success: boolean;
  data?: {
    walletAddress: string;
    totalPurchased: number;
    walletLimit: number;
    remaining: number;
    purchaseCount: number;
    canPurchase: boolean;
  };
  error?: string;
}

// Initialize database connection
const dbPool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'crypto_presale',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

const privateSaleService = new PrivateSaleService(dbPool);

/**
 * API endpoint to check remaining purchase limit for a wallet
 * GET /api/private-sale/remaining-limit?wallet=0x...
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<RemainingLimitResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
    });
  }

  try {
    const { wallet } = req.query;

    // Validate wallet address parameter
    if (!wallet || typeof wallet !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Wallet address is required',
      });
    }

    // Validate wallet address format
    if (!ethers.isAddress(wallet)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid wallet address format',
      });
    }

    // Get remaining limit from service
    const limitInfo = await privateSaleService.getRemainingLimit(wallet);

    return res.status(200).json({
      success: true,
      data: {
        walletAddress: wallet.toLowerCase(),
        totalPurchased: limitInfo.totalPurchased,
        walletLimit: limitInfo.walletLimit,
        remaining: limitInfo.remaining,
        purchaseCount: limitInfo.purchaseCount,
        canPurchase: limitInfo.remaining > 0,
      },
    });
  } catch (error: any) {
    console.error('Error fetching remaining limit:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch remaining limit',
    });
  }
}
