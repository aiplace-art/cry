import express, { Request, Response } from 'express';
import { Pool } from 'pg';
import { PrivateSaleService } from '../services/privateSaleService';
import { paymentGateway } from '../integrations/paymentGateway';
import { sendEmail, EmailType } from '../utils/emailService';
import {
  purchaseRateLimiter,
  apiRateLimiter,
  verifyWallet,
  antiFraud,
  validateTransaction,
  sanitizeInput
} from '../middleware/security.middleware';
import {
  PurchaseRequest,
  PurchaseStatus,
  ClaimRequest,
  PaymentGateway
} from '../types/privateSale.types';

const router = express.Router();

// Initialize database pool
const dbPool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'private_sale',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000
});

const privateSaleService = new PrivateSaleService(dbPool);

// Apply middleware to all routes
router.use(sanitizeInput);
router.use(apiRateLimiter);

/**
 * POST /api/private-sale/purchase
 * Create a new token purchase
 */
router.post(
  '/purchase',
  purchaseRateLimiter,
  verifyWallet,
  antiFraud,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const purchaseRequest: PurchaseRequest = {
        walletAddress: req.body.walletAddress,
        paymentMethod: req.body.paymentMethod,
        amountUSD: parseFloat(req.body.amountUSD),
        referralCode: req.body.referralCode,
        email: req.body.email
      };

      // Validate input
      if (!purchaseRequest.walletAddress || !purchaseRequest.paymentMethod || !purchaseRequest.amountUSD) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      if (!purchaseRequest.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(purchaseRequest.email)) {
        res.status(400).json({ error: 'Valid email is required' });
        return;
      }

      const result = await privateSaleService.createPurchase(purchaseRequest);

      res.status(201).json({
        success: true,
        purchase: {
          id: result.purchase.id,
          walletAddress: result.purchase.walletAddress,
          amountUSD: result.purchase.amountUsd,
          tokensPurchased: result.purchase.tokensPurchased.toString(),
          bonusTokens: result.purchase.bonusTokens.toString(),
          totalTokens: result.purchase.totalTokens.toString(),
          status: result.purchase.status,
          createdAt: result.purchase.createdAt
        },
        paymentUrl: result.paymentUrl
      });
    } catch (error: any) {
      console.error('Purchase creation error:', error);
      res.status(400).json({
        success: false,
        error: error.message || 'Failed to create purchase'
      });
    }
  }
);

/**
 * GET /api/private-sale/status
 * Get current sale status
 */
router.get('/status', async (req: Request, res: Response): Promise<void> => {
  try {
    const status = await privateSaleService.getSaleStatus();

    res.json({
      success: true,
      status: {
        totalTokens: status.totalTokens.toString(),
        tokensSold: status.tokensSold.toString(),
        tokensRemaining: status.tokensRemaining.toString(),
        totalRaised: status.totalRaised,
        totalPurchases: status.totalPurchases,
        uniqueBuyers: status.uniqueBuyers,
        isActive: status.isActive,
        saleEndDate: status.saleEndDate
      }
    });
  } catch (error: any) {
    console.error('Get status error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get sale status'
    });
  }
});

/**
 * GET /api/private-sale/purchases/:wallet
 * Get user's purchase history
 */
router.get('/purchases/:wallet', async (req: Request, res: Response): Promise<void> => {
  try {
    const walletAddress = req.params.wallet;

    const history = await privateSaleService.getUserPurchases(walletAddress);

    res.json({
      success: true,
      data: {
        purchases: history.purchases.map(p => ({
          id: p.id,
          paymentMethod: p.paymentMethod,
          amountUSD: p.amountUsd,
          tokensPurchased: p.tokensPurchased.toString(),
          bonusTokens: p.bonusTokens.toString(),
          totalTokens: p.totalTokens.toString(),
          status: p.status,
          txHash: p.txHash,
          createdAt: p.createdAt
        })),
        totalInvested: history.totalInvested,
        totalTokens: history.totalTokens.toString(),
        claimedTokens: history.claimedTokens.toString(),
        claimableTokens: history.claimableTokens.toString(),
        vestingSchedule: history.vestingSchedule.map(v => ({
          unlockDate: v.unlockDate,
          tokensUnlocked: v.tokensUnlocked.toString(),
          percentage: v.percentage,
          isClaimed: v.isClaimed
        }))
      }
    });
  } catch (error: any) {
    console.error('Get purchases error:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to get purchases'
    });
  }
});

/**
 * POST /api/private-sale/claim
 * Claim vested tokens
 */
router.post(
  '/claim',
  verifyWallet,
  validateTransaction,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const claimRequest: ClaimRequest = {
        walletAddress: req.body.walletAddress,
        purchaseId: parseInt(req.body.purchaseId),
        signature: req.body.signature
      };

      if (!claimRequest.walletAddress || !claimRequest.purchaseId || !claimRequest.signature) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      const result = await privateSaleService.claimTokens(claimRequest);

      res.json({
        success: true,
        txHash: result.txHash,
        tokensClaimed: result.tokensClaimed.toString()
      });
    } catch (error: any) {
      console.error('Claim error:', error);
      res.status(400).json({
        success: false,
        error: error.message || 'Failed to claim tokens'
      });
    }
  }
);

/**
 * GET /api/private-sale/referral/:code
 * Get referral statistics
 */
router.get('/referral/:code', async (req: Request, res: Response): Promise<void> => {
  try {
    const referralCode = req.params.code;

    const stats = await privateSaleService.getReferralStats(referralCode);

    res.json({
      success: true,
      stats: {
        referralCode: stats.referralCode,
        totalReferrals: stats.totalReferrals,
        totalBonusTokens: stats.totalBonusTokens.toString(),
        referrals: stats.referrals.map(r => ({
          wallet: r.wallet,
          tokens: r.tokens.toString(),
          date: r.date
        }))
      }
    });
  } catch (error: any) {
    console.error('Get referral stats error:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to get referral stats'
    });
  }
});

/**
 * POST /api/private-sale/webhook/coinbase
 * Webhook handler for Coinbase Commerce
 */
router.post('/webhook/coinbase', async (req: Request, res: Response): Promise<void> => {
  try {
    const signature = req.headers['x-cc-webhook-signature'] as string;
    const isValid = await paymentGateway.verifyWebhook(PaymentGateway.COINBASE, signature, req.body);

    if (!isValid) {
      res.status(401).json({ error: 'Invalid signature' });
      return;
    }

    const event = req.body.event;
    const charge = event.data;

    if (event.type === 'charge:confirmed') {
      const purchaseId = charge.metadata.purchase_id;
      await privateSaleService.updatePurchaseStatus(
        purchaseId,
        PurchaseStatus.COMPLETED,
        charge.id
      );

      // Send confirmation email
      await sendEmail({
        to: charge.metadata.email,
        type: EmailType.PAYMENT_RECEIVED,
        data: {
          txHash: charge.id,
          tokens: charge.metadata.tokens,
          vestingMonths: 12
        }
      });
    }

    if (event.type === 'charge:failed') {
      const purchaseId = charge.metadata.purchase_id;
      await privateSaleService.updatePurchaseStatus(purchaseId, PurchaseStatus.FAILED);

      await sendEmail({
        to: charge.metadata.email,
        type: EmailType.PURCHASE_FAILED,
        data: { reason: 'Payment failed' }
      });
    }

    res.json({ success: true });
  } catch (error: any) {
    console.error('Coinbase webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

/**
 * POST /api/private-sale/webhook/nowpayments
 * Webhook handler for NOWPayments
 */
router.post('/webhook/nowpayments', async (req: Request, res: Response): Promise<void> => {
  try {
    const signature = req.headers['x-nowpayments-sig'] as string;
    const isValid = await paymentGateway.verifyWebhook(PaymentGateway.NOWPAYMENTS, signature, req.body);

    if (!isValid) {
      res.status(401).json({ error: 'Invalid signature' });
      return;
    }

    const payment = req.body;

    if (payment.payment_status === 'finished') {
      const purchaseId = payment.order_id;
      await privateSaleService.updatePurchaseStatus(
        purchaseId,
        PurchaseStatus.COMPLETED,
        payment.payment_id
      );
    }

    if (payment.payment_status === 'failed') {
      await privateSaleService.updatePurchaseStatus(payment.order_id, PurchaseStatus.FAILED);
    }

    res.json({ success: true });
  } catch (error: any) {
    console.error('NOWPayments webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

/**
 * POST /api/private-sale/webhook/coingate
 * Webhook handler for CoinGate
 */
router.post('/webhook/coingate', async (req: Request, res: Response): Promise<void> => {
  try {
    const order = req.body;

    if (order.status === 'paid') {
      const purchaseId = order.order_id;
      await privateSaleService.updatePurchaseStatus(
        purchaseId,
        PurchaseStatus.COMPLETED,
        order.id.toString()
      );
    }

    if (order.status === 'expired' || order.status === 'canceled') {
      await privateSaleService.updatePurchaseStatus(order.order_id, PurchaseStatus.FAILED);
    }

    res.json({ success: true });
  } catch (error: any) {
    console.error('CoinGate webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

/**
 * GET /api/private-sale/health
 * Health check endpoint
 */
router.get('/health', async (req: Request, res: Response): Promise<void> => {
  try {
    // Check database connection
    await dbPool.query('SELECT 1');

    res.json({
      success: true,
      status: 'healthy',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      status: 'unhealthy',
      error: 'Database connection failed'
    });
  }
});

export default router;
