# HypeAI BNB Chain Mainnet Deployment Guide

## Overview

This guide provides comprehensive instructions for deploying all HypeAI smart contracts to BNB Chain Mainnet.

**Network**: BNB Chain Mainnet (Chain ID: 56)
**Deployment Scripts**: `/scripts/deployment/`
**Configuration**: `.env.mainnet`

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Pre-Deployment Setup](#pre-deployment-setup)
3. [Configuration](#configuration)
4. [Deployment Process](#deployment-process)
5. [Post-Deployment](#post-deployment)
6. [Verification](#verification)
7. [Rollback Plan](#rollback-plan)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Tools

- Node.js >= 16.0.0
- npm >= 8.0.0
- Hardhat
- Git

### Required Resources

- **BNB Balance**: Minimum 0.5 BNB for deployment gas fees
- **BscScan API Key**: For contract verification (get from https://bscscan.com/myapikey)
- **Wallet**: MetaMask or hardware wallet with deployment private key

### Security Requirements

- ✅ Use hardware wallet for mainnet deployments (recommended)
- ✅ Never commit private keys to version control
- ✅ Use multi-signature wallet for treasury (recommended)
- ✅ Test all contracts on testnet first

---

## Pre-Deployment Setup

### 1. Clone and Install

```bash
git clone <repository-url>
cd Crypto
npm install
```

### 2. Compile Contracts

```bash
npx hardhat compile
```

Verify compilation is successful with no errors.

### 3. Run Tests

```bash
npx hardhat test
```

Ensure all tests pass before mainnet deployment.

### 4. Testnet Deployment (Recommended)

Deploy to BNB Testnet first to verify everything works:

```bash
npx hardhat run scripts/deploy/deploy-testnet.js --network bscTestnet
```

---

## Configuration

### 1. Create .env.mainnet File

Copy the template:

```bash
cp .env.mainnet.example .env.mainnet
```

### 2. Configure Environment Variables

Edit `.env.mainnet` with your values:

```env
# BNB Chain RPC
BSC_RPC_URL=https://bsc-dataseed1.binance.org

# Private Key (MUST start with 0x)
PRIVATE_KEY=0xYOUR_PRIVATE_KEY_HERE

# BscScan API Key
BSCSCAN_API_KEY=YOUR_BSCSCAN_API_KEY

# Gas Configuration
GAS_PRICE_GWEI=5
GAS_LIMIT=8000000

# Wallets (MUST be valid addresses)
TREASURY_WALLET=0xYOUR_TREASURY_WALLET
TEAM_WALLET=0xYOUR_TEAM_WALLET
MARKETING_WALLET=0xYOUR_MARKETING_WALLET
LIQUIDITY_WALLET=0xYOUR_LIQUIDITY_WALLET

# Token Configuration
TOKEN_NAME=HypeAI
TOKEN_SYMBOL=HYPEAI
TOTAL_SUPPLY=10000000000

# Private Sale Configuration
PRIVATE_SALE_TOKEN_PRICE=100000000000000
PRIVATE_SALE_HARD_CAP=1000000000000000000000
PRIVATE_SALE_MIN_PURCHASE=10000000000000000
PRIVATE_SALE_MAX_PURCHASE=50000000000000000000

# Referral System
REFERRAL_LEVEL1_PERCENT=500
REFERRAL_LEVEL2_PERCENT=300
REFERRAL_LEVEL3_PERCENT=200

# Vesting (90 days cliff, 365 days total)
VESTING_CLIFF_DURATION=7776000
VESTING_TOTAL_DURATION=31536000

# Staking (1 token minimum, 12% APY)
STAKING_MIN_AMOUNT=1000000000000000000
STAKING_APY_PERCENT=1200

# Governance (4% quorum, 3 days voting)
GOVERNANCE_QUORUM_PERCENT=400
GOVERNANCE_VOTING_PERIOD=259200

# Oracle (Chainlink BNB/USD on BSC Mainnet)
CHAINLINK_BNB_USD_FEED=0x0567F2323251f0Aab15c8dFb1967E4e8A7D42aeE

# Deployment Options
VERIFY_CONTRACTS=true
DEPLOY_WITH_DELAY=true
DEPLOY_DELAY_SECONDS=10
MAX_RETRIES=3
RETRY_DELAY_SECONDS=30
```

### 3. Validate Configuration

```bash
# Check deployer balance
node scripts/check-mainnet-balance.js

# Verify wallet addresses
node scripts/validate-addresses.js
```

---

## Deployment Process

### Deployment Scripts

All deployment scripts are located in `/scripts/deployment/`:

1. `01-deploy-token.js` - HypeAI Token
2. `02-deploy-private-sale.js` - Private Sale Contract
3. `03-deploy-referral.js` - Referral System
4. `04-deploy-vesting.js` - Team Token Vesting
5. `05-deploy-governance.js` - Governance DAO
6. `06-deploy-staking.js` - Staking Contract
7. `07-deploy-oracle.js` - AI Oracle
8. `08-verify-contracts.js` - BscScan Verification

### Option 1: Master Script (Recommended)

Deploy all contracts with one command:

```bash
chmod +x scripts/deployment/mainnet-deploy.sh
./scripts/deployment/mainnet-deploy.sh
```

The master script will:
- Run pre-deployment checks
- Deploy all contracts sequentially
- Verify contracts on BscScan
- Generate deployment report
- Send notifications (if configured)

### Option 2: Manual Step-by-Step Deployment

Deploy contracts individually:

```bash
# 1. Deploy Token
npx hardhat run scripts/deployment/01-deploy-token.js --network bsc

# 2. Deploy Private Sale
npx hardhat run scripts/deployment/02-deploy-private-sale.js --network bsc

# 3. Deploy Referral System
npx hardhat run scripts/deployment/03-deploy-referral.js --network bsc

# 4. Deploy Vesting
npx hardhat run scripts/deployment/04-deploy-vesting.js --network bsc

# 5. Deploy Governance
npx hardhat run scripts/deployment/05-deploy-governance.js --network bsc

# 6. Deploy Staking
npx hardhat run scripts/deployment/06-deploy-staking.js --network bsc

# 7. Deploy Oracle
npx hardhat run scripts/deployment/07-deploy-oracle.js --network bsc

# 8. Verify All Contracts
npx hardhat run scripts/deployment/08-verify-contracts.js --network bsc
```

### Deployment Output

Deployment data is saved to `/deployments/mainnet/`:

```
deployments/mainnet/
├── token-deployment.json
├── private-sale-deployment.json
├── referral-deployment.json
├── vesting-deployment.json
├── governance-deployment.json
├── staking-deployment.json
├── oracle-deployment.json
├── verification-report.json
├── deployment-summary.txt
└── logs/
    └── deployment-YYYYMMDD-HHMMSS.log
```

---

## Post-Deployment

### 1. Transfer Tokens to Contracts

```bash
# Transfer tokens to Private Sale
npx hardhat run scripts/post-deployment/fund-private-sale.js --network bsc

# Transfer tokens to Staking rewards pool
npx hardhat run scripts/post-deployment/fund-staking.js --network bsc

# Transfer team tokens to Vesting contract
npx hardhat run scripts/post-deployment/fund-vesting.js --network bsc
```

### 2. Configure Contract Parameters

```bash
# Set referral percentages (if not done in deployment)
npx hardhat run scripts/post-deployment/configure-referral.js --network bsc

# Configure staking parameters
npx hardhat run scripts/post-deployment/configure-staking.js --network bsc
```

### 3. Transfer Ownership (if using multi-sig)

```bash
npx hardhat run scripts/post-deployment/transfer-ownership.js --network bsc
```

### 4. Update Frontend

Update contract addresses in frontend configuration:

```typescript
// src/frontend/lib/constants.ts
export const CONTRACT_ADDRESSES = {
  token: "0x...",
  privateSale: "0x...",
  referral: "0x...",
  vesting: "0x...",
  governance: "0x...",
  staking: "0x...",
  oracle: "0x...",
};
```

### 5. Run Integration Tests

```bash
npx hardhat run tests/integration/mainnet-integration-test.js --network bsc
```

---

## Verification

### Verify on BscScan

Automatic verification (already included in master script):

```bash
npx hardhat run scripts/deployment/08-verify-contracts.js --network bsc
```

Manual verification for a specific contract:

```bash
npx hardhat verify --network bsc <CONTRACT_ADDRESS> <CONSTRUCTOR_ARGS>
```

Example:

```bash
npx hardhat verify --network bsc 0x123... "HypeAI" "HYPEAI" "10000000000000000000000000000" "0xTreasuryAddress"
```

### Verify Deployment

Check deployment on BscScan:

1. **Token**: https://bscscan.com/token/<TOKEN_ADDRESS>
2. **Private Sale**: https://bscscan.com/address/<PRIVATE_SALE_ADDRESS>
3. **Referral**: https://bscscan.com/address/<REFERRAL_ADDRESS>
4. **Vesting**: https://bscscan.com/address/<VESTING_ADDRESS>
5. **Governance**: https://bscscan.com/address/<GOVERNANCE_ADDRESS>
6. **Staking**: https://bscscan.com/address/<STAKING_ADDRESS>
7. **Oracle**: https://bscscan.com/address/<ORACLE_ADDRESS>

### Security Audit Checklist

- [ ] All contracts deployed successfully
- [ ] All contracts verified on BscScan
- [ ] Token total supply correct (10B tokens)
- [ ] Treasury wallet set correctly
- [ ] Private sale parameters correct
- [ ] Referral percentages correct
- [ ] Vesting schedule correct
- [ ] Governance quorum and voting period correct
- [ ] Staking APY and minimum stake correct
- [ ] Oracle price feed working
- [ ] Ownership transferred to multi-sig (if applicable)
- [ ] Integration tests passed
- [ ] Frontend updated with new addresses

---

## Rollback Plan

If deployment fails or critical issues are found:

### 1. Stop Operations

```bash
# Pause contracts (if pausable)
npx hardhat run scripts/emergency/pause-all-contracts.js --network bsc
```

### 2. Document Issues

- Save all deployment logs
- Document the specific error/issue
- Take screenshots of BscScan transactions

### 3. Communicate

- Notify team immediately
- Prepare community announcement (if public)
- Contact audit firm (if critical security issue)

### 4. Recovery Options

**Option A: Fix and Redeploy**
- Fix the issue in code
- Deploy new contracts
- Migrate data if needed

**Option B: Upgrade (if upgradeable)**
- Deploy new implementation
- Update proxy contracts

**Option C: Manual Intervention**
- Use emergency functions
- Transfer assets to safe wallet
- Plan migration to new contracts

---

## Troubleshooting

### Common Issues

#### Issue: "Insufficient funds for gas"

**Solution**:
```bash
# Check balance
node scripts/check-mainnet-balance.js

# Get more BNB from exchange
```

#### Issue: "Contract verification failed"

**Solution**:
```bash
# Wait 30 seconds and retry
sleep 30
npx hardhat run scripts/deployment/08-verify-contracts.js --network bsc

# Or verify manually on BscScan
```

#### Issue: "Nonce too low"

**Solution**:
```bash
# Reset Hardhat cache
npx hardhat clean

# Or manually set nonce in deployment script
```

#### Issue: "Contract already deployed at address"

**Solution**:
```bash
# Check deployments/mainnet/*.json files
# Remove deployment file if you want to redeploy
rm deployments/mainnet/token-deployment.json
```

#### Issue: "Gas price too low"

**Solution**:
```bash
# Increase gas price in .env.mainnet
GAS_PRICE_GWEI=10  # Increase from 5 to 10
```

### Gas Optimization

If gas costs are too high:

1. **Compile with optimizer**:
```javascript
// hardhat.config.cjs
optimizer: {
  enabled: true,
  runs: 200  // Increase for lower deployment cost
}
```

2. **Deploy during low traffic**:
- Check BSC gas tracker: https://bscscan.com/gastracker
- Deploy during off-peak hours

3. **Use batch transactions**:
- Group multiple operations
- Use multicall for multiple reads

### Emergency Contacts

- **Hardhat Support**: https://hardhat.org/support
- **BNB Chain Discord**: https://discord.gg/bnbchain
- **BscScan Support**: https://bscscan.com/contactus

---

## Data Migration Plan

### If Migrating from Testnet

1. **Export User Data**:
```bash
npx hardhat run scripts/migration/export-testnet-data.js --network bscTestnet
```

2. **Verify Data**:
```bash
node scripts/migration/validate-export.js
```

3. **Import to Mainnet** (if applicable):
```bash
npx hardhat run scripts/migration/import-mainnet-data.js --network bsc
```

### User Wallet Migration

Users don't need to do anything - same wallet works on mainnet.

### Frontend Update Process

1. Update contract addresses in frontend
2. Deploy frontend to staging
3. Test all functionality
4. Deploy to production
5. Announce to users

---

## Gas Cost Estimates

Estimated gas costs for deployment (at 5 Gwei):

| Contract | Gas Used | Cost (BNB) | Cost (USD at $600/BNB) |
|----------|----------|------------|------------------------|
| Token | ~2,500,000 | 0.0125 | $7.50 |
| Private Sale | ~2,000,000 | 0.0100 | $6.00 |
| Referral System | ~3,000,000 | 0.0150 | $9.00 |
| Vesting | ~1,500,000 | 0.0075 | $4.50 |
| Governance | ~2,500,000 | 0.0125 | $7.50 |
| Staking | ~2,500,000 | 0.0125 | $7.50 |
| Oracle | ~1,500,000 | 0.0075 | $4.50 |
| **TOTAL** | **~15,500,000** | **~0.0775 BNB** | **~$46.50** |

*Note: Actual costs may vary based on network congestion and gas prices.*

---

## Security Best Practices

1. **Use Hardware Wallet**: Ledger or Trezor for deployment
2. **Multi-Signature**: Use Gnosis Safe for treasury
3. **Timelock**: Consider adding timelock for critical operations
4. **Audit**: Get professional audit before mainnet deployment
5. **Bug Bounty**: Consider bug bounty program post-launch
6. **Monitoring**: Set up contract monitoring and alerts
7. **Emergency Pause**: Have emergency pause mechanism
8. **Rate Limiting**: Implement rate limits on critical functions

---

## Next Steps After Deployment

1. **Security Audit**: Professional audit of deployed contracts
2. **Liquidity**: Add liquidity to DEX (PancakeSwap)
3. **Marketing**: Announce mainnet launch
4. **Community**: Update community on deployment
5. **Documentation**: Update all documentation with mainnet addresses
6. **Monitoring**: Set up 24/7 monitoring and alerts
7. **Support**: Prepare customer support for launch
8. **Testing**: Final integration testing on mainnet

---

## Support

For deployment issues:

- **GitHub Issues**: https://github.com/your-repo/issues
- **Discord**: https://discord.gg/hypeai
- **Email**: dev@hypeai.io
- **Emergency**: emergency@hypeai.io

---

## Appendix

### A. Deployment Checklist

```
Pre-Deployment:
[ ] All tests passing
[ ] Testnet deployment successful
[ ] .env.mainnet configured
[ ] Wallets funded with BNB
[ ] BscScan API key configured
[ ] Team notified
[ ] Backup plan ready

Deployment:
[ ] Contracts compiled
[ ] Token deployed
[ ] Private Sale deployed
[ ] Referral System deployed
[ ] Vesting deployed
[ ] Governance deployed
[ ] Staking deployed
[ ] Oracle deployed
[ ] All contracts verified on BscScan

Post-Deployment:
[ ] Tokens transferred to contracts
[ ] Parameters configured
[ ] Ownership transferred (if applicable)
[ ] Frontend updated
[ ] Integration tests passed
[ ] Documentation updated
[ ] Team notified
[ ] Community announced
```

### B. Contract Addresses Template

```json
{
  "network": "bsc",
  "chainId": 56,
  "contracts": {
    "token": "0x...",
    "privateSale": "0x...",
    "referral": "0x...",
    "vesting": "0x...",
    "governance": "0x...",
    "staking": "0x...",
    "oracle": "0x..."
  },
  "deploymentDate": "2025-01-XX",
  "deployer": "0x...",
  "verified": true
}
```

### C. BNB Chain Resources

- **Official Docs**: https://docs.bnbchain.org/
- **BscScan**: https://bscscan.com/
- **Testnet Faucet**: https://testnet.binance.org/faucet-smart
- **Gas Tracker**: https://bscscan.com/gastracker
- **Status**: https://bscscan.com/stat/gasprice

---

**Last Updated**: 2025-01-21
**Version**: 1.0.0
**Author**: HypeAI Development Team
