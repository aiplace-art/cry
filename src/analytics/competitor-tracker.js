const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

class CompetitorTracker {
  constructor(config) {
    this.config = config;
    this.dataDir = path.join(__dirname, 'data', 'competitors');
  }

  async initialize() {
    await fs.mkdir(this.dataDir, { recursive: true });
  }

  async trackCompetitor(competitor) {
    console.log(`Tracking competitor: ${competitor.name}`);

    try {
      const data = {
        timestamp: Date.now(),
        name: competitor.name,
        symbol: competitor.symbol,
        metrics: await this.fetchAllMetrics(competitor),
      };

      // Save to file
      const filename = `${competitor.symbol}-${Date.now()}.json`;
      await fs.writeFile(
        path.join(this.dataDir, filename),
        JSON.stringify(data, null, 2)
      );

      return data;
    } catch (error) {
      console.error(`Error tracking ${competitor.name}:`, error.message);
      return null;
    }
  }

  async fetchAllMetrics(competitor) {
    const [priceData, socialData] = await Promise.all([
      this.fetchPriceData(competitor),
      this.fetchSocialData(competitor),
    ]);

    return {
      ...priceData,
      ...socialData,
    };
  }

  async fetchPriceData(competitor) {
    try {
      const response = await axios.get(
        `https://api.coingecko.com/api/v3/coins/${competitor.coingecko_id}`,
        {
          headers: this.config.coingecko_api_key
            ? { 'x-cg-pro-api-key': this.config.coingecko_api_key }
            : {},
        }
      );

      const data = response.data;
      return {
        price: data.market_data.current_price.usd,
        marketCap: data.market_data.market_cap.usd,
        volume24h: data.market_data.total_volume.usd,
        priceChange24h: data.market_data.price_change_percentage_24h,
        priceChange7d: data.market_data.price_change_percentage_7d,
        holders: data.community_data?.twitter_followers || 0,
      };
    } catch (error) {
      console.error(`Price data error for ${competitor.name}:`, error.message);
      return {
        price: 0,
        marketCap: 0,
        volume24h: 0,
        priceChange24h: 0,
        priceChange7d: 0,
        holders: 0,
      };
    }
  }

  async fetchSocialData(competitor) {
    const social = {
      twitterFollowers: 0,
      telegramMembers: 0,
    };

    // Twitter
    if (competitor.twitter && this.config.twitter_bearer_token) {
      try {
        const response = await axios.get(
          `https://api.twitter.com/2/users/by/username/${competitor.twitter.replace('@', '')}`,
          {
            headers: {
              Authorization: `Bearer ${this.config.twitter_bearer_token}`,
            },
            params: {
              'user.fields': 'public_metrics',
            },
          }
        );
        social.twitterFollowers = response.data.data.public_metrics.followers_count;
      } catch (error) {
        console.error(`Twitter error for ${competitor.name}:`, error.message);
      }
    }

    // Telegram
    if (competitor.telegram && this.config.telegram_bot_token) {
      try {
        const response = await axios.get(
          `https://api.telegram.org/bot${this.config.telegram_bot_token}/getChatMembersCount`,
          {
            params: {
              chat_id: competitor.telegram,
            },
          }
        );
        social.telegramMembers = response.data.result;
      } catch (error) {
        console.error(`Telegram error for ${competitor.name}:`, error.message);
      }
    }

    return social;
  }

  async generateComparison() {
    console.log('Generating competitor comparison...');

    const files = await fs.readdir(this.dataDir);
    const latestData = new Map();

    // Get latest data for each competitor
    for (const file of files) {
      if (!file.endsWith('.json')) continue;

      const data = JSON.parse(
        await fs.readFile(path.join(this.dataDir, file), 'utf-8')
      );

      if (
        !latestData.has(data.symbol) ||
        latestData.get(data.symbol).timestamp < data.timestamp
      ) {
        latestData.set(data.symbol, data);
      }
    }

    // Generate comparison matrix
    const comparison = {
      timestamp: Date.now(),
      competitors: Array.from(latestData.values()),
      rankings: {
        byMarketCap: this.rankBy(latestData, 'metrics.marketCap'),
        byVolume: this.rankBy(latestData, 'metrics.volume24h'),
        byTwitter: this.rankBy(latestData, 'metrics.twitterFollowers'),
        byTelegram: this.rankBy(latestData, 'metrics.telegramMembers'),
      },
    };

    // Save comparison
    await fs.writeFile(
      path.join(__dirname, 'data', 'competitor-comparison.json'),
      JSON.stringify(comparison, null, 2)
    );

    console.log('Comparison generated successfully');
    return comparison;
  }

  rankBy(dataMap, metric) {
    return Array.from(dataMap.values())
      .sort((a, b) => {
        const aVal = this.getNestedValue(a, metric);
        const bVal = this.getNestedValue(b, metric);
        return bVal - aVal;
      })
      .map((item, index) => ({
        rank: index + 1,
        name: item.name,
        symbol: item.symbol,
        value: this.getNestedValue(item, metric),
      }));
  }

  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => current?.[key], obj) || 0;
  }
}

// Main execution
async function main() {
  const config = require('./metrics-config.json');

  const tracker = new CompetitorTracker({
    coingecko_api_key: process.env.COINGECKO_API_KEY,
    twitter_bearer_token: process.env.TWITTER_BEARER_TOKEN,
    telegram_bot_token: process.env.TELEGRAM_BOT_TOKEN,
  });

  await tracker.initialize();

  // Track all competitors
  for (const competitor of config.competitors) {
    await tracker.trackCompetitor(competitor);
    // Rate limiting
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  // Generate comparison
  await tracker.generateComparison();

  console.log('Competitor tracking complete!');
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = CompetitorTracker;
