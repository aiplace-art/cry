const aiService = require('../services/ai.service');
const { logger } = require('../config/logger');

/**
 * Get AI price prediction
 */
const getPricePrediction = async (req, res) => {
  try {
    const { tokenSymbol, timeframe, includeAnalysis } = req.validatedBody;

    const prediction = await aiService.getPricePrediction(tokenSymbol, timeframe, includeAnalysis);

    res.json({ prediction });
  } catch (error) {
    logger.error(`Get price prediction error: ${error.message}`);
    res.status(500).json({ error: 'Failed to generate price prediction' });
  }
};

/**
 * Get trading signals
 */
const getTradingSignals = async (req, res) => {
  try {
    const { symbol } = req.params;
    const { timeframe = '24h' } = req.query;

    const signals = await aiService.getTradingSignals(symbol, timeframe);

    res.json({ signals });
  } catch (error) {
    logger.error(`Get trading signals error: ${error.message}`);
    res.status(500).json({ error: 'Failed to generate trading signals' });
  }
};

/**
 * Get sentiment analysis
 */
const getSentimentAnalysis = async (req, res) => {
  try {
    const { symbol } = req.params;

    const sentiment = await aiService.getSentimentAnalysis(symbol);

    res.json({ sentiment });
  } catch (error) {
    logger.error(`Get sentiment analysis error: ${error.message}`);
    res.status(500).json({ error: 'Failed to fetch sentiment analysis' });
  }
};

/**
 * Get AI market analysis
 */
const getMarketAnalysis = async (req, res) => {
  try {
    const { timeframe = '24h' } = req.query;

    const analysis = await aiService.getMarketAnalysis(timeframe);

    res.json({ analysis });
  } catch (error) {
    logger.error(`Get market analysis error: ${error.message}`);
    res.status(500).json({ error: 'Failed to generate market analysis' });
  }
};

/**
 * Get AI portfolio recommendations
 */
const getPortfolioAdvice = async (req, res) => {
  try {
    const userId = req.userId;
    const { riskTolerance = 'medium' } = req.body;

    const advice = await aiService.getPortfolioAdvice(userId, riskTolerance);

    res.json({ advice });
  } catch (error) {
    logger.error(`Get portfolio advice error: ${error.message}`);
    res.status(500).json({ error: 'Failed to generate portfolio advice' });
  }
};

module.exports = {
  getPricePrediction,
  getTradingSignals,
  getSentimentAnalysis,
  getMarketAnalysis,
  getPortfolioAdvice
};
