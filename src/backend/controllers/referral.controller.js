/**
 * Referral Controller - HTTP request handlers for referral endpoints
 */

const referralService = require('../services/referral.service');
const { logger } = require('../config/logger');

class ReferralController {
  /**
   * Get user's referral code
   * GET /api/referral/code
   */
  async getReferralCode(req, res, next) {
    try {
      const userId = req.userId;

      const user = await referralService.getUserById(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      res.json({
        success: true,
        data: {
          referralCode: user.referral_code,
          totalReferrals: user.total_referrals,
          totalEarnings: user.total_earnings
        }
      });
    } catch (error) {
      logger.error('Get referral code error:', error);
      next(error);
    }
  }

  /**
   * Register referral relationship
   * POST /api/referral/register
   * Body: { referrerCode: string }
   */
  async registerReferral(req, res, next) {
    try {
      const userId = req.userId;
      const { referrerCode } = req.body;

      if (!referrerCode) {
        return res.status(400).json({
          success: false,
          error: 'Referrer code is required'
        });
      }

      // Check if user already has a referrer
      const user = await referralService.getUserById(userId);
      if (user.referrer_id) {
        return res.status(400).json({
          success: false,
          error: 'User already has a referrer'
        });
      }

      // Validate referrer code
      const isValid = await referralService.validateReferralCode(referrerCode);
      if (!isValid) {
        return res.status(404).json({
          success: false,
          error: 'Invalid referrer code'
        });
      }

      // Cannot refer yourself
      if (user.referral_code === referrerCode) {
        return res.status(400).json({
          success: false,
          error: 'Cannot use your own referral code'
        });
      }

      // Get referrer
      const referrerResult = await referralService.getUserByCode(referrerCode);

      // Create referral relationship
      const client = await require('../utils/database-pool').getClient();
      try {
        await client.beginTransaction();

        await client.query(
          'UPDATE users SET referrer_id = $1 WHERE id = $2',
          [referrerResult.id, userId]
        );

        await client.query(
          'INSERT INTO referrals (referrer_id, referred_id, referral_code) VALUES ($1, $2, $3)',
          [referrerResult.id, userId, referrerCode]
        );

        await client.commitTransaction();

        res.json({
          success: true,
          message: 'Referral registered successfully',
          data: {
            referrerCode
          }
        });
      } catch (error) {
        await client.rollbackTransaction();
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      logger.error('Register referral error:', error);
      next(error);
    }
  }

  /**
   * Get referral statistics
   * GET /api/referral/stats
   */
  async getStats(req, res, next) {
    try {
      const userId = req.userId;

      const stats = await referralService.getReferralStats(userId);

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      logger.error('Get referral stats error:', error);
      next(error);
    }
  }

  /**
   * Get referral list
   * GET /api/referral/list?limit=50&offset=0
   */
  async getReferralList(req, res, next) {
    try {
      const userId = req.userId;
      const limit = Math.min(parseInt(req.query.limit) || 50, 100);
      const offset = parseInt(req.query.offset) || 0;

      const referrals = await referralService.getReferralList(userId, limit, offset);

      res.json({
        success: true,
        data: {
          referrals,
          pagination: {
            limit,
            offset,
            total: referrals.length
          }
        }
      });
    } catch (error) {
      logger.error('Get referral list error:', error);
      next(error);
    }
  }

  /**
   * Get pending rewards
   * GET /api/referral/rewards/pending
   */
  async getPendingRewards(req, res, next) {
    try {
      const userId = req.userId;

      const rewards = await referralService.getPendingRewards(userId);

      const totalPending = rewards.reduce((sum, r) => sum + parseFloat(r.amount), 0);

      res.json({
        success: true,
        data: {
          rewards,
          totalPending,
          count: rewards.length
        }
      });
    } catch (error) {
      logger.error('Get pending rewards error:', error);
      next(error);
    }
  }

  /**
   * Claim rewards
   * POST /api/referral/claim
   * Body: { rewardType: 'tokens' | 'usdt', rewardIds: string[] }
   */
  async claimRewards(req, res, next) {
    try {
      const userId = req.userId;
      const { rewardType, rewardIds } = req.body;

      if (!rewardType || !['tokens', 'usdt'].includes(rewardType)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid reward type. Must be "tokens" or "usdt"'
        });
      }

      if (!rewardIds || !Array.isArray(rewardIds) || rewardIds.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Reward IDs are required'
        });
      }

      // In production, this would trigger actual blockchain transaction
      // For now, generate mock transaction hash
      const claimTxHash = '0x' + require('crypto').randomBytes(32).toString('hex');

      const result = await referralService.claimRewards(
        userId,
        rewardType,
        rewardIds,
        claimTxHash
      );

      res.json({
        success: true,
        message: 'Rewards claimed successfully',
        data: {
          totalAmount: result.totalAmount,
          rewardCount: result.rewardCount,
          txHash: claimTxHash,
          rewardType
        }
      });
    } catch (error) {
      logger.error('Claim rewards error:', error);
      next(error);
    }
  }

  /**
   * Get referral chain (multi-level)
   * GET /api/referral/chain?depth=3
   */
  async getReferralChain(req, res, next) {
    try {
      const userId = req.userId;
      const depth = Math.min(parseInt(req.query.depth) || 3, 5);

      const chain = await referralService.getReferralChain(userId, depth);

      // Group by level
      const grouped = chain.reduce((acc, item) => {
        if (!acc[item.level]) {
          acc[item.level] = [];
        }
        acc[item.level].push(item);
        return acc;
      }, {});

      res.json({
        success: true,
        data: {
          chain,
          grouped,
          totalReferrals: chain.length
        }
      });
    } catch (error) {
      logger.error('Get referral chain error:', error);
      next(error);
    }
  }

  /**
   * Validate referral code
   * GET /api/referral/validate/:code
   */
  async validateCode(req, res, next) {
    try {
      const { code } = req.params;

      const isValid = await referralService.validateReferralCode(code);

      res.json({
        success: true,
        data: {
          code,
          valid: isValid
        }
      });
    } catch (error) {
      logger.error('Validate referral code error:', error);
      next(error);
    }
  }

  /**
   * Get leaderboard
   * GET /api/referral/leaderboard?limit=100
   */
  async getLeaderboard(req, res, next) {
    try {
      const limit = Math.min(parseInt(req.query.limit) || 100, 500);

      const leaderboard = await referralService.getLeaderboard(limit);

      res.json({
        success: true,
        data: {
          leaderboard,
          count: leaderboard.length
        }
      });
    } catch (error) {
      logger.error('Get leaderboard error:', error);
      next(error);
    }
  }
}

module.exports = new ReferralController();
