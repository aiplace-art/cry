const mongoose = require('mongoose');

const aiPredictionSchema = new mongoose.Schema({
  tokenSymbol: {
    type: String,
    required: true,
    uppercase: true,
    index: true
  },
  timeframe: {
    type: String,
    enum: ['1h', '4h', '24h', '7d', '30d'],
    required: true
  },
  currentPrice: {
    type: Number,
    required: true
  },
  predictedPrice: {
    type: Number,
    required: true
  },
  confidence: {
    type: Number,
    min: 0,
    max: 100,
    required: true
  },
  trend: {
    type: String,
    enum: ['bullish', 'bearish', 'neutral'],
    required: true
  },
  signals: {
    buy: { type: Number, min: 0, max: 100 },
    sell: { type: Number, min: 0, max: 100 },
    hold: { type: Number, min: 0, max: 100 }
  },
  technicalIndicators: {
    rsi: { type: Number },
    macd: { type: mongoose.Schema.Types.Mixed },
    sma: { type: mongoose.Schema.Types.Mixed },
    ema: { type: mongoose.Schema.Types.Mixed }
  },
  sentimentScore: {
    type: Number,
    min: -1,
    max: 1
  },
  analysis: {
    type: String
  },
  modelVersion: {
    type: String,
    default: '1.0.0'
  },
  accuracy: {
    type: Number,
    min: 0,
    max: 100
  },
  validUntil: {
    type: Date,
    required: true,
    index: true
  }
}, {
  timestamps: true
});

// Indexes
aiPredictionSchema.index({ tokenSymbol: 1, timeframe: 1, createdAt: -1 });
aiPredictionSchema.index({ validUntil: 1 });

// TTL index
aiPredictionSchema.index({ validUntil: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('AIPrediction', aiPredictionSchema);
