# 🚀 Quick Start: Project Management Agents

## Overview

Complete AI-powered project management system for HypeAI. **6 specialized agents** work 24/7 to manage every aspect of your project:

- 👥 **Community Manager** - Telegram engagement & growth
- 📊 **Analytics Tracker** - Metrics & trends
- 🚀 **Launch Coordinator** - Timeline & milestones
- 🔍 **Social Monitor** - Twitter mentions & sentiment
- 📢 **Marketing Executor** - Content & campaigns
- 🎯 **Master Coordinator** - Orchestrates all agents

## Installation

### 1. Install PM2 (if not already installed)
```bash
npm install -g pm2
```

### 2. Start All Agents
```bash
npm run project:start
```

That's it! All 6 agents are now running 24/7.

## Usage

### Monitor Agents
```bash
npm run project:status    # View all agents status
npm run project:logs      # View agent logs
```

### Control Agents
```bash
npm run project:stop      # Stop all agents
npm run project:restart   # Restart all agents
```

### Telegram Bot Commands

Once agents are running, use these commands in Telegram:

**📊 Status & Metrics:**
- `/status` - Full project report
- `/metrics` - Current numbers
- `/agents` - List all agents

**🚀 Launch:**
- `/launch` - Launch readiness check
- `/alerts` - View important alerts

**❓ Help:**
- `/help` - All available commands

## What Each Agent Does

### 👥 Community Manager
- Welcomes new Telegram members
- Tracks engagement rate
- Monitors daily active users
- Reports growth metrics

**Key Metrics:**
- Total members
- Active users (24h)
- Engagement rate
- Growth rate

### 📊 Analytics Tracker
- Collects website analytics
- Tracks conversion rates
- Analyzes growth trends
- Monitors traffic sources

**Key Metrics:**
- Website visits (total/unique)
- Conversion rate
- Growth rate
- Traffic sources

### 🚀 Launch Coordinator
- Manages launch timeline
- Tracks milestone completion
- Checks readiness status
- Identifies blockers

**Key Metrics:**
- Days to launch (Nov 15, 2025)
- Readiness score (0-100%)
- Milestones completed
- Blocker count

### 🔍 Social Monitor
- Tracks Twitter mentions
- Analyzes sentiment
- Detects viral potential
- Monitors brand health

**Key Metrics:**
- Total mentions
- Sentiment score (-1 to +1)
- Viral potential (0-100)
- Trending status

### 📢 Marketing Executor
- Publishes scheduled content
- Executes campaigns
- Optimizes engagement
- Tracks ROI

**Key Metrics:**
- Posts published
- Total reach
- Engagement rate
- Content performance

### 🎯 Master Coordinator
- Orchestrates all agents
- Aggregates metrics
- Manages alerts
- Provides Telegram interface

## Launch Milestones

Current milestones being tracked:

✅ **Completed:**
- Website deployed

⏳ **In Progress:**
- [ ] 100 community members
- [ ] 500 community members
- [ ] 1000 community members (CRITICAL)
- [ ] 100 Twitter followers
- [ ] All bots running
- [ ] Content prepared
- [ ] Wallet tested

## Data Storage

All agent data is stored in:
```
data/project-coordination/
├── project-state.json       # Main project state
├── daily-metrics.json       # Historical metrics
├── alerts.json              # Active alerts
├── community-metrics.json   # Community data
├── analytics-metrics.json   # Analytics data
├── launch-metrics.json      # Launch status
├── social-metrics.json      # Social media data
└── marketing-metrics.json   # Marketing data
```

## Monitoring

### View Real-Time Logs
```bash
# All agents
pm2 logs

# Specific agent
pm2 logs project-coordinator
pm2 logs community-manager
pm2 logs analytics-tracker
pm2 logs launch-coordinator
pm2 logs social-monitor
pm2 logs marketing-executor
```

### Check Agent Status
```bash
pm2 status
```

Output example:
```
┌────┬────────────────────┬──────────┬──────┬───────────┬──────────┬──────────┐
│ id │ name               │ mode     │ ↺    │ status    │ cpu      │ memory   │
├────┼────────────────────┼──────────┼──────┼───────────┼──────────┼──────────┤
│ 0  │ project-coordinator│ fork     │ 0    │ online    │ 0%       │ 45.2mb   │
│ 1  │ community-manager  │ fork     │ 0    │ online    │ 0%       │ 32.1mb   │
│ 2  │ analytics-tracker  │ fork     │ 0    │ online    │ 0%       │ 28.5mb   │
│ 3  │ launch-coordinator │ fork     │ 0    │ online    │ 0%       │ 25.3mb   │
│ 4  │ social-monitor     │ fork     │ 0    │ online    │ 0%       │ 30.8mb   │
│ 5  │ marketing-executor │ fork     │ 0    │ online    │ 0%       │ 27.9mb   │
└────┴────────────────────┴──────────┴──────┴───────────┴──────────┴──────────┘
```

### View Agent Details
```bash
pm2 show project-coordinator
```

## Troubleshooting

### Agent Not Starting
```bash
# Check logs for errors
pm2 logs project-coordinator --err

# Restart specific agent
pm2 restart project-coordinator

# Restart all agents
npm run project:restart
```

### No Metrics Updating
```bash
# Check if agents are running
pm2 status

# Check data directory permissions
ls -la data/project-coordination/

# Restart analytics agent
pm2 restart analytics-tracker
```

### Telegram Bot Not Responding
```bash
# Check coordinator status
pm2 logs project-coordinator

# Verify Telegram token in config
cat src/bots/solana-bot-config.json

# Restart coordinator
pm2 restart project-coordinator
```

## Advanced

### Manual Agent Start
```bash
# Start coordinator only
node src/bots/project-master-coordinator.js

# Start specific agent
node src/bots/community-manager-agent.js
```

### Custom Configuration
Edit `ecosystem.config.cjs` to customize:
- Memory limits
- Log locations
- Auto-restart settings
- Environment variables

### Add New Agent
1. Create agent file in `src/bots/`
2. Add to `ecosystem.config.cjs`
3. Update coordinator's agent list
4. Restart: `npm run project:restart`

## Performance

**Resource Usage (typical):**
- CPU: <5% combined
- RAM: ~200MB total
- Disk: Minimal (logs rotate)

**Uptime:**
- Target: 99.9%
- Auto-restart on failure
- PM2 keeps processes alive

## Support

**Need Help?**
- Check logs: `npm run project:logs`
- View status: `npm run project:status`
- Restart: `npm run project:restart`
- Read full docs: `docs/PROJECT_MANAGEMENT_SYSTEM.md`

## What's Next?

After starting agents:

1. **Monitor `/status` daily** via Telegram
2. **Check milestone progress** with `/launch`
3. **Review alerts** with `/alerts`
4. **Track growth** with `/metrics`
5. **Engage community** - agents handle automation!

---

## Quick Reference

```bash
# Start agents
npm run project:start

# Check status
npm run project:status

# View logs
npm run project:logs

# Stop agents
npm run project:stop

# Restart agents
npm run project:restart
```

**Telegram Commands:**
`/status` | `/metrics` | `/launch` | `/alerts` | `/agents` | `/help`

---

**Launch Date:** November 15, 2025
**Days Remaining:** Calculating...
**Readiness:** Tracking...

🤖 **6 AI Agents working 24/7 for your project success!**
