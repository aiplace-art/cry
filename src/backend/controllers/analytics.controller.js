const analyticsService = require('../services/analytics.service');
const { logger } = require('../config/logger');

/**
 * Get portfolio analytics
 */
const getPortfolioAnalytics = async (req, res) => {
  try {
    const userId = req.userId;
    const { timeframe = '30d' } = req.query;

    const analytics = await analyticsService.getPortfolioAnalytics(userId, timeframe);

    res.json({ analytics });
  } catch (error) {
    logger.error(`Get portfolio analytics error: ${error.message}`);
    res.status(500).json({ error: 'Failed to fetch portfolio analytics' });
  }
};

/**
 * Get performance metrics
 */
const getPerformanceMetrics = async (req, res) => {
  try {
    const userId = req.userId;
    const { timeframe = '30d' } = req.query;

    const metrics = await analyticsService.getPerformanceMetrics(userId, timeframe);

    res.json({ metrics });
  } catch (error) {
    logger.error(`Get performance metrics error: ${error.message}`);
    res.status(500).json({ error: 'Failed to fetch performance metrics' });
  }
};

/**
 * Get profit and loss analysis
 */
const getPnLAnalysis = async (req, res) => {
  try {
    const userId = req.userId;
    const { timeframe = '30d' } = req.query;

    const pnl = await analyticsService.getPnLAnalysis(userId, timeframe);

    res.json({ pnl });
  } catch (error) {
    logger.error(`Get PnL analysis error: ${error.message}`);
    res.status(500).json({ error: 'Failed to fetch P&L analysis' });
  }
};

/**
 * Get staking analytics
 */
const getStakingAnalytics = async (req, res) => {
  try {
    const userId = req.userId;

    const analytics = await analyticsService.getStakingAnalytics(userId);

    res.json({ analytics });
  } catch (error) {
    logger.error(`Get staking analytics error: ${error.message}`);
    res.status(500).json({ error: 'Failed to fetch staking analytics' });
  }
};

/**
 * Get market analytics
 */
const getMarketAnalytics = async (req, res) => {
  try {
    const { timeframe = '24h' } = req.query;

    const analytics = await analyticsService.getMarketAnalytics(timeframe);

    res.json({ analytics });
  } catch (error) {
    logger.error(`Get market analytics error: ${error.message}`);
    res.status(500).json({ error: 'Failed to fetch market analytics' });
  }
};

module.exports = {
  getPortfolioAnalytics,
  getPerformanceMetrics,
  getPnLAnalysis,
  getStakingAnalytics,
  getMarketAnalytics
};
