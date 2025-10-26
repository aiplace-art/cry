# 🚀 HypeAI Platform - Production Deployment Guide

**Version:** 1.0.0
**Last Updated:** 2025-10-25
**Target Network:** BNB Chain (BSC) Mainnet

---

## 📋 Table of Contents

1. [Pre-Deployment Requirements](#pre-deployment-requirements)
2. [Environment Setup](#environment-setup)
3. [Smart Contract Deployment](#smart-contract-deployment)
4. [Frontend Deployment](#frontend-deployment)
5. [Infrastructure Setup](#infrastructure-setup)
6. [Post-Deployment Validation](#post-deployment-validation)
7. [Monitoring Setup](#monitoring-setup)
8. [Troubleshooting](#troubleshooting)

---

## 1. Pre-Deployment Requirements

### 1.1 Wallet Preparation

**Deployer Wallet:**
- [ ] Minimum balance: **0.5 BNB** for gas fees
- [ ] Private key secured in password manager
- [ ] Test deployment on BSC Testnet completed
- [ ] Wallet address whitelisted in team documentation

**Treasury Wallets:**
```plaintext
TREASURY_WALLET     = 0x... (Team tokens - 20% = 2B HYPEAI)
TEAM_WALLET         = 0x... (Team allocation - vesting enabled)
MARKETING_WALLET    = 0x... (Marketing - 15% = 1.5B HYPEAI)
LIQUIDITY_WALLET    = 0x... (DEX liquidity - 30% = 3B HYPEAI)
```

**Verification:**
```bash
# Check deployer balance
cast balance <DEPLOYER_ADDRESS> --rpc-url https://bsc-dataseed1.binance.org

# Should show > 0.5 BNB (500000000000000000 wei)
```

### 1.2 Required API Keys

```bash
# .env.mainnet configuration
BSCSCAN_API_KEY=your_bscscan_api_key        # From https://bscscan.com/myapikey
COINMARKETCAP_API_KEY=your_cmc_api_key      # For gas reporting
INFURA_PROJECT_ID=your_infura_id            # Backup RPC (optional)
ALCHEMY_API_KEY=your_alchemy_key            # Backup RPC (optional)
```

**Obtain API Keys:**
1. **BscScan**: https://bscscan.com/myapikey
2. **CoinMarketCap**: https://coinmarketcap.com/api/
3. **Infura**: https://infura.io/
4. **Alchemy**: https://www.alchemy.com/

### 1.3 System Requirements

**Development Machine:**
- Node.js >= 18.0.0
- npm >= 8.0.0
- Git >= 2.30.0
- Hardhat 2.26.3+
- 8GB RAM minimum
- 10GB free disk space

**Verify Installation:**
```bash
node --version    # v18.0.0+
npm --version     # 8.0.0+
git --version     # 2.30.0+
npx hardhat --version  # 2.26.3+
```

### 1.4 Repository Setup

```bash
# Clone repository
git clone https://github.com/your-org/hypeai-platform.git
cd hypeai-platform

# Install dependencies
npm ci

# Verify contracts compile
npm run compile

# Run full test suite
npm run test
```

**Expected Output:**
```
  Token Contract Tests
    ✓ Should deploy with correct initial supply (245ms)
    ✓ Should enforce transfer restrictions (183ms)
    ... (28 tests total)

  28 passing (5s)
```

---

## 2. Environment Setup

### 2.1 Create Production Environment File

```bash
# Copy mainnet template
cp .env.mainnet .env.production

# Edit with production values
nano .env.production
```

### 2.2 Production Configuration

**⚠️ CRITICAL: Fill in ALL placeholders with real values**

```bash
# ========================================
# BNB Chain Mainnet Configuration
# ========================================

# Network RPC Endpoints
BSC_RPC_URL=https://bsc-dataseed1.binance.org
BSC_BACKUP_RPC_URL=https://bsc-dataseed2.binance.org
BSC_BACKUP_RPC_URL_2=https://bsc-dataseed3.binance.org

# Deployment Wallet (KEEP SECRET!)
PRIVATE_KEY=0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef

# Contract Verification
BSCSCAN_API_KEY=ABC123XYZ789

# Gas Configuration
GAS_PRICE_GWEI=5          # 5 Gwei for normal transactions
GAS_LIMIT=8000000         # 8M gas limit

# Token Configuration
TOKEN_NAME=HypeAI
TOKEN_SYMBOL=HYPEAI
TOTAL_SUPPLY=10000000000000000000000000000  # 10 billion with 18 decimals

# Wallet Addresses
TREASURY_WALLET=0xYourTreasuryWalletAddress
TEAM_WALLET=0xYourTeamWalletAddress
MARKETING_WALLET=0xYourMarketingWalletAddress
LIQUIDITY_WALLET=0xYourLiquidityWalletAddress

# Private Sale Configuration
PRIVATE_SALE_TOKEN_PRICE=100000000000000    # 0.0001 BNB per token
PRIVATE_SALE_HARD_CAP=1000000000000000000000  # 1000 BNB
PRIVATE_SALE_MIN_PURCHASE=10000000000000000   # 0.01 BNB min
PRIVATE_SALE_MAX_PURCHASE=50000000000000000000 # 50 BNB max

# Referral System (Percentages in basis points: 500 = 5%)
REFERRAL_LEVEL1_PERCENT=500    # 5% for direct referrals
REFERRAL_LEVEL2_PERCENT=300    # 3% for second level
REFERRAL_LEVEL3_PERCENT=200    # 2% for third level

# Vesting Configuration (in seconds)
VESTING_CLIFF_DURATION=7776000    # 90 days cliff
VESTING_TOTAL_DURATION=31536000   # 365 days total vesting

# Staking Configuration
STAKING_MIN_AMOUNT=1000000000000000000    # 1 token minimum
STAKING_APY_PERCENT=1200                  # 12% APY

# Governance Configuration
GOVERNANCE_QUORUM_PERCENT=400    # 4% quorum required
GOVERNANCE_VOTING_PERIOD=259200  # 3 days voting period

# Chainlink Oracle (BNB/USD on BSC Mainnet)
CHAINLINK_BNB_USD_FEED=0x0567F2323251f0Aab15c8dFb1967E4e8A7D42aeE

# Deployment Options
VERIFY_CONTRACTS=true
SAVE_DEPLOYMENT_LOG=true
DEPLOYMENT_LOG_PATH=./deployments/mainnet

# Safety Checks
REQUIRE_BALANCE_CHECK=true
MIN_DEPLOYER_BALANCE_BNB=0.5

# Multi-Signature (Optional)
USE_MULTISIG=false
MULTISIG_WALLET=0xYourMultisigWalletAddress
MULTISIG_REQUIRED_CONFIRMATIONS=2

# Monitoring & Alerts
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
TELEGRAM_CHAT_ID=-1001234567890

# Deployment Strategy
DEPLOY_WITH_DELAY=true
DEPLOY_DELAY_SECONDS=10
MAX_RETRIES=3
RETRY_DELAY_SECONDS=30
```

### 2.3 Configuration Validation

```bash
# Validate environment configuration
node scripts/validate-config.js

# Expected output:
# ✅ Private key format valid
# ✅ Wallet addresses valid
# ✅ Gas configuration acceptable
# ✅ All required variables present
```

---

## 3. Smart Contract Deployment

### 3.1 Deployment Sequence

**⚠️ IMPORTANT: Deploy contracts in this exact order**

```
1. Token (HYPEAI ERC20)
   ↓
2. ReferralSystem
   ↓
3. PrivateSale (with referral integration)
   ↓
4. TeamTokenVesting
   ↓
5. Staking
   ↓
6. Governance
   ↓
7. AIOracle (optional)
```

### 3.2 Pre-Deployment Checklist

```bash
# 1. Verify network connection
npx hardhat console --network bsc
> await ethers.provider.getBlockNumber()
# Should return current BSC block number

# 2. Check gas price
cast gas-price --rpc-url https://bsc-dataseed1.binance.org
# Should show current gas price in wei

# 3. Verify deployer balance
cast balance $DEPLOYER_ADDRESS --rpc-url https://bsc-dataseed1.binance.org
# Should show > 0.5 BNB

# 4. Test compilation
npm run compile
# Should compile without errors

# 5. Run security tests
npm run test tests/security/
# All security tests should pass
```

### 3.3 Deploy Token Contract

```bash
# Deploy main token
npx hardhat run scripts/deploy-token.js --network bsc

# Expected output:
# Deploying Token to BSC Mainnet...
# Token deployed to: 0x1234567890abcdef1234567890abcdef12345678
# Verification submitted to BscScan
```

**Save Token Address:**
```bash
echo "TOKEN_ADDRESS=0x1234567890abcdef1234567890abcdef12345678" >> deployments/mainnet/.env
```

### 3.4 Deploy ReferralSystem

```bash
# Deploy referral system
npx hardhat run scripts/deploy-referral.js --network bsc

# Expected output:
# Deploying ReferralSystem...
# ReferralSystem deployed to: 0xabcdef1234567890abcdef1234567890abcdef12
```

**Save Referral Address:**
```bash
echo "REFERRAL_ADDRESS=0xabcdef1234567890abcdef1234567890abcdef12" >> deployments/mainnet/.env
```

### 3.5 Deploy PrivateSale

```bash
# Deploy private sale with referral integration
npx hardhat run scripts/deploy-presale.js --network bsc

# Expected output:
# Deploying PrivateSale...
# Integrating with ReferralSystem...
# PrivateSale deployed to: 0xfedcba9876543210fedcba9876543210fedcba98
```

### 3.6 Deploy TeamTokenVesting

```bash
# Deploy team vesting contract
npx hardhat run scripts/deploy-vesting.js --network bsc

# Expected output:
# Deploying TeamTokenVesting...
# Setting up vesting schedules...
# TeamTokenVesting deployed to: 0x9876543210fedcba9876543210fedcba98765432
```

### 3.7 Deploy Staking Contract

```bash
# Deploy staking
npx hardhat run scripts/deploy-staking.js --network bsc

# Expected output:
# Deploying Staking...
# Configuring APY: 12%
# Staking deployed to: 0x3456789012345678901234567890123456789012
```

### 3.8 Deploy Governance

```bash
# Deploy governance
npx hardhat run scripts/deploy-governance.js --network bsc

# Expected output:
# Deploying Governance...
# Setting quorum: 4%
# Governance deployed to: 0x7890123456789012345678901234567890123456
```

### 3.9 Contract Verification

**Automatic Verification (if configured):**
```bash
# Contracts should auto-verify if VERIFY_CONTRACTS=true
# Check BscScan for verification status
```

**Manual Verification:**
```bash
# Verify Token
npx hardhat verify --network bsc \
  0xTOKEN_ADDRESS \
  "HypeAI" "HYPEAI" "10000000000000000000000000000"

# Verify PrivateSale
npx hardhat verify --network bsc \
  0xPRESALE_ADDRESS \
  0xTOKEN_ADDRESS \
  "100000000000000" \
  "1000000000000000000000"

# Verify ReferralSystem
npx hardhat verify --network bsc \
  0xREFERRAL_ADDRESS
```

### 3.10 Post-Deployment Configuration

```bash
# Grant roles and permissions
npx hardhat run scripts/post-deploy-config.js --network bsc

# This script will:
# 1. Grant MINTER_ROLE to PrivateSale
# 2. Set referral system in PrivateSale
# 3. Configure staking rewards
# 4. Initialize governance parameters
# 5. Transfer ownership if multisig enabled
```

---

## 4. Frontend Deployment

### 4.1 Build Frontend

```bash
cd src/frontend

# Install dependencies
npm ci

# Create production environment
cat > .env.production << EOF
NEXT_PUBLIC_PRESALE_CONTRACT_ADDRESS=0xYourPresaleAddress
NEXT_PUBLIC_TOKEN_CONTRACT_ADDRESS=0xYourTokenAddress
NEXT_PUBLIC_REFERRAL_CONTRACT_ADDRESS=0xYourReferralAddress
NEXT_PUBLIC_STAKING_CONTRACT_ADDRESS=0xYourStakingAddress
NEXT_PUBLIC_GOVERNANCE_CONTRACT_ADDRESS=0xYourGovernanceAddress
NEXT_PUBLIC_BSC_RPC_URL=https://bsc-dataseed1.binance.org
NEXT_PUBLIC_BSCSCAN_URL=https://bscscan.com
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
NEXT_PUBLIC_ENVIRONMENT=production
NEXT_PUBLIC_CHAIN_ID=56
EOF

# Build application
npm run build

# Test production build locally
npm run start
# Visit http://localhost:3000 to verify
```

### 4.2 Deploy to Vercel

**Option 1: Automatic Deployment (Recommended)**
```bash
# Push to main branch triggers automatic deployment
git add .
git commit -m "Deploy: Production build"
git push origin main

# GitHub Actions will:
# 1. Run quality checks
# 2. Run security audit
# 3. Build application
# 4. Deploy to Vercel production
# 5. Run Lighthouse CI
```

**Option 2: Manual Deployment**
```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod

# Follow prompts:
# ? Set up and deploy? [Y/n] Y
# ? Which scope? Your Team
# ? Link to existing project? Y
# ? What's the name of your existing project? hypeai-presale
```

### 4.3 Configure Vercel Environment Variables

**Via Vercel Dashboard:**
1. Go to https://vercel.com/your-team/hypeai-presale
2. Settings → Environment Variables
3. Add production variables:

```
NEXT_PUBLIC_PRESALE_CONTRACT_ADDRESS = 0xYourPresaleAddress
NEXT_PUBLIC_TOKEN_CONTRACT_ADDRESS = 0xYourTokenAddress
NEXT_PUBLIC_BSC_RPC_URL = https://bsc-dataseed1.binance.org
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID = your_project_id
NEXT_PUBLIC_ENVIRONMENT = production
```

### 4.4 Verify Frontend Deployment

**Checklist:**
- [ ] Website loads at production URL
- [ ] Wallet connection works (MetaMask, WalletConnect)
- [ ] Contract addresses are correct in console
- [ ] Private sale purchase flow works
- [ ] Referral link generation works
- [ ] Staking interface functional
- [ ] No console errors

**Test Transaction:**
```javascript
// In browser console (on production site)
console.log(window.ethereum)  // Should show MetaMask provider
console.log(await ethereum.request({ method: 'eth_chainId' }))  // Should be 0x38 (BSC)
```

---

## 5. Infrastructure Setup

### 5.1 Deploy Docker Containers

```bash
# Production Docker Compose setup
cd /path/to/project

# Create production docker-compose file
cp docker-compose.yml docker-compose.production.yml

# Edit with production configurations
nano docker-compose.production.yml
```

**Production Docker Compose:**
```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:7.0
    container_name: hypeai-mongodb-prod
    restart: always
    environment:
      MONGO_INITDB_ROOT_USERNAME: ${MONGO_USER}
      MONGO_INITDB_ROOT_PASSWORD: ${MONGO_PASSWORD}
      MONGO_INITDB_DATABASE: hypeai_production
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db
      - ./backups/mongo:/backups
    networks:
      - hypeai-network

  postgres:
    image: postgres:16-alpine
    container_name: hypeai-postgres-prod
    restart: always
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: hypeai_analytics
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backups/postgres:/backups
    networks:
      - hypeai-network

  redis:
    image: redis:7-alpine
    container_name: hypeai-redis-prod
    restart: always
    command: redis-server --requirepass ${REDIS_PASSWORD} --maxmemory 2gb --maxmemory-policy allkeys-lru
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - hypeai-network

  monitoring:
    build: ./src/monitoring
    container_name: hypeai-monitoring
    restart: always
    environment:
      NODE_ENV: production
      MONGODB_URL: mongodb://${MONGO_USER}:${MONGO_PASSWORD}@mongodb:27017
      REDIS_URL: redis://:${REDIS_PASSWORD}@redis:6379
    ports:
      - "3001:3000"
    depends_on:
      - mongodb
      - redis
    networks:
      - hypeai-network

networks:
  hypeai-network:
    driver: bridge

volumes:
  mongodb_data:
  postgres_data:
  redis_data:
```

**Start Production Containers:**
```bash
# Load environment variables
source .env.production

# Start all services
docker-compose -f docker-compose.production.yml up -d

# Verify all containers running
docker ps

# Check logs
docker-compose -f docker-compose.production.yml logs -f
```

### 5.2 Configure Nginx Reverse Proxy

```bash
# Install Nginx (Ubuntu/Debian)
sudo apt update
sudo apt install nginx

# Create Nginx configuration
sudo nano /etc/nginx/sites-available/hypeai
```

**Nginx Configuration:**
```nginx
upstream backend {
    least_conn;
    server localhost:3000;
    # Add more backend servers for load balancing:
    # server localhost:3001;
    # server localhost:3002;
}

upstream monitoring {
    server localhost:3001;
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name api.hypeai.com;
    return 301 https://$server_name$request_uri;
}

# Main backend
server {
    listen 443 ssl http2;
    server_name api.hypeai.com;

    # SSL configuration
    ssl_certificate /etc/letsencrypt/live/api.hypeai.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.hypeai.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
    limit_req zone=api_limit burst=20 nodelay;

    # Proxy settings
    location / {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Health check endpoint
    location /health {
        proxy_pass http://backend/health;
        access_log off;
    }
}

# Monitoring dashboard
server {
    listen 443 ssl http2;
    server_name monitoring.hypeai.com;

    ssl_certificate /etc/letsencrypt/live/monitoring.hypeai.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/monitoring.hypeai.com/privkey.pem;

    # Basic auth for security
    auth_basic "Monitoring Dashboard";
    auth_basic_user_file /etc/nginx/.htpasswd;

    location / {
        proxy_pass http://monitoring;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**Enable and Test:**
```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/hypeai /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

### 5.3 SSL Certificates (Let's Encrypt)

```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Obtain certificates
sudo certbot --nginx -d api.hypeai.com -d monitoring.hypeai.com

# Test automatic renewal
sudo certbot renew --dry-run

# Certificates auto-renew every 60 days
```

---

## 6. Post-Deployment Validation

### 6.1 Smart Contract Validation

```bash
# Test all contract functions
npx hardhat run scripts/validate-deployment.js --network bsc
```

**Manual Validation Checklist:**
```bash
# 1. Verify token supply
cast call 0xTOKEN_ADDRESS "totalSupply()" --rpc-url https://bsc-dataseed1.binance.org
# Expected: 10000000000000000000000000000 (10 billion * 10^18)

# 2. Check private sale configuration
cast call 0xPRESALE_ADDRESS "tokenPrice()" --rpc-url https://bsc-dataseed1.binance.org
# Expected: 100000000000000 (0.0001 BNB)

# 3. Verify referral percentages
cast call 0xREFERRAL_ADDRESS "referralPercentages(uint256)" 1 --rpc-url https://bsc-dataseed1.binance.org
# Expected: 500 (5%)

# 4. Check staking APY
cast call 0xSTAKIN_ADDRESS "apyPercent()" --rpc-url https://bsc-dataseed1.binance.org
# Expected: 1200 (12%)
```

### 6.2 Integration Testing

**Test Purchase Flow:**
```bash
# Use test account with small amount
npx hardhat run scripts/test-purchase.js --network bsc
# Should complete purchase and generate referral link
```

**Test Referral System:**
```bash
# Test referral bonus distribution
npx hardhat run scripts/test-referral.js --network bsc
# Should credit all 3 levels correctly
```

### 6.3 Performance Validation

```bash
# Run Lighthouse CI
npx lighthouse https://presale.hypeai.com --output html --output-path ./reports/lighthouse-prod.html

# Check critical metrics:
# - Performance: > 90
# - Accessibility: > 90
# - Best Practices: > 90
# - SEO: > 90
```

### 6.4 Security Validation

```bash
# Run security audit on live contracts
npx hardhat run scripts/security-audit.js --network bsc

# Check for:
# ✅ No reentrancy vulnerabilities
# ✅ Access controls working
# ✅ No integer overflows
# ✅ Emergency pause working
# ✅ Ownership properly transferred
```

---

## 7. Monitoring Setup

### 7.1 Enable Production Monitoring

```bash
# Start monitoring container
docker-compose -f docker-compose.production.yml up -d monitoring

# Access monitoring dashboard
open https://monitoring.hypeai.com
```

### 7.2 Configure Alerts

**Edit Alert Rules:**
```bash
nano src/monitoring/alert-rules.json
```

**Production Alert Rules:**
```json
{
  "alerts": [
    {
      "name": "high_error_rate",
      "condition": "error_rate > 1%",
      "severity": "critical",
      "channels": ["slack", "telegram"]
    },
    {
      "name": "low_balance",
      "condition": "deployer_balance < 0.1 BNB",
      "severity": "high",
      "channels": ["telegram"]
    },
    {
      "name": "high_gas_price",
      "condition": "gas_price > 10 gwei",
      "severity": "medium",
      "channels": ["slack"]
    },
    {
      "name": "database_down",
      "condition": "mongodb_status != connected",
      "severity": "critical",
      "channels": ["slack", "telegram", "pagerduty"]
    }
  ]
}
```

### 7.3 Setup Notification Channels

**Slack Webhook:**
```bash
# Add to .env.production
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
```

**Telegram Bot:**
```bash
# Add to .env.production
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
TELEGRAM_CHAT_ID=-1001234567890
```

**Test Notifications:**
```bash
npx hardhat run scripts/test-alerts.js
# Should send test message to all configured channels
```

---

## 8. Troubleshooting

### 8.1 Common Deployment Issues

**Issue: "Insufficient funds for gas"**
```bash
# Check deployer balance
cast balance $DEPLOYER_ADDRESS --rpc-url https://bsc-dataseed1.binance.org

# Solution: Send more BNB to deployer wallet
# Minimum: 0.5 BNB recommended
```

**Issue: "Contract verification failed"**
```bash
# Manual verification
npx hardhat verify --network bsc \
  --constructor-args scripts/arguments.js \
  0xCONTRACT_ADDRESS

# If still fails, check:
# 1. Compiler version matches (0.8.20)
# 2. Optimization enabled (runs: 200)
# 3. Constructor arguments correct
```

**Issue: "Transaction underpriced"**
```bash
# Increase gas price in .env.production
GAS_PRICE_GWEI=10  # Increase from 5 to 10

# Or use automatic gas pricing
GAS_PRICE_GWEI=auto
```

### 8.2 Rollback Procedure

**If Deployment Fails:**
```bash
# 1. Stop all services
docker-compose -f docker-compose.production.yml down

# 2. Restore database from backup
docker run --rm -v mongodb_data:/data/db \
  -v $(pwd)/backups/mongo:/backup \
  mongo:7.0 \
  mongorestore --uri="mongodb://localhost:27017" /backup/latest

# 3. Revert contract deployment (if needed)
# Note: Can't delete deployed contracts, but can pause them
cast send 0xCONTRACT_ADDRESS "pause()" \
  --private-key $PRIVATE_KEY \
  --rpc-url https://bsc-dataseed1.binance.org

# 4. Redeploy with fixes
git checkout previous-stable-commit
npm run deploy
```

### 8.3 Emergency Contacts

```plaintext
DevOps Team:    devops@hypeai.com
Security Team:  security@hypeai.com
CTO:            cto@hypeai.com

On-Call:        +1-XXX-XXX-XXXX
Slack:          #hypeai-incidents
```

---

## 📋 Final Checklist

**Pre-Launch:**
- [ ] All contracts deployed and verified on BscScan
- [ ] Frontend deployed and accessible
- [ ] All environment variables configured
- [ ] Monitoring dashboard operational
- [ ] Alert notifications tested
- [ ] Database backups configured
- [ ] SSL certificates installed and auto-renewing
- [ ] Nginx reverse proxy configured
- [ ] Load balancer (if applicable) configured
- [ ] Documentation updated with deployed addresses
- [ ] Team briefed on deployment
- [ ] Emergency contacts documented

**Launch Day:**
- [ ] Monitor dashboard for 4 hours continuously
- [ ] Check error rates every 15 minutes
- [ ] Verify transaction processing
- [ ] Test all user flows
- [ ] Monitor gas usage
- [ ] Watch social media for issues
- [ ] Team on standby for support

**Post-Launch (24 hours):**
- [ ] No critical errors logged
- [ ] Performance metrics within bounds
- [ ] User transactions completing successfully
- [ ] Referral system working
- [ ] Staking operational
- [ ] Governance functioning
- [ ] Update status page
- [ ] Send launch announcement

---

**Deployment Completed By:** _____________
**Date:** _____________
**Verified By:** _____________
**Status:** ⬜ Success  ⬜ Partial  ⬜ Failed

**Notes:**
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
