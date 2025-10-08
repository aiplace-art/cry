# 🚀 Quick Start Guide - HypedToken

## Installation & Setup (5 minutes)

### 1. Install Dependencies
```bash
cd /Users/ai.place/Crypto
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
# Edit .env with your configuration
```

### 3. Test the Tokenomics Calculator
```bash
node src/backend/tokenomics.js
```

## Quick Examples

### Calculate Staking Rewards
```javascript
const TokenomicsCalculator = require('./src/backend/tokenomics.js');
const calc = new TokenomicsCalculator();

// Stake 100,000 HYPE for 365 days
const rewards = calc.calculateStakingRewards(100000, 365);
console.log(rewards);
// Output:
// {
//   principal: 100000,
//   lockPeriod: 365,
//   apy: 62,
//   dailyReward: ~169.86 HYPE,
//   totalReward: ~62,000 HYPE,
//   finalAmount: ~185,821 HYPE
// }
```

### Get Complete Summary
```javascript
const summary = calc.getTokenomicsSummary();
console.log(JSON.stringify(summary, null, 2));
```

### Calculate Burn Projection
```javascript
// 1-year burn projection with 10M daily volume
const burnProj = calc.calculateBurnProjection(365, 10_000_000);
console.log(burnProj.projections);
```

## Smart Contract Testing

### Run All Tests
```bash
npm test
```

### Run with Gas Report
```bash
REPORT_GAS=true npm test
```

### Coverage Report
```bash
npm run coverage
```

## Deployment

### Local Testing
```bash
# Start local node
npm run node

# In another terminal, deploy
npm run deploy -- --network localhost
```

### Testnet Deployment
```bash
# Deploy to Goerli
npm run deploy -- --network goerli

# Deploy to BSC Testnet
npm run deploy -- --network bscTestnet
```

### Verify Contract
```bash
npm run verify -- --network goerli DEPLOYED_CONTRACT_ADDRESS
```

## Key Calculations

### Staking APY Tiers
| Lock Period | APY | Example (100K HYPE) |
|-------------|-----|---------------------|
| 30 days | 17% | ~1,397 HYPE reward |
| 90 days | 27% | ~6,657 HYPE reward |
| 365 days | 62% | ~62,000 HYPE reward |

### Fee Distribution (8% Total)
- **Reflection (2%)**: Distributed to all holders
- **Liquidity (3%)**: Added to DEX pool
- **Burn (1%)**: Sent to dead wallet
- **Treasury (2%)**: Development fund

### Token Distribution
- Public Sale: 25% (250M)
- Liquidity Pool: 20% (200M)
- Staking Rewards: 15% (150M)
- Team & Advisors: 15% (150M)
- Treasury: 10% (100M)
- Marketing: 8% (80M)
- Partnerships: 5% (50M)
- Airdrop: 2% (20M)

## Common Commands

```bash
# Compile contracts
npm run compile

# Run tests
npm test

# Deploy locally
npm run node && npm run deploy

# Calculate tokenomics
node src/backend/tokenomics.js

# Lint code
npm run lint

# Format code
npm run format
```

## Files Overview

```
/Users/ai.place/Crypto/
├── src/
│   ├── contracts/Token.sol          # Main smart contract
│   └── backend/tokenomics.js        # Tokenomics calculator
├── docs/
│   ├── tokenomics.md                # Full documentation
│   └── QUICK_START.md               # This file
├── tests/Token.test.js              # Comprehensive tests
├── scripts/deploy.js                # Deployment script
├── config/hardhat.config.js         # Hardhat configuration
└── package.json                     # Project dependencies
```

## Next Steps

1. ✅ Review full documentation: `docs/tokenomics.md`
2. ✅ Run tokenomics calculator: `node src/backend/tokenomics.js`
3. ✅ Test smart contract: `npm test`
4. ✅ Deploy to testnet: `npm run deploy -- --network goerli`
5. ✅ Verify contract on Etherscan
6. ✅ Add initial liquidity to DEX
7. ✅ Enable trading: `token.enableTrading()`
8. ✅ Launch marketing campaign

## Support

- Full Docs: `/docs/tokenomics.md`
- Contract: `/src/contracts/Token.sol`
- Calculator: `/src/backend/tokenomics.js`
- Tests: `/tests/Token.test.js`

---

**Happy Building! 🚀**
