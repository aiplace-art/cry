const axios = require('axios');
const cron = require('node-cron');
const { ethers } = require('ethers');
const fs = require('fs').promises;
const path = require('path');

class HealthMonitor {
  constructor(config = {}) {
    this.config = {
      checkInterval: config.checkInterval || '*/1 * * * *', // Every minute
      discordBotUrl: config.discordBotUrl || 'http://localhost:3001/health',
      telegramBotUrl: config.telegramBotUrl || 'http://localhost:3002/health',
      twitterBotUrl: config.twitterBotUrl || 'http://localhost:3003/health',
      analyticsUrl: config.analyticsUrl || 'http://localhost:3004/health',
      websiteUrl: config.websiteUrl || 'https://hypeai.io',
      rpcUrl: config.rpcUrl || process.env.RPC_URL,
      contractAddress: config.contractAddress || process.env.CONTRACT_ADDRESS,
      minGasBalance: config.minGasBalance || ethers.parseEther('0.1'),
      alertCallback: config.alertCallback || this.defaultAlertCallback,
      metricsPath: config.metricsPath || path.join(__dirname, '../../data/health-metrics.json')
    };

    this.services = [
      { name: 'Discord Bot', url: this.config.discordBotUrl, critical: true },
      { name: 'Telegram Bot', url: this.config.telegramBotUrl, critical: true },
      { name: 'Twitter Bot', url: this.config.twitterBotUrl, critical: true },
      { name: 'Analytics Dashboard', url: this.config.analyticsUrl, critical: false },
      { name: 'Website', url: this.config.websiteUrl, critical: true }
    ];

    this.healthHistory = [];
    this.isRunning = false;
    this.cronJob = null;
  }

  /**
   * Start health monitoring
   */
  start() {
    if (this.isRunning) {
      console.log('Health monitor already running');
      return;
    }

    console.log('🏥 Starting Health Monitor...');
    console.log(`📊 Check interval: ${this.config.checkInterval}`);

    // Run initial check
    this.runHealthCheck();

    // Schedule periodic checks
    this.cronJob = cron.schedule(this.config.checkInterval, () => {
      this.runHealthCheck();
    });

    this.isRunning = true;
    console.log('✅ Health Monitor started');
  }

  /**
   * Stop health monitoring
   */
  stop() {
    if (this.cronJob) {
      this.cronJob.stop();
      this.cronJob = null;
    }
    this.isRunning = false;
    console.log('🛑 Health Monitor stopped');
  }

  /**
   * Run comprehensive health check
   */
  async runHealthCheck() {
    const timestamp = new Date().toISOString();
    console.log(`\n🔍 Running health check at ${timestamp}`);

    const results = {
      timestamp,
      services: {},
      blockchain: {},
      apis: {},
      overall: { status: 'healthy', score: 100 }
    };

    try {
      // Check all services
      await Promise.all(
        this.services.map(async (service) => {
          results.services[service.name] = await this.checkService(service);
        })
      );

      // Check blockchain
      results.blockchain = await this.checkBlockchain();

      // Check external APIs
      results.apis = await this.checkAPIs();

      // Calculate overall health
      results.overall = this.calculateOverallHealth(results);

      // Save metrics
      await this.saveMetrics(results);

      // Trigger alerts if needed
      await this.processAlerts(results);

      // Keep history (last 100 checks)
      this.healthHistory.push(results);
      if (this.healthHistory.length > 100) {
        this.healthHistory.shift();
      }

      console.log(`✅ Health check complete - Status: ${results.overall.status} (${results.overall.score}/100)`);

    } catch (error) {
      console.error('❌ Health check failed:', error.message);
      results.overall = { status: 'critical', score: 0, error: error.message };
    }

    return results;
  }

  /**
   * Check individual service health
   */
  async checkService(service) {
    const startTime = Date.now();
    const result = {
      name: service.name,
      status: 'unknown',
      responseTime: 0,
      critical: service.critical,
      error: null
    };

    try {
      const response = await axios.get(service.url, {
        timeout: 10000,
        validateStatus: () => true
      });

      result.responseTime = Date.now() - startTime;

      if (response.status === 200) {
        result.status = 'healthy';
        result.data = response.data;
      } else {
        result.status = 'degraded';
        result.error = `HTTP ${response.status}`;
      }

    } catch (error) {
      result.responseTime = Date.now() - startTime;
      result.status = 'down';
      result.error = error.message;
    }

    return result;
  }

  /**
   * Check blockchain/smart contract status
   */
  async checkBlockchain() {
    const result = {
      status: 'unknown',
      gasBalance: '0',
      contractBalance: '0',
      blockNumber: 0,
      error: null
    };

    try {
      if (!this.config.rpcUrl) {
        result.status = 'skipped';
        result.error = 'RPC URL not configured';
        return result;
      }

      const provider = new ethers.JsonRpcProvider(this.config.rpcUrl);

      // Get current block
      result.blockNumber = await provider.getBlockNumber();

      // Check deployer wallet balance
      if (process.env.DEPLOYER_PRIVATE_KEY) {
        const wallet = new ethers.Wallet(process.env.DEPLOYER_PRIVATE_KEY, provider);
        const balance = await provider.getBalance(wallet.address);
        result.gasBalance = ethers.formatEther(balance);

        // Check if gas balance is sufficient
        if (balance < this.config.minGasBalance) {
          result.status = 'warning';
          result.error = 'Low gas balance';
        }
      }

      // Check contract balance
      if (this.config.contractAddress) {
        const contractBalance = await provider.getBalance(this.config.contractAddress);
        result.contractBalance = ethers.formatEther(contractBalance);
      }

      if (!result.status || result.status === 'unknown') {
        result.status = 'healthy';
      }

    } catch (error) {
      result.status = 'down';
      result.error = error.message;
    }

    return result;
  }

  /**
   * Check external APIs
   */
  async checkAPIs() {
    const apis = [
      { name: 'CoinGecko', url: 'https://api.coingecko.com/api/v3/ping' },
      { name: 'Twitter API', url: 'https://api.twitter.com/2/tweets', requiresAuth: true }
    ];

    const results = {};

    for (const api of apis) {
      const startTime = Date.now();
      const apiResult = {
        name: api.name,
        status: 'unknown',
        responseTime: 0,
        error: null
      };

      try {
        if (api.requiresAuth && !process.env.TWITTER_BEARER_TOKEN) {
          apiResult.status = 'skipped';
          apiResult.error = 'Authentication not configured';
        } else {
          const response = await axios.get(api.url, {
            timeout: 5000,
            validateStatus: () => true,
            headers: api.requiresAuth ? {
              'Authorization': `Bearer ${process.env.TWITTER_BEARER_TOKEN}`
            } : {}
          });

          apiResult.responseTime = Date.now() - startTime;

          if (response.status < 400) {
            apiResult.status = 'healthy';
          } else if (response.status === 429) {
            apiResult.status = 'rate-limited';
            apiResult.error = 'Rate limit exceeded';
          } else {
            apiResult.status = 'degraded';
            apiResult.error = `HTTP ${response.status}`;
          }
        }
      } catch (error) {
        apiResult.responseTime = Date.now() - startTime;
        apiResult.status = 'down';
        apiResult.error = error.message;
      }

      results[api.name] = apiResult;
    }

    return results;
  }

  /**
   * Calculate overall health score
   */
  calculateOverallHealth(results) {
    let totalScore = 100;
    let status = 'healthy';
    const issues = [];

    // Check services
    for (const [name, service] of Object.entries(results.services)) {
      if (service.status === 'down') {
        if (service.critical) {
          totalScore -= 30;
          status = 'critical';
          issues.push(`${name} is down`);
        } else {
          totalScore -= 10;
          status = status === 'critical' ? 'critical' : 'degraded';
          issues.push(`${name} is down`);
        }
      } else if (service.status === 'degraded') {
        totalScore -= 5;
        if (status === 'healthy') status = 'degraded';
        issues.push(`${name} is degraded`);
      }
    }

    // Check blockchain
    if (results.blockchain.status === 'down') {
      totalScore -= 20;
      status = 'critical';
      issues.push('Blockchain connection failed');
    } else if (results.blockchain.status === 'warning') {
      totalScore -= 10;
      if (status === 'healthy') status = 'warning';
      issues.push(results.blockchain.error);
    }

    // Check APIs
    for (const [name, api] of Object.entries(results.apis)) {
      if (api.status === 'down') {
        totalScore -= 5;
        if (status === 'healthy') status = 'degraded';
        issues.push(`${name} is down`);
      } else if (api.status === 'rate-limited') {
        totalScore -= 3;
        if (status === 'healthy') status = 'warning';
        issues.push(`${name} rate limited`);
      }
    }

    return {
      status,
      score: Math.max(0, totalScore),
      issues
    };
  }

  /**
   * Save metrics to file
   */
  async saveMetrics(results) {
    try {
      const metricsDir = path.dirname(this.config.metricsPath);
      await fs.mkdir(metricsDir, { recursive: true });

      // Load existing metrics
      let metrics = { checks: [] };
      try {
        const data = await fs.readFile(this.config.metricsPath, 'utf8');
        metrics = JSON.parse(data);
      } catch (error) {
        // File doesn't exist yet
      }

      // Add new check
      metrics.checks.push(results);

      // Keep last 1000 checks
      if (metrics.checks.length > 1000) {
        metrics.checks = metrics.checks.slice(-1000);
      }

      // Save
      await fs.writeFile(this.config.metricsPath, JSON.stringify(metrics, null, 2));

    } catch (error) {
      console.error('Failed to save metrics:', error.message);
    }
  }

  /**
   * Process alerts based on health check results
   */
  async processAlerts(results) {
    if (results.overall.status === 'critical') {
      await this.config.alertCallback({
        priority: 'P0',
        title: '🚨 CRITICAL: System Health Alert',
        message: `Overall health score: ${results.overall.score}/100\nIssues: ${results.overall.issues.join(', ')}`,
        data: results
      });
    } else if (results.overall.status === 'degraded') {
      await this.config.alertCallback({
        priority: 'P2',
        title: '⚠️ WARNING: System Degraded',
        message: `Overall health score: ${results.overall.score}/100\nIssues: ${results.overall.issues.join(', ')}`,
        data: results
      });
    }
  }

  /**
   * Default alert callback
   */
  async defaultAlertCallback(alert) {
    console.log(`\n${alert.title}`);
    console.log(`Priority: ${alert.priority}`);
    console.log(`Message: ${alert.message}`);
  }

  /**
   * Get current health status
   */
  getCurrentHealth() {
    return this.healthHistory[this.healthHistory.length - 1] || null;
  }

  /**
   * Get health history
   */
  getHealthHistory(limit = 100) {
    return this.healthHistory.slice(-limit);
  }

  /**
   * Get uptime percentage
   */
  getUptime(hours = 24) {
    if (this.healthHistory.length === 0) return 100;

    const now = Date.now();
    const cutoff = now - (hours * 60 * 60 * 1000);

    const recentChecks = this.healthHistory.filter(check =>
      new Date(check.timestamp).getTime() > cutoff
    );

    if (recentChecks.length === 0) return 100;

    const healthyChecks = recentChecks.filter(check =>
      check.overall.status === 'healthy' || check.overall.status === 'warning'
    );

    return (healthyChecks.length / recentChecks.length) * 100;
  }
}

module.exports = HealthMonitor;

// CLI usage
if (require.main === module) {
  const monitor = new HealthMonitor();
  monitor.start();

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n👋 Shutting down...');
    monitor.stop();
    process.exit(0);
  });
}
