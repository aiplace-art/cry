/**
 * Referral Routes - All referral system endpoints
 */

const express = require('express');
const router = express.Router();
const referralController = require('../controllers/referral.controller');
const authController = require('../controllers/auth.controller');
const purchaseController = require('../controllers/purchase.controller');
const dashboardController = require('../controllers/dashboard.controller');
const { verifyToken } = require('../middleware/auth');
const { validateRequest } = require('../middleware/referral-validation');
const rateLimiter = require('../middleware/rateLimiter');

// ======================
// AUTH ROUTES
// ======================

// Web3 Authentication
router.post('/auth/web3/nonce',
  rateLimiter.authLimiter,
  validateRequest('generateNonce'),
  authController.generateNonce.bind(authController)
);

router.post('/auth/web3/verify',
  rateLimiter.authLimiter,
  validateRequest('verifyWeb3'),
  authController.verifyWeb3Signature.bind(authController)
);

// Web2 Authentication (Email/Password)
router.post('/auth/register',
  rateLimiter.authLimiter,
  validateRequest('register'),
  authController.register.bind(authController)
);

router.post('/auth/login',
  rateLimiter.authLimiter,
  validateRequest('login'),
  authController.login.bind(authController)
);

router.post('/auth/logout',
  verifyToken,
  authController.logout.bind(authController)
);

router.get('/auth/me',
  verifyToken,
  authController.getCurrentUser.bind(authController)
);

// ======================
// REFERRAL ROUTES
// ======================

// Get user's referral code
router.get('/referral/code',
  verifyToken,
  referralController.getReferralCode.bind(referralController)
);

// Register referral relationship
router.post('/referral/register',
  verifyToken,
  validateRequest('registerReferral'),
  referralController.registerReferral.bind(referralController)
);

// Get referral statistics
router.get('/referral/stats',
  verifyToken,
  referralController.getStats.bind(referralController)
);

// Get referral list
router.get('/referral/list',
  verifyToken,
  referralController.getReferralList.bind(referralController)
);

// Get pending rewards
router.get('/referral/rewards/pending',
  verifyToken,
  referralController.getPendingRewards.bind(referralController)
);

// Claim rewards
router.post('/referral/claim',
  verifyToken,
  rateLimiter.claimLimiter,
  validateRequest('claimRewards'),
  referralController.claimRewards.bind(referralController)
);

// Get referral chain
router.get('/referral/chain',
  verifyToken,
  referralController.getReferralChain.bind(referralController)
);

// Validate referral code (public)
router.get('/referral/validate/:code',
  referralController.validateCode.bind(referralController)
);

// Get leaderboard (public)
router.get('/referral/leaderboard',
  rateLimiter.publicLimiter,
  referralController.getLeaderboard.bind(referralController)
);

// ======================
// PURCHASE ROUTES
// ======================

// Record purchase
router.post('/purchase/record',
  verifyToken,
  rateLimiter.purchaseLimiter,
  validateRequest('recordPurchase'),
  purchaseController.recordPurchase.bind(purchaseController)
);

// Confirm purchase
router.post('/purchase/confirm/:purchaseId',
  verifyToken,
  validateRequest('confirmPurchase'),
  purchaseController.confirmPurchase.bind(purchaseController)
);

// Get purchase history
router.get('/purchase/history',
  verifyToken,
  purchaseController.getPurchaseHistory.bind(purchaseController)
);

// Verify blockchain transaction (public)
router.get('/purchase/verify/:txHash',
  rateLimiter.publicLimiter,
  purchaseController.verifyTransaction.bind(purchaseController)
);

// Get purchase by transaction hash
router.get('/purchase/by-tx/:txHash',
  verifyToken,
  purchaseController.getPurchaseByTxHash.bind(purchaseController)
);

// ======================
// DASHBOARD ROUTES
// ======================

// Get dashboard overview
router.get('/dashboard/overview',
  verifyToken,
  dashboardController.getOverview.bind(dashboardController)
);

// Get earnings breakdown
router.get('/dashboard/earnings',
  verifyToken,
  dashboardController.getEarnings.bind(dashboardController)
);

// Get referral analytics
router.get('/dashboard/referrals',
  verifyToken,
  dashboardController.getReferralAnalytics.bind(dashboardController)
);

// Get statistics summary
router.get('/dashboard/stats',
  verifyToken,
  dashboardController.getStatsSummary.bind(dashboardController)
);

// Get recent activity
router.get('/dashboard/activity',
  verifyToken,
  dashboardController.getRecentActivity.bind(dashboardController)
);

module.exports = router;
