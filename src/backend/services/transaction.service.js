const Transaction = require('../models/Transaction');
const { logger } = require('../config/logger');

/**
 * Track a new transaction
 */
const trackTransaction = async (transactionData) => {
  try {
    const transaction = await Transaction.create(transactionData);

    logger.info(`Transaction tracked: ${transaction._id}`);

    return transaction;
  } catch (error) {
    logger.error(`Track transaction error: ${error.message}`);
    throw error;
  }
};

/**
 * Get transaction statistics
 */
const getTransactionStats = async (userId, timeframe = '30d') => {
  try {
    // Calculate date range
    const timeframes = {
      '7d': 7,
      '30d': 30,
      '90d': 90,
      '1y': 365
    };

    const days = timeframes[timeframe] || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Aggregate statistics
    const stats = await Transaction.aggregate([
      {
        $match: {
          userId: userId,
          createdAt: { $gte: startDate }
        }
      },
      {
        $facet: {
          byType: [
            {
              $group: {
                _id: '$type',
                count: { $sum: 1 },
                totalAmount: { $sum: '$amountDecimal' }
              }
            }
          ],
          byStatus: [
            {
              $group: {
                _id: '$status',
                count: { $sum: 1 }
              }
            }
          ],
          overall: [
            {
              $group: {
                _id: null,
                totalTransactions: { $sum: 1 },
                totalVolume: { $sum: '$amountDecimal' },
                avgAmount: { $avg: '$amountDecimal' },
                totalFees: { $sum: '$fee' }
              }
            }
          ],
          daily: [
            {
              $group: {
                _id: {
                  $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
                },
                count: { $sum: 1 },
                volume: { $sum: '$amountDecimal' }
              }
            },
            { $sort: { _id: 1 } }
          ]
        }
      }
    ]);

    return {
      timeframe,
      byType: stats[0].byType,
      byStatus: stats[0].byStatus,
      overall: stats[0].overall[0] || {
        totalTransactions: 0,
        totalVolume: 0,
        avgAmount: 0,
        totalFees: 0
      },
      daily: stats[0].daily
    };
  } catch (error) {
    logger.error(`Get transaction stats error: ${error.message}`);
    throw error;
  }
};

/**
 * Update transaction status (e.g., when confirmed on-chain)
 */
const updateTransactionStatus = async (txHash, status, metadata = {}) => {
  try {
    const transaction = await Transaction.findOneAndUpdate(
      { txHash },
      {
        $set: {
          status,
          ...metadata
        }
      },
      { new: true }
    );

    if (!transaction) {
      throw new Error('Transaction not found');
    }

    logger.info(`Transaction ${txHash} updated to ${status}`);

    return transaction;
  } catch (error) {
    logger.error(`Update transaction status error: ${error.message}`);
    throw error;
  }
};

module.exports = {
  trackTransaction,
  getTransactionStats,
  updateTransactionStatus
};
