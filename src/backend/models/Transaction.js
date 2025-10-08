const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  txHash: {
    type: String,
    unique: true,
    sparse: true,
    index: true
  },
  type: {
    type: String,
    enum: ['transfer', 'swap', 'stake', 'unstake', 'claim', 'deposit', 'withdraw'],
    required: true,
    index: true
  },
  from: {
    type: String,
    required: true,
    lowercase: true
  },
  to: {
    type: String,
    required: true,
    lowercase: true
  },
  amount: {
    type: String,
    required: true
  },
  amountDecimal: {
    type: Number,
    required: true
  },
  tokenAddress: {
    type: String,
    lowercase: true
  },
  tokenSymbol: {
    type: String
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'failed', 'cancelled'],
    default: 'pending',
    index: true
  },
  blockNumber: {
    type: Number
  },
  gasUsed: {
    type: String
  },
  gasPrice: {
    type: String
  },
  fee: {
    type: Number,
    default: 0
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  error: {
    type: String
  }
}, {
  timestamps: true
});

// Indexes
transactionSchema.index({ userId: 1, createdAt: -1 });
transactionSchema.index({ type: 1, status: 1 });
transactionSchema.index({ tokenAddress: 1 });
transactionSchema.index({ createdAt: -1 });

// Virtual for USD value
transactionSchema.virtual('usdValue').get(function() {
  return this.metadata?.usdValue || 0;
});

module.exports = mongoose.model('Transaction', transactionSchema);
