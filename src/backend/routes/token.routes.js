const express = require('express');
const router = express.Router();
const tokenController = require('../controllers/token.controller');
const { verifyToken } = require('../middleware/auth');

/**
 * @route   GET /api/v1/tokens/prices
 * @desc    Get token prices
 * @access  Public
 */
router.get('/prices', tokenController.getTokenPrices);

/**
 * @route   GET /api/v1/tokens/:symbol
 * @desc    Get specific token details
 * @access  Public
 */
router.get('/:symbol', tokenController.getTokenDetails);

/**
 * @route   GET /api/v1/tokens/:symbol/history
 * @desc    Get token price history
 * @access  Public
 */
router.get('/:symbol/history', tokenController.getPriceHistory);

/**
 * @route   GET /api/v1/tokens/trending
 * @desc    Get trending tokens
 * @access  Public
 */
router.get('/trending/list', tokenController.getTrendingTokens);

/**
 * @route   GET /api/v1/tokens/user/portfolio
 * @desc    Get user's token portfolio
 * @access  Private
 */
router.get('/user/portfolio', verifyToken, tokenController.getUserPortfolio);

module.exports = router;
