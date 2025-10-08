const Stake = require('../models/Stake');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const tokenService = require('./token.service');
const { logger } = require('../config/logger');

/**
 * Available staking pools configuration
 */
const STAKING_POOLS = [
  {
    tokenSymbol: 'ETH',
    tokenAddress: '0x0000000000000000000000000000000000000000',
    apy: 5.5,
    minStake: '0.1',
    maxDuration: 365,
    minDuration: 7
  },
  {
    tokenSymbol: 'USDT',
    tokenAddress: '0xdac17f958d2ee523a2206206994597c13d831ec7',
    apy: 8.0,
    minStake: '100',
    maxDuration: 365,
    minDuration: 30
  },
  {
    tokenSymbol: 'USDC',
    tokenAddress: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    apy: 7.5,
    minStake: '100',
    maxDuration: 365,
    minDuration: 30
  },
  {
    tokenSymbol: 'DAI',
    tokenAddress: '0x6b175474e89094c44da98b954eedeac495271d0f',
    apy: 7.0,
    minStake: '100',
    maxDuration: 365,
    minDuration: 30
  }
];

/**
 * Get available staking pools
 */
const getAvailablePools = async () => {
  try {
    // Get current prices for all pool tokens
    const symbols = STAKING_POOLS.map(pool => pool.tokenSymbol);
    const prices = await tokenService.getTokenPrices(symbols);

    // Enhance pools with current price data
    const poolsWithPrices = STAKING_POOLS.map(pool => {
      const priceData = prices.find(p => p.symbol === pool.tokenSymbol);
      return {
        ...pool,
        currentPrice: priceData?.price || 0,
        change24h: priceData?.change24h || 0
      };
    });

    return poolsWithPrices;
  } catch (error) {
    logger.error(`Get available pools error: ${error.message}`);
    throw error;
  }
};

/**
 * Create new stake
 */
const createStake = async ({ userId, walletAddress, tokenAddress, amount, duration }) => {
  try {
    // Find pool configuration
    const pool = STAKING_POOLS.find(p => p.tokenAddress.toLowerCase() === tokenAddress.toLowerCase());

    if (!pool) {
      throw new Error('Invalid staking pool');
    }

    // Validate amount
    const amountDecimal = parseFloat(amount);
    if (amountDecimal < parseFloat(pool.minStake)) {
      throw new Error(`Minimum stake amount is ${pool.minStake} ${pool.tokenSymbol}`);
    }

    // Validate duration
    if (duration < pool.minDuration || duration > pool.maxDuration) {
      throw new Error(`Duration must be between ${pool.minDuration} and ${pool.maxDuration} days`);
    }

    // Calculate end date
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + duration);

    // Create stake
    const stake = await Stake.create({
      userId,
      walletAddress,
      tokenAddress,
      tokenSymbol: pool.tokenSymbol,
      amount,
      amountDecimal,
      apy: pool.apy,
      duration,
      startDate,
      endDate,
      status: 'active'
    });

    // Update user's total staked
    await User.findByIdAndUpdate(userId, {
      $inc: { totalStaked: amountDecimal }
    });

    // Create transaction record
    await Transaction.create({
      userId,
      type: 'stake',
      from: walletAddress,
      to: tokenAddress,
      amount,
      amountDecimal,
      tokenAddress,
      tokenSymbol: pool.tokenSymbol,
      status: 'confirmed',
      metadata: {
        stakeId: stake._id,
        duration,
        apy: pool.apy
      }
    });

    logger.info(`Stake created: ${stake._id} for user ${userId}`);

    return stake;
  } catch (error) {
    logger.error(`Create stake error: ${error.message}`);
    throw error;
  }
};

/**
 * Unstake tokens
 */
const unstake = async (stakeId, userId) => {
  try {
    const stake = await Stake.findOne({ _id: stakeId, userId });

    if (!stake) {
      throw new Error('Stake not found');
    }

    if (stake.status !== 'active') {
      throw new Error('Stake is not active');
    }

    // Calculate final rewards
    const rewards = stake.calculateRewards();

    // Update stake status
    stake.status = 'withdrawn';
    stake.withdrawnAt = new Date();
    await stake.save();

    // Update user's total staked and earned
    await User.findByIdAndUpdate(userId, {
      $inc: {
        totalStaked: -stake.amountDecimal,
        totalEarned: rewards.earned
      }
    });

    // Create transaction record
    await Transaction.create({
      userId,
      type: 'unstake',
      from: stake.tokenAddress,
      to: stake.walletAddress,
      amount: stake.amount,
      amountDecimal: stake.amountDecimal,
      tokenAddress: stake.tokenAddress,
      tokenSymbol: stake.tokenSymbol,
      status: 'confirmed',
      metadata: {
        stakeId: stake._id,
        rewards: rewards.earned
      }
    });

    logger.info(`Unstaked: ${stakeId} for user ${userId}`);

    return {
      stake,
      rewards,
      totalReturned: stake.amountDecimal + rewards.earned
    };
  } catch (error) {
    logger.error(`Unstake error: ${error.message}`);
    throw error;
  }
};

/**
 * Claim rewards without unstaking
 */
const claimRewards = async (stakeId, userId) => {
  try {
    const stake = await Stake.findOne({ _id: stakeId, userId });

    if (!stake) {
      throw new Error('Stake not found');
    }

    if (stake.status !== 'active') {
      throw new Error('Stake is not active');
    }

    // Calculate current rewards
    const rewards = stake.calculateRewards();
    const claimableRewards = rewards.pending;

    if (claimableRewards <= 0) {
      throw new Error('No rewards to claim');
    }

    // Update stake rewards
    stake.rewards.claimed += claimableRewards;
    stake.rewards.pending = 0;
    await stake.save();

    // Update user's total earned
    await User.findByIdAndUpdate(userId, {
      $inc: { totalEarned: claimableRewards }
    });

    // Create transaction record
    await Transaction.create({
      userId,
      type: 'claim',
      from: stake.tokenAddress,
      to: stake.walletAddress,
      amount: claimableRewards.toString(),
      amountDecimal: claimableRewards,
      tokenAddress: stake.tokenAddress,
      tokenSymbol: stake.tokenSymbol,
      status: 'confirmed',
      metadata: {
        stakeId: stake._id,
        rewardsClaimed: claimableRewards
      }
    });

    logger.info(`Rewards claimed: ${claimableRewards} for stake ${stakeId}`);

    return {
      claimedAmount: claimableRewards,
      remainingStake: stake.amountDecimal
    };
  } catch (error) {
    logger.error(`Claim rewards error: ${error.message}`);
    throw error;
  }
};

module.exports = {
  getAvailablePools,
  createStake,
  unstake,
  claimRewards
};
