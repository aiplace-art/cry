/**
 * Dashboard Controller - Analytics and overview endpoints
 */

const referralService = require('../services/referral.service');
const { query } = require('../utils/database-pool');
const { logger } = require('../config/logger');

class DashboardController {
  /**
   * Get dashboard overview
   * GET /api/dashboard/overview
   */
  async getOverview(req, res, next) {
    try {
      const userId = req.userId;

      const overview = await referralService.getDashboardOverview(userId);

      res.json({
        success: true,
        data: overview
      });
    } catch (error) {
      logger.error('Get dashboard overview error:', error);
      next(error);
    }
  }

  /**
   * Get earnings breakdown
   * GET /api/dashboard/earnings
   */
  async getEarnings(req, res, next) {
    try {
      const userId = req.userId;

      // Get earnings by type
      const earningsResult = await query(
        `SELECT
          reward_type,
          SUM(amount) as total_amount,
          COUNT(*) as count,
          SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) as pending,
          SUM(CASE WHEN status = 'claimed' THEN amount ELSE 0 END) as claimed
        FROM referral_rewards
        WHERE referrer_id = $1
        GROUP BY reward_type`,
        [userId]
      );

      // Get earnings over time (last 30 days)
      const timelineResult = await query(
        `SELECT
          DATE_TRUNC('day', earned_at) as date,
          SUM(amount) as amount,
          COUNT(*) as count
        FROM referral_rewards
        WHERE referrer_id = $1
          AND earned_at > NOW() - INTERVAL '30 days'
        GROUP BY DATE_TRUNC('day', earned_at)
        ORDER BY date DESC`,
        [userId]
      );

      // Get top referring purchases
      const topPurchasesResult = await query(
        `SELECT
          rr.amount,
          rr.earned_at,
          p.amount_usd as purchase_amount,
          u.wallet_address as referred_user
        FROM referral_rewards rr
        JOIN purchases p ON rr.purchase_id = p.id
        JOIN users u ON rr.referred_id = u.id
        WHERE rr.referrer_id = $1
        ORDER BY rr.amount DESC
        LIMIT 10`,
        [userId]
      );

      res.json({
        success: true,
        data: {
          byType: earningsResult.rows,
          timeline: timelineResult.rows,
          topPurchases: topPurchasesResult.rows
        }
      });
    } catch (error) {
      logger.error('Get earnings error:', error);
      next(error);
    }
  }

  /**
   * Get referral analytics
   * GET /api/dashboard/referrals
   */
  async getReferralAnalytics(req, res, next) {
    try {
      const userId = req.userId;

      // Get referral conversion funnel
      const funnelResult = await query(
        `SELECT
          COUNT(DISTINCT r.referred_id) as total_referrals,
          COUNT(DISTINCT CASE WHEN r.first_purchase_at IS NOT NULL THEN r.referred_id END) as converted_referrals,
          COUNT(DISTINCT CASE WHEN r.total_purchases_count > 1 THEN r.referred_id END) as repeat_buyers,
          SUM(r.total_purchases_amount) as total_volume
        FROM referrals r
        WHERE r.referrer_id = $1`,
        [userId]
      );

      // Get referral activity (last 30 days)
      const activityResult = await query(
        `SELECT
          DATE_TRUNC('day', registered_at) as date,
          COUNT(*) as new_referrals
        FROM referrals
        WHERE referrer_id = $1
          AND registered_at > NOW() - INTERVAL '30 days'
        GROUP BY DATE_TRUNC('day', registered_at)
        ORDER BY date DESC`,
        [userId]
      );

      // Get top performing referrals
      const topReferralsResult = await query(
        `SELECT
          r.referred_id,
          u.wallet_address,
          u.email,
          r.total_purchases_count,
          r.total_purchases_amount,
          r.total_rewards_earned,
          r.registered_at
        FROM referrals r
        JOIN users u ON r.referred_id = u.id
        WHERE r.referrer_id = $1
        ORDER BY r.total_purchases_amount DESC
        LIMIT 10`,
        [userId]
      );

      const funnel = funnelResult.rows[0];
      const conversionRate = funnel.total_referrals > 0
        ? (funnel.converted_referrals / funnel.total_referrals * 100).toFixed(2)
        : 0;

      res.json({
        success: true,
        data: {
          funnel: {
            ...funnel,
            conversionRate: parseFloat(conversionRate)
          },
          activity: activityResult.rows,
          topReferrals: topReferralsResult.rows
        }
      });
    } catch (error) {
      logger.error('Get referral analytics error:', error);
      next(error);
    }
  }

  /**
   * Get statistics summary
   * GET /api/dashboard/stats
   */
  async getStatsSummary(req, res, next) {
    try {
      const userId = req.userId;

      const statsResult = await query(
        `SELECT
          u.total_referrals,
          u.total_earnings,
          COUNT(DISTINCT r.referred_id) as active_referrals,
          COALESCE(SUM(p.amount_usd), 0) as total_sales,
          COALESCE(SUM(CASE WHEN rr.status = 'pending' THEN rr.amount ELSE 0 END), 0) as pending_rewards,
          COALESCE(SUM(CASE WHEN rr.status = 'claimed' THEN rr.amount ELSE 0 END), 0) as claimed_rewards,
          COUNT(DISTINCT p.id) as total_purchases,
          (
            SELECT ranking FROM referral_leaderboard
            WHERE id = $1
          ) as leaderboard_rank
        FROM users u
        LEFT JOIN referrals r ON u.id = r.referrer_id AND r.is_active = true
        LEFT JOIN purchases p ON r.referred_id = p.user_id AND p.status = 'confirmed'
        LEFT JOIN referral_rewards rr ON u.id = rr.referrer_id
        WHERE u.id = $1
        GROUP BY u.id, u.total_referrals, u.total_earnings`,
        [userId]
      );

      // Calculate growth (vs last 30 days)
      const growthResult = await query(
        `SELECT
          COUNT(DISTINCT CASE WHEN r.registered_at > NOW() - INTERVAL '30 days' THEN r.referred_id END) as new_referrals_30d,
          COALESCE(SUM(CASE WHEN rr.earned_at > NOW() - INTERVAL '30 days' THEN rr.amount ELSE 0 END), 0) as earnings_30d,
          COUNT(DISTINCT CASE WHEN p.created_at > NOW() - INTERVAL '30 days' THEN p.id END) as purchases_30d
        FROM users u
        LEFT JOIN referrals r ON u.id = r.referrer_id
        LEFT JOIN referral_rewards rr ON u.id = rr.referrer_id
        LEFT JOIN purchases p ON r.referred_id = p.user_id AND p.status = 'confirmed'
        WHERE u.id = $1`,
        [userId]
      );

      res.json({
        success: true,
        data: {
          stats: statsResult.rows[0],
          growth: growthResult.rows[0]
        }
      });
    } catch (error) {
      logger.error('Get stats summary error:', error);
      next(error);
    }
  }

  /**
   * Get recent activity
   * GET /api/dashboard/activity?limit=20
   */
  async getRecentActivity(req, res, next) {
    try {
      const userId = req.userId;
      const limit = Math.min(parseInt(req.query.limit) || 20, 100);

      const activityResult = await query(
        `SELECT
          'referral' as type,
          r.registered_at as timestamp,
          u.wallet_address as user,
          NULL as amount
        FROM referrals r
        JOIN users u ON r.referred_id = u.id
        WHERE r.referrer_id = $1

        UNION ALL

        SELECT
          'purchase' as type,
          p.created_at as timestamp,
          u.wallet_address as user,
          p.amount_usd as amount
        FROM purchases p
        JOIN referrals r ON p.user_id = r.referred_id
        JOIN users u ON p.user_id = u.id
        WHERE r.referrer_id = $1 AND p.status = 'confirmed'

        UNION ALL

        SELECT
          'reward' as type,
          rr.earned_at as timestamp,
          u.wallet_address as user,
          rr.amount as amount
        FROM referral_rewards rr
        JOIN users u ON rr.referred_id = u.id
        WHERE rr.referrer_id = $1

        ORDER BY timestamp DESC
        LIMIT $2`,
        [userId, limit]
      );

      res.json({
        success: true,
        data: {
          activity: activityResult.rows
        }
      });
    } catch (error) {
      logger.error('Get recent activity error:', error);
      next(error);
    }
  }
}

module.exports = new DashboardController();
