/**
 * Referral Service - Business logic for referral system
 * Handles referral tracking, rewards calculation, and analytics
 */

const { query, getClient } = require('../utils/database-pool');
const { ethers } = require('ethers');

class ReferralService {
  /**
   * Generate unique referral code for user
   */
  async generateReferralCode() {
    const result = await query('SELECT generate_referral_code() as code');
    return result.rows[0].code;
  }

  /**
   * Create new user with referral code
   */
  async createUser({ walletAddress, email, passwordHash, referrerCode }) {
    const client = await getClient();
    try {
      await client.beginTransaction();

      // Generate unique referral code
      const referralCode = await this.generateReferralCode();

      // Find referrer if code provided
      let referrerId = null;
      if (referrerCode) {
        const referrerResult = await client.query(
          'SELECT id FROM users WHERE referral_code = $1 AND is_active = true',
          [referrerCode]
        );
        if (referrerResult.rows.length > 0) {
          referrerId = referrerResult.rows[0].id;
        }
      }

      // Create user
      const userResult = await client.query(
        `INSERT INTO users (wallet_address, email, password_hash, referral_code, referrer_id)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, wallet_address, email, referral_code, created_at`,
        [walletAddress || null, email || null, passwordHash || null, referralCode, referrerId]
      );

      const user = userResult.rows[0];

      // Create referral relationship if referrer exists
      if (referrerId) {
        await client.query(
          `INSERT INTO referrals (referrer_id, referred_id, referral_code)
           VALUES ($1, $2, $3)`,
          [referrerId, user.id, referrerCode]
        );
      }

      await client.commitTransaction();
      return user;
    } catch (error) {
      await client.rollbackTransaction();
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get user by wallet address
   */
  async getUserByWallet(walletAddress) {
    const result = await query(
      `SELECT id, wallet_address, email, referral_code, referrer_id,
              total_earnings, total_referrals, created_at, is_active
       FROM users
       WHERE wallet_address = $1`,
      [walletAddress.toLowerCase()]
    );
    return result.rows[0];
  }

  /**
   * Get user by email
   */
  async getUserByEmail(email) {
    const result = await query(
      `SELECT id, wallet_address, email, referral_code, referrer_id,
              password_hash, total_earnings, total_referrals, created_at, is_active
       FROM users
       WHERE email = $1`,
      [email.toLowerCase()]
    );
    return result.rows[0];
  }

  /**
   * Get user by referral code
   */
  async getUserByCode(code) {
    const result = await query(
      `SELECT id, wallet_address, email, referral_code, referrer_id,
              total_earnings, total_referrals, created_at, is_active
       FROM users
       WHERE referral_code = $1 AND is_active = true`,
      [code]
    );
    return result.rows[0];
  }

  /**
   * Get user by ID
   */
  async getUserById(userId) {
    const result = await query(
      `SELECT id, wallet_address, email, referral_code, referrer_id,
              total_earnings, total_referrals, created_at, is_active
       FROM users
       WHERE id = $1`,
      [userId]
    );
    return result.rows[0];
  }

  /**
   * Update last login timestamp
   */
  async updateLastLogin(userId) {
    await query(
      'UPDATE users SET last_login = NOW() WHERE id = $1',
      [userId]
    );
  }

  /**
   * Get user's referral statistics
   */
  async getReferralStats(userId) {
    const result = await query(
      `SELECT
        u.referral_code,
        u.total_referrals,
        u.total_earnings,
        COUNT(DISTINCT r.referred_id) as active_referrals,
        COALESCE(SUM(p.amount_usd), 0) as total_sales_volume,
        COALESCE(SUM(CASE WHEN rr.status = 'pending' THEN rr.amount ELSE 0 END), 0) as pending_rewards,
        COALESCE(SUM(CASE WHEN rr.status = 'claimed' THEN rr.amount ELSE 0 END), 0) as claimed_rewards
      FROM users u
      LEFT JOIN referrals r ON u.id = r.referrer_id
      LEFT JOIN purchases p ON r.referred_id = p.user_id AND p.status = 'confirmed'
      LEFT JOIN referral_rewards rr ON u.id = rr.referrer_id
      WHERE u.id = $1
      GROUP BY u.id, u.referral_code, u.total_referrals, u.total_earnings`,
      [userId]
    );

    return result.rows[0];
  }

  /**
   * Get user's referral list with details
   */
  async getReferralList(userId, limit = 50, offset = 0) {
    const result = await query(
      `SELECT
        r.id,
        r.referred_id,
        u.wallet_address,
        u.email,
        r.registered_at,
        r.first_purchase_at,
        r.total_purchases_count,
        r.total_purchases_amount,
        r.total_rewards_earned,
        r.is_active
      FROM referrals r
      JOIN users u ON r.referred_id = u.id
      WHERE r.referrer_id = $1
      ORDER BY r.registered_at DESC
      LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    return result.rows;
  }

  /**
   * Record purchase and calculate referral rewards
   */
  async recordPurchase({ userId, txHash, amountUsd, amountTokens, tokenPrice, referrerCode }) {
    const client = await getClient();
    try {
      await client.beginTransaction();

      // Find referrer
      let referrerId = null;
      if (referrerCode) {
        const referrerResult = await client.query(
          'SELECT id FROM users WHERE referral_code = $1 AND is_active = true',
          [referrerCode]
        );
        if (referrerResult.rows.length > 0) {
          referrerId = referrerResult.rows[0].id;
        }
      }

      // If no referrer code provided, check if user has a referrer
      if (!referrerId) {
        const userResult = await client.query(
          'SELECT referrer_id FROM users WHERE id = $1',
          [userId]
        );
        if (userResult.rows.length > 0) {
          referrerId = userResult.rows[0].referrer_id;
        }
      }

      // Create purchase record
      const purchaseResult = await client.query(
        `INSERT INTO purchases (user_id, tx_hash, amount_usd, amount_tokens, token_price, referrer_id, status)
         VALUES ($1, $2, $3, $4, $5, $6, 'pending')
         RETURNING id, created_at`,
        [userId, txHash, amountUsd, amountTokens, tokenPrice, referrerId]
      );

      const purchase = purchaseResult.rows[0];

      // Calculate and create referral rewards if referrer exists
      if (referrerId) {
        // Direct referral: 10% reward
        const rewardAmount = parseFloat(amountUsd) * 0.10;

        await client.query(
          `INSERT INTO referral_rewards (referrer_id, referred_id, purchase_id, reward_type, amount, percentage, status)
           VALUES ($1, $2, $3, 'tokens', $4, 10.00, 'pending')`,
          [referrerId, userId, purchase.id, rewardAmount]
        );

        // Update referral relationship
        await client.query(
          `UPDATE referrals
           SET first_purchase_at = COALESCE(first_purchase_at, NOW()),
               total_purchases_count = total_purchases_count + 1,
               total_purchases_amount = total_purchases_amount + $1
           WHERE referrer_id = $2 AND referred_id = $3`,
          [amountUsd, referrerId, userId]
        );
      }

      await client.commitTransaction();
      return { purchaseId: purchase.id, referrerId };
    } catch (error) {
      await client.rollbackTransaction();
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Confirm purchase after blockchain verification
   */
  async confirmPurchase(purchaseId, blockNumber) {
    await query(
      `UPDATE purchases
       SET status = 'confirmed', confirmed_at = NOW(), block_number = $1
       WHERE id = $2`,
      [blockNumber, purchaseId]
    );
  }

  /**
   * Get pending rewards for user
   */
  async getPendingRewards(userId) {
    const result = await query(
      `SELECT
        rr.id,
        rr.reward_type,
        rr.amount,
        rr.percentage,
        rr.earned_at,
        p.amount_usd as purchase_amount,
        u.wallet_address as referred_user
      FROM referral_rewards rr
      JOIN purchases p ON rr.purchase_id = p.id
      JOIN users u ON rr.referred_id = u.id
      WHERE rr.referrer_id = $1 AND rr.status = 'pending' AND p.status = 'confirmed'
      ORDER BY rr.earned_at DESC`,
      [userId]
    );

    return result.rows;
  }

  /**
   * Claim rewards
   */
  async claimRewards(userId, rewardType, rewardIds, claimTxHash) {
    const client = await getClient();
    try {
      await client.beginTransaction();

      // Verify all rewards belong to user and are pending
      const verifyResult = await client.query(
        `SELECT id, amount FROM referral_rewards
         WHERE id = ANY($1) AND referrer_id = $2 AND status = 'pending'`,
        [rewardIds, userId]
      );

      if (verifyResult.rows.length !== rewardIds.length) {
        throw new Error('Some rewards are invalid or already claimed');
      }

      // Calculate total amount
      const totalAmount = verifyResult.rows.reduce((sum, r) => sum + parseFloat(r.amount), 0);

      // Mark rewards as claimed
      await client.query(
        `UPDATE referral_rewards
         SET status = 'claimed', claimed_at = NOW(), tx_hash = $1
         WHERE id = ANY($2)`,
        [claimTxHash, rewardIds]
      );

      // Create claim record
      await client.query(
        `INSERT INTO reward_claims (user_id, reward_type, total_amount, reward_ids, tx_hash, status)
         VALUES ($1, $2, $3, $4, $5, 'pending')`,
        [userId, rewardType, totalAmount, rewardIds, claimTxHash]
      );

      await client.commitTransaction();
      return { totalAmount, rewardCount: rewardIds.length };
    } catch (error) {
      await client.rollbackTransaction();
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get purchase history for user
   */
  async getPurchaseHistory(userId, limit = 50, offset = 0) {
    const result = await query(
      `SELECT
        id,
        tx_hash,
        amount_usd,
        amount_tokens,
        token_price,
        status,
        created_at,
        confirmed_at,
        block_number
      FROM purchases
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    return result.rows;
  }

  /**
   * Get dashboard overview
   */
  async getDashboardOverview(userId) {
    const stats = await this.getReferralStats(userId);
    const pendingRewards = await this.getPendingRewards(userId);

    const recentPurchases = await query(
      `SELECT
        p.amount_usd,
        p.created_at,
        u.wallet_address as buyer
      FROM purchases p
      JOIN referrals r ON p.user_id = r.referred_id
      JOIN users u ON p.user_id = u.id
      WHERE r.referrer_id = $1 AND p.status = 'confirmed'
      ORDER BY p.created_at DESC
      LIMIT 10`,
      [userId]
    );

    return {
      stats,
      pendingRewards: {
        total: pendingRewards.reduce((sum, r) => sum + parseFloat(r.amount), 0),
        count: pendingRewards.length,
        items: pendingRewards.slice(0, 5)
      },
      recentPurchases: recentPurchases.rows
    };
  }

  /**
   * Get referral leaderboard
   */
  async getLeaderboard(limit = 100) {
    const result = await query(
      `SELECT
        id,
        wallet_address,
        referral_code,
        total_referrals,
        total_earnings,
        ranking
      FROM referral_leaderboard
      ORDER BY ranking
      LIMIT $1`,
      [limit]
    );

    return result.rows;
  }

  /**
   * Refresh leaderboard materialized view
   */
  async refreshLeaderboard() {
    await query('SELECT refresh_leaderboard()');
  }

  /**
   * Validate referral code
   */
  async validateReferralCode(code) {
    const result = await query(
      'SELECT id FROM users WHERE referral_code = $1 AND is_active = true',
      [code]
    );
    return result.rows.length > 0;
  }

  /**
   * Get referral chain (multi-level)
   */
  async getReferralChain(userId, depth = 3) {
    const result = await query(
      `WITH RECURSIVE referral_chain AS (
        -- Base case: direct referrals
        SELECT
          r.referred_id,
          r.referrer_id,
          u.wallet_address,
          u.referral_code,
          1 as level
        FROM referrals r
        JOIN users u ON r.referred_id = u.id
        WHERE r.referrer_id = $1

        UNION ALL

        -- Recursive case: referrals of referrals
        SELECT
          r.referred_id,
          r.referrer_id,
          u.wallet_address,
          u.referral_code,
          rc.level + 1
        FROM referrals r
        JOIN users u ON r.referred_id = u.id
        JOIN referral_chain rc ON r.referrer_id = rc.referred_id
        WHERE rc.level < $2
      )
      SELECT * FROM referral_chain
      ORDER BY level, referred_id`,
      [userId, depth]
    );

    return result.rows;
  }
}

module.exports = new ReferralService();
