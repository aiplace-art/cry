/**
 * Private Sale Purchase Endpoint
 * POST /api/private-sale/purchase
 *
 * Process token purchase (simulation for testnet)
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import {
  PurchaseRequest,
  PurchaseResponse,
  PurchaseRequestSchema,
  APIError,
  DBPurchase
} from '../../../types/api';
import {
  getAuthenticatedAddress,
  sanitizeAddress
} from '../../../lib/backend/auth';
import {
  getBNBPriceUSD,
  getTokenPrice,
  calculateTokensWithBonus,
  normalizeAddress
} from '../../../lib/backend/blockchain';
import { insertPurchase } from '../../../lib/backend/database';
import { withRateLimit } from '../../../lib/backend/rate-limiter';
import { ethers } from 'ethers';

// ============================================================================
// API Handler
// ============================================================================

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PurchaseResponse>
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
    });
  }

  try {
    // Authenticate user
    const authHeader = req.headers.authorization as string | undefined;
    const userAddress = getAuthenticatedAddress(authHeader);

    // Validate request body
    const validationResult = PurchaseRequestSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request data',
      });
    }

    const { amount, paymentMethod, referralCode, email } = validationResult.data;

    // Validate minimum investment (SECURITY: Enforce $400 minimum as per specs)
    const MINIMUM_INVESTMENT_USD = 400;
    if (amount < MINIMUM_INVESTMENT_USD) {
      return res.status(400).json({
        success: false,
        error: `Minimum investment is $${MINIMUM_INVESTMENT_USD}`,
      });
    }

    // Additional validation: Prevent zero or negative amounts
    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Investment amount must be greater than zero',
      });
    }

    // Validate maximum investment (prevent overflow attacks)
    const MAXIMUM_INVESTMENT_USD = 10_000_000;
    if (amount > MAXIMUM_INVESTMENT_USD) {
      return res.status(400).json({
        success: false,
        error: `Maximum investment is $${MAXIMUM_INVESTMENT_USD.toLocaleString()}`,
      });
    }

    // Get current prices
    const [tokenPrice, bnbPrice] = await Promise.all([
      getTokenPrice(),
      getBNBPriceUSD(),
    ]);

    // Convert amount to USD
    let amountUSD = amount;
    if (paymentMethod === 'BNB') {
      amountUSD = amount * bnbPrice;
    }

    // Calculate tokens with bonus
    const calculation = calculateTokensWithBonus(amountUSD, tokenPrice);

    // Generate mock transaction hash (for testnet simulation)
    // In production, this would come from actual blockchain transaction
    const mockTxHash = ethers.id(
      `${userAddress}-${Date.now()}-${amount}-${paymentMethod}`
    );

    // Create purchase record
    const purchase: Omit<DBPurchase, 'created_at'> = {
      id: ethers.id(`${userAddress}-${Date.now()}`),
      address: normalizeAddress(userAddress),
      timestamp: Date.now(),
      amount: amountUSD,
      payment_method: paymentMethod,
      token_amount: calculation.baseTokens,
      bonus_tokens: calculation.bonusTokens,
      total_tokens: calculation.totalTokens,
      bonus_percentage: calculation.bonusPercentage,
      tx_hash: mockTxHash,
      referral_code: referralCode,
      email: email,
      claimed_tokens: 0,
    };

    // Save to database
    insertPurchase(purchase);

    // Estimate gas (mock for testnet)
    const estimatedGas = paymentMethod === 'BNB' ? '0.001' : '0.002';

    // Return success response
    return res.status(200).json({
      success: true,
      txHash: mockTxHash,
      tokensReceived: Math.floor(calculation.baseTokens),
      bonusTokens: Math.floor(calculation.bonusTokens),
      totalTokens: Math.floor(calculation.totalTokens),
      bonusPercentage: calculation.bonusPercentage,
      estimatedGas,
    });

  } catch (error) {
    // SECURITY: Import error handler for proper sanitization
    const { createErrorResponse, logError } = await import('../../../lib/backend/error-handler');

    logError(error, {
      endpoint: '/api/private-sale/purchase',
      userAddress: req.headers.authorization ? 'authenticated' : 'anonymous'
    });

    if (error instanceof APIError) {
      const response = createErrorResponse(error.statusCode, error);
      return res.status(response.statusCode).json(response.body);
    }

    const response = createErrorResponse(500, error);
    return res.status(response.statusCode).json(response.body);
  }
}

// ============================================================================
// Export with Rate Limiting
// ============================================================================

export default withRateLimit('purchase', handler);
