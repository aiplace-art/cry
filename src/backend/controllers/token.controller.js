const tokenService = require('../services/token.service');
const { logger } = require('../config/logger');

/**
 * Get token prices
 */
const getTokenPrices = async (req, res) => {
  try {
    const { symbols, currency = 'USD' } = req.query;

    if (!symbols) {
      return res.status(400).json({ error: 'Symbols parameter is required' });
    }

    const symbolArray = Array.isArray(symbols) ? symbols : symbols.split(',');
    const prices = await tokenService.getTokenPrices(symbolArray, currency);

    res.json({ prices });
  } catch (error) {
    logger.error(`Get token prices error: ${error.message}`);
    res.status(500).json({ error: 'Failed to fetch token prices' });
  }
};

/**
 * Get specific token details
 */
const getTokenDetails = async (req, res) => {
  try {
    const { symbol } = req.params;
    const { currency = 'USD' } = req.query;

    const tokenDetails = await tokenService.getTokenDetails(symbol, currency);

    if (!tokenDetails) {
      return res.status(404).json({ error: 'Token not found' });
    }

    res.json({ token: tokenDetails });
  } catch (error) {
    logger.error(`Get token details error: ${error.message}`);
    res.status(500).json({ error: 'Failed to fetch token details' });
  }
};

/**
 * Get token price history
 */
const getPriceHistory = async (req, res) => {
  try {
    const { symbol } = req.params;
    const { timeframe = '24h', interval = '1h' } = req.query;

    const history = await tokenService.getPriceHistory(symbol, timeframe, interval);

    res.json({ history });
  } catch (error) {
    logger.error(`Get price history error: ${error.message}`);
    res.status(500).json({ error: 'Failed to fetch price history' });
  }
};

/**
 * Get trending tokens
 */
const getTrendingTokens = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const trending = await tokenService.getTrendingTokens(parseInt(limit));

    res.json({ trending });
  } catch (error) {
    logger.error(`Get trending tokens error: ${error.message}`);
    res.status(500).json({ error: 'Failed to fetch trending tokens' });
  }
};

/**
 * Get user's token portfolio
 */
const getUserPortfolio = async (req, res) => {
  try {
    const userId = req.userId;

    const portfolio = await tokenService.getUserPortfolio(userId);

    res.json({ portfolio });
  } catch (error) {
    logger.error(`Get user portfolio error: ${error.message}`);
    res.status(500).json({ error: 'Failed to fetch portfolio' });
  }
};

module.exports = {
  getTokenPrices,
  getTokenDetails,
  getPriceHistory,
  getTrendingTokens,
  getUserPortfolio
};
