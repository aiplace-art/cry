const express = require('express');
const router = express.Router();
const aiController = require('../controllers/ai.controller');
const { verifyToken } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');

/**
 * @route   POST /api/v1/ai/predict
 * @desc    Get AI price prediction
 * @access  Private
 */
router.post('/predict', verifyToken, validate(schemas.aiPrediction), aiController.getPricePrediction);

/**
 * @route   GET /api/v1/ai/signals/:symbol
 * @desc    Get trading signals for token
 * @access  Private
 */
router.get('/signals/:symbol', verifyToken, aiController.getTradingSignals);

/**
 * @route   GET /api/v1/ai/sentiment/:symbol
 * @desc    Get sentiment analysis for token
 * @access  Public
 */
router.get('/sentiment/:symbol', aiController.getSentimentAnalysis);

/**
 * @route   GET /api/v1/ai/market-analysis
 * @desc    Get AI market analysis
 * @access  Private
 */
router.get('/market-analysis', verifyToken, aiController.getMarketAnalysis);

/**
 * @route   POST /api/v1/ai/portfolio-advice
 * @desc    Get AI portfolio recommendations
 * @access  Private
 */
router.post('/portfolio-advice', verifyToken, aiController.getPortfolioAdvice);

module.exports = router;
