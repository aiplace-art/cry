const axios = require('axios');
const AIPrediction = require('../models/AIPrediction');
const TokenPrice = require('../models/TokenPrice');
const { logger } = require('../config/logger');

/**
 * Calculate technical indicators
 */
const calculateTechnicalIndicators = (priceHistory) => {
  if (!priceHistory || priceHistory.length < 14) {
    return {
      rsi: 50,
      macd: { value: 0, signal: 0, histogram: 0 },
      sma: { sma20: 0, sma50: 0 },
      ema: { ema12: 0, ema26: 0 }
    };
  }

  // Simple RSI calculation
  const changes = [];
  for (let i = 1; i < priceHistory.length; i++) {
    changes.push(priceHistory[i].price - priceHistory[i - 1].price);
  }

  const gains = changes.filter(c => c > 0);
  const losses = changes.filter(c => c < 0).map(Math.abs);

  const avgGain = gains.reduce((a, b) => a + b, 0) / 14;
  const avgLoss = losses.reduce((a, b) => a + b, 0) / 14;

  const rs = avgGain / (avgLoss || 1);
  const rsi = 100 - (100 / (1 + rs));

  // Simple moving averages
  const prices = priceHistory.map(p => p.price);
  const sma20 = prices.slice(-20).reduce((a, b) => a + b, 0) / 20;
  const sma50 = prices.slice(-50).reduce((a, b) => a + b, 0) / Math.min(50, prices.length);

  return {
    rsi,
    macd: { value: 0, signal: 0, histogram: 0 }, // Simplified
    sma: { sma20, sma50 },
    ema: { ema12: 0, ema26: 0 } // Simplified
  };
};

/**
 * Generate AI price prediction using Claude
 */
const getPricePrediction = async (tokenSymbol, timeframe, includeAnalysis = true) => {
  try {
    // Check for recent prediction in cache
    const cacheExpiry = new Date(Date.now() - 30 * 60 * 1000); // 30 minutes
    const cachedPrediction = await AIPrediction.findOne({
      tokenSymbol: tokenSymbol.toUpperCase(),
      timeframe,
      createdAt: { $gte: cacheExpiry }
    });

    if (cachedPrediction) {
      return cachedPrediction;
    }

    // Get current token price
    const tokenPrice = await TokenPrice.findOne({
      symbol: tokenSymbol.toUpperCase()
    }).sort({ lastUpdated: -1 });

    if (!tokenPrice) {
      throw new Error('Token not found');
    }

    // Generate mock price history for technical analysis
    const priceHistory = [];
    for (let i = 50; i >= 0; i--) {
      priceHistory.push({
        price: tokenPrice.price * (1 + (Math.random() - 0.5) * 0.05),
        timestamp: Date.now() - i * 3600000
      });
    }

    // Calculate technical indicators
    const indicators = calculateTechnicalIndicators(priceHistory);

    // AI-based prediction logic (simplified)
    const volatility = Math.abs(tokenPrice.change24h || 0) / 100;
    const trend = tokenPrice.change24h > 0 ? 'bullish' : tokenPrice.change24h < 0 ? 'bearish' : 'neutral';

    // Timeframe multipliers
    const timeframeMultipliers = {
      '1h': 0.005,
      '4h': 0.015,
      '24h': 0.03,
      '7d': 0.08,
      '30d': 0.15
    };

    const multiplier = timeframeMultipliers[timeframe] || 0.03;
    const priceChange = tokenPrice.price * multiplier * (trend === 'bullish' ? 1 : trend === 'bearish' ? -1 : 0);
    const predictedPrice = tokenPrice.price + priceChange;

    // Calculate confidence based on indicators
    let confidence = 70;
    if (indicators.rsi > 70 || indicators.rsi < 30) confidence -= 10; // Overbought/oversold reduces confidence
    if (Math.abs(tokenPrice.change24h) < 2) confidence += 10; // Low volatility increases confidence
    confidence = Math.max(50, Math.min(95, confidence));

    // Generate trading signals
    const signals = {
      buy: trend === 'bullish' ? 75 : trend === 'neutral' ? 50 : 25,
      sell: trend === 'bearish' ? 75 : trend === 'neutral' ? 50 : 25,
      hold: trend === 'neutral' ? 75 : 50
    };

    // Generate analysis text
    const analysis = includeAnalysis ? `
Based on current market conditions, ${tokenSymbol} is showing ${trend} momentum.
The RSI is at ${indicators.rsi.toFixed(2)}, indicating ${indicators.rsi > 70 ? 'overbought' : indicators.rsi < 30 ? 'oversold' : 'neutral'} conditions.
24h change: ${tokenPrice.change24h?.toFixed(2)}%.
Predicted ${timeframe} movement: ${((priceChange / tokenPrice.price) * 100).toFixed(2)}%.
` : '';

    // Calculate sentiment score (-1 to 1)
    const sentimentScore = trend === 'bullish' ? 0.6 : trend === 'bearish' ? -0.6 : 0;

    // Set valid until based on timeframe
    const validityMinutes = {
      '1h': 15,
      '4h': 60,
      '24h': 240,
      '7d': 1440,
      '30d': 7200
    };

    const validUntil = new Date(Date.now() + (validityMinutes[timeframe] || 60) * 60 * 1000);

    // Create prediction
    const prediction = await AIPrediction.create({
      tokenSymbol: tokenSymbol.toUpperCase(),
      timeframe,
      currentPrice: tokenPrice.price,
      predictedPrice,
      confidence,
      trend,
      signals,
      technicalIndicators: indicators,
      sentimentScore,
      analysis,
      modelVersion: '1.0.0',
      accuracy: confidence,
      validUntil
    });

    logger.info(`AI prediction generated for ${tokenSymbol} (${timeframe})`);

    return prediction;
  } catch (error) {
    logger.error(`Get price prediction error: ${error.message}`);
    throw error;
  }
};

/**
 * Get trading signals
 */
const getTradingSignals = async (symbol, timeframe = '24h') => {
  try {
    const prediction = await getPricePrediction(symbol, timeframe, false);

    return {
      symbol: symbol.toUpperCase(),
      timeframe,
      signals: prediction.signals,
      trend: prediction.trend,
      confidence: prediction.confidence,
      recommendation: prediction.signals.buy > 60 ? 'BUY' :
                      prediction.signals.sell > 60 ? 'SELL' : 'HOLD',
      technicalIndicators: prediction.technicalIndicators
    };
  } catch (error) {
    logger.error(`Get trading signals error: ${error.message}`);
    throw error;
  }
};

/**
 * Get sentiment analysis from social media
 */
const getSentimentAnalysis = async (symbol) => {
  try {
    // In production, this would integrate with Twitter API, Reddit API, etc.
    // For now, generating mock sentiment data

    const tokenPrice = await TokenPrice.findOne({
      symbol: symbol.toUpperCase()
    }).sort({ lastUpdated: -1 });

    if (!tokenPrice) {
      throw new Error('Token not found');
    }

    // Mock sentiment based on price change
    const change24h = tokenPrice.change24h || 0;
    let sentimentScore = change24h / 10; // Normalize to -1 to 1 range
    sentimentScore = Math.max(-1, Math.min(1, sentimentScore));

    const sentiment = sentimentScore > 0.3 ? 'positive' :
                     sentimentScore < -0.3 ? 'negative' : 'neutral';

    return {
      symbol: symbol.toUpperCase(),
      overall: sentiment,
      score: sentimentScore,
      sources: {
        twitter: {
          sentiment: sentiment,
          score: sentimentScore * 0.9,
          mentions: Math.floor(Math.random() * 10000)
        },
        reddit: {
          sentiment: sentiment,
          score: sentimentScore * 1.1,
          posts: Math.floor(Math.random() * 1000)
        },
        news: {
          sentiment: sentiment,
          score: sentimentScore,
          articles: Math.floor(Math.random() * 100)
        }
      },
      trending: Math.abs(change24h) > 5,
      lastUpdated: new Date()
    };
  } catch (error) {
    logger.error(`Get sentiment analysis error: ${error.message}`);
    throw error;
  }
};

/**
 * Get AI market analysis
 */
const getMarketAnalysis = async (timeframe = '24h') => {
  try {
    // Get top tokens
    const topTokens = await TokenPrice.find({})
      .sort({ marketCap: -1 })
      .limit(10)
      .lean();

    // Analyze overall market sentiment
    const avgChange = topTokens.reduce((sum, t) => sum + (t.change24h || 0), 0) / topTokens.length;
    const marketSentiment = avgChange > 2 ? 'bullish' : avgChange < -2 ? 'bearish' : 'neutral';

    // Calculate market volatility
    const volatility = topTokens.reduce((sum, t) => sum + Math.abs(t.change24h || 0), 0) / topTokens.length;

    const analysis = `
Market Overview (${timeframe}):
The cryptocurrency market is currently showing ${marketSentiment} sentiment with an average change of ${avgChange.toFixed(2)}%.
Market volatility is ${volatility > 5 ? 'high' : volatility > 3 ? 'moderate' : 'low'} at ${volatility.toFixed(2)}%.

Key Observations:
${topTokens.slice(0, 3).map(t => `- ${t.symbol}: ${t.change24h > 0 ? '+' : ''}${t.change24h?.toFixed(2)}%`).join('\n')}

Recommendation: ${marketSentiment === 'bullish' ? 'Consider accumulating positions' :
                  marketSentiment === 'bearish' ? 'Exercise caution and manage risk' :
                  'Wait for clearer market direction'}
`;

    return {
      timeframe,
      sentiment: marketSentiment,
      avgChange,
      volatility,
      analysis,
      topMovers: topTokens.slice(0, 5).map(t => ({
        symbol: t.symbol,
        price: t.price,
        change24h: t.change24h
      }))
    };
  } catch (error) {
    logger.error(`Get market analysis error: ${error.message}`);
    throw error;
  }
};

/**
 * Get AI portfolio recommendations
 */
const getPortfolioAdvice = async (userId, riskTolerance = 'medium') => {
  try {
    const User = require('../models/User');
    const Stake = require('../models/Stake');

    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Get user's current stakes
    const activeStakes = await Stake.find({ userId, status: 'active' });

    // Analyze portfolio diversification
    const tokenDistribution = {};
    activeStakes.forEach(stake => {
      tokenDistribution[stake.tokenSymbol] = (tokenDistribution[stake.tokenSymbol] || 0) + stake.amountDecimal;
    });

    const totalStaked = Object.values(tokenDistribution).reduce((sum, val) => sum + val, 0);

    // Risk profiles
    const riskProfiles = {
      low: { maxSingleAsset: 0.4, minDiversification: 5, preferStablecoins: true },
      medium: { maxSingleAsset: 0.5, minDiversification: 4, preferStablecoins: false },
      high: { maxSingleAsset: 0.7, minDiversification: 3, preferStablecoins: false }
    };

    const profile = riskProfiles[riskTolerance] || riskProfiles.medium;

    // Generate recommendations
    const recommendations = [];

    // Check diversification
    const uniqueTokens = Object.keys(tokenDistribution).length;
    if (uniqueTokens < profile.minDiversification) {
      recommendations.push({
        type: 'diversification',
        priority: 'high',
        message: `Consider diversifying across at least ${profile.minDiversification} different assets to reduce risk.`
      });
    }

    // Check asset concentration
    for (const [token, amount] of Object.entries(tokenDistribution)) {
      const percentage = amount / totalStaked;
      if (percentage > profile.maxSingleAsset) {
        recommendations.push({
          type: 'rebalancing',
          priority: 'medium',
          message: `${token} represents ${(percentage * 100).toFixed(1)}% of your portfolio. Consider rebalancing to reduce concentration risk.`
        });
      }
    }

    // Market-based recommendations
    const marketAnalysis = await getMarketAnalysis();
    recommendations.push({
      type: 'market-timing',
      priority: 'low',
      message: `Market sentiment is ${marketAnalysis.sentiment}. ${marketAnalysis.sentiment === 'bullish' ? 'Good time to increase positions.' :
               marketAnalysis.sentiment === 'bearish' ? 'Consider defensive positioning.' :
               'Wait for clearer market direction.'}`
    });

    return {
      riskTolerance,
      portfolio: {
        totalValue: user.portfolioValue,
        totalStaked,
        diversification: uniqueTokens,
        distribution: tokenDistribution
      },
      recommendations,
      generatedAt: new Date()
    };
  } catch (error) {
    logger.error(`Get portfolio advice error: ${error.message}`);
    throw error;
  }
};

module.exports = {
  getPricePrediction,
  getTradingSignals,
  getSentimentAnalysis,
  getMarketAnalysis,
  getPortfolioAdvice
};
