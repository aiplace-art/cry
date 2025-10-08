const User = require('../models/User');
const Stake = require('../models/Stake');
const Transaction = require('../models/Transaction');
const TokenPrice = require('../models/TokenPrice');
const { logger } = require('../config/logger');

/**
 * Get portfolio analytics
 */
const getPortfolioAnalytics = async (userId, timeframe = '30d') => {
  try {
    const user = await User.findById(userId);

    if (!user) {
      throw new Error('User not found');
    }

    // Get all active stakes
    const activeStakes = await Stake.find({ userId, status: 'active' });

    // Calculate total staked value and pending rewards
    let totalStakedValue = 0;
    let totalPendingRewards = 0;

    activeStakes.forEach(stake => {
      totalStakedValue += stake.amountDecimal;
      const rewards = stake.calculateRewards();
      totalPendingRewards += rewards.pending;
    });

    // Get transaction volume for timeframe
    const timeframes = { '7d': 7, '30d': 30, '90d': 90, '1y': 365 };
    const days = timeframes[timeframe] || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const volumeStats = await Transaction.aggregate([
      {
        $match: {
          userId: user._id,
          createdAt: { $gte: startDate },
          status: 'confirmed'
        }
      },
      {
        $group: {
          _id: null,
          totalVolume: { $sum: '$amountDecimal' },
          transactionCount: { $sum: 1 }
        }
      }
    ]);

    const volume = volumeStats[0] || { totalVolume: 0, transactionCount: 0 };

    return {
      portfolioValue: user.portfolioValue,
      totalStaked: totalStakedValue,
      totalEarned: user.totalEarned,
      pendingRewards: totalPendingRewards,
      activeStakes: activeStakes.length,
      transactionVolume: volume.totalVolume,
      transactionCount: volume.transactionCount,
      timeframe
    };
  } catch (error) {
    logger.error(`Get portfolio analytics error: ${error.message}`);
    throw error;
  }
};

/**
 * Get performance metrics
 */
const getPerformanceMetrics = async (userId, timeframe = '30d') => {
  try {
    const timeframes = { '7d': 7, '30d': 30, '90d': 90, '1y': 365 };
    const days = timeframes[timeframe] || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get ROI from staking
    const stakingROI = await Stake.aggregate([
      {
        $match: {
          userId: userId,
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          totalInvested: { $sum: '$amountDecimal' },
          totalEarned: { $sum: '$rewards.earned' }
        }
      }
    ]);

    const staking = stakingROI[0] || { totalInvested: 0, totalEarned: 0 };
    const stakingROIPercent = staking.totalInvested > 0
      ? (staking.totalEarned / staking.totalInvested) * 100
      : 0;

    // Get transaction success rate
    const transactionMetrics = await Transaction.aggregate([
      {
        $match: {
          userId: userId,
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalTx = transactionMetrics.reduce((sum, m) => sum + m.count, 0);
    const confirmedTx = transactionMetrics.find(m => m._id === 'confirmed')?.count || 0;
    const successRate = totalTx > 0 ? (confirmedTx / totalTx) * 100 : 0;

    return {
      timeframe,
      staking: {
        totalInvested: staking.totalInvested,
        totalEarned: staking.totalEarned,
        roi: stakingROIPercent
      },
      transactions: {
        total: totalTx,
        confirmed: confirmedTx,
        successRate
      }
    };
  } catch (error) {
    logger.error(`Get performance metrics error: ${error.message}`);
    throw error;
  }
};

/**
 * Get profit and loss analysis
 */
const getPnLAnalysis = async (userId, timeframe = '30d') => {
  try {
    const timeframes = { '7d': 7, '30d': 30, '90d': 90, '1y': 365 };
    const days = timeframes[timeframe] || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Calculate realized gains from completed stakes
    const realizedGains = await Stake.aggregate([
      {
        $match: {
          userId: userId,
          status: { $in: ['completed', 'withdrawn'] },
          withdrawnAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          totalGains: { $sum: '$rewards.earned' },
          count: { $sum: 1 }
        }
      }
    ]);

    // Calculate unrealized gains from active stakes
    const activeStakes = await Stake.find({
      userId,
      status: 'active',
      createdAt: { $gte: startDate }
    });

    let unrealizedGains = 0;
    activeStakes.forEach(stake => {
      const rewards = stake.calculateRewards();
      unrealizedGains += rewards.pending;
    });

    const realized = realizedGains[0] || { totalGains: 0, count: 0 };

    return {
      timeframe,
      realized: {
        gains: realized.totalGains,
        transactions: realized.count
      },
      unrealized: {
        gains: unrealizedGains,
        activePositions: activeStakes.length
      },
      total: realized.totalGains + unrealizedGains
    };
  } catch (error) {
    logger.error(`Get PnL analysis error: ${error.message}`);
    throw error;
  }
};

/**
 * Get staking analytics
 */
const getStakingAnalytics = async (userId) => {
  try {
    const allStakes = await Stake.find({ userId });

    const analytics = {
      total: allStakes.length,
      active: 0,
      completed: 0,
      withdrawn: 0,
      totalStaked: 0,
      totalEarned: 0,
      averageAPY: 0,
      byToken: {}
    };

    let totalAPY = 0;

    allStakes.forEach(stake => {
      analytics[stake.status]++;
      analytics.totalStaked += stake.amountDecimal;
      analytics.totalEarned += stake.rewards.earned;
      totalAPY += stake.apy;

      // Group by token
      if (!analytics.byToken[stake.tokenSymbol]) {
        analytics.byToken[stake.tokenSymbol] = {
          count: 0,
          totalStaked: 0,
          totalEarned: 0
        };
      }

      analytics.byToken[stake.tokenSymbol].count++;
      analytics.byToken[stake.tokenSymbol].totalStaked += stake.amountDecimal;
      analytics.byToken[stake.tokenSymbol].totalEarned += stake.rewards.earned;
    });

    analytics.averageAPY = allStakes.length > 0 ? totalAPY / allStakes.length : 0;

    return analytics;
  } catch (error) {
    logger.error(`Get staking analytics error: ${error.message}`);
    throw error;
  }
};

/**
 * Get market analytics
 */
const getMarketAnalytics = async (timeframe = '24h') => {
  try {
    // Get top tokens by market cap
    const topTokens = await TokenPrice.find({})
      .sort({ marketCap: -1 })
      .limit(10)
      .lean();

    // Get biggest gainers
    const gainers = await TokenPrice.find({})
      .sort({ change24h: -1 })
      .limit(5)
      .lean();

    // Get biggest losers
    const losers = await TokenPrice.find({})
      .sort({ change24h: 1 })
      .limit(5)
      .lean();

    // Calculate market overview
    const overview = await TokenPrice.aggregate([
      {
        $group: {
          _id: null,
          totalMarketCap: { $sum: '$marketCap' },
          totalVolume24h: { $sum: '$volume24h' },
          avgChange24h: { $avg: '$change24h' }
        }
      }
    ]);

    return {
      timeframe,
      overview: overview[0] || {
        totalMarketCap: 0,
        totalVolume24h: 0,
        avgChange24h: 0
      },
      topTokens,
      gainers,
      losers
    };
  } catch (error) {
    logger.error(`Get market analytics error: ${error.message}`);
    throw error;
  }
};

module.exports = {
  getPortfolioAnalytics,
  getPerformanceMetrics,
  getPnLAnalysis,
  getStakingAnalytics,
  getMarketAnalytics
};
