const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { verifyWalletSignature, generateNonce } = require('../middleware/auth');
const { logger } = require('../config/logger');

/**
 * Get authentication nonce for wallet address
 */
const getNonce = async (req, res) => {
  try {
    const { walletAddress } = req.params;

    if (!walletAddress) {
      return res.status(400).json({ error: 'Wallet address is required' });
    }

    // Find or create user
    let user = await User.findOne({ walletAddress: walletAddress.toLowerCase() });

    if (!user) {
      const nonce = generateNonce();
      user = await User.create({
        walletAddress: walletAddress.toLowerCase(),
        nonce
      });
    } else {
      // Update nonce for existing user
      user.nonce = generateNonce();
      await user.save();
    }

    res.json({
      nonce: user.nonce,
      walletAddress: user.walletAddress
    });
  } catch (error) {
    logger.error(`Get nonce error: ${error.message}`);
    res.status(500).json({ error: 'Failed to generate nonce' });
  }
};

/**
 * Verify wallet signature and authenticate user
 */
const verifyAndAuthenticate = async (req, res) => {
  try {
    const { walletAddress, signature, message } = req.validatedBody;

    // Find user
    const user = await User.findOne({ walletAddress: walletAddress.toLowerCase() });

    if (!user) {
      return res.status(404).json({ error: 'User not found. Please request a nonce first.' });
    }

    // Verify signature
    const isValid = await verifyWalletSignature(walletAddress, message, signature);

    if (!isValid) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    // Check if message matches stored nonce
    if (message !== user.nonce) {
      return res.status(401).json({ error: 'Invalid nonce' });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user._id,
        walletAddress: user.walletAddress,
        role: user.role
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    // Update last login
    await user.updateLastLogin();

    // Generate new nonce for next authentication
    user.nonce = generateNonce();
    await user.save();

    res.json({
      token,
      user: {
        id: user._id,
        walletAddress: user.walletAddress,
        role: user.role,
        portfolioValue: user.portfolioValue,
        totalStaked: user.totalStaked,
        totalEarned: user.totalEarned
      }
    });
  } catch (error) {
    logger.error(`Authentication error: ${error.message}`);
    res.status(500).json({ error: 'Authentication failed' });
  }
};

/**
 * Logout user (client-side token removal)
 */
const logout = async (req, res) => {
  try {
    // In a stateless JWT system, logout is handled client-side
    // Optionally, you could implement a token blacklist here
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    logger.error(`Logout error: ${error.message}`);
    res.status(500).json({ error: 'Logout failed' });
  }
};

module.exports = {
  getNonce,
  verifyAndAuthenticate,
  logout
};
