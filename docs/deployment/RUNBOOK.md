# 🚨 HypeAI Platform - Production Runbook

**Version:** 1.0.0
**Last Updated:** 2025-10-25
**On-Call:** DevOps Team

---

## 📋 Quick Reference

### Emergency Contacts
```plaintext
🚨 Critical Issues:     +1-XXX-XXX-XXXX (24/7 on-call)
🔐 Security Team:       security@hypeai.com
⚙️  DevOps Team:         devops@hypeai.com
👨‍💻 CTO:                 cto@hypeai.com

Slack Channels:
  #hypeai-incidents    (Critical issues)
  #hypeai-alerts       (Automated alerts)
  #hypeai-ops          (General operations)
```

### System URLs
```plaintext
🌐 Production Frontend:    https://presale.hypeai.com
📊 Monitoring Dashboard:   https://monitoring.hypeai.com
🔍 BscScan Token:          https://bscscan.com/token/0xTOKEN_ADDRESS
📡 API Endpoint:           https://api.hypeai.com
🗄️  Database Admin:         https://admin.hypeai.com
```

### Quick Commands
```bash
# Check system status
docker ps -a
curl https://api.hypeai.com/health

# View logs
docker logs hypeai-backend -f --tail 100
docker logs hypeai-monitoring -f --tail 100

# Restart services
docker-compose -f docker-compose.production.yml restart backend
docker-compose -f docker-compose.production.yml restart monitoring

# Check contract status
cast call 0xTOKEN_ADDRESS "paused()" --rpc-url https://bsc-dataseed1.binance.org
```

---

## 1. System Architecture Overview

### 1.1 Component Map

```plaintext
┌─────────────────────────────────────────────────────────────┐
│                      Production Stack                        │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐      ┌──────────────┐                     │
│  │   Frontend   │      │   Vercel     │                     │
│  │  (Next.js)   │──────│  (CDN/Host)  │                     │
│  └──────────────┘      └──────────────┘                     │
│         │                                                     │
│         ├─── HTTPS ───┐                                      │
│         │             │                                      │
│  ┌──────▼──────┐     │                                      │
│  │    Nginx    │     │                                      │
│  │ (Reverse    │     │                                      │
│  │  Proxy)     │     │                                      │
│  └──────┬──────┘     │                                      │
│         │            │                                       │
│  ┌──────▼──────┐    │                                       │
│  │   Backend   │    │                                       │
│  │  Services   │    │                                       │
│  └──────┬──────┘    │                                       │
│         │           │                                        │
│         ├───────────┴─────────────┐                         │
│         │                         │                         │
│  ┌──────▼──────┐   ┌────────────▼────┐   ┌──────────────┐ │
│  │  MongoDB    │   │   PostgreSQL    │   │    Redis     │ │
│  │  (User DB)  │   │   (Analytics)   │   │   (Cache)    │ │
│  └─────────────┘   └─────────────────┘   └──────────────┘ │
│         │                                                    │
│  ┌──────▼──────────────────────────────────────────┐       │
│  │           BNB Chain (Mainnet)                   │       │
│  │  - Token Contract                               │       │
│  │  - PrivateSale Contract                         │       │
│  │  - ReferralSystem Contract                      │       │
│  │  - Staking Contract                             │       │
│  │  - Governance Contract                          │       │
│  └─────────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Critical Components

| Component | Type | Location | Health Check |
|-----------|------|----------|--------------|
| Frontend | Next.js | Vercel | https://presale.hypeai.com |
| API | Node.js | Docker | https://api.hypeai.com/health |
| MongoDB | Database | Docker | Port 27017 |
| PostgreSQL | Database | Docker | Port 5432 |
| Redis | Cache | Docker | Port 6379 |
| Token Contract | Smart Contract | BSC Mainnet | 0xTOKEN_ADDRESS |
| Monitoring | Custom | Docker | https://monitoring.hypeai.com |

---

## 2. Common Operations

### 2.1 Service Restart

**Backend Service:**
```bash
# Restart backend
docker-compose -f docker-compose.production.yml restart backend

# Verify restart
docker logs backend --tail 50

# Check health
curl https://api.hypeai.com/health
# Expected: {"status":"healthy","uptime":5}
```

**Database Restart:**
```bash
# Restart MongoDB
docker-compose -f docker-compose.production.yml restart mongodb

# Verify connection
docker exec mongodb mongosh --eval "db.adminCommand('ping')"
# Expected: { ok: 1 }

# Restart PostgreSQL
docker-compose -f docker-compose.production.yml restart postgres

# Verify connection
docker exec postgres pg_isready
# Expected: /var/run/postgresql:5432 - accepting connections
```

**Redis Restart:**
```bash
# Restart Redis
docker-compose -f docker-compose.production.yml restart redis

# Verify connection
docker exec redis redis-cli -a $REDIS_PASSWORD ping
# Expected: PONG
```

### 2.2 Log Viewing

**Real-time Logs:**
```bash
# Backend logs
docker logs -f backend --tail 100

# MongoDB logs
docker logs -f mongodb --tail 100

# All services combined
docker-compose -f docker-compose.production.yml logs -f --tail 100
```

**Log Search:**
```bash
# Search for errors in last 1000 lines
docker logs backend --tail 1000 | grep -i "error"

# Search for specific transaction
docker logs backend --tail 5000 | grep "0xTRANSACTION_HASH"

# Count errors in last hour
docker logs backend --since 1h | grep -c "ERROR"
```

**Export Logs:**
```bash
# Export last 24 hours of logs
docker logs backend --since 24h > logs/backend-$(date +%Y%m%d).log

# Compress old logs
gzip logs/backend-*.log

# Upload to S3 (if configured)
aws s3 cp logs/ s3://hypeai-logs/ --recursive
```

### 2.3 Database Backup

**MongoDB Backup:**
```bash
# Create backup directory
mkdir -p backups/mongo/$(date +%Y%m%d)

# Dump database
docker exec mongodb mongodump \
  --out=/backups/$(date +%Y%m%d) \
  --username=$MONGO_USER \
  --password=$MONGO_PASSWORD \
  --authenticationDatabase=admin

# Copy to host
docker cp mongodb:/backups/$(date +%Y%m%d) backups/mongo/

# Compress backup
tar -czf backups/mongo-$(date +%Y%m%d).tar.gz backups/mongo/$(date +%Y%m%d)

# Verify backup
tar -tzf backups/mongo-$(date +%Y%m%d).tar.gz | head
```

**PostgreSQL Backup:**
```bash
# Create backup directory
mkdir -p backups/postgres/$(date +%Y%m%d)

# Dump database
docker exec postgres pg_dump \
  -U $POSTGRES_USER \
  -d hypeai_analytics \
  -F c \
  -f /backups/$(date +%Y%m%d)/analytics.dump

# Copy to host
docker cp postgres:/backups/$(date +%Y%m%d) backups/postgres/

# Compress backup
tar -czf backups/postgres-$(date +%Y%m%d).tar.gz backups/postgres/$(date +%Y%m%d)
```

**Automated Backup Script:**
```bash
# /scripts/backup-databases.sh
#!/bin/bash
set -e

DATE=$(date +%Y%m%d)
BACKUP_DIR="/backups/$DATE"

echo "🗄️  Starting database backup: $DATE"

# MongoDB backup
docker exec mongodb mongodump --out=$BACKUP_DIR \
  --username=$MONGO_USER --password=$MONGO_PASSWORD

# PostgreSQL backup
docker exec postgres pg_dump -U $POSTGRES_USER \
  -d hypeai_analytics -F c -f $BACKUP_DIR/analytics.dump

# Compress
tar -czf /backups/backup-$DATE.tar.gz $BACKUP_DIR

# Upload to S3
aws s3 cp /backups/backup-$DATE.tar.gz s3://hypeai-backups/

# Remove local backup after 7 days
find /backups -type f -name "backup-*.tar.gz" -mtime +7 -delete

echo "✅ Backup completed: $DATE"
```

**Schedule Automated Backups:**
```bash
# Add to crontab
crontab -e

# Add line (daily at 2 AM):
0 2 * * * /scripts/backup-databases.sh >> /var/log/backup.log 2>&1
```

### 2.4 Database Restore

**MongoDB Restore:**
```bash
# Extract backup
tar -xzf backups/mongo-20251025.tar.gz

# Restore database
docker exec -i mongodb mongorestore \
  --username=$MONGO_USER \
  --password=$MONGO_PASSWORD \
  --authenticationDatabase=admin \
  --drop \
  /backups/20251025

# Verify restore
docker exec mongodb mongosh --eval "db.users.countDocuments()"
```

**PostgreSQL Restore:**
```bash
# Extract backup
tar -xzf backups/postgres-20251025.tar.gz

# Restore database
docker exec -i postgres pg_restore \
  -U $POSTGRES_USER \
  -d hypeai_analytics \
  --clean \
  /backups/20251025/analytics.dump

# Verify restore
docker exec postgres psql -U $POSTGRES_USER -d hypeai_analytics -c "SELECT COUNT(*) FROM transactions;"
```

### 2.5 Smart Contract Operations

**Check Contract Status:**
```bash
# Is contract paused?
cast call $TOKEN_ADDRESS "paused()" --rpc-url $BSC_RPC_URL
# 0x0000000000000000000000000000000000000000000000000000000000000000 = false (not paused)
# 0x0000000000000000000000000000000000000000000000000000000000000001 = true (paused)

# Check token balance
cast call $TOKEN_ADDRESS "balanceOf(address)" $WALLET_ADDRESS --rpc-url $BSC_RPC_URL

# Check total supply
cast call $TOKEN_ADDRESS "totalSupply()" --rpc-url $BSC_RPC_URL
```

**Emergency Pause:**
```bash
# Pause token transfers
cast send $TOKEN_ADDRESS "pause()" \
  --private-key $ADMIN_PRIVATE_KEY \
  --rpc-url $BSC_RPC_URL \
  --gas-price 5gwei

# Verify paused
cast call $TOKEN_ADDRESS "paused()" --rpc-url $BSC_RPC_URL
# Should return: 0x0000...0001 (true)

# Unpause when safe
cast send $TOKEN_ADDRESS "unpause()" \
  --private-key $ADMIN_PRIVATE_KEY \
  --rpc-url $BSC_RPC_URL \
  --gas-price 5gwei
```

**Check Transaction Status:**
```bash
# Get transaction receipt
cast receipt 0xTRANSACTION_HASH --rpc-url $BSC_RPC_URL

# Decode transaction input
cast 4byte-decode $(cast tx 0xTRANSACTION_HASH input --rpc-url $BSC_RPC_URL)
```

### 2.6 Monitoring Dashboard

**Access Dashboard:**
```bash
# Open in browser
open https://monitoring.hypeai.com

# Or via curl
curl -u admin:$MONITORING_PASSWORD https://monitoring.hypeai.com/api/metrics
```

**Key Metrics to Monitor:**
```json
{
  "system": {
    "cpu_usage": "< 70%",
    "memory_usage": "< 80%",
    "disk_usage": "< 85%"
  },
  "application": {
    "error_rate": "< 1%",
    "response_time_p95": "< 2000ms",
    "active_users": "0-10000"
  },
  "blockchain": {
    "gas_price": "3-10 gwei",
    "block_number": "current",
    "deployer_balance": "> 0.1 BNB"
  },
  "database": {
    "mongodb_connections": "< 100",
    "postgres_connections": "< 50",
    "redis_memory": "< 1GB"
  }
}
```

---

## 3. Troubleshooting Guide

### 3.1 Service Down

**Symptom:** API not responding (502/503 errors)

**Diagnosis:**
```bash
# 1. Check if service is running
docker ps | grep backend
# If not listed, service is down

# 2. Check logs for errors
docker logs backend --tail 100

# 3. Check system resources
docker stats --no-stream
```

**Solutions:**

**A. If OOM (Out of Memory):**
```bash
# Increase memory limit in docker-compose
services:
  backend:
    mem_limit: 2g  # Increase from 1g

# Restart with new limits
docker-compose -f docker-compose.production.yml up -d backend
```

**B. If Crashed:**
```bash
# Restart service
docker-compose -f docker-compose.production.yml restart backend

# If still failing, rebuild
docker-compose -f docker-compose.production.yml up -d --build backend
```

**C. If Port Conflict:**
```bash
# Find process using port
sudo lsof -i :3000

# Kill process
sudo kill -9 PID

# Restart service
docker-compose -f docker-compose.production.yml restart backend
```

### 3.2 Database Connection Issues

**Symptom:** "Cannot connect to MongoDB" errors

**Diagnosis:**
```bash
# 1. Check if MongoDB is running
docker ps | grep mongodb

# 2. Test connection
docker exec mongodb mongosh --eval "db.adminCommand('ping')"

# 3. Check logs
docker logs mongodb --tail 50
```

**Solutions:**

**A. If MongoDB is down:**
```bash
# Restart MongoDB
docker-compose -f docker-compose.production.yml restart mongodb

# Wait 10 seconds for startup
sleep 10

# Verify connection
docker exec mongodb mongosh --eval "db.adminCommand('ping')"
```

**B. If connection pool exhausted:**
```bash
# Increase max pool size in backend config
# Edit: src/backend/config/database.js
mongoose.connect(uri, {
  maxPoolSize: 100,  // Increase from 50
  minPoolSize: 10
});

# Restart backend
docker-compose -f docker-compose.production.yml restart backend
```

**C. If disk full:**
```bash
# Check disk space
df -h

# Clear old logs
find /var/lib/docker/containers -name "*.log" -mtime +7 -exec truncate -s 0 {} \;

# Prune unused Docker data
docker system prune -a --volumes -f
```

### 3.3 High Gas Fees

**Symptom:** Transactions failing with "gas price too low"

**Diagnosis:**
```bash
# 1. Check current gas price
cast gas-price --rpc-url $BSC_RPC_URL
# Returns gas price in wei

# 2. Convert to Gwei
cast gas-price --rpc-url $BSC_RPC_URL | awk '{print $1/1000000000 " Gwei"}'
```

**Solutions:**

**A. Update gas price in environment:**
```bash
# Edit .env.production
GAS_PRICE_GWEI=10  # Increase from current value

# Or use automatic pricing
GAS_PRICE_GWEI=auto

# Restart services to apply
docker-compose -f docker-compose.production.yml restart backend
```

**B. Use gas price oracle:**
```javascript
// Add to backend: src/utils/gas-oracle.js
const getGasPrice = async () => {
  const basePrice = await ethers.provider.getGasPrice();
  // Add 20% buffer
  return basePrice.mul(120).div(100);
};
```

### 3.4 Smart Contract Errors

**Symptom:** Transactions reverting

**Diagnosis:**
```bash
# 1. Get transaction hash
TX_HASH="0xYourFailedTxHash"

# 2. View transaction details
cast tx $TX_HASH --rpc-url $BSC_RPC_URL

# 3. Try to get revert reason
cast run $TX_HASH --rpc-url $BSC_RPC_URL
```

**Common Errors and Solutions:**

**A. "Insufficient allowance":**
```bash
# User needs to approve token spending
# Check current allowance
cast call $TOKEN_ADDRESS "allowance(address,address)" \
  $USER_ADDRESS $PRESALE_ADDRESS \
  --rpc-url $BSC_RPC_URL

# Solution: Instruct user to approve
# Frontend should call: token.approve(presaleAddress, amount)
```

**B. "Presale has ended":**
```bash
# Check presale end time
cast call $PRESALE_ADDRESS "endTime()" --rpc-url $BSC_RPC_URL

# If ended early by mistake, extend it
cast send $PRESALE_ADDRESS "extendSale(uint256)" 7776000 \
  --private-key $ADMIN_PRIVATE_KEY \
  --rpc-url $BSC_RPC_URL
  # 7776000 = 90 days in seconds
```

**C. "Below minimum purchase":**
```bash
# Check minimum purchase amount
cast call $PRESALE_ADDRESS "minPurchase()" --rpc-url $BSC_RPC_URL

# Solution: User must purchase at least this amount
# Or admin can lower minimum
cast send $PRESALE_ADDRESS "setMinPurchase(uint256)" \
  5000000000000000 \
  --private-key $ADMIN_PRIVATE_KEY \
  --rpc-url $BSC_RPC_URL
  # 5000000000000000 = 0.005 BNB
```

### 3.5 Frontend Issues

**Symptom:** Website not loading or showing errors

**Diagnosis:**
```bash
# 1. Check Vercel deployment status
vercel ls

# 2. Check production build logs
vercel logs presale.hypeai.com

# 3. Test API connectivity
curl -I https://presale.hypeai.com
```

**Solutions:**

**A. If deployment failed:**
```bash
# Redeploy from Vercel dashboard
# Or trigger new deployment
git commit --allow-empty -m "Trigger deployment"
git push origin main
```

**B. If environment variables missing:**
```bash
# Check Vercel environment variables
vercel env ls

# Add missing variables
vercel env add NEXT_PUBLIC_PRESALE_CONTRACT_ADDRESS production
# Paste value when prompted

# Redeploy to apply
vercel --prod
```

**C. If contract not connecting:**
```javascript
// Check in browser console (F12)
console.log(window.ethereum)  // Should show MetaMask provider
console.log(await window.ethereum.request({ method: 'eth_chainId' }))
// Should return "0x38" (BSC Mainnet = 56 in hex)

// If wrong network, prompt user to switch:
await window.ethereum.request({
  method: 'wallet_switchEthereumChain',
  params: [{ chainId: '0x38' }]
});
```

### 3.6 Performance Degradation

**Symptom:** Slow response times (> 5 seconds)

**Diagnosis:**
```bash
# 1. Check response times
curl -w "@curl-format.txt" -o /dev/null -s https://api.hypeai.com/health

# 2. Check system load
docker stats --no-stream

# 3. Check database query times
docker exec mongodb mongosh --eval "db.currentOp()"
```

**Solutions:**

**A. If CPU high:**
```bash
# Scale horizontally - add more backend instances
docker-compose -f docker-compose.production.yml up -d --scale backend=3

# Or increase CPU limit
services:
  backend:
    cpus: '2.0'  # Increase from 1.0
```

**B. If slow database queries:**
```bash
# Add database indexes
docker exec mongodb mongosh --eval "
db.users.createIndex({ email: 1 });
db.transactions.createIndex({ userId: 1, timestamp: -1 });
db.referrals.createIndex({ referrer: 1 });
"

# Verify indexes created
docker exec mongodb mongosh --eval "db.users.getIndexes()"
```

**C. If memory leaks:**
```bash
# Restart backend to clear memory
docker-compose -f docker-compose.production.yml restart backend

# Monitor memory usage over time
while true; do
  docker stats --no-stream | grep backend
  sleep 60
done
```

---

## 4. Emergency Procedures

### 4.1 CRITICAL: Smart Contract Exploit

**Detection Signs:**
- Unusual large transactions
- Rapid token supply changes
- Unexpected contract interactions
- User reports of stolen funds

**Immediate Actions (< 5 minutes):**

```bash
# STEP 1: PAUSE ALL CONTRACTS IMMEDIATELY
echo "🚨 PAUSING TOKEN CONTRACT"
cast send $TOKEN_ADDRESS "pause()" \
  --private-key $EMERGENCY_PRIVATE_KEY \
  --rpc-url $BSC_RPC_URL \
  --gas-price 20gwei \
  --priority-gas-price 5gwei

echo "🚨 PAUSING PRESALE CONTRACT"
cast send $PRESALE_ADDRESS "pause()" \
  --private-key $EMERGENCY_PRIVATE_KEY \
  --rpc-url $BSC_RPC_URL \
  --gas-price 20gwei

echo "🚨 PAUSING STAKING CONTRACT"
cast send $STAKING_ADDRESS "pause()" \
  --private-key $EMERGENCY_PRIVATE_KEY \
  --rpc-url $BSC_RPC_URL \
  --gas-price 20gwei

# STEP 2: VERIFY PAUSED
cast call $TOKEN_ADDRESS "paused()" --rpc-url $BSC_RPC_URL
# Must return: 0x0000...0001 (true)

# STEP 3: NOTIFY TEAM
curl -X POST $SLACK_WEBHOOK_URL \
  -H 'Content-Type: application/json' \
  -d '{
    "text": "🚨 CRITICAL: All contracts paused due to potential exploit. Team mobilize immediately.",
    "channel": "#hypeai-incidents"
  }'

# STEP 4: TAKE FRONTEND OFFLINE
vercel --prod --confirm
# Then delete deployment or set maintenance page
```

**Investigation (Within 1 hour):**

```bash
# 1. Get all transactions in last 24 hours
cast logs --from-block $(cast block-number --rpc-url $BSC_RPC_URL | awk '{print $1-6000}') \
  --to-block latest \
  --address $TOKEN_ADDRESS \
  --rpc-url $BSC_RPC_URL > exploit-analysis.log

# 2. Analyze suspicious transactions
grep -i "transfer" exploit-analysis.log | \
  awk '{print $4, $5, $6}' | \
  sort -k3 -rn | \
  head -50  # Top 50 largest transfers

# 3. Check attacker addresses
ATTACKER="0xSuspiciousAddress"
cast balance $ATTACKER --rpc-url $BSC_RPC_URL

# 4. Trace attack path
cast tx $ATTACK_TX_HASH --rpc-url $BSC_RPC_URL
cast run $ATTACK_TX_HASH --rpc-url $BSC_RPC_URL  # Trace execution
```

**Recovery Actions:**

```bash
# If exploit confirmed:
# 1. Deploy patched contract
npx hardhat run scripts/deploy-patched-contract.js --network bsc

# 2. Migrate state if needed
npx hardhat run scripts/migrate-state.js --network bsc

# 3. Notify users via all channels
# 4. Coordinate with exchanges (if listed)
# 5. File incident report
# 6. Consider bounty for white hat disclosure

# If false alarm:
# Unpause contracts after verification
cast send $TOKEN_ADDRESS "unpause()" \
  --private-key $ADMIN_PRIVATE_KEY \
  --rpc-url $BSC_RPC_URL
```

### 4.2 Database Corruption

**Detection Signs:**
- Write operations failing
- Read operations returning incorrect data
- Database integrity errors in logs

**Immediate Actions:**

```bash
# STEP 1: STOP ALL WRITES
docker-compose -f docker-compose.production.yml stop backend

# STEP 2: ASSESS DAMAGE
docker exec mongodb mongosh --eval "db.runCommand({dbStats: 1})"

# STEP 3: RESTORE FROM LAST KNOWN GOOD BACKUP
LAST_GOOD_BACKUP="backups/mongo-20251024.tar.gz"
tar -xzf $LAST_GOOD_BACKUP

docker exec -i mongodb mongorestore \
  --drop \
  --username=$MONGO_USER \
  --password=$MONGO_PASSWORD \
  /backups/20251024

# STEP 4: VERIFY INTEGRITY
docker exec mongodb mongosh --eval "
  db.users.countDocuments();
  db.transactions.countDocuments();
  db.stats();
"

# STEP 5: RESTART SERVICES
docker-compose -f docker-compose.production.yml start backend
```

### 4.3 Complete System Outage

**Scenario:** All services down, no access

**Recovery Steps:**

```bash
# 1. Connect to server via SSH
ssh -i ~/.ssh/hypeai-prod.pem ubuntu@production-server

# 2. Check system status
systemctl status docker
df -h  # Check disk space
free -h  # Check memory

# 3. If Docker down, restart
sudo systemctl restart docker

# 4. Restart all services
cd /opt/hypeai
docker-compose -f docker-compose.production.yml down
docker-compose -f docker-compose.production.yml up -d

# 5. Monitor startup
docker-compose -f docker-compose.production.yml logs -f

# 6. Verify health
curl https://api.hypeai.com/health
curl https://presale.hypeai.com

# 7. Check smart contracts still functional
cast call $TOKEN_ADDRESS "totalSupply()" --rpc-url $BSC_RPC_URL
```

### 4.4 Denial of Service (DoS) Attack

**Detection Signs:**
- Abnormally high request rate
- CPU at 100%
- Services unresponsive
- Repeated requests from same IPs

**Mitigation:**

```bash
# 1. Identify attacker IPs
docker logs nginx --tail 10000 | \
  awk '{print $1}' | \
  sort | uniq -c | \
  sort -rn | \
  head -20

# 2. Block malicious IPs in Nginx
sudo nano /etc/nginx/conf.d/blocked-ips.conf

# Add:
# deny 1.2.3.4;
# deny 5.6.7.8;

sudo nginx -t
sudo systemctl reload nginx

# 3. Enable rate limiting (if not already)
# Edit /etc/nginx/sites-available/hypeai
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
limit_req zone=api_limit burst=20 nodelay;

# 4. Enable Cloudflare (if available)
# Set DNS to Cloudflare nameservers
# Enable "Under Attack Mode" in Cloudflare dashboard

# 5. Scale services if legitimate traffic spike
docker-compose -f docker-compose.production.yml up -d --scale backend=5
```

### 4.5 Data Breach Suspected

**Immediate Actions:**

```bash
# 1. CHANGE ALL CREDENTIALS IMMEDIATELY
# Generate new passwords
NEW_MONGO_PASSWORD=$(openssl rand -base64 32)
NEW_POSTGRES_PASSWORD=$(openssl rand -base64 32)
NEW_REDIS_PASSWORD=$(openssl rand -base64 32)

# Update in environment
sed -i "s/MONGO_PASSWORD=.*/MONGO_PASSWORD=$NEW_MONGO_PASSWORD/" .env.production
sed -i "s/POSTGRES_PASSWORD=.*/POSTGRES_PASSWORD=$NEW_POSTGRES_PASSWORD/" .env.production
sed -i "s/REDIS_PASSWORD=.*/REDIS_PASSWORD=$NEW_REDIS_PASSWORD/" .env.production

# 2. ROTATE API KEYS
# BscScan API key
# WalletConnect project ID
# All service API keys

# 3. AUDIT ACCESS LOGS
docker logs mongodb --since 7d | grep "authentication failed" > auth-failures.log
docker logs postgres --since 7d | grep "FATAL" > postgres-errors.log

# 4. CHECK FOR UNAUTHORIZED TRANSACTIONS
cast logs --from-block $(cast block-number --rpc-url $BSC_RPC_URL | awk '{print $1-6000}') \
  --address $TOKEN_ADDRESS \
  --rpc-url $BSC_RPC_URL | \
  grep -v "known_address_1\|known_address_2" > suspicious-txs.log

# 5. NOTIFY AUTHORITIES IF CONFIRMED
# Security team
# Legal team
# Users (via email/announcement)
# Law enforcement (if required by jurisdiction)
```

---

## 5. Escalation Matrix

### 5.1 Severity Levels

**P0 - CRITICAL (Immediate Response)**
- Smart contract exploit
- Data breach
- Complete system outage
- Financial loss > $10,000

**Response Time:** < 15 minutes
**Escalate To:** CTO + Security Team + All DevOps
**Communication:** Slack #hypeai-incidents + Phone calls

---

**P1 - HIGH (Urgent)**
- Database corruption
- API completely down
- Major security vulnerability discovered
- User funds at risk

**Response Time:** < 1 hour
**Escalate To:** DevOps Lead + Security Team
**Communication:** Slack #hypeai-incidents

---

**P2 - MEDIUM (Important)**
- Performance degradation
- Non-critical service down
- Elevated error rates
- Minor security issue

**Response Time:** < 4 hours
**Escalate To:** On-call DevOps
**Communication:** Slack #hypeai-alerts

---

**P3 - LOW (Normal)**
- Feature request
- Minor bug
- Planned maintenance
- Documentation update

**Response Time:** < 24 hours
**Escalate To:** Regular support queue
**Communication:** Ticket system

---

### 5.2 Contact Tree

```plaintext
INCIDENT DETECTED
       |
       ├─ P0/P1 ──> On-call DevOps (responds within 15 min)
       |              |
       |              ├─ Can resolve? ──> YES ──> Monitor & document
       |              |
       |              └─ Cannot resolve or P0? ──> NO ──> Escalate to DevOps Lead
       |                                                        |
       |                                                        ├─ Still blocked? ──> Escalate to CTO
       |                                                        |
       |                                                        └─ Security? ──> Add Security Team
       |
       └─ P2/P3 ──> Ticket System ──> Assigned DevOps (within 4-24h)
```

---

## 6. Monitoring and Alerts

### 6.1 Key Metrics to Watch

**System Health:**
```bash
# CPU Usage
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}" | grep -v "0.00%"
# Alert if > 80% for > 5 minutes

# Memory Usage
docker stats --no-stream --format "table {{.Name}}\t{{.MemUsage}}"
# Alert if > 85%

# Disk Space
df -h | grep -E "/(|var|opt)" | awk '{print $5}'
# Alert if > 85%
```

**Application Metrics:**
```bash
# Error Rate
docker logs backend --since 1h | grep -c "ERROR"
# Alert if > 10 errors/hour

# Response Time (via monitoring dashboard)
curl -s https://monitoring.hypeai.com/api/metrics | jq '.response_time_p95'
# Alert if > 2000ms

# Active Users
curl -s https://monitoring.hypeai.com/api/metrics | jq '.active_users'
```

**Blockchain Metrics:**
```bash
# Deployer Balance
cast balance $DEPLOYER_ADDRESS --rpc-url $BSC_RPC_URL | \
  awk '{print $1/1000000000000000000 " BNB"}'
# Alert if < 0.1 BNB

# Gas Price
cast gas-price --rpc-url $BSC_RPC_URL | \
  awk '{print $1/1000000000 " Gwei"}'
# Alert if > 20 Gwei

# Contract Paused Status
cast call $TOKEN_ADDRESS "paused()" --rpc-url $BSC_RPC_URL
# Alert if returns true (unless intentional)
```

### 6.2 Alert Configuration

**See:** `/src/monitoring/alert-rules.json`

**Test Alerts:**
```bash
# Test Slack notification
curl -X POST $SLACK_WEBHOOK_URL \
  -H 'Content-Type: application/json' \
  -d '{"text":"🧪 Test alert from runbook"}'

# Test Telegram notification
curl -X POST "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/sendMessage" \
  -d "chat_id=$TELEGRAM_CHAT_ID" \
  -d "text=🧪 Test alert from runbook"
```

---

## 7. Maintenance Windows

### 7.1 Planned Maintenance

**Schedule:** Every Sunday 2:00 AM - 4:00 AM UTC (lowest traffic)

**Maintenance Checklist:**
```bash
# 1. Announce maintenance 24 hours in advance
curl -X POST $SLACK_WEBHOOK_URL \
  -d '{"text":"📅 Scheduled maintenance: Sunday 2-4 AM UTC. Site may be briefly unavailable."}'

# 2. Set maintenance page (if needed)
vercel env add MAINTENANCE_MODE true production

# 3. Backup databases
/scripts/backup-databases.sh

# 4. Update dependencies
docker-compose -f docker-compose.production.yml pull

# 5. Restart services with new images
docker-compose -f docker-compose.production.yml up -d

# 6. Run health checks
curl https://api.hypeai.com/health

# 7. Clear maintenance mode
vercel env rm MAINTENANCE_MODE production

# 8. Monitor for 30 minutes
docker-compose -f docker-compose.production.yml logs -f --tail 100
```

### 7.2 Emergency Maintenance

**When:** Critical security patch or urgent bugfix needed immediately

```bash
# 1. Notify team immediately
curl -X POST $SLACK_WEBHOOK_URL \
  -d '{"text":"🚨 EMERGENCY MAINTENANCE starting now. Estimated time: 30 minutes."}'

# 2. Quick backup
docker exec mongodb mongodump --out=/backups/emergency-$(date +%Y%m%d-%H%M)

# 3. Apply fix
# (Deploy new code, patch contracts, etc.)

# 4. Verify fix
npm run test
curl https://api.hypeai.com/health

# 5. Announce completion
curl -X POST $SLACK_WEBHOOK_URL \
  -d '{"text":"✅ Emergency maintenance completed. All systems operational."}'
```

---

## 8. Post-Incident Review

### 8.1 Incident Report Template

**File:** `/reports/incident-YYYYMMDD-HHMM.md`

```markdown
# Incident Report

**Incident ID:** INC-2025-XXX
**Date:** 2025-10-25
**Severity:** P0 / P1 / P2 / P3
**Duration:** XX minutes
**Status:** Resolved / Ongoing / Monitoring

## Summary
Brief description of what happened.

## Timeline
- 14:00 UTC: Incident detected (alert triggered)
- 14:05 UTC: On-call DevOps responded
- 14:10 UTC: Root cause identified
- 14:20 UTC: Fix deployed
- 14:25 UTC: Service restored
- 14:30 UTC: Monitoring confirmed stable

## Root Cause
Detailed explanation of what caused the issue.

## Impact
- Users affected: XX
- Transactions failed: XX
- Financial loss: $XX
- Downtime: XX minutes

## Resolution
Steps taken to resolve the issue.

## Lessons Learned
What we learned from this incident.

## Action Items
- [ ] Implement monitoring for this scenario
- [ ] Update runbook with new procedure
- [ ] Deploy preventive fix
- [ ] Train team on this type of incident

## Contributors
- On-call: John Doe
- Support: Jane Smith
- CTO: Alice Johnson
```

### 8.2 Post-Mortem Meeting

**Schedule:** Within 48 hours of P0/P1 incidents

**Agenda:**
1. Review incident timeline (10 min)
2. Discuss root cause (15 min)
3. Identify preventive measures (15 min)
4. Assign action items (10 min)
5. Update documentation (10 min)

**Attendees:**
- DevOps team
- Security team (if security-related)
- CTO
- Affected service owners

---

## 📚 Additional Resources

- **Architecture Docs:** `/docs/architecture/`
- **Security Audits:** `/docs/security/`
- **Deployment Guide:** `/docs/deployment/DEPLOYMENT_GUIDE.md`
- **API Documentation:** `/docs/api/`
- **Smart Contract ABIs:** `/artifacts/contracts/`

---

**Runbook Maintained By:** DevOps Team
**Last Reviewed:** 2025-10-25
**Next Review:** 2025-11-25
**Version:** 1.0.0
