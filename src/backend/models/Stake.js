const mongoose = require('mongoose');

const stakeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  walletAddress: {
    type: String,
    required: true,
    lowercase: true
  },
  tokenAddress: {
    type: String,
    required: true,
    lowercase: true
  },
  tokenSymbol: {
    type: String,
    required: true
  },
  amount: {
    type: String,
    required: true
  },
  amountDecimal: {
    type: Number,
    required: true
  },
  apy: {
    type: Number,
    required: true,
    default: 5.0
  },
  duration: {
    type: Number,
    required: true, // in days
    min: 1,
    max: 365
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'withdrawn', 'cancelled'],
    default: 'active',
    index: true
  },
  rewards: {
    earned: { type: Number, default: 0 },
    claimed: { type: Number, default: 0 },
    pending: { type: Number, default: 0 }
  },
  transactionHash: {
    type: String,
    sparse: true
  },
  withdrawnAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes
stakeSchema.index({ userId: 1, status: 1 });
stakeSchema.index({ endDate: 1 });
stakeSchema.index({ tokenAddress: 1 });

// Calculate rewards
stakeSchema.methods.calculateRewards = function() {
  const now = new Date();
  const timeStaked = Math.min(now - this.startDate, this.endDate - this.startDate);
  const daysStaked = timeStaked / (1000 * 60 * 60 * 24);
  const yearlyReward = this.amountDecimal * (this.apy / 100);
  const earnedRewards = (yearlyReward / 365) * daysStaked;

  this.rewards.earned = earnedRewards;
  this.rewards.pending = earnedRewards - this.rewards.claimed;

  return this.rewards;
};

// Auto-update status
stakeSchema.pre('save', function(next) {
  if (this.status === 'active' && new Date() >= this.endDate) {
    this.status = 'completed';
  }
  next();
});

module.exports = mongoose.model('Stake', stakeSchema);
