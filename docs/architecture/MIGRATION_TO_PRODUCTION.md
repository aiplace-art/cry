# 🔄 HypeAI Migration to Production Architecture

**Version:** 1.0
**Date:** 2025-10-25
**Estimated Timeline:** 8-12 weeks
**Risk Level:** Medium

---

## 📋 Executive Summary

This document outlines the **step-by-step migration plan** from the current monolithic architecture to the production-ready microservices architecture defined in `PRODUCTION_ARCHITECTURE.md`.

**Migration Goals:**
- Zero downtime migration (users won't notice)
- Gradual rollout (strangler fig pattern)
- Rollback capability at each step
- Data integrity guaranteed

**Timeline:**
- **Phase 1:** Infrastructure Setup (2 weeks)
- **Phase 2:** Database Migration (2 weeks)
- **Phase 3:** Service Extraction (4 weeks)
- **Phase 4:** Traffic Cutover (1 week)
- **Phase 5:** Optimization (3 weeks)

---

## 🎯 Current State Analysis

### Current Architecture:
```
┌──────────────────────────────────────┐
│         MONOLITHIC APPLICATION        │
│                                       │
│  • Single Node.js server (server.js) │
│  • All logic in one codebase         │
│  • Single PostgreSQL database        │
│  • No caching layer                  │
│  • No load balancing                 │
│  • No auto-scaling                   │
│                                       │
│  Deployment: Manual (pm2)            │
│  Scaling: Vertical only              │
│  Availability: ~95% (single point)   │
└──────────────────────────────────────┘
```

### Pain Points:
1. **Single Point of Failure:** If server crashes, entire app is down
2. **No Scalability:** Can't scale individual components
3. **Slow Deployments:** Must redeploy entire app for small changes
4. **Performance Bottlenecks:** No caching, slow database queries
5. **Developer Friction:** All code in one repo, merge conflicts

---

## 📅 Migration Timeline

```
Week 1-2:  Infrastructure Setup
Week 3-4:  Database Migration
Week 5-8:  Service Extraction (Strangler Fig)
Week 9:    Traffic Cutover (Blue-Green)
Week 10-12: Optimization & Monitoring
```

---

## 🚀 Phase 1: Infrastructure Setup (Week 1-2)

### Goal: Set up cloud infrastructure before migrating code

### Tasks:

#### 1.1 **Choose Cloud Provider**

**Options:**

| Provider | Pros | Cons | Monthly Cost |
|----------|------|------|--------------|
| **AWS** | Most features, best EKS | Complex, expensive | $1,500 |
| **GCP** | Simple, good GKE, free $300 credits | Smaller ecosystem | $1,200 |
| **Azure** | Good for enterprise, MS integration | Less popular for startups | $1,300 |
| **DigitalOcean** | Simple, cheap, good docs | Limited services | $800 |

**Recommendation:** **GCP** (best balance of features and cost)

---

#### 1.2 **Set Up Kubernetes Cluster (GKE)**

```bash
# Create GKE cluster
gcloud container clusters create hypeai-production \
  --region us-central1 \
  --num-nodes 3 \
  --machine-type e2-medium \
  --enable-autoscaling \
  --min-nodes 3 \
  --max-nodes 10 \
  --enable-autorepair \
  --enable-autoupgrade

# Connect kubectl
gcloud container clusters get-credentials hypeai-production --region us-central1

# Verify cluster
kubectl get nodes
```

**Output:**
```
NAME                                    STATUS   ROLES    AGE   VERSION
gke-hypeai-production-pool-1-abc123   Ready    <none>   2m    v1.27.3
gke-hypeai-production-pool-1-def456   Ready    <none>   2m    v1.27.3
gke-hypeai-production-pool-1-ghi789   Ready    <none>   2m    v1.27.3
```

---

#### 1.3 **Set Up Databases**

**PostgreSQL (Cloud SQL):**
```bash
# Create Cloud SQL instance
gcloud sql instances create hypeai-postgres \
  --database-version=POSTGRES_15 \
  --tier=db-custom-4-16384 \
  --region=us-central1 \
  --availability-type=REGIONAL \
  --storage-size=500GB \
  --storage-type=SSD \
  --storage-auto-increase

# Create database
gcloud sql databases create hypeai_production --instance=hypeai-postgres

# Create user
gcloud sql users create hypeai_user \
  --instance=hypeai-postgres \
  --password=<strong-password>
```

**Redis (Memorystore):**
```bash
# Create Redis instance
gcloud redis instances create hypeai-redis \
  --size=10 \
  --region=us-central1 \
  --tier=standard-ha \
  --redis-version=redis_6_x

# Get connection details
gcloud redis instances describe hypeai-redis --region=us-central1
```

**RabbitMQ (CloudAMQP):**
```bash
# Go to https://www.cloudamqp.com/
# Create instance: Pro plan ($100/month)
# Note connection URL: amqps://xxx:xxx@xxx.cloudamqp.com/xxx
```

---

#### 1.4 **Set Up Monitoring (Prometheus + Grafana)**

```bash
# Add Helm repo
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update

# Install Prometheus
helm install prometheus prometheus-community/kube-prometheus-stack \
  --namespace monitoring \
  --create-namespace

# Get Grafana password
kubectl get secret --namespace monitoring prometheus-grafana -o jsonpath="{.data.admin-password}" | base64 --decode

# Port-forward Grafana
kubectl port-forward --namespace monitoring svc/prometheus-grafana 3000:80

# Access: http://localhost:3000 (admin / <password>)
```

---

#### 1.5 **Set Up CI/CD (GitHub Actions)**

```yaml
# .github/workflows/deploy-production.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2

      - name: Authenticate with GCP
        uses: google-github-actions/auth@v1
        with:
          credentials_json: ${{ secrets.GCP_SA_KEY }}

      - name: Set up Cloud SDK
        uses: google-github-actions/setup-gcloud@v1

      - name: Configure Docker
        run: gcloud auth configure-docker us-central1-docker.pkg.dev

      - name: Build Docker image
        run: |
          docker build -t us-central1-docker.pkg.dev/hypeai/services/api:${{ github.sha }} .
          docker push us-central1-docker.pkg.dev/hypeai/services/api:${{ github.sha }}

      - name: Deploy to GKE
        run: |
          gcloud container clusters get-credentials hypeai-production --region us-central1
          kubectl set image deployment/api api=us-central1-docker.pkg.dev/hypeai/services/api:${{ github.sha }}
          kubectl rollout status deployment/api
```

---

#### 1.6 **Set Up CDN (Cloudflare)**

```bash
# 1. Sign up at https://cloudflare.com
# 2. Add your domain (e.g., hypeai.io)
# 3. Update nameservers at domain registrar
# 4. Configure settings:
#    - SSL: Full (strict)
#    - Always Use HTTPS: On
#    - Auto Minify: JS, CSS, HTML
#    - Brotli Compression: On
#    - Caching Level: Standard
#    - Browser Cache TTL: 4 hours

# 5. Create Page Rule:
#    URL: hypeai.io/static/*
#    Cache Level: Cache Everything
#    Edge Cache TTL: 1 month
```

---

### Phase 1 Checklist:

- [ ] GKE cluster running (3 nodes)
- [ ] PostgreSQL Cloud SQL instance created
- [ ] Redis Memorystore instance created
- [ ] RabbitMQ CloudAMQP instance created
- [ ] Prometheus + Grafana installed
- [ ] GitHub Actions CI/CD configured
- [ ] Cloudflare CDN configured
- [ ] Secrets stored in GCP Secret Manager

**Estimated Cost:** $800/month (infrastructure only)

---

## 💾 Phase 2: Database Migration (Week 3-4)

### Goal: Migrate existing data to Cloud SQL without downtime

### Strategy: **Dual-Write Pattern**

```
Step 1: Write to both old and new databases
Step 2: Backfill historical data
Step 3: Verify data consistency
Step 4: Switch reads to new database
Step 5: Stop writing to old database
```

---

### 2.1 **Set Up Dual-Write**

```javascript
// database.js (current monolith)
const { Pool } = require('pg');

// Old database connection
const oldDB = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'hypeai_old',
  user: 'postgres',
  password: process.env.OLD_DB_PASSWORD
});

// New database connection (Cloud SQL)
const newDB = new Pool({
  host: process.env.CLOUD_SQL_HOST,
  port: 5432,
  database: 'hypeai_production',
  user: 'hypeai_user',
  password: process.env.CLOUD_SQL_PASSWORD,
  ssl: { rejectUnauthorized: false }
});

// Dual-write wrapper
async function createUser(userData) {
  const results = await Promise.allSettled([
    oldDB.query('INSERT INTO users (...) VALUES (...)', [userData]),
    newDB.query('INSERT INTO users (...) VALUES (...)', [userData])
  ]);

  // Check if both succeeded
  const oldSuccess = results[0].status === 'fulfilled';
  const newSuccess = results[1].status === 'fulfilled';

  if (!oldSuccess) {
    console.error('Old DB write failed:', results[0].reason);
    throw new Error('Database write failed');
  }

  if (!newSuccess) {
    console.error('New DB write failed (non-blocking):', results[1].reason);
    // Log error but don't fail request
    logToSentry('Cloud SQL write failed', { userData, error: results[1].reason });
  }

  return results[0].value.rows[0];
}
```

---

### 2.2 **Backfill Historical Data**

```javascript
// scripts/backfill-database.js
const { oldDB, newDB } = require('../database');

async function backfillTable(tableName) {
  console.log(`Starting backfill for ${tableName}...`);

  // Get total rows
  const { rows: [{ count }] } = await oldDB.query(`SELECT COUNT(*) FROM ${tableName}`);
  console.log(`Total rows to migrate: ${count}`);

  // Batch processing (1000 rows at a time)
  const batchSize = 1000;
  let offset = 0;

  while (offset < count) {
    const { rows } = await oldDB.query(
      `SELECT * FROM ${tableName} ORDER BY id LIMIT $1 OFFSET $2`,
      [batchSize, offset]
    );

    // Insert into new database
    for (const row of rows) {
      await newDB.query(
        `INSERT INTO ${tableName} (...) VALUES (...) ON CONFLICT (id) DO NOTHING`,
        [row]
      );
    }

    offset += batchSize;
    console.log(`Progress: ${offset}/${count} (${Math.round(offset/count*100)}%)`);
  }

  console.log(`✅ Backfill complete for ${tableName}`);
}

async function main() {
  const tables = ['users', 'transactions', 'referrals', 'wallets'];

  for (const table of tables) {
    await backfillTable(table);
  }

  console.log('✅ All tables backfilled!');
  process.exit(0);
}

main().catch(console.error);
```

**Run backfill:**
```bash
# Test on staging first
NODE_ENV=staging node scripts/backfill-database.js

# Run on production (off-peak hours: 3 AM UTC)
NODE_ENV=production node scripts/backfill-database.js
```

---

### 2.3 **Verify Data Consistency**

```javascript
// scripts/verify-data-consistency.js
async function verifyTable(tableName) {
  const [oldCount, newCount] = await Promise.all([
    oldDB.query(`SELECT COUNT(*) FROM ${tableName}`),
    newDB.query(`SELECT COUNT(*) FROM ${tableName}`)
  ]);

  const oldTotal = parseInt(oldCount.rows[0].count);
  const newTotal = parseInt(newCount.rows[0].count);

  console.log(`${tableName}: Old DB = ${oldTotal}, New DB = ${newTotal}`);

  if (oldTotal === newTotal) {
    console.log(`✅ ${tableName} counts match`);
  } else {
    console.error(`❌ ${tableName} counts MISMATCH!`);
    process.exit(1);
  }
}

async function main() {
  const tables = ['users', 'transactions', 'referrals', 'wallets'];

  for (const table of tables) {
    await verifyTable(table);
  }

  console.log('✅ All tables verified!');
}

main().catch(console.error);
```

---

### 2.4 **Switch Reads to New Database**

```javascript
// Gradual rollout using feature flag
const FEATURE_FLAGS = {
  USE_CLOUD_SQL: process.env.FEATURE_USE_CLOUD_SQL === 'true'
};

async function getUser(userId) {
  const db = FEATURE_FLAGS.USE_CLOUD_SQL ? newDB : oldDB;
  const { rows } = await db.query('SELECT * FROM users WHERE id = $1', [userId]);
  return rows[0];
}

// Deployment steps:
// 1. Deploy with FEATURE_USE_CLOUD_SQL=false (still reading from old)
// 2. Set FEATURE_USE_CLOUD_SQL=true for 10% of requests
// 3. Monitor error rates and latency
// 4. Gradually increase to 50%, 100%
```

---

### 2.5 **Stop Writing to Old Database**

```javascript
// After 100% reads are on new DB and no errors for 7 days:

async function createUser(userData) {
  // Only write to new database now
  const { rows } = await newDB.query('INSERT INTO users (...) VALUES (...)', [userData]);
  return rows[0];
}

// Keep old database as backup for 30 days, then decommission
```

---

### Phase 2 Checklist:

- [ ] Dual-write implemented (writing to both DBs)
- [ ] Historical data backfilled (100% complete)
- [ ] Data consistency verified (counts match)
- [ ] Reads switched to Cloud SQL (100% traffic)
- [ ] Writes switched to Cloud SQL only
- [ ] Old database kept as backup (30 days)

**Estimated Downtime:** 0 minutes (zero-downtime migration)

---

## 🔨 Phase 3: Service Extraction (Week 5-8)

### Goal: Extract microservices from monolith using Strangler Fig Pattern

### Strategy:
```
1. Identify service boundaries (Chat, Agent, Web3, Analytics)
2. Extract one service at a time
3. Use API Gateway to route traffic (old vs new)
4. Gradually migrate endpoints
5. Decommission old code when 100% migrated
```

---

### 3.1 **Week 5: Extract Chat Service**

#### Step 1: Create new service repo

```bash
mkdir -p services/chat-service
cd services/chat-service

# Initialize
npm init -y
npm install express @anthropic-ai/sdk pg redis dotenv winston

# Project structure
services/chat-service/
├── src/
│   ├── controllers/
│   │   └── chatController.js
│   ├── services/
│   │   ├── claudeService.js (AI API)
│   │   └── vectorService.js (RAG)
│   ├── models/
│   │   └── Message.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── rateLimiter.js
│   ├── routes/
│   │   └── chatRoutes.js
│   └── server.js
├── Dockerfile
├── package.json
└── .env.example
```

#### Step 2: Implement Chat Service

```javascript
// src/server.js
const express = require('express');
const chatRoutes = require('./routes/chatRoutes');

const app = express();
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'chat-service', version: '1.0.0' });
});

// Routes
app.use('/v1/chat', chatRoutes);

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Chat Service running on port ${PORT}`);
});
```

```javascript
// src/controllers/chatController.js
const claudeService = require('../services/claudeService');
const vectorService = require('../services/vectorService');

async function sendMessage(req, res) {
  const { message, sessionId, language = 'en' } = req.body;

  try {
    // 1. Get relevant context from vector DB
    const context = await vectorService.search(message, language);

    // 2. Call Claude API
    const response = await claudeService.generateResponse(message, context, language);

    // 3. Save to database
    await saveMessage(sessionId, { role: 'user', content: message });
    await saveMessage(sessionId, { role: 'assistant', content: response.text });

    // 4. Return response
    res.json({
      response: response.text,
      sources: context.sources,
      metadata: {
        responseTime: Date.now() - req.startTime,
        tokensUsed: response.tokensUsed
      }
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Failed to process message' });
  }
}

module.exports = { sendMessage };
```

#### Step 3: Deploy Chat Service

```bash
# Build Docker image
docker build -t hypeai/chat-service:v1.0.0 .

# Push to registry
docker push hypeai/chat-service:v1.0.0

# Deploy to Kubernetes
kubectl apply -f k8s/chat-service-deployment.yaml
```

```yaml
# k8s/chat-service-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: chat-service
spec:
  replicas: 3
  selector:
    matchLabels:
      app: chat-service
  template:
    metadata:
      labels:
        app: chat-service
    spec:
      containers:
      - name: chat-service
        image: hypeai/chat-service:v1.0.0
        ports:
        - containerPort: 3001
        env:
        - name: ANTHROPIC_API_KEY
          valueFrom:
            secretKeyRef:
              name: api-secrets
              key: anthropic-api-key
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: db-secrets
              key: postgres-url
---
apiVersion: v1
kind: Service
metadata:
  name: chat-service
spec:
  selector:
    app: chat-service
  ports:
  - port: 3001
    targetPort: 3001
  type: ClusterIP
```

#### Step 4: Update API Gateway to Route Traffic

```javascript
// API Gateway routing logic
app.use('/v1/chat', (req, res, next) => {
  // Feature flag: percentage of traffic to new service
  const useNewService = Math.random() < parseFloat(process.env.NEW_SERVICE_PERCENTAGE || '0.1');

  if (useNewService) {
    // Forward to new Chat Service
    proxy.web(req, res, { target: 'http://chat-service:3001' });
  } else {
    // Use old monolith code
    next();
  }
});

// Deployment schedule:
// Day 1: NEW_SERVICE_PERCENTAGE=0.1 (10%)
// Day 3: NEW_SERVICE_PERCENTAGE=0.5 (50%)
// Day 5: NEW_SERVICE_PERCENTAGE=1.0 (100%)
```

---

### 3.2 **Week 6: Extract Agent Service**

(Similar pattern as Chat Service)

```bash
# Create new service
mkdir -p services/agent-service
cd services/agent-service

# Project structure
services/agent-service/
├── src/
│   ├── agents/
│   │   ├── researcher.js
│   │   ├── coder.js
│   │   ├── tester.js
│   │   └── (24 more agents)
│   ├── queue/
│   │   └── taskQueue.js (Bull)
│   ├── coordinator/
│   │   └── omegaCoordinator.js
│   └── server.js
├── Dockerfile
└── package.json

# Deploy similar to Chat Service
```

---

### 3.3 **Week 7: Extract Web3 API Service**

```bash
mkdir -p services/web3-api
cd services/web3-api

# Dependencies
npm install express ethers web3 dotenv

# Key endpoints:
# POST /v1/blockchain/transfer
# GET  /v1/blockchain/balance/:address
# POST /v1/blockchain/stake
```

---

### 3.4 **Week 8: Extract Analytics Service**

```bash
mkdir -p services/analytics
cd services/analytics

# Dependencies
npm install express pg redis

# Endpoints:
# GET  /v1/analytics/dashboard
# GET  /v1/analytics/users
# GET  /v1/analytics/revenue
```

---

### Phase 3 Checklist:

- [ ] Chat Service extracted and deployed (Week 5)
- [ ] Agent Service extracted and deployed (Week 6)
- [ ] Web3 API Service extracted and deployed (Week 7)
- [ ] Analytics Service extracted and deployed (Week 8)
- [ ] All services have health checks
- [ ] All services connected to new database
- [ ] Monitoring dashboards created for each service

---

## 🔀 Phase 4: Traffic Cutover (Week 9)

### Goal: Fully migrate all traffic to new microservices

### 4.1 **Blue-Green Deployment**

```
┌──────────────┐      ┌──────────────┐
│  BLUE (Old)  │      │ GREEN (New)  │
│  Monolith    │      │ Microservices│
│              │      │              │
│  100% traffic│ ---> │  0% traffic  │  Day 1
│  50% traffic │ ---> │ 50% traffic  │  Day 3
│  0% traffic  │ ---> │ 100% traffic │  Day 5
└──────────────┘      └──────────────┘
```

### 4.2 **Cutover Schedule**

**Day 1-2 (10% traffic to Green):**
```bash
# Update API Gateway
kubectl set env deployment/api-gateway NEW_SERVICE_PERCENTAGE=0.1

# Monitor metrics
kubectl logs -f deployment/api-gateway | grep "error"
kubectl top pods # Check CPU/memory
```

**Day 3-4 (50% traffic to Green):**
```bash
kubectl set env deployment/api-gateway NEW_SERVICE_PERCENTAGE=0.5

# Check error rates
curl http://api.hypeai.io/health
# Should return < 1% error rate
```

**Day 5 (100% traffic to Green):**
```bash
kubectl set env deployment/api-gateway NEW_SERVICE_PERCENTAGE=1.0

# Verify all traffic on new services
kubectl get pods -o wide
kubectl logs -f deployment/chat-service
kubectl logs -f deployment/agent-service
```

### 4.3 **Rollback Plan**

If error rate > 5% at any stage:
```bash
# Immediate rollback
kubectl set env deployment/api-gateway NEW_SERVICE_PERCENTAGE=0.0

# Investigate logs
kubectl logs deployment/chat-service --tail=100 | grep ERROR

# Fix issue, redeploy, retry cutover
```

---

### Phase 4 Checklist:

- [ ] 10% traffic migrated successfully (< 1% errors)
- [ ] 50% traffic migrated successfully (< 1% errors)
- [ ] 100% traffic migrated successfully (< 1% errors)
- [ ] Old monolith decommissioned (kept as backup for 30 days)
- [ ] DNS updated to point to new infrastructure
- [ ] CDN cache purged (force refresh)

**Estimated Downtime:** 0 minutes (zero-downtime cutover)

---

## 🎯 Phase 5: Optimization (Week 10-12)

### Goal: Fine-tune performance, reduce costs, improve reliability

---

### 5.1 **Week 10: Performance Optimization**

#### Auto-Scaling Tuning
```bash
# Current HPA (Horizontal Pod Autoscaler)
kubectl get hpa

# Tune based on actual usage
kubectl autoscale deployment chat-service \
  --cpu-percent=70 \
  --min=3 \
  --max=10

# Monitor scaling events
kubectl get hpa -w
```

#### Database Query Optimization
```sql
-- Identify slow queries
SELECT query, mean_exec_time, calls
FROM pg_stat_statements
WHERE mean_exec_time > 100 -- > 100ms
ORDER BY mean_exec_time DESC
LIMIT 10;

-- Add missing indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_transactions_user_id_created_at ON transactions(user_id, created_at);
```

#### Cache Hit Rate Optimization
```javascript
// Increase cache TTL for hot data
const cacheConfig = {
  hotQuestions: 3600,     // 1 hour
  userProfile: 300,       // 5 minutes
  balanceQuery: 30,       // 30 seconds
  analyticsData: 600      // 10 minutes
};

// Monitor cache hit rate (target: > 80%)
const hitRate = redis.get('stats:cache-hits') / redis.get('stats:cache-requests');
console.log(`Cache hit rate: ${hitRate * 100}%`);
```

---

### 5.2 **Week 11: Cost Optimization**

#### Rightsizing Instances
```bash
# Analyze actual usage
kubectl top nodes
kubectl top pods

# Current: 3× e2-medium (2 vCPU, 4GB RAM) = $150/month
# Actual usage: 50% CPU, 60% memory
# Downsize to: 3× e2-small (2 vCPU, 2GB RAM) = $75/month
# Savings: $75/month

gcloud container clusters resize hypeai-production \
  --machine-type=e2-small \
  --num-nodes=3
```

#### Reserved Instances
```bash
# Purchase 1-year committed use discount (40% off)
gcloud compute commitments create hypeai-commitment \
  --resources=vcpu=6,memory=12 \
  --plan=12-month \
  --region=us-central1

# Savings: $600/year
```

#### Spot Instances for Worker Pools
```yaml
# Use preemptible VMs for non-critical workloads
apiVersion: apps/v1
kind: Deployment
metadata:
  name: worker-pool
spec:
  template:
    spec:
      nodeSelector:
        cloud.google.com/gke-preemptible: "true"
      tolerations:
      - key: cloud.google.com/gke-preemptible
        operator: Equal
        value: "true"
        effect: NoSchedule

# Savings: 60-80% off compute costs for workers
```

---

### 5.3 **Week 12: Reliability Improvements**

#### Circuit Breakers
```javascript
const CircuitBreaker = require('opossum');

const breaker = new CircuitBreaker(callClaudeAPI, {
  timeout: 5000,
  errorThresholdPercentage: 50,
  resetTimeout: 30000
});

breaker.fallback(() => {
  return getCachedResponse();
});
```

#### Graceful Shutdown
```javascript
// Handle SIGTERM for graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');

  // Stop accepting new requests
  server.close();

  // Wait for existing requests to finish
  await waitForPendingRequests();

  // Close database connections
  await db.end();

  console.log('Shutdown complete');
  process.exit(0);
});
```

#### Health Check Improvements
```javascript
app.get('/health', async (req, res) => {
  const checks = await Promise.allSettled([
    checkDatabase(),
    checkRedis(),
    checkClaudeAPI(),
    checkMessageQueue()
  ]);

  const healthy = checks.every(c => c.status === 'fulfilled' && c.value.healthy);

  res.status(healthy ? 200 : 503).json({
    status: healthy ? 'healthy' : 'degraded',
    checks: checks.map((c, i) => ({
      name: ['database', 'redis', 'claude', 'queue'][i],
      healthy: c.status === 'fulfilled' && c.value.healthy,
      latency: c.value?.latency
    }))
  });
});
```

---

### Phase 5 Checklist:

- [ ] Auto-scaling tuned (CPU/memory thresholds optimized)
- [ ] Database queries optimized (all < 100ms)
- [ ] Cache hit rate > 80%
- [ ] Instances rightsized (cost reduced by 30%)
- [ ] Reserved instances purchased (40% discount)
- [ ] Circuit breakers implemented
- [ ] Graceful shutdown implemented
- [ ] Health checks improved

**Cost Reduction:** ~$500/month (from $1,500 to $1,000)

---

## ✅ Success Criteria

### Migration Complete When:
- ✅ 100% traffic on new microservices
- ✅ Zero data loss during migration
- ✅ Error rate < 1%
- ✅ API latency p95 < 100ms
- ✅ 99.9% uptime achieved
- ✅ Old monolith decommissioned
- ✅ Team trained on new architecture
- ✅ Documentation updated

---

## 🚨 Rollback Plan

### If Migration Fails:

**Immediate Actions:**
1. Set `NEW_SERVICE_PERCENTAGE=0.0` (route all traffic back to old monolith)
2. Alert team via Slack/PagerDuty
3. Create incident postmortem document

**Within 1 Hour:**
1. Identify root cause (logs, metrics, traces)
2. Decide: Fix forward or rollback permanently
3. Communicate to stakeholders

**Within 24 Hours:**
1. If fix forward: Deploy hotfix, resume migration
2. If rollback: Revert DNS, decommission new services
3. Schedule retrospective meeting

---

## 📊 Migration Metrics Dashboard

### Monitor During Migration:

| Metric | Target | Alert Threshold |
|--------|--------|-----------------|
| Error Rate | < 1% | > 5% |
| API Latency p95 | < 100ms | > 200ms |
| Database Latency | < 50ms | > 100ms |
| Cache Hit Rate | > 80% | < 60% |
| CPU Usage | < 70% | > 85% |
| Memory Usage | < 80% | > 90% |
| Uptime | > 99.9% | < 99% |

---

## 📞 Support & Escalation

### Migration Team:

| Role | Name | Contact | Responsibility |
|------|------|---------|----------------|
| **Project Lead** | TBD | Slack: @lead | Overall migration success |
| **Infrastructure** | TBD | Slack: @infra | Kubernetes, databases |
| **Backend Dev** | TBD | Slack: @backend | Service extraction |
| **Frontend Dev** | TBD | Slack: @frontend | API integration |
| **DevOps** | TBD | Slack: @devops | CI/CD, monitoring |
| **DBA** | TBD | Slack: @dba | Database migration |

### Escalation Path:
1. **Level 1:** On-call engineer (respond within 15 min)
2. **Level 2:** Team lead (respond within 30 min)
3. **Level 3:** CTO (respond within 1 hour)

---

## 📅 Next Steps

1. **Review this migration plan** with stakeholders
2. **Allocate budget** (~$2,000/month infrastructure)
3. **Assign team members** to roles
4. **Set go-live date** (recommend 8-12 weeks from today)
5. **Begin Phase 1** (infrastructure setup)

---

**Document Owner:** System Architect Team
**Status:** ✅ Ready for Execution
**Last Updated:** 2025-10-25

---

**END OF MIGRATION PLAN**
