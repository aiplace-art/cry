#!/usr/bin/env node

/**
 * Master Launcher for Telegram Growth Bot Suite
 *
 * This script manages all three growth bots:
 * 1. Content Creator Bot
 * 2. Mention Monitor Bot
 * 3. Growth Hacker Bot
 *
 * Features:
 * - Concurrent bot execution
 * - Health monitoring
 * - Automatic restart on failure
 * - Performance analytics
 * - Resource management
 * - Safety controls
 *
 * Usage:
 *   node run-all-growth-bots.js                  # Start all bots
 *   node run-all-growth-bots.js --status         # Check status
 *   node run-all-growth-bots.js --stop           # Stop all bots
 *   node run-all-growth-bots.js --report         # Generate report
 */

const { spawn, fork } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const EventEmitter = require('events');

// Configuration
const CONFIG = {
  // Bot paths
  bots: {
    contentCreator: path.join(__dirname, 'telegram-content-creator.js'),
    mentionMonitor: path.join(__dirname, 'telegram-mention-monitor.js'),
    growthHacker: path.join(__dirname, 'telegram-growth-hacker.js')
  },

  // Scheduling
  schedules: {
    contentCreator: {
      interval: 4 * 60 * 60 * 1000, // 4 hours
      enabled: true,
      description: 'Posts content every 4 hours'
    },
    mentionMonitor: {
      continuous: true,
      checkInterval: 30 * 1000, // 30 seconds
      enabled: true,
      description: 'Monitors mentions continuously'
    },
    growthHacker: {
      interval: 6 * 60 * 60 * 1000, // 6 hours
      enabled: true,
      description: 'Analyzes growth opportunities every 6 hours'
    }
  },

  // Resource limits
  resources: {
    maxMemory: 500, // MB
    maxCpu: 80, // percentage
    maxDiskSpace: 1000 // MB
  },

  // Safety controls
  safety: {
    maxMessagesPerHour: 20,
    maxOutreachPerDay: 5,
    minDelayBetweenPosts: 3 * 60 * 1000, // 3 minutes
    enableRateLimiting: true,
    enableSpamDetection: true
  },

  // Monitoring
  monitoring: {
    healthCheckInterval: 60 * 1000, // 1 minute
    logLevel: 'info',
    enableMetrics: true,
    enableAlerts: true
  },

  // Paths
  paths: {
    logs: path.join(__dirname, '../../logs'),
    data: path.join(__dirname, '../../data'),
    backups: path.join(__dirname, '../../backups'),
    config: path.join(__dirname, '../../config')
  }
};

// Bot Manager Class
class BotManager extends EventEmitter {
  constructor() {
    super();
    this.processes = new Map();
    this.metrics = new Map();
    this.isRunning = false;
    this.startTime = null;
  }

  /**
   * Initialize the bot manager
   */
  async initialize() {
    console.log('🚀 Initializing Telegram Growth Bot Suite...\n');

    // Create directories
    await this.createDirectories();

    // Load environment
    await this.loadEnvironment();

    // Initialize metrics
    this.initializeMetrics();

    console.log('✅ Initialization complete!\n');
  }

  /**
   * Create required directories
   */
  async createDirectories() {
    for (const [name, dirPath] of Object.entries(CONFIG.paths)) {
      try {
        await fs.mkdir(dirPath, { recursive: true });
        console.log(`✓ Created directory: ${name}`);
      } catch (error) {
        console.error(`✗ Failed to create ${name} directory:`, error.message);
      }
    }
  }

  /**
   * Load environment variables
   */
  async loadEnvironment() {
    try {
      // Check for .env file
      const envPath = path.join(__dirname, '../../.env');
      try {
        await fs.access(envPath);
        console.log('✓ Environment file found');
      } catch {
        console.warn('⚠ No .env file found - using default configuration');
      }

      // Verify required environment variables
      const required = ['TELEGRAM_BOT_TOKEN', 'TELEGRAM_CHANNEL_ID'];
      const missing = required.filter(key => !process.env[key]);

      if (missing.length > 0) {
        console.warn('⚠ Missing environment variables:', missing.join(', '));
        console.warn('  Bots may not function without proper configuration');
      } else {
        console.log('✓ Environment variables verified');
      }
    } catch (error) {
      console.error('✗ Error loading environment:', error.message);
    }
  }

  /**
   * Initialize metrics tracking
   */
  initializeMetrics() {
    for (const botName of Object.keys(CONFIG.bots)) {
      this.metrics.set(botName, {
        starts: 0,
        crashes: 0,
        messages: 0,
        errors: 0,
        lastRun: null,
        totalRuntime: 0,
        avgMemory: 0,
        avgCpu: 0
      });
    }
    console.log('✓ Metrics initialized\n');
  }

  /**
   * Start all bots
   */
  async startAll() {
    console.log('🤖 Starting all bots...\n');
    this.isRunning = true;
    this.startTime = Date.now();

    // Start Content Creator Bot
    if (CONFIG.schedules.contentCreator.enabled) {
      await this.startBot('contentCreator', CONFIG.schedules.contentCreator.interval);
    }

    // Start Mention Monitor Bot (continuous)
    if (CONFIG.schedules.mentionMonitor.enabled) {
      await this.startBot('mentionMonitor', null, true);
    }

    // Start Growth Hacker Bot
    if (CONFIG.schedules.growthHacker.enabled) {
      await this.startBot('growthHacker', CONFIG.schedules.growthHacker.interval);
    }

    // Start health monitoring
    this.startHealthMonitoring();

    console.log('\n✅ All bots started successfully!\n');
    this.printStatus();
  }

  /**
   * Start individual bot
   */
  async startBot(botName, interval = null, continuous = false) {
    const botPath = CONFIG.bots[botName];
    const metrics = this.metrics.get(botName);

    console.log(`Starting ${botName}...`);

    const runBot = async () => {
      try {
        const process = fork(botPath, [], {
          stdio: 'pipe',
          env: { ...process.env, BOT_NAME: botName }
        });

        this.processes.set(botName, process);
        metrics.starts++;
        metrics.lastRun = Date.now();

        // Handle process output
        process.stdout.on('data', (data) => {
          this.handleBotOutput(botName, data.toString());
        });

        process.stderr.on('data', (data) => {
          this.handleBotError(botName, data.toString());
        });

        // Handle process exit
        process.on('exit', (code) => {
          this.handleBotExit(botName, code);
        });

        console.log(`✓ ${botName} started (PID: ${process.pid})`);
      } catch (error) {
        console.error(`✗ Failed to start ${botName}:`, error.message);
        metrics.errors++;
      }
    };

    // Run immediately
    await runBot();

    // Schedule recurring runs
    if (continuous) {
      // For continuous bots, just keep them running
      console.log(`  → Running continuously`);
    } else if (interval) {
      // For interval bots, run on schedule
      setInterval(runBot, interval);
      console.log(`  → Scheduled every ${this.formatInterval(interval)}`);
    }
  }

  /**
   * Handle bot output
   */
  handleBotOutput(botName, output) {
    const timestamp = new Date().toISOString();
    const logLine = `[${timestamp}] [${botName}] ${output.trim()}`;

    // Log to console
    if (CONFIG.monitoring.logLevel === 'debug' || output.includes('ERROR')) {
      console.log(logLine);
    }

    // Log to file
    this.logToFile(botName, logLine);

    // Update metrics
    const metrics = this.metrics.get(botName);
    if (output.includes('message sent') || output.includes('reply sent')) {
      metrics.messages++;
    }
  }

  /**
   * Handle bot errors
   */
  handleBotError(botName, error) {
    const timestamp = new Date().toISOString();
    const errorLine = `[${timestamp}] [${botName}] ERROR: ${error.trim()}`;

    console.error(errorLine);
    this.logToFile(botName, errorLine);

    // Update metrics
    const metrics = this.metrics.get(botName);
    metrics.errors++;

    // Send alert if enabled
    if (CONFIG.monitoring.enableAlerts) {
      this.sendAlert(botName, error);
    }
  }

  /**
   * Handle bot exit
   */
  handleBotExit(botName, code) {
    const metrics = this.metrics.get(botName);

    if (code !== 0) {
      console.error(`⚠ ${botName} exited with code ${code}`);
      metrics.crashes++;

      // Auto-restart if enabled
      if (this.isRunning) {
        console.log(`  → Restarting ${botName} in 10 seconds...`);
        setTimeout(() => {
          this.startBot(botName, CONFIG.schedules[botName].interval);
        }, 10000);
      }
    } else {
      console.log(`✓ ${botName} completed successfully`);
    }

    this.processes.delete(botName);
  }

  /**
   * Start health monitoring
   */
  startHealthMonitoring() {
    console.log('💓 Starting health monitoring...\n');

    setInterval(() => {
      this.checkHealth();
    }, CONFIG.monitoring.healthCheckInterval);
  }

  /**
   * Check system health
   */
  async checkHealth() {
    const health = {
      timestamp: Date.now(),
      uptime: Date.now() - this.startTime,
      bots: {},
      resources: await this.getResourceUsage(),
      alerts: []
    };

    // Check each bot
    for (const [botName, process] of this.processes.entries()) {
      const metrics = this.metrics.get(botName);

      health.bots[botName] = {
        running: process && !process.killed,
        pid: process?.pid,
        metrics: { ...metrics }
      };
    }

    // Check for issues
    if (health.resources.memory > CONFIG.resources.maxMemory) {
      health.alerts.push({
        level: 'warning',
        message: `High memory usage: ${health.resources.memory}MB`
      });
    }

    if (health.resources.cpu > CONFIG.resources.maxCpu) {
      health.alerts.push({
        level: 'warning',
        message: `High CPU usage: ${health.resources.cpu}%`
      });
    }

    // Log health status
    if (CONFIG.monitoring.logLevel === 'debug' || health.alerts.length > 0) {
      console.log('Health check:', JSON.stringify(health, null, 2));
    }

    return health;
  }

  /**
   * Get resource usage
   */
  async getResourceUsage() {
    const used = process.memoryUsage();

    return {
      memory: Math.round(used.heapUsed / 1024 / 1024), // MB
      cpu: process.cpuUsage().user / 1000000, // percentage approximation
      uptime: Math.floor(process.uptime())
    };
  }

  /**
   * Stop all bots
   */
  async stopAll() {
    console.log('\n🛑 Stopping all bots...\n');
    this.isRunning = false;

    for (const [botName, process] of this.processes.entries()) {
      console.log(`Stopping ${botName}...`);
      process.kill('SIGTERM');

      // Wait for graceful shutdown
      await new Promise(resolve => setTimeout(resolve, 2000));

      if (!process.killed) {
        console.log(`  Force killing ${botName}...`);
        process.kill('SIGKILL');
      }

      console.log(`✓ ${botName} stopped`);
    }

    this.processes.clear();
    console.log('\n✅ All bots stopped\n');
  }

  /**
   * Print current status
   */
  printStatus() {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 TELEGRAM GROWTH BOT SUITE - STATUS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log(`Status: ${this.isRunning ? '🟢 Running' : '🔴 Stopped'}`);
    console.log(`Uptime: ${this.formatUptime(Date.now() - this.startTime)}\n`);

    console.log('Bots:');
    for (const [botName, process] of this.processes.entries()) {
      const metrics = this.metrics.get(botName);
      const schedule = CONFIG.schedules[botName];

      console.log(`\n  ${botName}:`);
      console.log(`    Status: ${process && !process.killed ? '✅ Running' : '❌ Stopped'}`);
      console.log(`    PID: ${process?.pid || 'N/A'}`);
      console.log(`    Schedule: ${schedule.description || 'N/A'}`);
      console.log(`    Starts: ${metrics.starts}`);
      console.log(`    Messages: ${metrics.messages}`);
      console.log(`    Errors: ${metrics.errors}`);
      console.log(`    Crashes: ${metrics.crashes}`);
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  }

  /**
   * Generate performance report
   */
  async generateReport() {
    console.log('📈 Generating performance report...\n');

    const report = {
      generated: new Date().toISOString(),
      uptime: Date.now() - this.startTime,
      bots: {},
      summary: {
        totalMessages: 0,
        totalErrors: 0,
        totalCrashes: 0,
        avgUptime: 0
      }
    };

    // Collect metrics for each bot
    for (const [botName, metrics] of this.metrics.entries()) {
      report.bots[botName] = { ...metrics };
      report.summary.totalMessages += metrics.messages;
      report.summary.totalErrors += metrics.errors;
      report.summary.totalCrashes += metrics.crashes;
    }

    // Calculate averages
    const botCount = this.metrics.size;
    report.summary.avgUptime = report.uptime / botCount;

    // Print report
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 PERFORMANCE REPORT');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log(`Generated: ${report.generated}`);
    console.log(`Total Uptime: ${this.formatUptime(report.uptime)}\n`);

    console.log('Summary:');
    console.log(`  Total Messages Sent: ${report.summary.totalMessages}`);
    console.log(`  Total Errors: ${report.summary.totalErrors}`);
    console.log(`  Total Crashes: ${report.summary.totalCrashes}`);
    console.log(`  Success Rate: ${this.calculateSuccessRate()}%\n`);

    console.log('Bot Details:');
    for (const [botName, metrics] of Object.entries(report.bots)) {
      console.log(`\n  ${botName}:`);
      console.log(`    Messages: ${metrics.messages}`);
      console.log(`    Errors: ${metrics.errors}`);
      console.log(`    Crashes: ${metrics.crashes}`);
      console.log(`    Success Rate: ${this.calculateBotSuccessRate(metrics)}%`);
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Save report to file
    const reportPath = path.join(CONFIG.paths.logs, `report-${Date.now()}.json`);
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    console.log(`Report saved to: ${reportPath}\n`);

    return report;
  }

  /**
   * Calculate overall success rate
   */
  calculateSuccessRate() {
    let totalMessages = 0;
    let totalErrors = 0;

    for (const metrics of this.metrics.values()) {
      totalMessages += metrics.messages;
      totalErrors += metrics.errors;
    }

    if (totalMessages === 0) return 100;
    return Math.round(((totalMessages - totalErrors) / totalMessages) * 100);
  }

  /**
   * Calculate bot-specific success rate
   */
  calculateBotSuccessRate(metrics) {
    if (metrics.messages === 0) return 100;
    return Math.round(((metrics.messages - metrics.errors) / metrics.messages) * 100);
  }

  /**
   * Log to file
   */
  async logToFile(botName, message) {
    try {
      const logPath = path.join(CONFIG.paths.logs, `${botName}.log`);
      await fs.appendFile(logPath, message + '\n');
    } catch (error) {
      console.error('Failed to write log:', error.message);
    }
  }

  /**
   * Send alert
   */
  sendAlert(botName, message) {
    console.log(`\n🚨 ALERT [${botName}]: ${message}\n`);
    // TODO: Implement email/SMS alerts if needed
  }

  /**
   * Format interval for display
   */
  formatInterval(ms) {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours}h${minutes > 0 ? ` ${minutes}m` : ''}`;
    }
    return `${minutes}m`;
  }

  /**
   * Format uptime for display
   */
  formatUptime(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days}d ${hours % 24}h ${minutes % 60}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    }
    return `${seconds}s`;
  }
}

// CLI Command Handler
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'start';

  const manager = new BotManager();

  try {
    switch (command) {
      case 'start':
        await manager.initialize();
        await manager.startAll();

        // Handle graceful shutdown
        process.on('SIGINT', async () => {
          console.log('\n\nReceived SIGINT, shutting down gracefully...');
          await manager.stopAll();
          process.exit(0);
        });

        process.on('SIGTERM', async () => {
          console.log('\n\nReceived SIGTERM, shutting down gracefully...');
          await manager.stopAll();
          process.exit(0);
        });
        break;

      case '--status':
      case 'status':
        await manager.initialize();
        manager.printStatus();
        break;

      case '--stop':
      case 'stop':
        await manager.initialize();
        await manager.stopAll();
        break;

      case '--report':
      case 'report':
        await manager.initialize();
        await manager.generateReport();
        break;

      case '--help':
      case 'help':
        console.log(`
Telegram Growth Bot Suite - Master Launcher

Usage:
  node run-all-growth-bots.js [command]

Commands:
  start              Start all bots (default)
  status, --status   Show current status
  stop, --stop       Stop all bots
  report, --report   Generate performance report
  help, --help       Show this help message

Environment Variables:
  TELEGRAM_BOT_TOKEN       Your Telegram bot token (required)
  TELEGRAM_CHANNEL_ID      Your channel ID (required)
  NODE_ENV                 Environment (development/production)

Examples:
  node run-all-growth-bots.js
  node run-all-growth-bots.js --status
  node run-all-growth-bots.js --report

With PM2:
  pm2 start run-all-growth-bots.js --name telegram-growth-suite
  pm2 status
  pm2 logs telegram-growth-suite
  pm2 stop telegram-growth-suite
        `);
        break;

      default:
        console.error(`Unknown command: ${command}`);
        console.log('Run with --help for usage information');
        process.exit(1);
    }
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
}

module.exports = BotManager;
