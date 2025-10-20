import type { NextApiRequest, NextApiResponse } from 'next';
import { ethers } from 'ethers';
import { Pool } from 'pg';
import { PrivateSaleService } from '../../../backend/services/privateSaleService';
import { PurchaseRequest as ServicePurchaseRequest, PurchaseStatus } from '../../../backend/types/privateSale.types';

interface PurchaseRequest {
  amount: number;
  paymentMethod: string;
  walletAddress: string;
  email: string;
  referralCode?: string;
  calculation: {
    usdAmount: number;
    baseTokens: number;
    bonusTokens: number;
    totalTokens: number;
    bonusPercentage: number;
  };
}

interface PurchaseResponse {
  success: boolean;
  purchaseId?: string;
  paymentUrl?: string;
  transactionHash?: string;
  error?: string;
  limitInfo?: {
    totalPurchased: number;
    walletLimit: number;
    remaining: number;
  };
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
 * API endpoint to process private sale purchases with $500 per wallet limit
 * POST /api/private-sale/purchase
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PurchaseResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
    });
  }

  try {
    const { amount, paymentMethod, walletAddress, email, referralCode, calculation } = req.body as PurchaseRequest;

    // Validate input
    if (!amount || !paymentMethod || !walletAddress || !email || !calculation) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
      });
    }

    // Validate wallet address
    if (!ethers.isAddress(walletAddress)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid wallet address',
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email address',
      });
    }

    // Validate payment method
    const validPaymentMethods = ['ETH', 'USDT', 'USDC', 'BTC', 'CARD'];
    if (!validPaymentMethods.includes(paymentMethod.toUpperCase())) {
      return res.status(400).json({
        success: false,
        error: 'Invalid payment method',
      });
    }

    // Check remaining limit BEFORE attempting purchase
    const limitInfo = await privateSaleService.getRemainingLimit(walletAddress);

    if (limitInfo.remaining <= 0) {
      return res.status(403).json({
        success: false,
        error: `You have reached your purchase limit of $${limitInfo.walletLimit}`,
        limitInfo: {
          totalPurchased: limitInfo.totalPurchased,
          walletLimit: limitInfo.walletLimit,
          remaining: limitInfo.remaining,
        },
      });
    }

    if (calculation.usdAmount > limitInfo.remaining) {
      return res.status(403).json({
        success: false,
        error: `Purchase amount exceeds your remaining limit. You can purchase up to $${limitInfo.remaining.toFixed(2)} more.`,
        limitInfo: {
          totalPurchased: limitInfo.totalPurchased,
          walletLimit: limitInfo.walletLimit,
          remaining: limitInfo.remaining,
        },
      });
    }

    // Create purchase request for service
    const serviceRequest: ServicePurchaseRequest = {
      walletAddress: walletAddress.toLowerCase(),
      amountUSD: calculation.usdAmount,
      paymentMethod: paymentMethod.toUpperCase(),
      email,
      referralCode,
    };

    // Process purchase through service (includes limit validation)
    const result = await privateSaleService.createPurchase(serviceRequest);

    return res.status(200).json({
      success: true,
      purchaseId: result.purchase.id?.toString(),
      paymentUrl: result.paymentUrl,
      transactionHash: result.purchase.txHash || undefined,
    });
  } catch (error: any) {
    console.error('Purchase error:', error);

    // Handle specific error types
    if (error.message.includes('limit') || error.message.includes('Exceeds')) {
      // Get current limit info for error response
      try {
        const limitInfo = await privateSaleService.getRemainingLimit(req.body.walletAddress);
        return res.status(403).json({
          success: false,
          error: error.message,
          limitInfo: {
            totalPurchased: limitInfo.totalPurchased,
            walletLimit: limitInfo.walletLimit,
            remaining: limitInfo.remaining,
          },
        });
      } catch (limitError) {
        // If we can't get limit info, just return the error
        return res.status(403).json({
          success: false,
          error: error.message,
        });
      }
    }

    // Handle blacklist errors
    if (error.message.includes('blacklisted')) {
      return res.status(403).json({
        success: false,
        error: 'This wallet address is not eligible for purchases',
      });
    }

    // Handle sale status errors
    if (error.message.includes('not active') || error.message.includes('ended')) {
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }

    // Generic error response
    return res.status(500).json({
      success: false,
      error: error.message || 'Purchase failed. Please try again.',
    });
  }
}
