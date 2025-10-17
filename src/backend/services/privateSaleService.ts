import { Pool } from 'pg';
import { ethers } from 'ethers';
import {
  Purchase,
  PurchaseRequest,
  PurchaseStatus,
  SaleStatus,
  UserPurchaseHistory,
  VestingSchedule,
  ClaimRequest,
  ReferralStats,
  SaleConfig
} from '../types/privateSale.types';
import { paymentGateway } from '../integrations/paymentGateway';
import { sendEmail, EmailType } from '../utils/emailService';

export class PrivateSaleService {
  private db: Pool;

  constructor(dbPool: Pool) {
    this.db = dbPool;
  }

  async createPurchase(request: PurchaseRequest): Promise<{ purchase: Purchase; paymentUrl: string }> {
    const client = await this.db.connect();

    try {
      await client.query('BEGIN');

      // Validate wallet address
      if (!ethers.isAddress(request.walletAddress)) {
        throw new Error('Invalid wallet address');
      }

      // Get sale configuration
      const configResult = await client.query(
        'SELECT * FROM private_sale_config WHERE is_active = true LIMIT 1'
      );

      if (configResult.rows.length === 0) {
        throw new Error('Sale is not active');
      }

      const config: SaleConfig = configResult.rows[0];

      // Validate purchase amount
      if (request.amountUSD < config.minPurchaseUsd) {
        throw new Error(`Minimum purchase is $${config.minPurchaseUsd}`);
      }

      if (request.amountUSD > config.maxPurchaseUsd) {
        throw new Error(`Maximum purchase is $${config.maxPurchaseUsd}`);
      }

      // Check if sale has ended
      if (new Date() > config.saleEndDate) {
        throw new Error('Sale has ended');
      }

      // Calculate tokens
      const tokensPurchased = BigInt(Math.floor(request.amountUSD / config.tokenPriceUsd));
      let bonusTokens = BigInt(0);

      // Apply referral bonus
      if (request.referralCode) {
        const referralResult = await client.query(
          'SELECT * FROM private_sale_referrals WHERE referral_code = $1 LIMIT 1',
          [request.referralCode]
        );

        if (referralResult.rows.length > 0) {
          const bonusPercentage = referralResult.rows[0].bonus_percentage || 10;
          bonusTokens = (tokensPurchased * BigInt(bonusPercentage)) / BigInt(100);
        }
      }

      const totalTokens = tokensPurchased + bonusTokens;

      // Check if enough tokens available
      if (config.tokensSold + totalTokens > config.totalTokens) {
        throw new Error('Not enough tokens available');
      }

      // Create purchase record
      const purchaseResult = await client.query(
        `INSERT INTO private_sale_purchases
        (wallet_address, payment_method, amount_usd, tokens_purchased, bonus_tokens, total_tokens, status, referral_code)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *`,
        [
          request.walletAddress.toLowerCase(),
          request.paymentMethod,
          request.amountUSD,
          tokensPurchased.toString(),
          bonusTokens.toString(),
          totalTokens.toString(),
          PurchaseStatus.PENDING,
          request.referralCode || null
        ]
      );

      const purchase = purchaseResult.rows[0];

      // Create payment
      const paymentResponse = await paymentGateway.createPayment(
        request.amountUSD,
        request.paymentMethod,
        {
          walletAddress: request.walletAddress,
          purchaseId: purchase.id,
          tokens: totalTokens.toString(),
          referralCode: request.referralCode
        }
      );

      // Update purchase with payment details
      await client.query(
        'UPDATE private_sale_purchases SET payment_id = $1, status = $2 WHERE id = $3',
        [paymentResponse.paymentId, PurchaseStatus.PROCESSING, purchase.id]
      );

      // Create referral record if applicable
      if (request.referralCode) {
        const referralResult = await client.query(
          'SELECT referrer_wallet FROM private_sale_referrals WHERE referral_code = $1 LIMIT 1',
          [request.referralCode]
        );

        if (referralResult.rows.length > 0) {
          await client.query(
            `INSERT INTO private_sale_referrals (referral_code, referrer_wallet, referred_wallet, bonus_tokens)
            VALUES ($1, $2, $3, $4)`,
            [
              request.referralCode,
              referralResult.rows[0].referrer_wallet,
              request.walletAddress.toLowerCase(),
              bonusTokens.toString()
            ]
          );
        }
      }

      await client.query('COMMIT');

      // Send confirmation email
      await sendEmail({
        to: request.email,
        type: EmailType.PURCHASE_INITIATED,
        data: {
          walletAddress: request.walletAddress,
          amount: request.amountUSD,
          tokens: totalTokens.toString(),
          paymentUrl: paymentResponse.paymentUrl
        }
      });

      return {
        purchase: {
          ...purchase,
          tokensPurchased: BigInt(purchase.tokens_purchased),
          bonusTokens: BigInt(purchase.bonus_tokens),
          totalTokens: BigInt(purchase.total_tokens)
        },
        paymentUrl: paymentResponse.paymentUrl
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async getSaleStatus(): Promise<SaleStatus> {
    const configResult = await this.db.query(
      'SELECT * FROM private_sale_config WHERE is_active = true LIMIT 1'
    );

    const statsResult = await this.db.query(
      `SELECT
        COALESCE(SUM(amount_usd), 0) as total_raised,
        COUNT(*) as total_purchases,
        COUNT(DISTINCT wallet_address) as unique_buyers
      FROM private_sale_purchases
      WHERE status = $1`,
      [PurchaseStatus.COMPLETED]
    );

    if (configResult.rows.length === 0) {
      throw new Error('Sale configuration not found');
    }

    const config = configResult.rows[0];
    const stats = statsResult.rows[0];

    return {
      totalTokens: BigInt(config.total_tokens),
      tokensSold: BigInt(config.tokens_sold),
      tokensRemaining: BigInt(config.total_tokens) - BigInt(config.tokens_sold),
      totalRaised: parseFloat(stats.total_raised),
      totalPurchases: parseInt(stats.total_purchases),
      uniqueBuyers: parseInt(stats.unique_buyers),
      isActive: config.is_active,
      saleEndDate: config.sale_end_date
    };
  }

  async getUserPurchases(walletAddress: string): Promise<UserPurchaseHistory> {
    if (!ethers.isAddress(walletAddress)) {
      throw new Error('Invalid wallet address');
    }

    const purchasesResult = await this.db.query(
      `SELECT p.*, COALESCE(SUM(c.tokens_claimed), 0) as claimed_tokens
      FROM private_sale_purchases p
      LEFT JOIN private_sale_claims c ON p.id = c.purchase_id
      WHERE p.wallet_address = $1
      GROUP BY p.id
      ORDER BY p.created_at DESC`,
      [walletAddress.toLowerCase()]
    );

    const configResult = await this.db.query(
      'SELECT * FROM private_sale_config WHERE is_active = true LIMIT 1'
    );

    const config = configResult.rows[0];
    const purchases = purchasesResult.rows;

    let totalInvested = 0;
    let totalTokens = BigInt(0);
    let claimedTokens = BigInt(0);

    const vestingSchedules: VestingSchedule[] = [];

    for (const purchase of purchases) {
      if (purchase.status === PurchaseStatus.COMPLETED) {
        totalInvested += parseFloat(purchase.amount_usd);
        totalTokens += BigInt(purchase.total_tokens);
        claimedTokens += BigInt(purchase.claimed_tokens || 0);

        // Calculate vesting schedule
        const schedule = this.calculateVestingSchedule(
          BigInt(purchase.total_tokens),
          purchase.vesting_start_date || purchase.created_at,
          config
        );
        vestingSchedules.push(...schedule);
      }
    }

    const claimableTokens = this.calculateClaimableTokens(vestingSchedules);

    return {
      purchases: purchases.map(p => ({
        ...p,
        tokensPurchased: BigInt(p.tokens_purchased),
        bonusTokens: BigInt(p.bonus_tokens),
        totalTokens: BigInt(p.total_tokens)
      })),
      totalInvested,
      totalTokens,
      claimedTokens,
      claimableTokens,
      vestingSchedule: vestingSchedules
    };
  }

  private calculateVestingSchedule(
    totalTokens: bigint,
    startDate: Date,
    config: any
  ): VestingSchedule[] {
    const schedule: VestingSchedule[] = [];
    const initialUnlock = (totalTokens * BigInt(config.initial_unlock_percentage)) / BigInt(100);
    const vestingMonths = config.vesting_months;
    const monthlyUnlock = (totalTokens - initialUnlock) / BigInt(vestingMonths);

    // Initial unlock
    schedule.push({
      unlockDate: new Date(startDate),
      tokensUnlocked: initialUnlock,
      percentage: config.initial_unlock_percentage,
      isClaimed: false
    });

    // Monthly unlocks
    for (let i = 1; i <= vestingMonths; i++) {
      const unlockDate = new Date(startDate);
      unlockDate.setMonth(unlockDate.getMonth() + i);

      schedule.push({
        unlockDate,
        tokensUnlocked: monthlyUnlock,
        percentage: Math.floor((100 - config.initial_unlock_percentage) / vestingMonths),
        isClaimed: false
      });
    }

    return schedule;
  }

  private calculateClaimableTokens(schedule: VestingSchedule[]): bigint {
    const now = new Date();
    let claimable = BigInt(0);

    for (const vest of schedule) {
      if (vest.unlockDate <= now && !vest.isClaimed) {
        claimable += vest.tokensUnlocked;
      }
    }

    return claimable;
  }

  async claimTokens(request: ClaimRequest): Promise<{ txHash: string; tokensClaimed: bigint }> {
    const client = await this.db.connect();

    try {
      await client.query('BEGIN');

      // Verify signature
      const message = `Claim tokens for purchase ${request.purchaseId}`;
      const recoveredAddress = ethers.verifyMessage(message, request.signature);

      if (recoveredAddress.toLowerCase() !== request.walletAddress.toLowerCase()) {
        throw new Error('Invalid signature');
      }

      // Get purchase details
      const purchaseResult = await client.query(
        'SELECT * FROM private_sale_purchases WHERE id = $1 AND wallet_address = $2',
        [request.purchaseId, request.walletAddress.toLowerCase()]
      );

      if (purchaseResult.rows.length === 0) {
        throw new Error('Purchase not found');
      }

      const purchase = purchaseResult.rows[0];

      if (purchase.status !== PurchaseStatus.COMPLETED) {
        throw new Error('Purchase not completed');
      }

      // Calculate claimable tokens
      const configResult = await client.query(
        'SELECT * FROM private_sale_config WHERE is_active = true LIMIT 1'
      );
      const config = configResult.rows[0];

      const vestingSchedule = this.calculateVestingSchedule(
        BigInt(purchase.total_tokens),
        purchase.vesting_start_date,
        config
      );

      const claimableTokens = this.calculateClaimableTokens(vestingSchedule);

      if (claimableTokens === BigInt(0)) {
        throw new Error('No tokens available to claim');
      }

      // TODO: Execute blockchain transaction to transfer tokens
      const txHash = '0x' + Math.random().toString(16).substring(2, 66); // Placeholder

      // Record claim
      await client.query(
        `INSERT INTO private_sale_claims (purchase_id, tokens_claimed, tx_hash)
        VALUES ($1, $2, $3)`,
        [request.purchaseId, claimableTokens.toString(), txHash]
      );

      await client.query('COMMIT');

      return {
        txHash,
        tokensClaimed: claimableTokens
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async getReferralStats(referralCode: string): Promise<ReferralStats> {
    const result = await this.db.query(
      `SELECT
        r.referral_code,
        r.referrer_wallet,
        r.referred_wallet,
        r.bonus_tokens,
        r.created_at
      FROM private_sale_referrals r
      WHERE r.referral_code = $1
      ORDER BY r.created_at DESC`,
      [referralCode]
    );

    if (result.rows.length === 0) {
      throw new Error('Referral code not found');
    }

    let totalBonusTokens = BigInt(0);
    const referrals = result.rows.map(row => {
      const tokens = BigInt(row.bonus_tokens);
      totalBonusTokens += tokens;
      return {
        wallet: row.referred_wallet,
        tokens,
        date: row.created_at
      };
    });

    return {
      referralCode,
      totalReferrals: result.rows.length,
      totalBonusTokens,
      referrals
    };
  }

  async updatePurchaseStatus(
    purchaseId: number,
    status: PurchaseStatus,
    txHash?: string
  ): Promise<void> {
    const client = await this.db.connect();

    try {
      await client.query('BEGIN');

      await client.query(
        'UPDATE private_sale_purchases SET status = $1, tx_hash = $2, updated_at = NOW() WHERE id = $3',
        [status, txHash, purchaseId]
      );

      if (status === PurchaseStatus.COMPLETED) {
        // Update total tokens sold
        const purchaseResult = await client.query(
          'SELECT total_tokens FROM private_sale_purchases WHERE id = $1',
          [purchaseId]
        );

        const totalTokens = BigInt(purchaseResult.rows[0].total_tokens);

        await client.query(
          'UPDATE private_sale_config SET tokens_sold = tokens_sold + $1 WHERE is_active = true',
          [totalTokens.toString()]
        );

        // Set vesting start date
        await client.query(
          'UPDATE private_sale_purchases SET vesting_start_date = NOW() WHERE id = $1',
          [purchaseId]
        );
      }

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}
