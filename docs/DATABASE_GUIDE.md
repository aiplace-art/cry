# HypeAI Unified Database Guide

## 📋 Overview

HypeAI uses a unified PostgreSQL database that all AI agents reference and sync with. This ensures data consistency across the entire project.

## 🗄️ Database Schema

The database contains several logical groups of tables:

### 1. Private Sale Tables
- `private_sale_config` - Sale configuration (price, limits, vesting)
- `private_sale_purchases` - Purchase records
- `private_sale_wallet_limits` - Anti-whale protection tracking
- `private_sale_referrals` - Referral system
- `private_sale_claims` - Token claims (vesting)

### 2. Project Coordination Tables
- `project_state` - Overall project metrics
- `project_milestones` - Milestone tracking
- `project_alerts` - System-wide alerts

### 3. Agent Coordination Tables
- `active_agents` - Registry of all active AI agents
- `agent_activity` - Activity log for all agents
- `agent_messages` - Inter-agent messaging

### 4. Tokenomics Tables
- `tokenomics_distribution` - Token allocation state
- `distribution_flows` - Distribution history
- `validation_alerts` - Tokenomics validation alerts

### 5. Social Media Tables
- `twitter_metrics` - Twitter statistics
- `twitter_posts` - Tweet history
- `telegram_metrics` - Telegram statistics

### 6. Financial & Analytics Tables
- `financial_reports` - Generated financial reports
- `growth_metrics` - Growth tracking
- `marketing_insights` - Marketing analytics

## 🚀 Quick Start

### 1. Install PostgreSQL

**macOS:**
```bash
brew install postgresql@14
brew services start postgresql@14
```

**Ubuntu/Debian:**
```bash
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

**Windows:**
Download from [postgresql.org](https://www.postgresql.org/download/windows/)

### 2. Create Database User

```bash
bash scripts/database/create-user.sh
```

This creates:
- User: `hypeai_user`
- Password: `hypeai_password`
- Database: `hypeai`

### 3. Initialize Database

**Option A - Bash script:**
```bash
bash scripts/database/init-database.sh
```

**Option B - Node.js script:**
```bash
node scripts/database/init-database.js
```

### 4. Start Database Coordinator

```bash
node src/bots/database-coordinator-agent.js
```

The coordinator will:
- Maintain database connections
- Sync data from JSON files
- Provide health monitoring
- Enable inter-agent communication

## 🔌 Using the Database in Your Agent

### Import the Database Pool

```javascript
const { pool, query, getClient } = require('../backend/utils/database-pool');
```

### Simple Query

```javascript
const result = await query('SELECT * FROM project_state WHERE id = 1');
const projectState = result.rows[0];
console.log('Twitter followers:', projectState.twitter_followers);
```

### Transaction

```javascript
const client = await getClient();

try {
  await client.beginTransaction();

  await client.query('UPDATE project_state SET twitter_followers = $1', [105]);
  await client.query('INSERT INTO agent_activity (agent_name, activity_type) VALUES ($1, $2)',
    ['my-agent', 'twitter_update']);

  await client.commitTransaction();
} catch (error) {
  await client.rollbackTransaction();
  throw error;
} finally {
  client.release();
}
```

### Register Your Agent

```javascript
await query(`
  INSERT INTO active_agents (agent_name, agent_type, pid, status)
  VALUES ($1, $2, $3, $4)
  ON CONFLICT (agent_name) DO UPDATE SET
    status = $4,
    last_heartbeat = CURRENT_TIMESTAMP
`, ['my-agent', 'marketing', process.pid, 'running']);
```

### Log Activity

```javascript
await query(`
  INSERT INTO agent_activity (agent_name, activity_type, description, data)
  VALUES ($1, $2, $3, $4)
`, [
  'my-agent',
  'task_completed',
  'Posted 5 tweets',
  JSON.stringify({ tweets: 5, engagement: 1250 })
]);
```

### Send Inter-Agent Message

```javascript
await query(`
  INSERT INTO agent_messages (from_agent, to_agent, message_type, payload)
  VALUES ($1, $2, $3, $4)
`, [
  'marketing-agent',
  'analytics-agent',
  'campaign_started',
  JSON.stringify({ campaign: 'testnet-launch', budget: 5000 })
]);
```

### Read Messages

```javascript
const result = await query(`
  SELECT * FROM agent_messages
  WHERE to_agent = $1 AND is_read = false
  ORDER BY created_at DESC
`, ['my-agent']);

for (const msg of result.rows) {
  console.log('Message from:', msg.from_agent);
  console.log('Type:', msg.message_type);
  console.log('Payload:', msg.payload);

  // Mark as read
  await query('UPDATE agent_messages SET is_read = true, read_at = NOW() WHERE id = $1', [msg.id]);
}
```

## 📊 Database Coordinator Features

The Database Coordinator agent provides:

### 1. Auto-Sync from JSON Files
- Syncs `data/project-coordination/project-state.json` every minute
- Syncs `data/tokenomics/distribution-state.json` every minute
- Ensures database always has latest data

### 2. Health Monitoring
- Tracks database connection pool
- Monitors active agents
- Generates health reports every 5 minutes

### 3. Heartbeat System
- All agents can send heartbeats
- Coordinator detects stale agents (no heartbeat for 5+ minutes)

### 4. Inter-Agent Communication
- Agents can send messages to each other
- Broadcast messages to all agents
- Message queue with read receipts

## 🔧 Configuration

Edit `scripts/.env.database`:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=hypeai
DB_USER=hypeai_user
DB_PASSWORD=hypeai_password

DB_POOL_MAX=20
DB_POOL_MIN=5
DB_IDLE_TIMEOUT=30000
DB_CONNECT_TIMEOUT=10000
```

## 🛠️ Maintenance

### View Database Tables

```bash
psql -U hypeai_user -d hypeai -c "\dt"
```

### Check Active Agents

```sql
SELECT agent_name, status, last_heartbeat
FROM active_agents
WHERE status = 'running';
```

### View Recent Activity

```sql
SELECT agent_name, activity_type, description, created_at
FROM agent_activity
ORDER BY created_at DESC
LIMIT 20;
```

### Check Project Metrics

```sql
SELECT * FROM project_state WHERE id = 1;
```

### View Distribution State

```sql
SELECT * FROM tokenomics_distribution;
```

## 🚨 Troubleshooting

### "Connection refused"

PostgreSQL not running:
```bash
# macOS
brew services start postgresql@14

# Linux
sudo systemctl start postgresql
```

### "Database does not exist"

Run initialization:
```bash
node scripts/database/init-database.js
```

### "Permission denied"

Create user and database:
```bash
bash scripts/database/create-user.sh
```

### "Pool connection timeout"

Increase timeout in `.env.database`:
```env
DB_CONNECT_TIMEOUT=30000
```

## 📝 Best Practices

1. **Always use the pool** - Don't create new connections
2. **Use transactions** - For multi-step operations
3. **Log activity** - Help other agents understand what you did
4. **Send heartbeats** - Every 30-60 seconds
5. **Handle errors** - Always rollback failed transactions
6. **Release clients** - Use try/finally to release connections

## 🎯 Next Steps

1. Start the database coordinator
2. Update your agents to use the database
3. Register your agents in `active_agents` table
4. Use inter-agent messaging for coordination
5. Monitor health reports every 5 minutes

For more details, see the source code in:
- `/config/database/schema.sql` - Full schema
- `/src/backend/utils/database-pool.js` - Connection pool utilities
- `/src/bots/database-coordinator-agent.js` - Coordinator implementation
