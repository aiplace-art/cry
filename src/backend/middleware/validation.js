const Joi = require('joi');
const { ethers } = require('ethers');

/**
 * Validate Ethereum address
 */
const ethereumAddressSchema = Joi.string().custom((value, helpers) => {
  if (!ethers.isAddress(value)) {
    return helpers.error('any.invalid');
  }
  return value;
}, 'Ethereum address validation');

/**
 * Validation schemas
 */
const schemas = {
  // Authentication
  walletAuth: Joi.object({
    walletAddress: ethereumAddressSchema.required(),
    signature: Joi.string().required(),
    message: Joi.string().required()
  }),

  // Staking
  createStake: Joi.object({
    tokenAddress: ethereumAddressSchema.required(),
    amount: Joi.string().pattern(/^\d+$/).required(),
    duration: Joi.number().integer().min(1).max(365).required()
  }),

  unstake: Joi.object({
    stakeId: Joi.string().required()
  }),

  // Transactions
  createTransaction: Joi.object({
    from: ethereumAddressSchema.required(),
    to: ethereumAddressSchema.required(),
    amount: Joi.string().pattern(/^\d+$/).required(),
    tokenAddress: ethereumAddressSchema.optional(),
    type: Joi.string().valid('transfer', 'swap', 'stake', 'unstake').required()
  }),

  // Token price feeds
  tokenQuery: Joi.object({
    symbols: Joi.alternatives().try(
      Joi.string(),
      Joi.array().items(Joi.string())
    ).required(),
    currency: Joi.string().default('USD')
  }),

  // AI predictions
  aiPrediction: Joi.object({
    tokenSymbol: Joi.string().required(),
    timeframe: Joi.string().valid('1h', '4h', '24h', '7d', '30d').required(),
    includeAnalysis: Joi.boolean().default(true)
  })
};

/**
 * Validation middleware factory
 */
const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        error: 'Validation Error',
        details: errors
      });
    }

    req.validatedBody = value;
    next();
  };
};

module.exports = {
  validate,
  schemas
};
