/**
 * HypeAI Comprehensive Monitoring & Alert System
 * Real-time monitoring of all systems with multi-channel alerts
 */

const https = require('https');
const nodemailer = require('nodemailer');
const fs = require('fs').promises;
const path = require('path');

class ComprehensiveMonitor {
  constructor() {
    this.checks = [];
    this.alerts = [];
    this.metrics = [];
    this.configFile = path.join(__dirname, 'monitor-config.json');
    this.metricsFile = path.join(__dirname, 'data', 'metrics.json');
    this.alertsFile = path.join(__dirname, 'data', 'alerts.json');

    this.config = {
      slack: {
        webhook: process.env.SLACK_WEBHOOK_URL,
        enabled: true
      },
      email: {
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: process.env.SMTP_PORT || 587,
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
        to: process.env.ALERT_EMAIL,
        enabled: true
      },
      checkInterval: 60000, // 60 seconds
      alertCooldown: 300000, // 5 minutes
    };

    this.lastAlerts = new Map(); // For deduplication
  }

  async init() {
    await this.loadConfig();
    await this.loadMetrics();
    this.startMonitoring();
    console.log('🔍 Comprehensive monitoring started');
  }

  async loadConfig() {
    try {
      const data = await fs.readFile(this.configFile, 'utf8');
      this.config = { ...this.config, ...JSON.parse(data) };
    } catch (err) {
      console.log('Using default config');
    }
  }

  async loadMetrics() {
    try {
      const data = await fs.readFile(this.metricsFile, 'utf8');
      this.metrics = JSON.parse(data);
    } catch (err) {
      this.metrics = [];
    }
  }

  async saveMetrics() {
    try {
      await fs.mkdir(path.dirname(this.metricsFile), { recursive: true });
      await fs.writeFile(this.metricsFile, JSON.stringify(this.metrics.slice(-10000), null, 2));
    } catch (err) {
      console.error('Error saving metrics:', err);
    }
  }

  async saveAlerts() {
    try {
      await fs.mkdir(path.dirname(this.alertsFile), { recursive: true });
      await fs.writeFile(this.alertsFile, JSON.stringify(this.alerts.slice(-1000), null, 2));
    } catch (err) {
      console.error('Error saving alerts:', err);
    }
  }

  // Health Checks
  async checkDiscordBot() {
    try {
      const statusFile = path.join(__dirname, '../bots/data/bot-status.json');
      const data = await fs.readFile(statusFile, 'utf8');
      const status = JSON.parse(data);

      const isHealthy = status.discord?.status === 'online' &&
                       (Date.now() - new Date(status.discord?.lastSeen).getTime()) < 120000;

      return {
        name: 'Discord Bot',
        healthy: isHealthy,
        status: status.discord?.status || 'unknown',
        lastSeen: status.discord?.lastSeen,
        metrics: {
          messages: status.discord?.messageCount || 0,
          uptime: status.discord?.uptime || 0
        }
      };
    } catch (err) {
      return { name: 'Discord Bot', healthy: false, error: err.message };
    }
  }

  async checkTelegramBot() {
    try {
      const statusFile = path.join(__dirname, '../bots/data/bot-status.json');
      const data = await fs.readFile(statusFile, 'utf8');
      const status = JSON.parse(data);

      const isHealthy = status.telegram?.status === 'online' &&
                       (Date.now() - new Date(status.telegram?.lastSeen).getTime()) < 120000;

      return {
        name: 'Telegram Bot',
        healthy: isHealthy,
        status: status.telegram?.status || 'unknown',
        lastSeen: status.telegram?.lastSeen,
        metrics: {
          messages: status.telegram?.messageCount || 0,
          uptime: status.telegram?.uptime || 0
        }
      };
    } catch (err) {
      return { name: 'Telegram Bot', healthy: false, error: err.message };
    }
  }

  async checkTwitterBot() {
    try {
      const statusFile = path.join(__dirname, '../bots/data/bot-status.json');
      const data = await fs.readFile(statusFile, 'utf8');
      const status = JSON.parse(data);

      const isHealthy = status.twitter?.status === 'online' &&
                       (Date.now() - new Date(status.twitter?.lastSeen).getTime()) < 120000;

      return {
        name: 'Twitter Bot',
        healthy: isHealthy,
        status: status.twitter?.status || 'unknown',
        lastSeen: status.twitter?.lastSeen,
        metrics: {
          mentions: status.twitter?.mentionsChecked || 0,
          uptime: status.twitter?.uptime || 0
        }
      };
    } catch (err) {
      return { name: 'Twitter Bot', healthy: false, error: err.message };
    }
  }

  async checkAnalyticsDashboard() {
    return new Promise((resolve) => {
      const req = https.get('http://localhost:3001/api/health', (res) => {
        resolve({
          name: 'Analytics Dashboard',
          healthy: res.statusCode === 200,
          status: `HTTP ${res.statusCode}`
        });
      });

      req.on('error', (err) => {
        resolve({
          name: 'Analytics Dashboard',
          healthy: false,
          error: err.message
        });
      });

      req.setTimeout(5000, () => {
        req.destroy();
        resolve({
          name: 'Analytics Dashboard',
          healthy: false,
          error: 'Timeout'
        });
      });
    });
  }

  async checkSmartContract() {
    // Mock check - replace with actual Web3 check
    return {
      name: 'Smart Contract',
      healthy: true,
      address: process.env.CONTRACT_ADDRESS || '0x...',
      metrics: {
        balance: '100 ETH',
        gasPrice: '50 gwei'
      }
    };
  }

  async checkTokenPrice() {
    return new Promise((resolve) => {
      https.get('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd', (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const price = JSON.parse(data);
            resolve({
              name: 'Price API',
              healthy: true,
              price: price.ethereum?.usd || 0
            });
          } catch (err) {
            resolve({ name: 'Price API', healthy: false, error: err.message });
          }
        });
      }).on('error', (err) => {
        resolve({ name: 'Price API', healthy: false, error: err.message });
      });
    });
  }

  // Alert System
  async sendSlackAlert(priority, title, message) {
    if (!this.config.slack.enabled || !this.config.slack.webhook) return;

    const colors = {
      P0: '#FF0000', // Red
      P1: '#FF6600', // Orange
      P2: '#FFCC00', // Yellow
      P3: '#00CC00', // Green
      P4: '#0099FF'  // Blue
    };

    const payload = {
      attachments: [{
        color: colors[priority] || '#999999',
        title: `${priority}: ${title}`,
        text: message,
        footer: 'HypeAI Monitoring',
        ts: Math.floor(Date.now() / 1000)
      }]
    };

    return new Promise((resolve) => {
      const req = https.request(this.config.slack.webhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }, (res) => {
        resolve(res.statusCode === 200);
      });

      req.on('error', () => resolve(false));
      req.write(JSON.stringify(payload));
      req.end();
    });
  }

  async sendEmailAlert(priority, title, message) {
    if (!this.config.email.enabled || !this.config.email.to) return;

    const transporter = nodemailer.createTransporter({
      host: this.config.email.host,
      port: this.config.email.port,
      secure: false,
      auth: {
        user: this.config.email.user,
        pass: this.config.email.pass
      }
    });

    const mailOptions = {
      from: `"HypeAI Alerts" <${this.config.email.user}>`,
      to: this.config.email.to,
      subject: `[${priority}] ${title}`,
      html: `
        <h2>${title}</h2>
        <p><strong>Priority:</strong> ${priority}</p>
        <p><strong>Time:</strong> ${new Date().toISOString()}</p>
        <hr>
        <p>${message}</p>
        <hr>
        <p style="color: #666; font-size: 12px;">
          This is an automated alert from HypeAI Monitoring System
        </p>
      `
    };

    try {
      await transporter.sendMail(mailOptions);
      return true;
    } catch (err) {
      console.error('Email error:', err);
      return false;
    }
  }

  async sendAlert(priority, title, message) {
    const alertKey = `${priority}-${title}`;
    const lastAlert = this.lastAlerts.get(alertKey);

    // Deduplicate alerts (cooldown period)
    if (lastAlert && (Date.now() - lastAlert) < this.config.alertCooldown) {
      return;
    }

    this.lastAlerts.set(alertKey, Date.now());

    const alert = {
      id: `alert_${Date.now()}`,
      priority,
      title,
      message,
      timestamp: new Date().toISOString()
    };

    this.alerts.push(alert);
    await this.saveAlerts();

    // Send to channels based on priority
    if (priority === 'P0' || priority === 'P1') {
      await this.sendSlackAlert(priority, title, message);
      await this.sendEmailAlert(priority, title, message);
    } else if (priority === 'P2') {
      await this.sendSlackAlert(priority, title, message);
    } else {
      // P3, P4 - just log, no alerts
      console.log(`📝 ${priority}: ${title}`);
    }
  }

  // Monitoring Loop
  async runChecks() {
    const checks = await Promise.all([
      this.checkDiscordBot(),
      this.checkTelegramBot(),
      this.checkTwitterBot(),
      this.checkAnalyticsDashboard(),
      this.checkSmartContract(),
      this.checkTokenPrice()
    ]);

    const timestamp = new Date().toISOString();
    const healthScore = checks.filter(c => c.healthy).length / checks.length * 100;

    const metric = {
      timestamp,
      healthScore,
      checks
    };

    this.metrics.push(metric);
    await this.saveMetrics();

    // Check for issues
    checks.forEach(check => {
      if (!check.healthy) {
        if (check.name.includes('Bot')) {
          this.sendAlert('P1', `${check.name} Down`,
            `${check.name} is not responding. Last seen: ${check.lastSeen || 'never'}\nError: ${check.error || 'unknown'}`
          );
        } else if (check.name.includes('Dashboard')) {
          this.sendAlert('P2', `${check.name} Unreachable`,
            `Cannot reach ${check.name}. Error: ${check.error || 'unknown'}`
          );
        }
      }
    });

    // Log status
    console.log(`✅ Health Check: ${healthScore.toFixed(1)}% (${checks.filter(c => c.healthy).length}/${checks.length} services)`);

    return metric;
  }

  startMonitoring() {
    // Run checks every minute
    setInterval(() => {
      this.runChecks().catch(err => {
        console.error('Check error:', err);
      });
    }, this.config.checkInterval);

    // Initial check
    this.runChecks();
  }

  // Get current status
  getCurrentStatus() {
    if (this.metrics.length === 0) {
      return { status: 'unknown', message: 'No metrics yet' };
    }

    const latest = this.metrics[this.metrics.length - 1];

    if (latest.healthScore === 100) {
      return { status: 'operational', message: 'All systems operational', score: 100 };
    } else if (latest.healthScore >= 80) {
      return { status: 'degraded', message: 'Some systems experiencing issues', score: latest.healthScore };
    } else {
      return { status: 'outage', message: 'Major outage detected', score: latest.healthScore };
    }
  }

  // Get recent alerts
  getRecentAlerts(limit = 10) {
    return this.alerts.slice(-limit).reverse();
  }
}

// Export
module.exports = ComprehensiveMonitor;

// CLI
if (require.main === module) {
  const monitor = new ComprehensiveMonitor();
  monitor.init();

  // Graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down monitor...');
    await monitor.saveMetrics();
    await monitor.saveAlerts();
    process.exit(0);
  });
}
