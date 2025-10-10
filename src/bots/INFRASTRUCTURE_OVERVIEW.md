# HypeAI Bot Infrastructure Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        HypeAI Bot Infrastructure                    │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                          External Services                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Discord API  ◄──────┐    Telegram API  ◄──────┐    Twitter API   │
│  (WebSocket)         │    (Long Polling)        │    (REST/Stream) │
│                      │                          │                   │
└──────────────────────┼──────────────────────────┼───────────────────┘
                       │                          │
                       │                          │
┌──────────────────────┼──────────────────────────┼───────────────────┐
│                      │    Load Balancer         │                   │
│                      │    (Optional)            │                   │
└──────────────────────┼──────────────────────────┼───────────────────┘
                       │                          │
                       ▼                          ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      Container Orchestration                        │
│                    (Docker Compose / PM2)                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐ │
│  │   Discord Bot    │  │  Telegram Bot    │  │   Twitter Bot    │ │
│  ├──────────────────┤  ├──────────────────┤  ├──────────────────┤ │
│  │ Port: Internal   │  │ Port: Internal   │  │ Port: Internal   │ │
│  │ Memory: 500MB    │  │ Memory: 500MB    │  │ Memory: 500MB    │ │
│  │ CPU: 0.5 core    │  │ CPU: 0.5 core    │  │ CPU: 0.5 core    │ │
│  │ Auto-restart: ✓  │  │ Auto-restart: ✓  │  │ Auto-restart: ✓  │ │
│  │ Health: /health  │  │ Health: /health  │  │ Health: /health  │ │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘ │
│                                                                     │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │              Monitoring Dashboard (Nginx)                  │   │
│  │              Port: 8080                                    │   │
│  │              URL: http://localhost:8080                    │   │
│  └────────────────────────────────────────────────────────────┘   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
                       │                          │
                       ▼                          ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         Shared Resources                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐            │
│  │  Logs Volume │  │  Data Volume │  │   Network    │            │
│  │  /app/logs   │  │  /app/data   │  │  hypeai-net  │            │
│  └──────────────┘  └──────────────┘  └──────────────┘            │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Component Details

### 1. Discord Bot Container

**Technology:** Node.js 18 Alpine + Discord.js v14

**Responsibilities:**
- Listen to Discord server events
- Process commands (!help, !price, !stats)
- Send automated messages
- Moderate channels
- Handle user interactions

**Environment Variables:**
- `DISCORD_TOKEN`
- `DISCORD_CLIENT_ID`
- `NODE_ENV=production`

**Health Check:**
- Interval: 30s
- Timeout: 10s
- Retries: 3

**Resource Limits:**
- Memory: 500MB
- CPU: 0.5 core

### 2. Telegram Bot Container

**Technology:** Node.js 18 Alpine + node-telegram-bot-api

**Responsibilities:**
- Poll Telegram API for updates
- Respond to commands (/start, /help, /price)
- Send automated announcements
- Handle inline queries
- Manage group chats

**Environment Variables:**
- `TELEGRAM_TOKEN`
- `NODE_ENV=production`

**Health Check:**
- Interval: 30s
- Timeout: 10s
- Retries: 3

**Resource Limits:**
- Memory: 500MB
- CPU: 0.5 core

### 3. Twitter Bot Container

**Technology:** Node.js 18 Alpine + twitter-api-v2

**Responsibilities:**
- Post scheduled tweets
- Monitor mentions and hashtags
- Auto-reply to mentions
- Retweet relevant content
- Track engagement metrics

**Environment Variables:**
- `TWITTER_API_KEY`
- `TWITTER_API_SECRET`
- `TWITTER_ACCESS_TOKEN`
- `TWITTER_ACCESS_SECRET`
- `NODE_ENV=production`

**Health Check:**
- Interval: 30s
- Timeout: 10s
- Retries: 3

**Resource Limits:**
- Memory: 500MB
- CPU: 0.5 core

### 4. Monitoring Dashboard (Nginx)

**Technology:** Nginx Alpine + Static HTML/JS

**Features:**
- Real-time bot status display
- Message count tracking
- Error rate monitoring
- Uptime statistics
- Resource usage graphs
- Auto-refresh (10s)

**Port:** 8080 (exposed to host)

**Access:** http://localhost:8080

## Deployment Strategies

### Strategy 1: Docker Compose (Production)

```yaml
Pros:
✓ Isolated environments
✓ Easy rollback
✓ Consistent across environments
✓ Auto-restart on failure
✓ Resource limits enforced
✓ Centralized logging
✓ Easy scaling

Cons:
✗ Requires Docker installation
✗ Slightly higher resource overhead
```

**Use when:**
- Deploying to production servers
- Need isolation between bots
- Want easy scaling
- Require consistent environments

### Strategy 2: PM2 (Development/Lightweight)

```yaml
Pros:
✓ Lightweight
✓ Built-in monitoring (pm2 monit)
✓ Fast restart times
✓ Native Node.js process management
✓ Easy local development

Cons:
✗ Less isolation
✗ Manual dependency management
✗ No container benefits
```

**Use when:**
- Local development
- Single server deployment
- Limited resources
- Need fast iteration

## Data Flow

### Incoming Messages

```
User Message (Discord/Telegram/Twitter)
           ↓
    API Gateway (Platform)
           ↓
    Bot Container (HypeAI)
           ↓
    Command Parser
           ↓
    ┌─────────────┬─────────────┬─────────────┐
    ↓             ↓             ↓             ↓
AI Response   Price Data   Community Info   Error Handler
    ↓             ↓             ↓             ↓
    └─────────────┴─────────────┴─────────────┘
           ↓
    Format Response
           ↓
    Send to Platform API
           ↓
    User Receives Response
```

### Monitoring Flow

```
Bot Containers
    ↓
Generate Metrics (in-memory)
    ↓
Expose via HTTP endpoint (optional)
    ↓
Dashboard Polling (every 10s)
    ↓
Update UI in Real-time
```

## Scaling Options

### Horizontal Scaling

**Docker:**
```bash
# Scale Discord bot to 3 instances
docker-compose up -d --scale discord-bot=3
```

**Requirements:**
- Shared state (Redis/Database)
- Load balancer
- Session management

### Vertical Scaling

**Increase Resources:**
```yaml
# docker-compose.yml
deploy:
  resources:
    limits:
      cpus: '2'
      memory: 2G
```

### Distributed Architecture

```
┌─────────────────────────────────────────┐
│         Load Balancer / Nginx           │
└─────────────────────────────────────────┘
           │
    ┌──────┴──────┬──────────┬──────────┐
    ↓             ↓          ↓          ↓
┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐
│ Bot 1  │  │ Bot 2  │  │ Bot 3  │  │ Bot N  │
└────────┘  └────────┘  └────────┘  └────────┘
           │
    ┌──────┴──────┐
    ↓             ↓
┌────────┐  ┌────────┐
│ Redis  │  │  DB    │
└────────┘  └────────┘
```

## Security Layers

### 1. Environment Isolation
- Containers run as non-root user
- Read-only root filesystem (optional)
- Network isolation via Docker networks

### 2. Secret Management
- Environment variables (not hardcoded)
- `.env` file (gitignored)
- Docker secrets (production)
- Vault integration (enterprise)

### 3. API Rate Limiting
- Per-user rate limits
- Global rate limits
- Exponential backoff on failures

### 4. Input Validation
- Sanitize all user input
- Command whitelist
- SQL injection prevention
- XSS protection

### 5. Logging & Monitoring
- Centralized logging
- Error tracking
- Anomaly detection
- Audit trails

## Disaster Recovery

### Backup Strategy

**What to Backup:**
- Environment variables (.env)
- Bot configuration files
- User data (if stored locally)
- Docker volumes

**Backup Frequency:**
- Configuration: Daily
- User data: Real-time or hourly
- Logs: Weekly archives

### Recovery Procedures

**Container Failure:**
```bash
# Auto-restart handles most failures
# Manual restart if needed:
docker-compose restart discord-bot
```

**Complete System Failure:**
```bash
# Restore from backup
cp backup/.env .env

# Redeploy
./scripts/deploy-bots.sh
```

**Data Corruption:**
```bash
# Stop affected bot
docker-compose stop discord-bot

# Restore data volume
docker volume rm hypeai_bot-data
docker volume create hypeai_bot-data
# Restore backup to volume

# Restart bot
docker-compose up -d discord-bot
```

## Monitoring & Alerts

### Health Checks

**Automated:**
- Container health checks (every 30s)
- Process health checks (PM2)
- API endpoint monitoring

**Manual:**
```bash
./scripts/health-check.sh
```

### Alert Triggers

**Critical:**
- Bot offline > 5 minutes
- Error rate > 10%
- Memory usage > 90%
- CPU usage > 90%

**Warning:**
- Bot restarted > 3 times/hour
- Error rate > 5%
- Memory usage > 75%
- Response time > 2s

### Alert Channels

- Email notifications
- SMS (critical only)
- Slack/Discord webhooks
- PagerDuty integration

## Performance Optimization

### Caching Strategy
- In-memory cache for frequent data
- Redis for distributed cache
- TTL-based invalidation

### Connection Pooling
- WebSocket connection reuse
- HTTP keep-alive
- Database connection pools

### Async Processing
- Non-blocking I/O
- Event-driven architecture
- Worker queues for heavy tasks

### Resource Optimization
- Lazy loading
- Memory leak prevention
- Garbage collection tuning
- Process clustering (PM2)

## Deployment Checklist

### Pre-Deployment
- [ ] All tokens configured in `.env`
- [ ] Docker/PM2 installed
- [ ] Network ports available
- [ ] Sufficient resources (CPU, RAM, Disk)
- [ ] Backup system configured

### Deployment
- [ ] Run `./scripts/deploy-bots.sh`
- [ ] Select deployment method
- [ ] Wait for all containers/processes to start
- [ ] Verify health checks pass

### Post-Deployment
- [ ] Access monitoring dashboard (http://localhost:8080)
- [ ] Send test messages to each bot
- [ ] Verify bot responses
- [ ] Check logs for errors
- [ ] Monitor resource usage
- [ ] Set up alerts

### Ongoing Maintenance
- [ ] Daily health checks
- [ ] Weekly log reviews
- [ ] Monthly security updates
- [ ] Quarterly performance reviews
- [ ] Regular backups

## File Reference

| File | Purpose | Location |
|------|---------|----------|
| `Dockerfile` | Container image definition | `/src/bots/` |
| `docker-compose.yml` | Multi-container orchestration | `/src/bots/` |
| `pm2.ecosystem.config.js` | PM2 configuration | `/src/bots/` |
| `deploy-bots.sh` | Main deployment script | `/scripts/` |
| `start-all.sh` | Start all bots | `/scripts/` |
| `stop-all.sh` | Stop all bots | `/scripts/` |
| `health-check.sh` | Status check script | `/scripts/` |
| `dashboard.html` | Monitoring UI | `/src/bots/monitoring/` |
| `PRODUCTION_SETUP.md` | Complete setup guide | `/src/bots/` |
| `DEPLOYMENT_QUICK_REF.md` | Quick reference | `/src/bots/` |

## Support & Resources

- **Documentation:** Complete in `/src/bots/PRODUCTION_SETUP.md`
- **Quick Reference:** `/src/bots/DEPLOYMENT_QUICK_REF.md`
- **Features:** `/src/bots/FEATURES.md`
- **Scripts:** `/scripts/*.sh`

---

**Infrastructure Status:** Production Ready ✅

**Deployment Time:** ~5 minutes

**Resource Requirements:**
- CPU: 2+ cores recommended
- RAM: 4GB+ recommended
- Disk: 10GB+ recommended
- Network: Stable internet connection
