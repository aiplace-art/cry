const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  walletAddress: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    index: true
  },
  nonce: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'trader'],
    default: 'user'
  },
  preferences: {
    currency: { type: String, default: 'USD' },
    notifications: { type: Boolean, default: true },
    theme: { type: String, enum: ['light', 'dark'], default: 'dark' }
  },
  portfolioValue: {
    type: Number,
    default: 0
  },
  totalStaked: {
    type: Number,
    default: 0
  },
  totalEarned: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes
userSchema.index({ createdAt: -1 });
userSchema.index({ isActive: 1 });

// Methods
userSchema.methods.updatePortfolioValue = async function(value) {
  this.portfolioValue = value;
  return this.save();
};

userSchema.methods.updateLastLogin = async function() {
  this.lastLogin = new Date();
  return this.save();
};

module.exports = mongoose.model('User', userSchema);
