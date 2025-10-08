const User = require('../models/User');
const Stake = require('../models/Stake');
const Transaction = require('../models/Transaction');
const { logger } = require('../config/logger');

/**
 * Get user profile
 */
const getProfile = async (req, res) => {
  try {
    const userId = req.userId;

    const user = await User.findById(userId).select('-nonce');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    logger.error(`Get profile error: ${error.message}`);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

/**
 * Update user profile
 */
const updateProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const { preferences } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: { preferences } },
      { new: true, runValidators: true }
    ).select('-nonce');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    logger.error(`Update profile error: ${error.message}`);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

/**
 * Get user dashboard data
 */
const getDashboard = async (req, res) => {
  try {
    const userId = req.userId;

    // Get user data
    const user = await User.findById(userId).select('-nonce');

    // Get active stakes
    const activeStakes = await Stake.find({ userId, status: 'active' })
      .sort({ createdAt: -1 })
      .limit(5);

    // Calculate total rewards
    let totalPendingRewards = 0;
    activeStakes.forEach(stake => {
      const rewards = stake.calculateRewards();
      totalPendingRewards += rewards.pending;
    });

    // Get recent transactions
    const recentTransactions = await Transaction.find({ userId })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    // Get transaction stats
    const transactionStats = await Transaction.aggregate([
      { $match: { userId: user._id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      user: {
        walletAddress: user.walletAddress,
        portfolioValue: user.portfolioValue,
        totalStaked: user.totalStaked,
        totalEarned: user.totalEarned,
        preferences: user.preferences
      },
      stakes: {
        active: activeStakes.length,
        totalPendingRewards
      },
      transactions: {
        recent: recentTransactions,
        stats: transactionStats
      }
    });
  } catch (error) {
    logger.error(`Get dashboard error: ${error.message}`);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  getDashboard
};
