/**
 * Request Validation Middleware for Referral System
 */

const { ethers } = require('ethers');

const validationSchemas = {
  // Auth validations
  generateNonce: (body) => {
    const errors = [];

    if (!body.walletAddress) {
      errors.push({ field: 'walletAddress', message: 'Wallet address is required' });
    } else if (!ethers.isAddress(body.walletAddress)) {
      errors.push({ field: 'walletAddress', message: 'Invalid wallet address format' });
    }

    return errors;
  },

  verifyWeb3: (body) => {
    const errors = [];

    if (!body.walletAddress) {
      errors.push({ field: 'walletAddress', message: 'Wallet address is required' });
    } else if (!ethers.isAddress(body.walletAddress)) {
      errors.push({ field: 'walletAddress', message: 'Invalid wallet address format' });
    }

    if (!body.signature) {
      errors.push({ field: 'signature', message: 'Signature is required' });
    }

    if (body.referrerCode && typeof body.referrerCode !== 'string') {
      errors.push({ field: 'referrerCode', message: 'Invalid referrer code format' });
    }

    return errors;
  },

  register: (body) => {
    const errors = [];

    if (!body.email) {
      errors.push({ field: 'email', message: 'Email is required' });
    } else if (!body.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      errors.push({ field: 'email', message: 'Invalid email format' });
    }

    if (!body.password) {
      errors.push({ field: 'password', message: 'Password is required' });
    } else if (body.password.length < 8) {
      errors.push({ field: 'password', message: 'Password must be at least 8 characters' });
    }

    if (body.referrerCode && typeof body.referrerCode !== 'string') {
      errors.push({ field: 'referrerCode', message: 'Invalid referrer code format' });
    }

    return errors;
  },

  login: (body) => {
    const errors = [];

    if (!body.email) {
      errors.push({ field: 'email', message: 'Email is required' });
    }

    if (!body.password) {
      errors.push({ field: 'password', message: 'Password is required' });
    }

    return errors;
  },

  // Referral validations
  registerReferral: (body) => {
    const errors = [];

    if (!body.referrerCode) {
      errors.push({ field: 'referrerCode', message: 'Referrer code is required' });
    } else if (typeof body.referrerCode !== 'string') {
      errors.push({ field: 'referrerCode', message: 'Invalid referrer code format' });
    }

    return errors;
  },

  claimRewards: (body) => {
    const errors = [];

    if (!body.rewardType) {
      errors.push({ field: 'rewardType', message: 'Reward type is required' });
    } else if (!['tokens', 'usdt'].includes(body.rewardType)) {
      errors.push({ field: 'rewardType', message: 'Reward type must be "tokens" or "usdt"' });
    }

    if (!body.rewardIds) {
      errors.push({ field: 'rewardIds', message: 'Reward IDs are required' });
    } else if (!Array.isArray(body.rewardIds)) {
      errors.push({ field: 'rewardIds', message: 'Reward IDs must be an array' });
    } else if (body.rewardIds.length === 0) {
      errors.push({ field: 'rewardIds', message: 'At least one reward ID is required' });
    }

    return errors;
  },

  // Purchase validations
  recordPurchase: (body) => {
    const errors = [];

    if (!body.txHash) {
      errors.push({ field: 'txHash', message: 'Transaction hash is required' });
    } else if (!body.txHash.match(/^0x[a-fA-F0-9]{64}$/)) {
      errors.push({ field: 'txHash', message: 'Invalid transaction hash format' });
    }

    if (!body.amountUsd) {
      errors.push({ field: 'amountUsd', message: 'USD amount is required' });
    } else if (isNaN(body.amountUsd) || parseFloat(body.amountUsd) <= 0) {
      errors.push({ field: 'amountUsd', message: 'Invalid USD amount' });
    }

    if (!body.amountTokens) {
      errors.push({ field: 'amountTokens', message: 'Token amount is required' });
    } else if (isNaN(body.amountTokens) || parseFloat(body.amountTokens) <= 0) {
      errors.push({ field: 'amountTokens', message: 'Invalid token amount' });
    }

    if (!body.tokenPrice) {
      errors.push({ field: 'tokenPrice', message: 'Token price is required' });
    } else if (isNaN(body.tokenPrice) || parseFloat(body.tokenPrice) <= 0) {
      errors.push({ field: 'tokenPrice', message: 'Invalid token price' });
    }

    if (body.referrerCode && typeof body.referrerCode !== 'string') {
      errors.push({ field: 'referrerCode', message: 'Invalid referrer code format' });
    }

    return errors;
  },

  confirmPurchase: (body) => {
    const errors = [];

    if (!body.blockNumber) {
      errors.push({ field: 'blockNumber', message: 'Block number is required' });
    } else if (isNaN(body.blockNumber) || parseInt(body.blockNumber) <= 0) {
      errors.push({ field: 'blockNumber', message: 'Invalid block number' });
    }

    return errors;
  }
};

/**
 * Validation middleware factory
 */
const validateRequest = (schemaName) => {
  return (req, res, next) => {
    const schema = validationSchemas[schemaName];

    if (!schema) {
      return next(new Error(`Validation schema "${schemaName}" not found`));
    }

    const errors = schema(req.body);

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors
      });
    }

    next();
  };
};

module.exports = {
  validateRequest,
  validationSchemas
};
