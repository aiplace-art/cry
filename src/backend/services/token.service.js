const axios = require('axios');
const TokenPrice = require('../models/TokenPrice');
const { logger } = require('../config/logger');

/**
 * Fetch token prices from CoinGecko
 */
const fetchPricesFromCoinGecko = async (symbols, currency = 'USD') => {
  try {
    const ids = symbols.map(s => s.toLowerCase()).join(',');
    const response = await axios.get('https://api.coingecko.com/api/v3/coins/markets', {
      params: {
        vs_currency: currency.toLowerCase(),
        ids,
        order: 'market_cap_desc',
        per_page: 100,
        page: 1,
        sparkline: false,
        price_change_percentage: '24h,7d'
      }
    });

    return response.data.map(token => ({
      symbol: token.symbol.toUpperCase(),
      name: token.name,
      price: token.current_price,
      currency,
      marketCap: token.market_cap,
      volume24h: token.total_volume,
      change24h: token.price_change_percentage_24h,
      change7d: token.price_change_percentage_7d_in_currency,
      high24h: token.high_24h,
      low24h: token.low_24h,
      circulatingSupply: token.circulating_supply,
      totalSupply: token.total_supply,
      source: 'coingecko',
      lastUpdated: new Date()
    }));
  } catch (error) {
    logger.error(`CoinGecko API error: ${error.message}`);
    throw error;
  }
};

/**
 * Get token prices with caching
 */
const getTokenPrices = async (symbols, currency = 'USD') => {
  try {
    const cacheExpiry = new Date(Date.now() - 5 * 60 * 1000); // 5 minutes

    // Try to get from cache first
    const cachedPrices = await TokenPrice.find({
      symbol: { $in: symbols.map(s => s.toUpperCase()) },
      currency: currency.toUpperCase(),
      lastUpdated: { $gte: cacheExpiry }
    });

    // If all prices are cached, return them
    if (cachedPrices.length === symbols.length) {
      return cachedPrices;
    }

    // Fetch missing prices
    const freshPrices = await fetchPricesFromCoinGecko(symbols, currency);

    // Update cache
    const bulkOps = freshPrices.map(price => ({
      updateOne: {
        filter: { symbol: price.symbol, currency: price.currency },
        update: { $set: price },
        upsert: true
      }
    }));

    if (bulkOps.length > 0) {
      await TokenPrice.bulkWrite(bulkOps);
    }

    return freshPrices;
  } catch (error) {
    logger.error(`Get token prices error: ${error.message}`);
    // Fallback to cached data if API fails
    const fallbackPrices = await TokenPrice.find({
      symbol: { $in: symbols.map(s => s.toUpperCase()) },
      currency: currency.toUpperCase()
    }).sort({ lastUpdated: -1 });

    return fallbackPrices;
  }
};

/**
 * Get specific token details
 */
const getTokenDetails = async (symbol, currency = 'USD') => {
  try {
    const prices = await getTokenPrices([symbol], currency);
    return prices[0] || null;
  } catch (error) {
    logger.error(`Get token details error: ${error.message}`);
    return null;
  }
};

/**
 * Get token price history
 */
const getPriceHistory = async (symbol, timeframe = '24h', interval = '1h') => {
  try {
    // This would typically fetch from a time-series database or external API
    // For now, returning mock data structure
    const dataPoints = [];
    const now = Date.now();
    const intervals = {
      '1h': 60 * 60 * 1000,
      '4h': 4 * 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000
    };

    const timeframeMs = intervals[timeframe] || intervals['24h'];
    const intervalMs = intervals[interval] || intervals['1h'];
    const points = Math.floor(timeframeMs / intervalMs);

    // Get current price
    const currentPrice = await getTokenDetails(symbol);

    if (!currentPrice) {
      throw new Error('Token not found');
    }

    // Generate historical data points (mock)
    for (let i = points; i >= 0; i--) {
      const timestamp = now - (i * intervalMs);
      const variance = (Math.random() - 0.5) * 0.05; // +/- 5% variance
      const price = currentPrice.price * (1 + variance);

      dataPoints.push({
        timestamp,
        price,
        volume: currentPrice.volume24h / points * (1 + (Math.random() - 0.5) * 0.3)
      });
    }

    return {
      symbol: symbol.toUpperCase(),
      timeframe,
      interval,
      data: dataPoints
    };
  } catch (error) {
    logger.error(`Get price history error: ${error.message}`);
    throw error;
  }
};

/**
 * Get trending tokens
 */
const getTrendingTokens = async (limit = 10) => {
  try {
    const trending = await TokenPrice.find({})
      .sort({ change24h: -1 })
      .limit(limit)
      .lean();

    return trending;
  } catch (error) {
    logger.error(`Get trending tokens error: ${error.message}`);
    return [];
  }
};

/**
 * Get user's token portfolio
 */
const getUserPortfolio = async (userId) => {
  try {
    const Transaction = require('../models/Transaction');

    // Aggregate user's token balances
    const balances = await Transaction.aggregate([
      {
        $match: {
          userId: userId,
          status: 'confirmed',
          type: { $in: ['transfer', 'deposit', 'withdraw', 'swap'] }
        }
      },
      {
        $group: {
          _id: '$tokenSymbol',
          totalIn: {
            $sum: {
              $cond: [
                { $eq: ['$to', '$walletAddress'] },
                '$amountDecimal',
                0
              ]
            }
          },
          totalOut: {
            $sum: {
              $cond: [
                { $eq: ['$from', '$walletAddress'] },
                '$amountDecimal',
                0
              ]
            }
          }
        }
      },
      {
        $project: {
          symbol: '$_id',
          balance: { $subtract: ['$totalIn', '$totalOut'] }
        }
      },
      {
        $match: {
          balance: { $gt: 0 }
        }
      }
    ]);

    // Get current prices for all tokens
    const symbols = balances.map(b => b.symbol).filter(Boolean);
    const prices = await getTokenPrices(symbols);

    // Calculate portfolio value
    const portfolio = balances.map(balance => {
      const priceData = prices.find(p => p.symbol === balance.symbol);
      const value = balance.balance * (priceData?.price || 0);

      return {
        symbol: balance.symbol,
        balance: balance.balance,
        price: priceData?.price || 0,
        value,
        change24h: priceData?.change24h || 0
      };
    });

    const totalValue = portfolio.reduce((sum, token) => sum + token.value, 0);

    return {
      tokens: portfolio,
      totalValue,
      tokenCount: portfolio.length
    };
  } catch (error) {
    logger.error(`Get user portfolio error: ${error.message}`);
    return {
      tokens: [],
      totalValue: 0,
      tokenCount: 0
    };
  }
};

module.exports = {
  getTokenPrices,
  getTokenDetails,
  getPriceHistory,
  getTrendingTokens,
  getUserPortfolio
};
