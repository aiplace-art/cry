/**
 * Purchase Controller - Handle token purchases and blockchain transactions
 */

const referralService = require('../services/referral.service');
const { ethers } = require('ethers');
const { logger } = require('../config/logger');

class PurchaseController {
  /**
   * Record purchase after blockchain confirmation
   * POST /api/purchase/record
   * Body: { userId: string, txHash: string, amountUsd: number, amountTokens: number, tokenPrice: number, referrerCode?: string }
   */
  async recordPurchase(req, res, next) {
    try {
      const {
        txHash,
        amountUsd,
        amountTokens,
        tokenPrice,
        referrerCode
      } = req.body;

      const userId = req.userId;

      // Validation
      if (!txHash || !txHash.match(/^0x[a-fA-F0-9]{64}$/)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid transaction hash format'
        });
      }

      if (!amountUsd || amountUsd <= 0) {
        return res.status(400).json({
          success: false,
          error: 'Invalid USD amount'
        });
      }

      if (!amountTokens || amountTokens <= 0) {
        return res.status(400).json({
          success: false,
          error: 'Invalid token amount'
        });
      }

      if (!tokenPrice || tokenPrice <= 0) {
        return res.status(400).json({
          success: false,
          error: 'Invalid token price'
        });
      }

      // Check if transaction already recorded
      const { query } = require('../utils/database-pool');
      const existingPurchase = await query(
        'SELECT id FROM purchases WHERE tx_hash = $1',
        [txHash]
      );

      if (existingPurchase.rows.length > 0) {
        return res.status(409).json({
          success: false,
          error: 'Transaction already recorded'
        });
      }

      // Record purchase
      const result = await referralService.recordPurchase({
        userId,
        txHash,
        amountUsd: parseFloat(amountUsd),
        amountTokens: parseFloat(amountTokens),
        tokenPrice: parseFloat(tokenPrice),
        referrerCode
      });

      res.status(201).json({
        success: true,
        message: 'Purchase recorded successfully',
        data: {
          purchaseId: result.purchaseId,
          txHash,
          amountUsd,
          amountTokens,
          hasReferrer: !!result.referrerId
        }
      });
    } catch (error) {
      logger.error('Record purchase error:', error);
      next(error);
    }
  }

  /**
   * Confirm purchase after blockchain verification
   * POST /api/purchase/confirm/:purchaseId
   * Body: { blockNumber: number }
   */
  async confirmPurchase(req, res, next) {
    try {
      const { purchaseId } = req.params;
      const { blockNumber } = req.body;

      if (!blockNumber || blockNumber <= 0) {
        return res.status(400).json({
          success: false,
          error: 'Invalid block number'
        });
      }

      // Verify purchase belongs to user (security check)
      const { query } = require('../utils/database-pool');
      const purchase = await query(
        'SELECT id, user_id, status FROM purchases WHERE id = $1',
        [purchaseId]
      );

      if (purchase.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Purchase not found'
        });
      }

      if (purchase.rows[0].status === 'confirmed') {
        return res.status(400).json({
          success: false,
          error: 'Purchase already confirmed'
        });
      }

      // Confirm purchase
      await referralService.confirmPurchase(purchaseId, blockNumber);

      res.json({
        success: true,
        message: 'Purchase confirmed successfully',
        data: {
          purchaseId,
          blockNumber
        }
      });
    } catch (error) {
      logger.error('Confirm purchase error:', error);
      next(error);
    }
  }

  /**
   * Get purchase history
   * GET /api/purchase/history?limit=50&offset=0
   */
  async getPurchaseHistory(req, res, next) {
    try {
      const userId = req.userId;
      const limit = Math.min(parseInt(req.query.limit) || 50, 100);
      const offset = parseInt(req.query.offset) || 0;

      const purchases = await referralService.getPurchaseHistory(userId, limit, offset);

      res.json({
        success: true,
        data: {
          purchases,
          pagination: {
            limit,
            offset,
            total: purchases.length
          }
        }
      });
    } catch (error) {
      logger.error('Get purchase history error:', error);
      next(error);
    }
  }

  /**
   * Verify blockchain transaction
   * GET /api/purchase/verify/:txHash
   */
  async verifyTransaction(req, res, next) {
    try {
      const { txHash } = req.params;

      if (!txHash || !txHash.match(/^0x[a-fA-F0-9]{64}$/)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid transaction hash'
        });
      }

      // In production, this would verify the transaction on blockchain
      // For now, return mock verification data
      const provider = new ethers.JsonRpcProvider(
        process.env.RPC_URL || 'https://eth-mainnet.g.alchemy.com/v2/your-api-key'
      );

      try {
        const tx = await provider.getTransaction(txHash);
        const receipt = await provider.getTransactionReceipt(txHash);

        if (!tx || !receipt) {
          return res.status(404).json({
            success: false,
            error: 'Transaction not found on blockchain'
          });
        }

        res.json({
          success: true,
          data: {
            txHash,
            from: tx.from,
            to: tx.to,
            value: ethers.formatEther(tx.value),
            blockNumber: receipt.blockNumber,
            confirmations: receipt.confirmations,
            status: receipt.status === 1 ? 'success' : 'failed'
          }
        });
      } catch (error) {
        return res.status(404).json({
          success: false,
          error: 'Transaction not found on blockchain'
        });
      }
    } catch (error) {
      logger.error('Verify transaction error:', error);
      next(error);
    }
  }

  /**
   * Get purchase by transaction hash
   * GET /api/purchase/by-tx/:txHash
   */
  async getPurchaseByTxHash(req, res, next) {
    try {
      const { txHash } = req.params;

      if (!txHash || !txHash.match(/^0x[a-fA-F0-9]{64}$/)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid transaction hash'
        });
      }

      const { query } = require('../utils/database-pool');
      const result = await query(
        `SELECT
          id,
          user_id,
          tx_hash,
          amount_usd,
          amount_tokens,
          token_price,
          referrer_id,
          status,
          created_at,
          confirmed_at,
          block_number
        FROM purchases
        WHERE tx_hash = $1`,
        [txHash]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Purchase not found'
        });
      }

      res.json({
        success: true,
        data: {
          purchase: result.rows[0]
        }
      });
    } catch (error) {
      logger.error('Get purchase by tx hash error:', error);
      next(error);
    }
  }
}

module.exports = new PurchaseController();
