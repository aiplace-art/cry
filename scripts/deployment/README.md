# HypeAI Mainnet Deployment Scripts

## Overview

This directory contains all scripts required for deploying HypeAI smart contracts to BNB Chain Mainnet.

## Directory Structure

```
scripts/deployment/
├── 01-deploy-token.js              # Deploy HypeAI Token
├── 02-deploy-private-sale.js       # Deploy Private Sale Contract
├── 03-deploy-referral.js           # Deploy Referral System
├── 04-deploy-vesting.js            # Deploy Vesting Contract
├── 05-deploy-governance.js         # Deploy Governance DAO
├── 06-deploy-staking.js            # Deploy Staking Contract
├── 07-deploy-oracle.js             # Deploy AI Oracle
├── 08-verify-contracts.js          # Verify all contracts on BscScan
├── mainnet-deploy.sh               # Master deployment script
├── data-migration-plan.js          # Data migration strategy
└── README.md                       # This file
```

## Quick Start

### 1. Prerequisites

```bash
# Install dependencies
npm install

# Compile contracts
npx hardhat compile

# Run tests
npx hardhat test
```

### 2. Configure Environment

```bash
# Copy template
cp ../../.env.mainnet.example ../../.env.mainnet

# Edit configuration
nano ../../.env.mainnet
```

### 3. Deploy to Mainnet

**Option A: Use Master Script (Recommended)**

```bash
chmod +x mainnet-deploy.sh
./mainnet-deploy.sh
```

**Option B: Deploy Individually**

```bash
npx hardhat run 01-deploy-token.js --network bsc
npx hardhat run 02-deploy-private-sale.js --network bsc
npx hardhat run 03-deploy-referral.js --network bsc
npx hardhat run 04-deploy-vesting.js --network bsc
npx hardhat run 05-deploy-governance.js --network bsc
npx hardhat run 06-deploy-staking.js --network bsc
npx hardhat run 07-deploy-oracle.js --network bsc
npx hardhat run 08-verify-contracts.js --network bsc
```

## Deployment Scripts

### 01-deploy-token.js

Deploys the main HypeAI ERC20 token.

**Constructor Arguments:**
- `tokenName` (string): Token name (default: "HypeAI")
- `tokenSymbol` (string): Token symbol (default: "HYPEAI")
- `totalSupply` (uint256): Total supply in tokens (default: 10,000,000,000)
- `treasuryWallet` (address): Treasury wallet address

**Output:** `deployments/mainnet/token-deployment.json`

### 02-deploy-private-sale.js

Deploys the Private Sale contract.

**Constructor Arguments:**
- `tokenAddress` (address): HypeAI token address
- `tokenPrice` (uint256): Price per token in BNB
- `hardCap` (uint256): Maximum BNB to raise
- `minPurchase` (uint256): Minimum purchase amount
- `maxPurchase` (uint256): Maximum purchase amount
- `treasuryWallet` (address): Treasury wallet

**Output:** `deployments/mainnet/private-sale-deployment.json`

### 03-deploy-referral.js

Deploys the multi-level Referral System.

**Constructor Arguments:**
- `tokenAddress` (address): HypeAI token address
- `treasuryWallet` (address): Treasury wallet

**Post-Deployment:**
- Sets level 1 reward: 5%
- Sets level 2 reward: 3%
- Sets level 3 reward: 2%

**Output:** `deployments/mainnet/referral-deployment.json`

### 04-deploy-vesting.js

Deploys the Team Token Vesting contract.

**Constructor Arguments:**
- `tokenAddress` (address): HypeAI token address
- `beneficiary` (address): Team wallet address
- `cliffDuration` (uint256): Cliff period in seconds (default: 90 days)
- `totalDuration` (uint256): Total vesting period (default: 365 days)

**Output:** `deployments/mainnet/vesting-deployment.json`

### 05-deploy-governance.js

Deploys the Governance DAO contract.

**Constructor Arguments:**
- `tokenAddress` (address): HypeAI token address
- `quorumPercent` (uint256): Quorum percentage (default: 4%)
- `votingPeriod` (uint256): Voting period in seconds (default: 3 days)

**Output:** `deployments/mainnet/governance-deployment.json`

### 06-deploy-staking.js

Deploys the Staking contract.

**Constructor Arguments:**
- `tokenAddress` (address): HypeAI token address
- `minStakeAmount` (uint256): Minimum stake amount
- `apyPercent` (uint256): APY percentage (default: 12%)
- `treasuryWallet` (address): Treasury wallet

**Output:** `deployments/mainnet/staking-deployment.json`

### 07-deploy-oracle.js

Deploys the AI Oracle contract.

**Constructor Arguments:**
- `tokenAddress` (address): HypeAI token address
- `priceFeed` (address): Chainlink BNB/USD price feed
- `treasuryWallet` (address): Treasury wallet

**Output:** `deployments/mainnet/oracle-deployment.json`

### 08-verify-contracts.js

Verifies all deployed contracts on BscScan.

**Requirements:**
- `BSCSCAN_API_KEY` must be set in `.env.mainnet`
- All contracts must be deployed first

**Output:** `deployments/mainnet/verification-report.json`

## Master Script Features

The `mainnet-deploy.sh` script provides:

✅ **Pre-deployment checks:**
- Network connectivity
- Deployer balance
- Configuration validation
- Private key verification

✅ **Sequential deployment:**
- Deploys all 7 contracts in order
- Configurable delays between deployments
- Error handling and retry logic

✅ **Post-deployment:**
- Automatic BscScan verification
- Deployment report generation
- Success/failure notifications

✅ **Safety features:**
- Confirmation prompts
- Comprehensive logging
- Deployment state tracking

## Configuration

All deployment parameters are configured in `.env.mainnet`:

```env
# Network
BSC_RPC_URL=https://bsc-dataseed1.binance.org
PRIVATE_KEY=0x...

# BscScan
BSCSCAN_API_KEY=...

# Gas
GAS_PRICE_GWEI=5
GAS_LIMIT=8000000

# Wallets
TREASURY_WALLET=0x...
TEAM_WALLET=0x...
MARKETING_WALLET=0x...
LIQUIDITY_WALLET=0x...

# Contract Parameters
TOKEN_NAME=HypeAI
TOKEN_SYMBOL=HYPEAI
TOTAL_SUPPLY=10000000000

PRIVATE_SALE_TOKEN_PRICE=100000000000000
PRIVATE_SALE_HARD_CAP=1000000000000000000000

REFERRAL_LEVEL1_PERCENT=500
REFERRAL_LEVEL2_PERCENT=300
REFERRAL_LEVEL3_PERCENT=200

VESTING_CLIFF_DURATION=7776000
VESTING_TOTAL_DURATION=31536000

STAKING_MIN_AMOUNT=1000000000000000000
STAKING_APY_PERCENT=1200

GOVERNANCE_QUORUM_PERCENT=400
GOVERNANCE_VOTING_PERIOD=259200

CHAINLINK_BNB_USD_FEED=0x0567F2323251f0Aab15c8dFb1967E4e8A7D42aeE

# Deployment Options
VERIFY_CONTRACTS=true
DEPLOY_WITH_DELAY=true
DEPLOY_DELAY_SECONDS=10
MAX_RETRIES=3
RETRY_DELAY_SECONDS=30
```

## Deployment Output

All deployment data is saved to `deployments/mainnet/`:

### JSON Files

Each contract deployment creates a JSON file with:
- Contract address
- Constructor arguments
- Deployment transaction hash
- Deployer address
- Block number
- Timestamp

### Log Files

Deployment logs are saved to:
```
deployments/mainnet/logs/deployment-YYYYMMDD-HHMMSS.log
```

### Summary Report

After deployment, a summary report is generated:
```
deployments/mainnet/deployment-summary.txt
```

## Gas Estimates

Estimated gas costs (at 5 Gwei):

| Contract | Gas | BNB | USD (@$600) |
|----------|-----|-----|-------------|
| Token | 2,500,000 | 0.0125 | $7.50 |
| Private Sale | 2,000,000 | 0.0100 | $6.00 |
| Referral | 3,000,000 | 0.0150 | $9.00 |
| Vesting | 1,500,000 | 0.0075 | $4.50 |
| Governance | 2,500,000 | 0.0125 | $7.50 |
| Staking | 2,500,000 | 0.0125 | $7.50 |
| Oracle | 1,500,000 | 0.0075 | $4.50 |
| **Total** | **~15.5M** | **~0.078** | **~$47** |

## Security Checklist

Before mainnet deployment:

- [ ] All tests passing
- [ ] Testnet deployment successful
- [ ] Code audited (recommended)
- [ ] Private keys secured
- [ ] Multi-sig wallet configured (recommended)
- [ ] Emergency pause mechanism tested
- [ ] Backup plan prepared
- [ ] Team notified

## Troubleshooting

### Common Issues

**Issue: "Insufficient funds"**
```bash
# Check balance
node ../check-mainnet-balance.js

# Need at least 0.5 BNB for deployment
```

**Issue: "Nonce too low"**
```bash
# Clear Hardhat cache
npx hardhat clean

# Restart deployment
```

**Issue: "Verification failed"**
```bash
# Wait 30 seconds and retry
sleep 30
npx hardhat run 08-verify-contracts.js --network bsc
```

**Issue: "Contract already deployed"**
```bash
# Check if deployment file exists
ls ../../deployments/mainnet/

# Remove if you want to redeploy
rm ../../deployments/mainnet/token-deployment.json
```

## Data Migration

For data migration from testnet to mainnet, see:
- `data-migration-plan.js` - Migration strategy
- `../../docs/BNB_MAINNET_DEPLOYMENT_GUIDE.md` - Full deployment guide

**Recommended:** Fresh deployment with no data migration.

## Post-Deployment

After successful deployment:

1. **Transfer tokens to contracts:**
```bash
npx hardhat run ../post-deployment/fund-contracts.js --network bsc
```

2. **Update frontend:**
```bash
# Copy addresses to frontend config
node ../update-frontend-addresses.js
```

3. **Run integration tests:**
```bash
npx hardhat test tests/integration/mainnet-integration-test.js --network bsc
```

4. **Announce deployment:**
- Update documentation
- Notify team
- Announce to community

## Support

For deployment issues:
- Check logs in `deployments/mainnet/logs/`
- Review deployment guide: `../../docs/BNB_MAINNET_DEPLOYMENT_GUIDE.md`
- Contact team: dev@hypeai.io

## Emergency Contacts

- **Hardhat**: https://hardhat.org/support
- **BNB Chain**: https://discord.gg/bnbchain
- **BscScan**: https://bscscan.com/contactus

---

**Last Updated:** 2025-01-21
**Network:** BNB Chain Mainnet (Chain ID: 56)
**Repository:** HypeAI Smart Contracts
