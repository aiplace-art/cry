const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { validate, schemas } = require('../middleware/validation');

/**
 * @route   GET /api/v1/auth/nonce/:walletAddress
 * @desc    Get authentication nonce for wallet
 * @access  Public
 */
router.get('/nonce/:walletAddress', authController.getNonce);

/**
 * @route   POST /api/v1/auth/verify
 * @desc    Verify wallet signature and authenticate
 * @access  Public
 */
router.post('/verify', validate(schemas.walletAuth), authController.verifyAndAuthenticate);

/**
 * @route   POST /api/v1/auth/logout
 * @desc    Logout user
 * @access  Private
 */
router.post('/logout', authController.logout);

module.exports = router;
