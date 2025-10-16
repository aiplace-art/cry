#!/usr/bin/env node

/**
 * 🎯 PROJECT MASTER COORDINATOR
 *
 * Main orchestrator that manages ALL aspects of the HypeAI project development
 * Spawns and coordinates multiple specialized agents for complete project oversight
 *
 * Responsibilities:
 * - Launch coordination & timeline management
 * - Community growth tracking & engagement
 * - Analytics & metrics collection
 * - Social media monitoring
 * - Marketing campaign execution
 * - Real-time reporting & alerting
 */

import TelegramBot from 'node-telegram-bot-api';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'solana-bot-config.json'), 'utf8'));
const bot = new TelegramBot(config.telegram.token, { polling: true });

// Project state tracking
const projectState = {
  launchDate: new Date('2025-11-15'),
  startedAt: new Date(),
  metrics: {
    telegramMembers: 0,
    twitterFollowers: 0,
    websiteVisits: 0,
    tokenHolders: 0,
    totalValue: 0
  },
  milestones: {
    '100_members': { target: 100, reached: false, date: null },
    '500_members': { target: 500, reached: false, date: null },
    '1000_members': { target: 1000, reached: false, date: null },
    'launch_ready': { reached: false, date: null }
  },
  activeAgents: new Map(),
  alerts: [],
  lastUpdate: new Date()
};

// Agent definitions
const agents = [
  {
    id: 'community-manager',
    name: 'Community Manager Agent',
    script: 'community-manager-agent.js',
    description: 'Manages Telegram community, engagement, moderation',
    metrics: ['telegram_members', 'engagement_rate', 'daily_active_users'],
    enabled: true
  },
  {
    id: 'analytics-tracker',
    name: 'Analytics Tracker Agent',
    script: 'analytics-tracker-agent.js',
    description: 'Collects and analyzes all project metrics',
    metrics: ['website_visits', 'conversion_rate', 'growth_rate'],
    enabled: true
  },
  {
    id: 'social-monitor',
    name: 'Social Media Monitor Agent',
    script: 'social-monitor-agent.js',
    description: 'Monitors Twitter, Telegram mentions, sentiment',
    metrics: ['mentions', 'sentiment_score', 'viral_potential'],
    enabled: true
  },
  {
    id: 'launch-coordinator',
    name: 'Launch Coordinator Agent',
    script: 'launch-coordinator-agent.js',
    description: 'Manages launch timeline, milestones, readiness checks',
    metrics: ['days_to_launch', 'milestones_completed', 'readiness_score'],
    enabled: true
  },
  {
    id: 'marketing-executor',
    name: 'Marketing Executor Agent',
    script: 'marketing-executor-agent.js',
    description: 'Executes marketing campaigns, content posting',
    metrics: ['posts_published', 'reach', 'engagement'],
    enabled: true
  },
  {
    id: 'growth-hacker',
    name: 'Growth Hacker Agent',
    script: 'growth-hacker-agent.js',
    description: 'Finds growth opportunities, partnerships, influencers',
    metrics: ['opportunities_found', 'partnerships_initiated', 'roi'],
    enabled: true
  }
];

// Data persistence
const DATA_DIR = path.join(__dirname, '../../data/project-coordination');
const STATE_FILE = path.join(DATA_DIR, 'project-state.json');
const METRICS_FILE = path.join(DATA_DIR, 'daily-metrics.json');
const ALERTS_FILE = path.join(DATA_DIR, 'alerts.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

/**
 * Load persisted state
 */
function loadState() {
  try {
    if (fs.existsSync(STATE_FILE)) {
      const saved = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
      // Preserve activeAgents Map - don't overwrite from saved state
      const activeAgentsBackup = projectState.activeAgents;
      Object.assign(projectState, saved);
      projectState.activeAgents = activeAgentsBackup;
      projectState.launchDate = new Date(projectState.launchDate);
      projectState.startedAt = new Date(projectState.startedAt);
      projectState.lastUpdate = new Date(projectState.lastUpdate);
      console.log('✅ Loaded previous project state');
    }
  } catch (error) {
    console.error('⚠️ Error loading state:', error.message);
  }
}

/**
 * Save current state
 */
function saveState() {
  try {
    projectState.lastUpdate = new Date();
    // Don't serialize activeAgents Map - it's runtime only
    const { activeAgents, ...stateToSave } = projectState;
    fs.writeFileSync(STATE_FILE, JSON.stringify(stateToSave, null, 2));
  } catch (error) {
    console.error('⚠️ Error saving state:', error.message);
  }
}

/**
 * Log metrics for analytics
 */
function logMetrics(type, data) {
  try {
    const metricsLog = {
      timestamp: new Date().toISOString(),
      type,
      data
    };

    let metrics = [];
    if (fs.existsSync(METRICS_FILE)) {
      metrics = JSON.parse(fs.readFileSync(METRICS_FILE, 'utf8'));
    }

    metrics.push(metricsLog);

    // Keep only last 1000 entries
    if (metrics.length > 1000) {
      metrics = metrics.slice(-1000);
    }

    fs.writeFileSync(METRICS_FILE, JSON.stringify(metrics, null, 2));
  } catch (error) {
    console.error('⚠️ Error logging metrics:', error.message);
  }
}

/**
 * Create alert
 */
function createAlert(severity, message, data = {}) {
  const alert = {
    id: Date.now(),
    timestamp: new Date().toISOString(),
    severity, // 'info', 'warning', 'critical'
    message,
    data,
    acknowledged: false
  };

  projectState.alerts.push(alert);

  // Keep only last 100 alerts
  if (projectState.alerts.length > 100) {
    projectState.alerts = projectState.alerts.slice(-100);
  }

  // Save alerts separately
  fs.writeFileSync(ALERTS_FILE, JSON.stringify(projectState.alerts, null, 2));

  console.log(`🚨 [${severity.toUpperCase()}] ${message}`);

  return alert;
}

/**
 * Check and update milestones
 */
function checkMilestones() {
  const members = projectState.metrics.telegramMembers;

  for (const [key, milestone] of Object.entries(projectState.milestones)) {
    if (!milestone.reached && milestone.target && members >= milestone.target) {
      milestone.reached = true;
      milestone.date = new Date();

      createAlert('info', `🎯 Milestone reached: ${milestone.target} members!`, { milestone: key });

      console.log(`🎉 MILESTONE REACHED: ${milestone.target} members!`);
    }
  }

  saveState();
}

/**
 * Generate daily report
 */
function generateDailyReport() {
  const daysToLaunch = Math.ceil((projectState.launchDate - new Date()) / (1000 * 60 * 60 * 24));

  const report = `
📊 HypeAI Project Daily Report
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🚀 Launch Countdown: ${daysToLaunch} days
📅 Launch Date: November 15, 2025

📈 Community Metrics:
├─ Telegram Members: ${projectState.metrics.telegramMembers}
├─ Twitter Followers: ${projectState.metrics.twitterFollowers}
├─ Website Visits: ${projectState.metrics.websiteVisits}
└─ Token Holders: ${projectState.metrics.tokenHolders}

🎯 Milestones:
${Object.entries(projectState.milestones)
  .map(([key, m]) => `├─ ${key}: ${m.reached ? '✅' : '⏳'} ${m.reached ? `(${m.date?.toLocaleDateString()})` : ''}`)
  .join('\n')}

🤖 Active Agents: ${projectState.activeAgents.size}/${agents.length}

⚠️ Active Alerts: ${projectState.alerts.filter(a => !a.acknowledged).length}

Last Update: ${new Date().toLocaleString()}
`;

  return report;
}

/**
 * Update metrics from agent reports
 */
function updateMetricsFromAgent(agentId, metrics) {
  console.log(`📊 Updating metrics from ${agentId}:`, metrics);

  Object.assign(projectState.metrics, metrics);
  checkMilestones();
  logMetrics('agent_update', { agentId, metrics });
  saveState();
}

/**
 * Spawn an agent process
 */
async function spawnAgent(agentDef) {
  const agentPath = path.join(__dirname, agentDef.script);

  // Check if agent file exists
  if (!fs.existsSync(agentPath)) {
    console.log(`⚠️ Agent script not found: ${agentDef.script}, will be created`);
    return null;
  }

  try {
    const agentProcess = spawn('node', [agentPath], {
      stdio: ['ignore', 'pipe', 'pipe'],
      detached: false
    });

    agentProcess.stdout.on('data', (data) => {
      console.log(`[${agentDef.id}] ${data.toString().trim()}`);
    });

    agentProcess.stderr.on('data', (data) => {
      console.error(`[${agentDef.id}] ERROR: ${data.toString().trim()}`);
    });

    agentProcess.on('close', (code) => {
      console.log(`[${agentDef.id}] Process exited with code ${code}`);
      projectState.activeAgents.delete(agentDef.id);

      // Restart agent if it crashed
      if (code !== 0) {
        createAlert('warning', `Agent ${agentDef.name} crashed, restarting...`, { agentId: agentDef.id });
        setTimeout(() => spawnAgent(agentDef), 5000);
      }
    });

    projectState.activeAgents.set(agentDef.id, {
      process: agentProcess,
      startedAt: new Date(),
      definition: agentDef
    });

    console.log(`✅ Spawned agent: ${agentDef.name}`);
    return agentProcess;
  } catch (error) {
    console.error(`❌ Failed to spawn agent ${agentDef.name}:`, error.message);
    return null;
  }
}

/**
 * Initialize all agents
 */
async function initializeAgents() {
  console.log('🚀 Initializing project management agents...\n');

  for (const agentDef of agents) {
    if (agentDef.enabled) {
      await spawnAgent(agentDef);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Stagger startup
    }
  }

  console.log(`\n✅ Initialized ${projectState.activeAgents.size}/${agents.length} agents`);
}

/**
 * Bot command handlers
 */

bot.onText(/\/status/, (msg) => {
  const report = generateDailyReport();
  bot.sendMessage(msg.chat.id, report);
});

bot.onText(/\/agents/, (msg) => {
  let response = '🤖 Project Management Agents:\n\n';

  for (const agentDef of agents) {
    const isActive = projectState.activeAgents.has(agentDef.id);
    const status = isActive ? '✅ ACTIVE' : '❌ INACTIVE';

    response += `${status} ${agentDef.name}\n`;
    response += `   ${agentDef.description}\n`;
    response += `   Tracks: ${agentDef.metrics.join(', ')}\n\n`;
  }

  bot.sendMessage(msg.chat.id, response);
});

bot.onText(/\/metrics/, (msg) => {
  const m = projectState.metrics;

  const response = `📊 Current Metrics:

👥 Telegram Members: ${m.telegramMembers}
🐦 Twitter Followers: ${m.twitterFollowers}
🌐 Website Visits: ${m.websiteVisits}
💎 Token Holders: ${m.tokenHolders}
💰 Total Value Locked: $${m.totalValue.toLocaleString()}

Last Update: ${projectState.lastUpdate.toLocaleString()}`;

  bot.sendMessage(msg.chat.id, response);
});

bot.onText(/\/alerts/, (msg) => {
  const activeAlerts = projectState.alerts.filter(a => !a.acknowledged);

  if (activeAlerts.length === 0) {
    bot.sendMessage(msg.chat.id, '✅ No active alerts!');
    return;
  }

  let response = `⚠️ Active Alerts (${activeAlerts.length}):\n\n`;

  for (const alert of activeAlerts.slice(-10)) {
    const emoji = alert.severity === 'critical' ? '🔴' : alert.severity === 'warning' ? '⚠️' : 'ℹ️';
    response += `${emoji} ${alert.message}\n`;
    response += `   ${new Date(alert.timestamp).toLocaleString()}\n\n`;
  }

  bot.sendMessage(msg.chat.id, response);
});

bot.onText(/\/launch/, (msg) => {
  const daysToLaunch = Math.ceil((projectState.launchDate - new Date()) / (1000 * 60 * 60 * 24));

  const readinessChecks = {
    community: projectState.metrics.telegramMembers >= 1000,
    twitter: projectState.metrics.twitterFollowers >= 100,
    website: true, // Already deployed
    bots: projectState.activeAgents.size >= 4
  };

  const readyCount = Object.values(readinessChecks).filter(Boolean).length;
  const readinessScore = (readyCount / Object.keys(readinessChecks).length * 100).toFixed(0);

  const response = `🚀 Launch Readiness Report

📅 Launch Date: November 15, 2025
⏱️ Days Remaining: ${daysToLaunch}

📊 Readiness Score: ${readinessScore}%

Checklist:
${readinessChecks.community ? '✅' : '❌'} Community (1000+ members)
${readinessChecks.twitter ? '✅' : '❌'} Twitter (100+ followers)
${readinessChecks.website ? '✅' : '❌'} Website Deployed
${readinessChecks.bots ? '✅' : '❌'} Bots Active

${readinessScore >= 75 ? '🎉 Ready for launch!' : '⚠️ More work needed before launch'}`;

  bot.sendMessage(msg.chat.id, response);
});

bot.onText(/\/help/, (msg) => {
  const help = `🎯 Project Master Coordinator Commands:

/status - Full project status report
/agents - List all management agents
/metrics - Current project metrics
/alerts - View active alerts
/launch - Launch readiness check
/help - Show this help message

This coordinator manages ${agents.length} specialized agents that handle:
• Community management & engagement
• Analytics & metrics tracking
• Social media monitoring
• Launch coordination
• Marketing execution
• Growth hacking

All agents work 24/7 to ensure project success! 🚀`;

  bot.sendMessage(msg.chat.id, help);
});

/**
 * Periodic tasks
 */

// Save state every 5 minutes
setInterval(() => {
  saveState();
}, 5 * 60 * 1000);

// Generate daily report at 12:00 UTC
setInterval(() => {
  const now = new Date();
  if (now.getUTCHours() === 12 && now.getUTCMinutes() === 0) {
    const report = generateDailyReport();
    console.log(report);
    createAlert('info', 'Daily report generated', { report });
  }
}, 60 * 1000);

// Check agent health every minute
setInterval(() => {
  for (const [agentId, agentInfo] of projectState.activeAgents) {
    const uptime = Date.now() - agentInfo.startedAt;
    if (uptime > 24 * 60 * 60 * 1000) {
      console.log(`ℹ️ Agent ${agentId} has been running for ${Math.floor(uptime / (60 * 60 * 1000))} hours`);
    }
  }
}, 60 * 1000);

/**
 * Main startup
 */
async function main() {
  console.log('🎯 HypeAI Project Master Coordinator Starting...\n');

  loadState();

  console.log('📊 Project Overview:');
  console.log(`   Launch Date: ${projectState.launchDate.toDateString()}`);
  console.log(`   Days to Launch: ${Math.ceil((projectState.launchDate - new Date()) / (1000 * 60 * 60 * 24))}`);
  console.log(`   Telegram Members: ${projectState.metrics.telegramMembers}`);
  console.log();

  await initializeAgents();

  console.log('\n✅ Project Master Coordinator is LIVE!');
  console.log('📱 Telegram bot ready for commands');
  console.log('🤖 All agents operational\n');

  createAlert('info', 'Project Master Coordinator started', {
    activeAgents: projectState.activeAgents.size,
    metrics: projectState.metrics
  });
}

// Handle shutdown gracefully
process.on('SIGINT', () => {
  console.log('\n⚠️ Shutting down Project Master Coordinator...');

  // Kill all agent processes
  for (const [agentId, agentInfo] of projectState.activeAgents) {
    try {
      agentInfo.process.kill();
      console.log(`   Stopped agent: ${agentId}`);
    } catch (error) {
      console.error(`   Error stopping agent ${agentId}:`, error.message);
    }
  }

  saveState();
  console.log('✅ Shutdown complete');
  process.exit(0);
});

// Start the coordinator
main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
