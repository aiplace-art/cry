const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transaction.controller');
const { verifyToken } = require('../middleware/auth');

// All routes require authentication
router.use(verifyToken);

/**
 * @route   GET /api/v1/transactions
 * @desc    Get user's transaction history
 * @access  Private
 */
router.get('/', transactionController.getTransactionHistory);

/**
 * @route   GET /api/v1/transactions/:txHash
 * @desc    Get transaction details
 * @access  Private
 */
router.get('/:txHash', transactionController.getTransactionDetails);

/**
 * @route   POST /api/v1/transactions/track
 * @desc    Track a new transaction
 * @access  Private
 */
router.post('/track', transactionController.trackTransaction);

/**
 * @route   GET /api/v1/transactions/stats/summary
 * @desc    Get transaction statistics
 * @access  Private
 */
router.get('/stats/summary', transactionController.getTransactionStats);

module.exports = router;
