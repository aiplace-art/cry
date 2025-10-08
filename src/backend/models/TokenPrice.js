const mongoose = require('mongoose');

const tokenPriceSchema = new mongoose.Schema({
  symbol: {
    type: String,
    required: true,
    uppercase: true,
    index: true
  },
  address: {
    type: String,
    lowercase: true,
    sparse: true
  },
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'USD'
  },
  marketCap: {
    type: Number
  },
  volume24h: {
    type: Number
  },
  change24h: {
    type: Number
  },
  change7d: {
    type: Number
  },
  high24h: {
    type: Number
  },
  low24h: {
    type: Number
  },
  circulatingSupply: {
    type: Number
  },
  totalSupply: {
    type: Number
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
    index: true
  },
  source: {
    type: String,
    enum: ['coingecko', 'binance', 'coinmarketcap', 'manual'],
    default: 'coingecko'
  }
}, {
  timestamps: true
});

// Compound index for symbol and currency
tokenPriceSchema.index({ symbol: 1, currency: 1 });
tokenPriceSchema.index({ lastUpdated: -1 });

// TTL index - automatically delete documents older than 1 hour
tokenPriceSchema.index({ lastUpdated: 1 }, { expireAfterSeconds: 3600 });

module.exports = mongoose.model('TokenPrice', tokenPriceSchema);
