const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analytics.controller');
const { verifyToken } = require('../middleware/auth');

// All routes require authentication
router.use(verifyToken);

/**
 * @route   GET /api/v1/analytics/portfolio
 * @desc    Get portfolio analytics
 * @access  Private
 */
router.get('/portfolio', analyticsController.getPortfolioAnalytics);

/**
 * @route   GET /api/v1/analytics/performance
 * @desc    Get performance metrics
 * @access  Private
 */
router.get('/performance', analyticsController.getPerformanceMetrics);

/**
 * @route   GET /api/v1/analytics/pnl
 * @desc    Get profit and loss analysis
 * @access  Private
 */
router.get('/pnl', analyticsController.getPnLAnalysis);

/**
 * @route   GET /api/v1/analytics/staking
 * @desc    Get staking analytics
 * @access  Private
 */
router.get('/staking', analyticsController.getStakingAnalytics);

/**
 * @route   GET /api/v1/analytics/market
 * @desc    Get market analytics
 * @access  Public
 */
router.get('/market', analyticsController.getMarketAnalytics);

module.exports = router;
