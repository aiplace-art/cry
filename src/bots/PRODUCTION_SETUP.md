# HypeAI Bots - Production Setup Guide

Complete guide to deploy HypeAI Discord, Telegram, and Twitter bots in production.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Start](#quick-start)
3. [Deployment Methods](#deployment-methods)
4. [Configuration](#configuration)
5. [Monitoring](#monitoring)
6. [Troubleshooting](#troubleshooting)
7. [Scaling](#scaling)

---

## Prerequisites

### Required Software

- **Node.js** v18+ ([Download](https://nodejs.org/))
- **Docker** & **Docker Compose** ([Download](https://docs.docker.com/get-docker/))
- **PM2** (optional, for non-Docker deployment): `npm install -g pm2`
- **Git** for version control

### Required API Keys

Before deployment, obtain the following API keys:

#### Discord Bot
1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create New Application
3. Go to "Bot" section
4. Copy Bot Token
5. Copy Application ID (Client ID)
6. Enable required intents: Message Content, Server Members, Presence

#### Telegram Bot
1. Message [@BotFather](https://t.me/BotFather) on Telegram
2. Send `/newbot` and follow instructions
3. Copy the API token provided

#### Twitter Bot
1. Apply for [Twitter Developer Account](https://developer.twitter.com/)
2. Create a new app
3. Generate API Key, API Secret, Access Token, and Access Secret
4. Enable OAuth 1.0a with Read and Write permissions

---

## Quick Start

### 1. Clone & Setup

```bash
# Clone repository
git clone https://github.com/yourusername/hypeai.git
cd hypeai

# Install dependencies
npm install
```

### 2. Configure Environment

Create `.env` file in project root:

```bash
# Discord Configuration
DISCORD_TOKEN=your_discord_bot_token_here
DISCORD_CLIENT_ID=your_discord_client_id_here

# Telegram Configuration
TELEGRAM_TOKEN=your_telegram_bot_token_here

# Twitter Configuration
TWITTER_API_KEY=your_twitter_api_key_here
TWITTER_API_SECRET=your_twitter_api_secret_here
TWITTER_ACCESS_TOKEN=your_twitter_access_token_here
TWITTER_ACCESS_SECRET=your_twitter_access_secret_here

# Optional: OpenAI for AI features
OPENAI_API_KEY=your_openai_api_key_here

# Optional: Database
DATABASE_URL=postgresql://user:password@localhost:5432/hypeai
```

### 3. Deploy

```bash
# Make scripts executable
chmod +x scripts/*.sh

# Run deployment script
./scripts/deploy-bots.sh
```

Select deployment mode:
- **Option 1**: Docker (recommended for production)
- **Option 2**: PM2 (for local development)

### 4. Verify

```bash
# Check bot status
./scripts/health-check.sh

# View monitoring dashboard
# Open http://localhost:8080 in browser
```

---

## Deployment Methods

### Method 1: Docker (Recommended)

**Advantages:**
- Isolated environments
- Easy scaling
- Production-ready
- Auto-restart on failure
- Centralized logging

**Deploy:**

```bash
cd src/bots

# Build and start all bots
docker-compose up -d --build

# View logs
docker-compose logs -f

# Check status
docker-compose ps

# Restart specific bot
docker-compose restart discord-bot

# Stop all bots
docker-compose down
```

**Production Configuration:**

```yaml
# docker-compose.prod.yml
version: '3.8'
services:
  discord-bot:
    restart: always
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
        reservations:
          cpus: '0.25'
          memory: 256M
```

### Method 2: PM2

**Advantages:**
- Lightweight
- Built-in monitoring
- Log rotation
- Easy local development

**Deploy:**

```bash
# Start all bots
pm2 start pm2.ecosystem.config.js

# Monitor
pm2 monit

# View logs
pm2 logs

# Restart specific bot
pm2 restart hypeai-discord-bot

# Stop all
pm2 stop all

# Save configuration (persist after reboot)
pm2 save
pm2 startup
```

---

## Configuration

### Bot-Specific Settings

#### Discord Bot

```javascript
// src/bots/discord-bot.js
const config = {
  prefix: '!',
  adminRoles: ['Admin', 'Moderator'],
  welcomeChannel: 'general',
  logChannel: 'bot-logs',
  rateLimit: {
    maxMessages: 5,
    perSeconds: 10
  }
};
```

#### Telegram Bot

```javascript
// src/bots/telegram-bot.js
const config = {
  allowedChats: [], // Empty = all chats allowed
  adminUsers: [123456789], // Telegram user IDs
  rateLimit: {
    maxMessages: 10,
    perSeconds: 60
  }
};
```

#### Twitter Bot

```javascript
// src/bots/twitter-bot.js
const config = {
  tweetInterval: 3600000, // 1 hour in ms
  hashTags: ['#HypeAI', '#Crypto', '#AI'],
  replyToMentions: true,
  autoFollow: false
};
```

### Resource Limits

**Docker:**

```yaml
# In docker-compose.yml
services:
  discord-bot:
    deploy:
      resources:
        limits:
          memory: 500M
          cpus: '0.5'
```

**PM2:**

```javascript
// In pm2.ecosystem.config.js
{
  max_memory_restart: '500M',
  instances: 1
}
```

---

## Monitoring

### Dashboard

Access the monitoring dashboard at **http://localhost:8080**

Features:
- Real-time bot status
- Message counts
- Error tracking
- Resource usage
- Uptime statistics

### Health Checks

```bash
# Manual health check
./scripts/health-check.sh

# Docker health status
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Health}}"

# PM2 status
pm2 status
```

### Logs

**Docker:**

```bash
# All logs
docker-compose logs -f

# Specific bot
docker-compose logs -f discord-bot

# Last 100 lines
docker-compose logs --tail=100 telegram-bot
```

**PM2:**

```bash
# All logs
pm2 logs

# Specific bot
pm2 logs hypeai-discord-bot

# Error logs only
pm2 logs --err

# Clear logs
pm2 flush
```

### Alerts

Set up alerts for critical events:

```bash
# Add to crontab for daily health checks
0 */4 * * * /path/to/health-check.sh | mail -s "HypeAI Health Report" admin@example.com
```

---

## Troubleshooting

### Common Issues

#### Bot won't start

**Symptom:** Container/process exits immediately

**Solutions:**

1. Check environment variables:
```bash
docker-compose config  # Verify .env is loaded
```

2. Check logs:
```bash
docker-compose logs discord-bot
pm2 logs hypeai-discord-bot --lines 50
```

3. Verify tokens:
```bash
# Test Discord token
curl -H "Authorization: Bot YOUR_TOKEN" https://discord.com/api/v10/users/@me
```

#### High memory usage

**Symptom:** Bot consuming >500MB RAM

**Solutions:**

1. Enable log rotation:
```javascript
// PM2
max_memory_restart: '500M'

// Docker
logging:
  options:
    max-size: "10m"
    max-file: "3"
```

2. Clear cache periodically:
```javascript
setInterval(() => {
  if (global.gc) global.gc();
}, 3600000); // Every hour
```

#### Connection timeouts

**Symptom:** Bot frequently disconnects

**Solutions:**

1. Increase timeouts:
```javascript
const client = new Client({
  retryLimit: 5,
  timeout: 30000
});
```

2. Add reconnection logic:
```javascript
client.on('disconnect', () => {
  console.log('Disconnected, reconnecting...');
  setTimeout(() => client.login(token), 5000);
});
```

#### Rate limiting

**Symptom:** "429 Too Many Requests" errors

**Solutions:**

1. Implement rate limiting:
```javascript
const rateLimit = new Map();

function isRateLimited(userId) {
  const now = Date.now();
  const userLimit = rateLimit.get(userId) || { count: 0, resetAt: now + 60000 };

  if (now > userLimit.resetAt) {
    userLimit.count = 0;
    userLimit.resetAt = now + 60000;
  }

  userLimit.count++;
  rateLimit.set(userId, userLimit);

  return userLimit.count > 10; // Max 10 messages per minute
}
```

### Debug Mode

Enable debug logging:

```bash
# Docker
docker-compose -f docker-compose.yml -f docker-compose.debug.yml up

# PM2
DEBUG=* pm2 start pm2.ecosystem.config.js

# Environment variable
export DEBUG=bot:*
```

---

## Scaling

### Horizontal Scaling

Run multiple instances behind a load balancer:

```yaml
# docker-compose.scale.yml
services:
  discord-bot:
    deploy:
      replicas: 3
    environment:
      - INSTANCE_ID=${HOSTNAME}
```

Deploy:
```bash
docker-compose up -d --scale discord-bot=3
```

### Vertical Scaling

Increase resources:

```yaml
services:
  discord-bot:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
```

### Load Balancing

Use Redis for shared state:

```javascript
const Redis = require('ioredis');
const redis = new Redis(process.env.REDIS_URL);

// Store shared data
await redis.set('bot:state', JSON.stringify(state));

// Retrieve from any instance
const state = JSON.parse(await redis.get('bot:state'));
```

---

## Production Checklist

- [ ] Environment variables configured
- [ ] API tokens validated
- [ ] Docker/PM2 installed
- [ ] Bots deployed successfully
- [ ] Health checks passing
- [ ] Monitoring dashboard accessible
- [ ] Logs rotating properly
- [ ] Auto-restart enabled
- [ ] Resource limits set
- [ ] Backups configured
- [ ] Alerts set up
- [ ] Documentation updated

---

## Security Best Practices

1. **Never commit `.env` files** - Add to `.gitignore`
2. **Use environment variables** - Never hardcode tokens
3. **Rotate tokens regularly** - Change every 90 days
4. **Limit permissions** - Grant minimum required access
5. **Enable 2FA** - On all platform accounts
6. **Monitor logs** - Check for unauthorized access
7. **Keep dependencies updated** - Run `npm audit` regularly
8. **Use HTTPS** - For all external APIs
9. **Validate input** - Sanitize all user messages
10. **Rate limit** - Prevent abuse

---

## Support

- **Documentation:** [GitHub Wiki](https://github.com/yourusername/hypeai/wiki)
- **Issues:** [GitHub Issues](https://github.com/yourusername/hypeai/issues)
- **Discord:** [Community Server](https://discord.gg/hypeai)

---

## Useful Commands Reference

```bash
# Deployment
./scripts/deploy-bots.sh         # Deploy all bots
./scripts/start-all.sh           # Start all bots
./scripts/stop-all.sh            # Stop all bots
./scripts/health-check.sh        # Health check

# Docker
docker-compose up -d             # Start in background
docker-compose down              # Stop all
docker-compose logs -f           # Follow logs
docker-compose restart           # Restart all
docker-compose ps                # Check status

# PM2
pm2 start pm2.ecosystem.config.js  # Start all
pm2 stop all                     # Stop all
pm2 restart all                  # Restart all
pm2 logs                         # View logs
pm2 monit                        # Monitor
pm2 status                       # Check status

# Monitoring
http://localhost:8080            # Dashboard
docker stats                     # Resource usage
pm2 monit                        # PM2 monitor
```

---

**Made with ❤️ for HypeAI Community**
