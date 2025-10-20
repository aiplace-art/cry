#!/usr/bin/env node

/**
 * HypeAI Database Coordinator Agent
 *
 * This agent maintains the unified database state and provides
 * sync interface for all other AI agents in the project.
 *
 * Key Responsibilities:
 * - Maintain database health and connection pool
 * - Provide sync API for all agents
 * - Monitor and log database activity
 * - Handle cross-agent data consistency
 * - Generate database health reports
 */

const { pool, query, getClient, testConnection, getPoolStats, dbConfig } = require('../backend/utils/database-pool');
const fs = require('fs').promises;
const path = require('path');

class DatabaseCoordinator {
  constructor() {
    this.agentName = 'database-coordinator';
    this.startTime = new Date();
    this.syncCount = 0;
    this.errorCount = 0;
    this.lastHealthCheck = null;
  }

  /**
   * Initialize the coordinator
   */
  async initialize() {
    console.log('🤖 HypeAI Database Coordinator Agent');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('📋 Configuration:');
    console.log(`   Database: ${dbConfig.database}`);
    console.log(`   Host: ${dbConfig.host}:${dbConfig.port}`);
    console.log(`   User: ${dbConfig.user}`);
    console.log(`   Pool: ${dbConfig.min}-${dbConfig.max} connections`);
    console.log('');

    // Test connection
    const isConnected = await testConnection();
    if (!isConnected) {
      throw new Error('Failed to connect to database');
    }

    // Register this agent
    await this.registerAgent();

    console.log('✅ Database Coordinator initialized\n');
    console.log('📡 Listening for sync requests...\n');
  }

  /**
   * Register this agent in the database
   */
  async registerAgent() {
    await query(`
      INSERT INTO active_agents (agent_name, agent_type, pid, status, config)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (agent_name)
      DO UPDATE SET
        pid = $3,
        status = $4,
        last_heartbeat = CURRENT_TIMESTAMP,
        error_count = 0
    `, [
      this.agentName,
      'database',
      process.pid,
      'running',
      JSON.stringify(dbConfig)
    ]);
  }

  /**
   * Send heartbeat to show agent is alive
   */
  async sendHeartbeat() {
    try {
      await query(`
        UPDATE active_agents
        SET last_heartbeat = CURRENT_TIMESTAMP
        WHERE agent_name = $1
      `, [this.agentName]);
    } catch (error) {
      console.error('❌ Heartbeat failed:', error.message);
    }
  }

  /**
   * Sync project state from JSON files to database
   */
  async syncProjectState() {
    const dataPath = path.join(__dirname, '../../data/project-coordination/project-state.json');

    try {
      const data = JSON.parse(await fs.readFile(dataPath, 'utf8'));

      await query(`
        UPDATE project_state SET
          telegram_members = $1,
          twitter_followers = $2,
          website_visits = $3,
          token_holders = $4,
          total_value_usd = $5,
          last_update = CURRENT_TIMESTAMP
        WHERE id = 1
      `, [
        data.metrics.telegramMembers || 0,
        data.metrics.twitterFollowers || 0,
        data.metrics.websiteVisits || 0,
        data.metrics.tokenHolders || 0,
        data.metrics.totalValue || 0
      ]);

      this.syncCount++;
      console.log('✅ Project state synced to database');
    } catch (error) {
      console.error('❌ Failed to sync project state:', error.message);
      this.errorCount++;
    }
  }

  /**
   * Sync tokenomics distribution from JSON to database
   */
  async syncTokenomicsDistribution() {
    const dataPath = path.join(__dirname, '../../data/tokenomics/distribution-state.json');

    try {
      const data = JSON.parse(await fs.readFile(dataPath, 'utf8'));

      const client = await getClient();

      try {
        await client.beginTransaction();

        for (const [allocation, amount] of Object.entries(data.distributed)) {
          await client.query(`
            UPDATE tokenomics_distribution
            SET distributed = $1, last_update = CURRENT_TIMESTAMP
            WHERE allocation_name = $2
          `, [amount, allocation]);
        }

        for (const [allocation, amount] of Object.entries(data.locked)) {
          await client.query(`
            UPDATE tokenomics_distribution
            SET locked = $1, last_update = CURRENT_TIMESTAMP
            WHERE allocation_name = $2
          `, [amount, allocation]);
        }

        await client.commitTransaction();

        this.syncCount++;
        console.log('✅ Tokenomics distribution synced to database');
      } catch (error) {
        await client.rollbackTransaction();
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('❌ Failed to sync tokenomics:', error.message);
      this.errorCount++;
    }
  }

  /**
   * Sync services pricing from JSON to database
   */
  async syncServicesPricing() {
    const dataPath = path.join(__dirname, '../../public/variant-2/data/services/pricing-plans.json');

    try {
      const data = JSON.parse(await fs.readFile(dataPath, 'utf8'));

      const client = await getClient();

      try {
        await client.beginTransaction();

        // Sync Twitter Automation pricing
        if (data.services['twitter-automation']) {
          const twitter = data.services['twitter-automation'];

          for (const [planName, planData] of Object.entries(twitter.plans)) {
            await client.query(`
              INSERT INTO service_pricing (service_id, plan_name, price, price_with_hype, billing_period, features)
              VALUES ($1, $2, $3, $4, $5, $6)
              ON CONFLICT (service_id, plan_name)
              DO UPDATE SET
                price = $3,
                price_with_hype = $4,
                features = $6,
                last_update = CURRENT_TIMESTAMP
            `, [
              'twitter-001',
              planName,
              planData.price,
              planData.priceWithHype,
              planData.billingPeriod,
              JSON.stringify(planData.features)
            ]);
          }
        }

        // Sync Resume/CV pricing
        if (data.services['resume-cv']) {
          const resume = data.services['resume-cv'];

          for (const [planName, planData] of Object.entries(resume.plans)) {
            await client.query(`
              INSERT INTO service_pricing (service_id, plan_name, price, price_with_hype, billing_period, features)
              VALUES ($1, $2, $3, $4, $5, $6)
              ON CONFLICT (service_id, plan_name)
              DO UPDATE SET
                price = $3,
                price_with_hype = $4,
                features = $6,
                last_update = CURRENT_TIMESTAMP
            `, [
              'resume-001',
              planName,
              planData.price,
              planData.priceWithHype,
              planData.billingPeriod,
              JSON.stringify(planData.features)
            ]);
          }
        }

        await client.commitTransaction();

        this.syncCount++;
        console.log('✅ Services pricing synced to database');
      } catch (error) {
        await client.rollbackTransaction();
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('❌ Failed to sync services pricing:', error.message);
      this.errorCount++;
    }
  }

  /**
   * Sync service catalog from JSON to database
   */
  async syncServiceCatalog() {
    const dataPath = path.join(__dirname, '../../public/variant-2/data/services/service-catalog.json');

    try {
      const data = JSON.parse(await fs.readFile(dataPath, 'utf8'));

      const client = await getClient();

      try {
        await client.beginTransaction();

        // Sync active services
        for (const service of data.activeServices) {
          await client.query(`
            INSERT INTO services_catalog (
              service_id, name, status, category, priority,
              landing_page, price_range, delivery_time, agents
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            ON CONFLICT (service_id)
            DO UPDATE SET
              status = $3,
              priority = $5,
              landing_page = $6,
              price_range = $7,
              delivery_time = $8,
              last_update = CURRENT_TIMESTAMP
          `, [
            service.id,
            service.name,
            service.status,
            service.category,
            service.priority,
            service.landingPage,
            service.priceRange,
            service.deliveryTime,
            JSON.stringify(service.agents)
          ]);
        }

        // Update statistics
        await client.query(`
          INSERT INTO service_statistics (
            id, total_services, active_services, total_revenue, total_clients
          )
          VALUES (1, $1, $2, $3, $4)
          ON CONFLICT (id)
          DO UPDATE SET
            total_services = $1,
            active_services = $2,
            total_revenue = $3,
            total_clients = $4,
            last_update = CURRENT_TIMESTAMP
        `, [
          data.meta.totalServices,
          data.meta.activeServices,
          data.statistics.totalRevenue || 0,
          data.statistics.totalClients || 0
        ]);

        await client.commitTransaction();

        this.syncCount++;
        console.log('✅ Service catalog synced to database');
      } catch (error) {
        await client.rollbackTransaction();
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('❌ Failed to sync service catalog:', error.message);
      this.errorCount++;
    }
  }

  /**
   * Sync all data from JSON files to database
   */
  async syncAllFromJSON() {
    console.log('🔄 Syncing data from JSON files to database...');
    await this.syncProjectState();
    await this.syncTokenomicsDistribution();
    await this.syncServicesPricing();
    await this.syncServiceCatalog();
    console.log('');
  }

  /**
   * Get project state from database
   */
  async getProjectState() {
    const result = await query('SELECT * FROM project_state WHERE id = 1');
    return result.rows[0];
  }

  /**
   * Get tokenomics distribution from database
   */
  async getTokenomicsDistribution() {
    const result = await query('SELECT * FROM tokenomics_distribution ORDER BY allocation_name');
    return result.rows;
  }

  /**
   * Get all active agents
   */
  async getActiveAgents() {
    const result = await query(`
      SELECT * FROM active_agents
      WHERE status = 'running'
      AND last_heartbeat > NOW() - INTERVAL '5 minutes'
      ORDER BY agent_name
    `);
    return result.rows;
  }

  /**
   * Log activity from another agent
   */
  async logAgentActivity(agentName, activityType, description, data = null) {
    await query(`
      INSERT INTO agent_activity (agent_name, activity_type, description, data)
      VALUES ($1, $2, $3, $4)
    `, [agentName, activityType, description, data ? JSON.stringify(data) : null]);
  }

  /**
   * Create project alert
   */
  async createAlert(severity, message, source, data = null) {
    await query(`
      INSERT INTO project_alerts (severity, message, source, data)
      VALUES ($1, $2, $3, $4)
    `, [severity, message, source, data ? JSON.stringify(data) : null]);
  }

  /**
   * Health check
   */
  async performHealthCheck() {
    const stats = getPoolStats();
    const projectState = await this.getProjectState();
    const agents = await this.getActiveAgents();

    const health = {
      timestamp: new Date(),
      database: {
        connected: true,
        pool: stats,
      },
      project: {
        telegramMembers: projectState.telegram_members,
        twitterFollowers: projectState.twitter_followers,
        tokenHolders: projectState.token_holders,
      },
      agents: {
        active: agents.length,
        list: agents.map(a => a.agent_name),
      },
      coordinator: {
        uptime: Math.floor((Date.now() - this.startTime) / 1000),
        syncCount: this.syncCount,
        errorCount: this.errorCount,
      }
    };

    this.lastHealthCheck = health;
    return health;
  }

  /**
   * Generate and display status report
   */
  async displayStatus() {
    const health = await this.performHealthCheck();

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 Database Coordinator Status Report');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    console.log('🗄️  Database:');
    console.log(`   Connection: ${health.database.connected ? '✅ Connected' : '❌ Disconnected'}`);
    console.log(`   Pool: ${health.database.pool.totalCount} total, ${health.database.pool.idleCount} idle, ${health.database.pool.waitingCount} waiting`);
    console.log('');
    console.log('📈 Project Metrics:');
    console.log(`   Telegram: ${health.project.telegramMembers} members`);
    console.log(`   Twitter: ${health.project.twitterFollowers} followers`);
    console.log(`   Token Holders: ${health.project.tokenHolders}`);
    console.log('');
    console.log('🤖 Active Agents: ' + health.agents.active);
    health.agents.list.forEach(name => {
      console.log(`   ✓ ${name}`);
    });
    console.log('');
    console.log('⚙️  Coordinator:');
    console.log(`   Uptime: ${Math.floor(health.coordinator.uptime / 60)} minutes`);
    console.log(`   Syncs: ${health.coordinator.syncCount}`);
    console.log(`   Errors: ${health.coordinator.errorCount}`);
    console.log('');
  }

  /**
   * Start the coordinator
   */
  async start() {
    await this.initialize();

    // Initial sync
    await this.syncAllFromJSON();

    // Schedule periodic tasks
    setInterval(() => this.sendHeartbeat(), 30000); // Every 30 seconds
    setInterval(() => this.syncAllFromJSON(), 60000); // Every 1 minute
    setInterval(() => this.displayStatus(), 300000); // Every 5 minutes

    // Display initial status
    await this.displayStatus();
  }
}

// Start the coordinator
const coordinator = new DatabaseCoordinator();

coordinator.start().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n⏹️  Stopping Database Coordinator...');

  await query(`
    UPDATE active_agents
    SET status = 'stopped'
    WHERE agent_name = $1
  `, ['database-coordinator']);

  console.log('✅ Database Coordinator stopped\n');
  process.exit(0);
});

// Export for use by other agents
module.exports = { DatabaseCoordinator };
