const express = require('express');
const path = require('path');
const HealthMonitor = require('./health-monitor');
const AlertSystem = require('./alerts');
const MetricsCollector = require('./metrics-collector');

class MonitoringServer {
  constructor(config = {}) {
    this.config = {
      port: config.port || process.env.MONITORING_PORT || 3005,
      ...config
    };

    this.app = express();
    this.app.use(express.json());
    this.app.use(express.static(path.join(__dirname)));

    // Initialize monitoring systems
    this.alertSystem = new AlertSystem(config.alerts);

    this.healthMonitor = new HealthMonitor({
      ...config.health,
      alertCallback: (alert) => this.alertSystem.sendAlert(alert)
    });

    this.metricsCollector = new MetricsCollector(config.metrics);

    this.setupRoutes();
  }

  setupRoutes() {
    // Dashboard
    this.app.get('/', (req, res) => {
      res.sendFile(path.join(__dirname, 'dashboard.html'));
    });

    // Status page
    this.app.get('/status', (req, res) => {
      res.sendFile(path.join(__dirname, 'status-page.html'));
    });

    // Health API
    this.app.get('/api/health', (req, res) => {
      const health = this.healthMonitor.getCurrentHealth();
      res.json(health || { status: 'initializing' });
    });

    this.app.get('/api/health/history', (req, res) => {
      const limit = parseInt(req.query.limit) || 100;
      const history = this.healthMonitor.getHealthHistory(limit);
      res.json(history);
    });

    this.app.get('/api/health/uptime', (req, res) => {
      const hours = parseInt(req.query.hours) || 24;
      const uptime = this.healthMonitor.getUptime(hours);
      res.json({ uptime, hours });
    });

    // Metrics API
    this.app.get('/api/metrics', (req, res) => {
      const metrics = this.metricsCollector.getCurrentMetrics();
      res.json(metrics || {});
    });

    this.app.get('/api/metrics/range', async (req, res) => {
      try {
        const startDate = new Date(req.query.start);
        const endDate = new Date(req.query.end || Date.now());

        const metrics = await this.metricsCollector.getMetricsForRange(startDate, endDate);
        res.json(metrics);
      } catch (error) {
        res.status(400).json({ error: error.message });
      }
    });

    this.app.get('/api/metrics/export', async (req, res) => {
      try {
        const metrics = this.metricsCollector.getCurrentMetrics();
        const health = this.healthMonitor.getCurrentHealth();
        const alerts = this.alertSystem.getAlertHistory(100);

        const exportData = {
          timestamp: new Date().toISOString(),
          metrics,
          health,
          alerts
        };

        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename=hypeai-metrics-${Date.now()}.json`);
        res.json(exportData);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // Alerts API
    this.app.get('/api/alerts', (req, res) => {
      const limit = parseInt(req.query.limit) || 100;
      const alerts = this.alertSystem.getAlertHistory(limit);
      res.json(alerts);
    });

    this.app.post('/api/alerts', async (req, res) => {
      try {
        const result = await this.alertSystem.sendAlert(req.body);
        res.json(result);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    this.app.post('/api/alerts/silence', (req, res) => {
      // TODO: Implement alert silencing
      res.json({ success: true, message: 'Alerts silenced' });
    });

    this.app.get('/api/alerts/stats', (req, res) => {
      const hours = parseInt(req.query.hours) || 24;
      const stats = this.alertSystem.getStatistics(hours);
      res.json(stats);
    });

    // Incidents API
    this.app.get('/api/incidents', (req, res) => {
      // TODO: Implement incident tracking
      res.json([]);
    });

    // Subscribe API
    this.app.post('/api/subscribe', (req, res) => {
      // TODO: Implement subscription management
      res.json({ success: true, message: 'Subscribed successfully' });
    });

    // Bot control API
    this.app.post('/api/bots/restart', (req, res) => {
      // TODO: Implement bot restart
      res.json({ success: true, message: 'Bots restarting' });
    });

    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
      });
    });

    // Error handling
    this.app.use((err, req, res, next) => {
      console.error('Server error:', err);
      res.status(500).json({ error: 'Internal server error' });
    });
  }

  async start() {
    // Start monitoring systems
    this.healthMonitor.start();
    this.metricsCollector.start();

    // Start web server
    return new Promise((resolve) => {
      this.server = this.app.listen(this.config.port, () => {
        console.log('\n🏥 HypeAI Monitoring System Started');
        console.log('=====================================');
        console.log(`📊 Dashboard: http://localhost:${this.config.port}`);
        console.log(`📈 Status Page: http://localhost:${this.config.port}/status`);
        console.log(`🔌 API: http://localhost:${this.config.port}/api`);
        console.log('=====================================\n');
        resolve();
      });
    });
  }

  async stop() {
    console.log('\n👋 Shutting down monitoring system...');

    // Stop monitoring
    this.healthMonitor.stop();
    this.metricsCollector.stop();

    // Stop server
    if (this.server) {
      await new Promise((resolve) => this.server.close(resolve));
    }

    console.log('✅ Monitoring system stopped\n');
  }
}

module.exports = MonitoringServer;

// CLI usage
if (require.main === module) {
  const server = new MonitoringServer();

  server.start().catch(error => {
    console.error('Failed to start monitoring server:', error);
    process.exit(1);
  });

  // Handle graceful shutdown
  process.on('SIGINT', async () => {
    await server.stop();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    await server.stop();
    process.exit(0);
  });
}
