# 🚀 HypedToken - Advanced Tokenomics & Smart Contract

A comprehensive cryptocurrency tokenomics model with innovative features including AI-driven fee optimization, reflection rewards, staking system, and deflationary burn mechanisms.

## 📋 Table of Contents

- [Features](#features)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Usage](#usage)
- [Smart Contract](#smart-contract)
- [Tokenomics Calculator](#tokenomics-calculator)
- [Documentation](#documentation)
- [Testing](#testing)
- [Deployment](#deployment)
- [Security](#security)

## ✨ Features

### Smart Contract Features
- ✅ ERC-20 Standard Compliance
- ✅ Anti-Whale Mechanisms (Max TX & Wallet Limits)
- ✅ Auto-Liquidity Generation (3% fee)
- ✅ Reflection Rewards (2% to holders)
- ✅ Deflationary Burn (1% per transaction)
- ✅ AI-Driven Dynamic Fee Adjustment
- ✅ Multi-Tier Staking System (17-62% APY)
- ✅ Treasury Fund (2% fee)
- ✅ Trading Controls & Blacklist
- ✅ ReentrancyGuard Protection

### Tokenomics Features
- 📊 Complete distribution model (8 categories)
- 📈 Vesting schedules for team & treasury
- 💰 Staking rewards calculator (3 tiers)
- 🔥 Burn projection modeling
- 💧 Liquidity incentive calculations
- 🎁 Tiered airdrop distribution
- 📉 Price projection models
- 🔄 Reflection rewards tracking

## 📁 Project Structure

```
Crypto/
├── src/
│   ├── contracts/
│   │   └── Token.sol           # Main smart contract
│   └── backend/
│       └── tokenomics.js       # Tokenomics calculator
├── docs/
│   └── tokenomics.md           # Complete documentation
├── config/
│   └── hardhat.config.js       # Hardhat configuration
├── tests/                      # Test files
├── package.json                # Dependencies
├── .env.example                # Environment variables template
└── README.md                   # This file
```

## 🔧 Installation

### Prerequisites
- Node.js >= 16.0.0
- npm >= 8.0.0
- Git

### Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/hyped-token.git
cd hyped-token

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
# Edit .env with your configuration

# Compile contracts
npm run compile
```

## 🚀 Usage

### Tokenomics Calculator

```javascript
const TokenomicsCalculator = require('./src/backend/tokenomics.js');
const calculator = new TokenomicsCalculator();

// Get complete summary
const summary = calculator.getTokenomicsSummary();
console.log(summary);

// Calculate staking rewards
const rewards = calculator.calculateStakingRewards(100000, 365);
console.log('Staking 100K HYPE for 365 days:', rewards);

// Calculate burn projection
const burnProj = calculator.calculateBurnProjection(365, 10_000_000);
console.log('1-year burn projection:', burnProj);

// Calculate distribution
const distribution = calculator.calculateDistribution();
console.log('Token distribution:', distribution);

// Vesting schedule
const vesting = calculator.calculateVestingSchedule('team');
console.log('Team vesting:', vesting);
```

### Run Calculator Examples

```bash
node src/backend/tokenomics.js
```

## 📜 Smart Contract

### Key Parameters

```solidity
Total Supply: 1,000,000,000 HYPE
Max Transaction: 5,000,000 HYPE (0.5%)
Max Wallet: 20,000,000 HYPE (2%)

Fees:
- Reflection: 2%
- Liquidity: 3%
- Burn: 1%
- Treasury: 2%
- Total: 8% (dynamic 5-15%)

Staking APY:
- 30 days: 17%
- 90 days: 27%
- 365 days: 62%
```

### Core Functions

```solidity
// Trading
transfer(address to, uint256 amount)
approve(address spender, uint256 amount)

// Staking
stake(uint256 amount, uint256 lockPeriodDays)
unstake(uint256 stakeIndex)

// Admin
enableTrading()
setFees(uint256 reflection, liquidity, burn, treasury)
setMaxTransactionAmount(uint256 amount)
```

## 📚 Documentation

Complete documentation available at `/docs/tokenomics.md`:

- Token Overview & Distribution
- Fee Structure & Mechanisms
- Burn & Deflationary Model
- Staking System & APY
- Reflection Rewards
- Liquidity Incentives
- Anti-Whale Protection
- AI-Driven Features
- Price Projections
- Security Features
- Integration Guide

## 🧪 Testing

```bash
# Run all tests
npm test

# Run with gas reporting
REPORT_GAS=true npm test

# Generate coverage report
npm run coverage

# Run specific test
npx hardhat test tests/Token.test.js
```

## 🚢 Deployment

### Local Development

```bash
# Start local Hardhat node
npm run node

# Deploy to localhost
npm run deploy -- --network localhost
```

### Testnet Deployment

```bash
# Deploy to Goerli
npm run deploy -- --network goerli

# Deploy to BSC Testnet
npm run deploy -- --network bscTestnet

# Verify contract
npm run verify -- --network goerli DEPLOYED_CONTRACT_ADDRESS
```

### Mainnet Deployment

```bash
# Deploy to Ethereum Mainnet
npm run deploy -- --network mainnet

# Deploy to BSC Mainnet
npm run deploy -- --network bsc

# Deploy to Polygon
npm run deploy -- --network polygon
```

## 🔐 Security

### Security Features
- OpenZeppelin battle-tested libraries
- ReentrancyGuard protection
- SafeMath for arithmetic operations
- Access control (Ownable)
- Trading pause mechanism
- Blacklist functionality
- Audit-ready code structure

### Best Practices
- Never commit `.env` file
- Use hardware wallets for mainnet
- Test thoroughly on testnets
- Get professional audit before mainnet
- Implement timelock for critical changes
- Use multi-sig for team funds

## 🔗 Claude-Flow Integration

### Session Management

```bash
# Restore session
npx claude-flow@alpha hooks session-restore --session-id "swarm-tokenomics"

# Store contract in memory
npx claude-flow@alpha hooks post-edit --file "src/contracts/Token.sol" --memory-key "swarm/contracts/token"

# Share calculations
npx claude-flow@alpha hooks post-edit --file "src/backend/tokenomics.js" --memory-key "swarm/backend/tokenomics"
```

## 📊 Tokenomics Summary

| Metric | Value |
|--------|-------|
| Total Supply | 1B HYPE |
| Initial Price | $0.001 |
| Target Market Cap | $100M |
| Max Transaction | 0.5% |
| Max Wallet | 2% |
| Transaction Fee | 8% (5-15% dynamic) |
| Staking APY | 17-62% |
| Reflection Yield | Up to 36.5% |
| Max Burn | 50% supply |

## 🛣️ Roadmap

- ✅ Q1 2025: Smart contract & tokenomics development
- 🔄 Q2 2025: DEX listing & staking platform
- 📅 Q3 2025: Multi-chain deployment & DAO
- 📅 Q4 2025: DeFi ecosystem & $100M market cap

## 📄 License

MIT License - see LICENSE file for details

## 🤝 Contributing

Contributions welcome! Please read CONTRIBUTING.md first.

## 📞 Support

- Documentation: `/docs/tokenomics.md`
- Issues: GitHub Issues
- Community: Discord/Telegram

---

**Built with ❤️ for the crypto community**

*Last Updated: October 2025*
