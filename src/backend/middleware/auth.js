const jwt = require('jsonwebtoken');
const { ethers } = require('ethers');
const { logger } = require('../config/logger');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

/**
 * Verify JWT token middleware
 */
const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'No token provided'
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    req.walletAddress = decoded.walletAddress;
    req.email = decoded.email;

    next();
  } catch (error) {
    logger.error(`Token verification failed: ${error.message}`);
    return res.status(401).json({
      success: false,
      error: 'Invalid or expired token'
    });
  }
};

/**
 * Verify Web3 wallet signature
 */
const verifyWalletSignature = async (walletAddress, message, signature) => {
  try {
    const recoveredAddress = ethers.verifyMessage(message, signature);
    return recoveredAddress.toLowerCase() === walletAddress.toLowerCase();
  } catch (error) {
    logger.error(`Wallet signature verification failed: ${error.message}`);
    return false;
  }
};

/**
 * Generate authentication nonce for wallet
 */
const generateNonce = () => {
  return `Sign this message to authenticate with Crypto Platform: ${Math.random().toString(36).substring(2, 15)}`;
};

/**
 * Role-based access control middleware
 */
const authorize = (...roles) => {
  return async (req, res, next) => {
    try {
      const user = await User.findById(req.userId);

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      if (!roles.includes(user.role)) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }

      next();
    } catch (error) {
      logger.error(`Authorization failed: ${error.message}`);
      return res.status(500).json({ error: 'Authorization error' });
    }
  };
};

module.exports = {
  verifyToken,
  verifyWalletSignature,
  generateNonce,
  authorize
};
