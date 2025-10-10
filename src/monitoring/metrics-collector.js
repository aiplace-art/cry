const axios = require('axios');
const cron = require('node-cron');
const fs = require('fs').promises;
const path = require('path');
const { ethers } = require('ethers');

class MetricsCollector {
  constructor(config = {}) {
    this.config = {
      // Collection intervals
      collectionInterval: config.collectionInterval || '*/1 * * * *', // Every minute
      hourlyInterval: config.hourlyInterval || '0 * * * *', // Every hour
      dailyInterval: config.dailyInterval || '0 0 * * *', // Every day

      // Token configuration
      tokenAddress: config.tokenAddress || process.env.CONTRACT_ADDRESS,
      rpcUrl: config.rpcUrl || process.env.RPC_URL,
      coingeckoId: config.coingeckoId || 'hypeai',

      // API endpoints
      analyticsUrl: config.analyticsUrl || 'http://localhost:3004/metrics',

      // Storage
      metricsPath: config.metricsPath || path.join(__dirname, '../../data/metrics'),
      retentionDays: config.retentionDays || 90
    };

    this.currentMetrics = null;
    this.isRunning = false;
    this.cronJobs = [];
  }

  /**
   * Start metrics collection
   */
  start() {
    if (this.isRunning) {
      console.log('Metrics collector already running');
      return;
    }

    console.log('📊 Starting Metrics Collector...');

    // Run initial collection
    this.collectMetrics();

    // Schedule regular collections
    this.cronJobs.push(
      cron.schedule(this.config.collectionInterval, () => this.collectMetrics())
    );

    this.cronJobs.push(
      cron.schedule(this.config.hourlyInterval, () => this.generateHourlySummary())
    );

    this.cronJobs.push(
      cron.schedule(this.config.dailyInterval, () => this.generateDailySummary())
    );

    this.isRunning = true;
    console.log('✅ Metrics Collector started');
  }

  /**
   * Stop metrics collection
   */
  stop() {
    this.cronJobs.forEach(job => job.stop());
    this.cronJobs = [];
    this.isRunning = false;
    console.log('🛑 Metrics Collector stopped');
  }

  /**
   * Collect all metrics
   */
  async collectMetrics() {
    const timestamp = new Date().toISOString();
    console.log(`\n📊 Collecting metrics at ${timestamp}`);

    const metrics = {
      timestamp,
      token: {},
      social: {},
      bots: {},
      website: {},
      apis: {}
    };

    try {
      // Collect all metrics in parallel
      const results = await Promise.allSettled([
        this.collectTokenMetrics(),
        this.collectSocialMetrics(),
        this.collectBotMetrics(),
        this.collectWebsiteMetrics(),
        this.collectAPIMetrics()
      ]);

      metrics.token = results[0].status === 'fulfilled' ? results[0].value : {};
      metrics.social = results[1].status === 'fulfilled' ? results[1].value : {};
      metrics.bots = results[2].status === 'fulfilled' ? results[2].value : {};
      metrics.website = results[3].status === 'fulfilled' ? results[3].value : {};
      metrics.apis = results[4].status === 'fulfilled' ? results[4].value : {};

      // Store metrics
      await this.storeMetrics(metrics);

      this.currentMetrics = metrics;
      console.log('✅ Metrics collection complete');

    } catch (error) {
      console.error('❌ Metrics collection failed:', error.message);
    }

    return metrics;
  }

  /**
   * Collect token metrics
   */
  async collectTokenMetrics() {
    const metrics = {
      price: 0,
      priceChange24h: 0,
      volume24h: 0,
      marketCap: 0,
      holderCount: 0,
      totalSupply: 0,
      circulatingSupply: 0
    };

    try {
      // Get price data from CoinGecko
      if (this.config.coingeckoId) {
        try {
          const response = await axios.get(
            `https://api.coingecko.com/api/v3/coins/${this.config.coingeckoId}`,
            { timeout: 10000 }
          );

          const data = response.data;
          metrics.price = data.market_data?.current_price?.usd || 0;
          metrics.priceChange24h = data.market_data?.price_change_percentage_24h || 0;
          metrics.volume24h = data.market_data?.total_volume?.usd || 0;
          metrics.marketCap = data.market_data?.market_cap?.usd || 0;
          metrics.circulatingSupply = data.market_data?.circulating_supply || 0;
          metrics.totalSupply = data.market_data?.total_supply || 0;
        } catch (error) {
          console.log('CoinGecko data not available:', error.message);
        }
      }

      // Get on-chain data
      if (this.config.tokenAddress && this.config.rpcUrl) {
        try {
          const provider = new ethers.JsonRpcProvider(this.config.rpcUrl);
          const tokenABI = [
            'function totalSupply() view returns (uint256)',
            'function balanceOf(address) view returns (uint256)',
            'function decimals() view returns (uint8)'
          ];

          const contract = new ethers.Contract(
            this.config.tokenAddress,
            tokenABI,
            provider
          );

          const [totalSupply, decimals] = await Promise.all([
            contract.totalSupply(),
            contract.decimals()
          ]);

          metrics.totalSupply = parseFloat(ethers.formatUnits(totalSupply, decimals));

          // Get holder count from Etherscan API if available
          if (process.env.ETHERSCAN_API_KEY) {
            const holderResponse = await axios.get(
              `https://api.etherscan.io/api?module=token&action=tokenholderlist&contractaddress=${this.config.tokenAddress}&apikey=${process.env.ETHERSCAN_API_KEY}`
            );
            if (holderResponse.data.status === '1') {
              metrics.holderCount = holderResponse.data.result.length;
            }
          }
        } catch (error) {
          console.log('On-chain data not available:', error.message);
        }
      }

    } catch (error) {
      console.error('Failed to collect token metrics:', error.message);
    }

    return metrics;
  }

  /**
   * Collect social media metrics
   */
  async collectSocialMetrics() {
    const metrics = {
      twitter: {
        followers: 0,
        tweets24h: 0,
        engagement: 0
      },
      discord: {
        members: 0,
        online: 0,
        messages24h: 0
      },
      telegram: {
        members: 0,
        messages24h: 0
      }
    };

    try {
      // Get Twitter metrics
      if (process.env.TWITTER_BEARER_TOKEN && process.env.TWITTER_ACCOUNT_ID) {
        try {
          const response = await axios.get(
            `https://api.twitter.com/2/users/${process.env.TWITTER_ACCOUNT_ID}?user.fields=public_metrics`,
            {
              headers: { 'Authorization': `Bearer ${process.env.TWITTER_BEARER_TOKEN}` },
              timeout: 10000
            }
          );
          metrics.twitter.followers = response.data.data?.public_metrics?.followers_count || 0;
        } catch (error) {
          console.log('Twitter metrics not available:', error.message);
        }
      }

      // Get Discord metrics from bot
      try {
        const response = await axios.get('http://localhost:3001/metrics', { timeout: 5000 });
        if (response.data) {
          metrics.discord = {
            members: response.data.memberCount || 0,
            online: response.data.onlineCount || 0,
            messages24h: response.data.messages24h || 0
          };
        }
      } catch (error) {
        console.log('Discord metrics not available');
      }

      // Get Telegram metrics from bot
      try {
        const response = await axios.get('http://localhost:3002/metrics', { timeout: 5000 });
        if (response.data) {
          metrics.telegram = {
            members: response.data.memberCount || 0,
            messages24h: response.data.messages24h || 0
          };
        }
      } catch (error) {
        console.log('Telegram metrics not available');
      }

    } catch (error) {
      console.error('Failed to collect social metrics:', error.message);
    }

    return metrics;
  }

  /**
   * Collect bot performance metrics
   */
  async collectBotMetrics() {
    const metrics = {
      discord: { status: 'unknown', uptime: 0, responseTime: 0 },
      telegram: { status: 'unknown', uptime: 0, responseTime: 0 },
      twitter: { status: 'unknown', uptime: 0, responseTime: 0 }
    };

    const bots = [
      { name: 'discord', url: 'http://localhost:3001/health' },
      { name: 'telegram', url: 'http://localhost:3002/health' },
      { name: 'twitter', url: 'http://localhost:3003/health' }
    ];

    for (const bot of bots) {
      try {
        const startTime = Date.now();
        const response = await axios.get(bot.url, { timeout: 5000 });
        const responseTime = Date.now() - startTime;

        metrics[bot.name] = {
          status: response.status === 200 ? 'healthy' : 'degraded',
          uptime: response.data?.uptime || 0,
          responseTime,
          ...response.data
        };
      } catch (error) {
        metrics[bot.name].status = 'down';
      }
    }

    return metrics;
  }

  /**
   * Collect website metrics
   */
  async collectWebsiteMetrics() {
    const metrics = {
      status: 'unknown',
      responseTime: 0,
      pageViews24h: 0,
      uniqueVisitors24h: 0
    };

    try {
      // Check website status
      const startTime = Date.now();
      const response = await axios.get(this.config.analyticsUrl, { timeout: 10000 });
      metrics.responseTime = Date.now() - startTime;
      metrics.status = response.status === 200 ? 'healthy' : 'degraded';

      if (response.data) {
        metrics.pageViews24h = response.data.pageViews24h || 0;
        metrics.uniqueVisitors24h = response.data.uniqueVisitors24h || 0;
      }

    } catch (error) {
      metrics.status = 'down';
      console.log('Website metrics not available:', error.message);
    }

    return metrics;
  }

  /**
   * Collect API response time metrics
   */
  async collectAPIMetrics() {
    const metrics = {};

    const apis = [
      { name: 'CoinGecko', url: 'https://api.coingecko.com/api/v3/ping' },
      { name: 'Etherscan', url: 'https://api.etherscan.io/api?module=stats&action=ethprice' }
    ];

    for (const api of apis) {
      try {
        const startTime = Date.now();
        await axios.get(api.url, { timeout: 5000 });
        metrics[api.name] = {
          status: 'healthy',
          responseTime: Date.now() - startTime
        };
      } catch (error) {
        metrics[api.name] = {
          status: 'down',
          responseTime: 0
        };
      }
    }

    return metrics;
  }

  /**
   * Store metrics to file
   */
  async storeMetrics(metrics) {
    try {
      await fs.mkdir(this.config.metricsPath, { recursive: true });

      // Store in minute-level file
      const date = new Date(metrics.timestamp);
      const filename = `${date.toISOString().split('T')[0]}.json`;
      const filepath = path.join(this.config.metricsPath, 'minute', filename);

      await fs.mkdir(path.dirname(filepath), { recursive: true });

      let dayMetrics = { metrics: [] };
      try {
        const data = await fs.readFile(filepath, 'utf8');
        dayMetrics = JSON.parse(data);
      } catch (error) {
        // File doesn't exist yet
      }

      dayMetrics.metrics.push(metrics);
      await fs.writeFile(filepath, JSON.stringify(dayMetrics, null, 2));

      // Clean old metrics
      await this.cleanOldMetrics();

    } catch (error) {
      console.error('Failed to store metrics:', error.message);
    }
  }

  /**
   * Generate hourly summary
   */
  async generateHourlySummary() {
    console.log('📊 Generating hourly summary...');

    try {
      const now = new Date();
      const hour = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours() - 1);

      // Load minute-level data for the hour
      const filename = `${hour.toISOString().split('T')[0]}.json`;
      const filepath = path.join(this.config.metricsPath, 'minute', filename);

      const data = await fs.readFile(filepath, 'utf8');
      const dayMetrics = JSON.parse(data);

      const hourStart = hour.getTime();
      const hourEnd = hourStart + (60 * 60 * 1000);

      const hourMetrics = dayMetrics.metrics.filter(m => {
        const time = new Date(m.timestamp).getTime();
        return time >= hourStart && time < hourEnd;
      });

      if (hourMetrics.length === 0) return;

      // Calculate aggregates
      const summary = this.calculateSummary(hourMetrics);
      summary.period = 'hour';
      summary.startTime = hour.toISOString();

      // Store hourly summary
      const hourlyPath = path.join(this.config.metricsPath, 'hourly', filename);
      await fs.mkdir(path.dirname(hourlyPath), { recursive: true });

      let hourlySummaries = { summaries: [] };
      try {
        const existing = await fs.readFile(hourlyPath, 'utf8');
        hourlySummaries = JSON.parse(existing);
      } catch (error) {
        // File doesn't exist
      }

      hourlySummaries.summaries.push(summary);
      await fs.writeFile(hourlyPath, JSON.stringify(hourlySummaries, null, 2));

      console.log('✅ Hourly summary generated');

    } catch (error) {
      console.error('Failed to generate hourly summary:', error.message);
    }
  }

  /**
   * Generate daily summary
   */
  async generateDailySummary() {
    console.log('📊 Generating daily summary...');

    try {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const filename = `${yesterday.toISOString().split('T')[0]}.json`;
      const filepath = path.join(this.config.metricsPath, 'hourly', filename);

      const data = await fs.readFile(filepath, 'utf8');
      const hourlyData = JSON.parse(data);

      const summary = this.calculateSummary(hourlyData.summaries);
      summary.period = 'day';
      summary.date = filename.replace('.json', '');

      // Store daily summary
      const dailyPath = path.join(this.config.metricsPath, 'daily', filename);
      await fs.mkdir(path.dirname(dailyPath), { recursive: true });
      await fs.writeFile(dailyPath, JSON.stringify(summary, null, 2));

      console.log('✅ Daily summary generated');

    } catch (error) {
      console.error('Failed to generate daily summary:', error.message);
    }
  }

  /**
   * Calculate summary statistics
   */
  calculateSummary(metrics) {
    if (metrics.length === 0) return {};

    const summary = {
      count: metrics.length,
      token: {},
      social: {},
      bots: {},
      website: {},
      apis: {}
    };

    // Token metrics
    const prices = metrics.map(m => m.token?.price || 0).filter(p => p > 0);
    if (prices.length > 0) {
      summary.token = {
        avgPrice: prices.reduce((a, b) => a + b, 0) / prices.length,
        minPrice: Math.min(...prices),
        maxPrice: Math.max(...prices),
        avgVolume24h: metrics.reduce((sum, m) => sum + (m.token?.volume24h || 0), 0) / metrics.length,
        avgMarketCap: metrics.reduce((sum, m) => sum + (m.token?.marketCap || 0), 0) / metrics.length
      };
    }

    // Social metrics
    summary.social = {
      twitter: {
        avgFollowers: this.avg(metrics, 'social.twitter.followers'),
        avgTweets24h: this.avg(metrics, 'social.twitter.tweets24h')
      },
      discord: {
        avgMembers: this.avg(metrics, 'social.discord.members'),
        avgMessages24h: this.avg(metrics, 'social.discord.messages24h')
      },
      telegram: {
        avgMembers: this.avg(metrics, 'social.telegram.members'),
        avgMessages24h: this.avg(metrics, 'social.telegram.messages24h')
      }
    };

    // Bot metrics
    summary.bots = {
      discord: { avgResponseTime: this.avg(metrics, 'bots.discord.responseTime') },
      telegram: { avgResponseTime: this.avg(metrics, 'bots.telegram.responseTime') },
      twitter: { avgResponseTime: this.avg(metrics, 'bots.twitter.responseTime') }
    };

    return summary;
  }

  /**
   * Calculate average of nested property
   */
  avg(metrics, property) {
    const values = metrics.map(m => {
      const keys = property.split('.');
      let value = m;
      for (const key of keys) {
        value = value?.[key];
      }
      return value || 0;
    }).filter(v => v > 0);

    return values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
  }

  /**
   * Clean old metrics based on retention policy
   */
  async cleanOldMetrics() {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - this.config.retentionDays);

      const minutePath = path.join(this.config.metricsPath, 'minute');
      const files = await fs.readdir(minutePath);

      for (const file of files) {
        const fileDate = new Date(file.replace('.json', ''));
        if (fileDate < cutoffDate) {
          await fs.unlink(path.join(minutePath, file));
          console.log(`🗑️ Deleted old metrics: ${file}`);
        }
      }
    } catch (error) {
      // Directory doesn't exist or other error
    }
  }

  /**
   * Get current metrics
   */
  getCurrentMetrics() {
    return this.currentMetrics;
  }

  /**
   * Get metrics for time range
   */
  async getMetricsForRange(startDate, endDate) {
    const metrics = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const filename = `${currentDate.toISOString().split('T')[0]}.json`;
      const filepath = path.join(this.config.metricsPath, 'minute', filename);

      try {
        const data = await fs.readFile(filepath, 'utf8');
        const dayMetrics = JSON.parse(data);
        metrics.push(...dayMetrics.metrics);
      } catch (error) {
        // File doesn't exist
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return metrics;
  }
}

module.exports = MetricsCollector;

// CLI usage
if (require.main === module) {
  const collector = new MetricsCollector();
  collector.start();

  process.on('SIGINT', () => {
    console.log('\n👋 Shutting down...');
    collector.stop();
    process.exit(0);
  });
}
