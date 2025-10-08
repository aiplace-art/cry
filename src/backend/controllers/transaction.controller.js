const Transaction = require('../models/Transaction');
const transactionService = require('../services/transaction.service');
const { logger } = require('../config/logger');

/**
 * Get user's transaction history
 */
const getTransactionHistory = async (req, res) => {
  try {
    const userId = req.userId;
    const { type, status, limit = 50, offset = 0, sort = '-createdAt' } = req.query;

    const query = { userId };
    if (type) query.type = type;
    if (status) query.status = status;

    const transactions = await Transaction.find(query)
      .sort(sort)
      .limit(parseInt(limit))
      .skip(parseInt(offset))
      .lean();

    const total = await Transaction.countDocuments(query);

    res.json({
      transactions,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: total > parseInt(offset) + parseInt(limit)
      }
    });
  } catch (error) {
    logger.error(`Get transaction history error: ${error.message}`);
    res.status(500).json({ error: 'Failed to fetch transaction history' });
  }
};

/**
 * Get transaction details
 */
const getTransactionDetails = async (req, res) => {
  try {
    const { txHash } = req.params;
    const userId = req.userId;

    const transaction = await Transaction.findOne({ txHash, userId });

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    res.json({ transaction });
  } catch (error) {
    logger.error(`Get transaction details error: ${error.message}`);
    res.status(500).json({ error: 'Failed to fetch transaction details' });
  }
};

/**
 * Track a new transaction
 */
const trackTransaction = async (req, res) => {
  try {
    const userId = req.userId;
    const transactionData = req.body;

    const transaction = await transactionService.trackTransaction({
      ...transactionData,
      userId
    });

    res.status(201).json({
      message: 'Transaction tracked successfully',
      transaction
    });
  } catch (error) {
    logger.error(`Track transaction error: ${error.message}`);
    res.status(500).json({ error: 'Failed to track transaction' });
  }
};

/**
 * Get transaction statistics
 */
const getTransactionStats = async (req, res) => {
  try {
    const userId = req.userId;
    const { timeframe = '30d' } = req.query;

    const stats = await transactionService.getTransactionStats(userId, timeframe);

    res.json({ stats });
  } catch (error) {
    logger.error(`Get transaction stats error: ${error.message}`);
    res.status(500).json({ error: 'Failed to fetch transaction statistics' });
  }
};

module.exports = {
  getTransactionHistory,
  getTransactionDetails,
  trackTransaction,
  getTransactionStats
};
