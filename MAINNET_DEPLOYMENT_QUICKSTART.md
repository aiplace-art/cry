# BNB Chain Mainnet Deployment - Quick Start Guide

## TL;DR - Deploy in 5 Minutes

```bash
# 1. Configure environment
cp .env.mainnet.example .env.mainnet
nano .env.mainnet  # Add your private key and wallet addresses

# 2. Deploy everything
npm run deploy:mainnet

# Done! 🚀
```

---

## What You Need

### 1. Funding (30 seconds)
- **0.5 BNB** in deployer wallet
- Get BNB from Binance, KuCoin, or other exchanges
- Send to your deployment wallet address

### 2. Configuration (2 minutes)

Create `.env.mainnet` file:

```env
# CRITICAL: Your deployment private key
PRIVATE_KEY=0xYOUR_PRIVATE_KEY_HERE

# CRITICAL: Your wallet addresses
TREASURY_WALLET=0xYOUR_TREASURY_WALLET
TEAM_WALLET=0xYOUR_TEAM_WALLET

# OPTIONAL: BscScan API key for verification
BSCSCAN_API_KEY=YOUR_API_KEY
```

Get BscScan API key: https://bscscan.com/myapikey

### 3. Deploy (2 minutes)

```bash
npm run deploy:mainnet
```

That's it! The script handles everything:
- ✅ Pre-deployment checks
- ✅ Deploy all 8 contracts
- ✅ Verify on BscScan
- ✅ Generate deployment report

---

## What Gets Deployed

| # | Contract | Purpose |
|---|----------|---------|
| 1 | Token | Main HypeAI ERC20 token (10B supply) |
| 2 | Private Sale | Token sale contract |
| 3 | Referral System | Multi-level referral rewards (3 levels) |
| 4 | Vesting | Team token vesting (90 day cliff, 365 day total) |
| 5 | Governance | DAO voting system |
| 6 | Staking | Token staking with 12% APY |
| 7 | Oracle | AI Oracle with Chainlink price feeds |
| 8 | Verification | BscScan contract verification |

---

## After Deployment

### 1. Check Deployment (1 minute)

```bash
# View deployment addresses
cat deployments/mainnet/token-deployment.json
cat deployments/mainnet/private-sale-deployment.json
# ... etc
```

### 2. Fund Contracts (Optional)

If you want to enable functionality immediately:

```bash
# Transfer tokens to Private Sale
# Transfer tokens to Staking rewards
# Transfer tokens to Vesting
```

### 3. Update Frontend (2 minutes)

Copy contract addresses to your frontend:

```typescript
// src/frontend/lib/constants.ts
export const CONTRACT_ADDRESSES = {
  token: "0x...",           // From token-deployment.json
  privateSale: "0x...",     // From private-sale-deployment.json
  referral: "0x...",        // From referral-deployment.json
  // ... etc
};
```

---

## Deployment Cost

**Total: ~0.08 BNB (~$48 at $600/BNB)**

Breakdown:
- Token: ~$7.50
- Private Sale: ~$6.00
- Referral: ~$9.00
- Vesting: ~$4.50
- Governance: ~$7.50
- Staking: ~$7.50
- Oracle: ~$4.50
- Verification: Free

---

## Manual Deployment (Advanced)

If you want to deploy contracts one-by-one:

```bash
# Deploy Token
npm run deploy:token

# Deploy Private Sale (requires Token address)
npm run deploy:private-sale

# Deploy Referral System
npm run deploy:referral

# Deploy Vesting
npm run deploy:vesting

# Deploy Governance
npm run deploy:governance

# Deploy Staking
npm run deploy:staking

# Deploy Oracle
npm run deploy:oracle

# Verify all on BscScan
npm run verify:mainnet
```

---

## Troubleshooting

### "Insufficient funds"
```bash
# Need at least 0.5 BNB
# Check balance:
node scripts/check-mainnet-balance.js
```

### "Private key invalid"
```bash
# Make sure it starts with 0x
PRIVATE_KEY=0x123abc...
```

### "Treasury wallet invalid"
```bash
# Must be a valid Ethereum address
TREASURY_WALLET=0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb
```

### "Verification failed"
```bash
# Wait 30 seconds and retry
sleep 30
npm run verify:mainnet
```

---

## Security Checklist

Before mainnet deployment:

- [ ] Tested on BNB Testnet
- [ ] Private key is from hardware wallet (recommended)
- [ ] Treasury is multi-sig wallet (recommended)
- [ ] Code has been audited (recommended)
- [ ] Team is ready for launch
- [ ] Marketing prepared
- [ ] Support ready

---

## Emergency Rollback

If something goes wrong:

```bash
# Pause all contracts (if pausable)
npx hardhat run scripts/emergency/pause-all-contracts.js --network bsc

# Document the issue
# Contact team
# Plan fix or redeploy
```

---

## Next Steps

1. **Verify on BscScan**
   - Check all contracts are verified
   - Test read/write functions

2. **Add Liquidity**
   - Add to PancakeSwap
   - Set initial price

3. **Launch Marketing**
   - Announce deployment
   - Update website
   - Social media campaign

4. **Monitor**
   - Set up alerts
   - Monitor transactions
   - Track metrics

---

## Full Documentation

For complete details, see:
- `/docs/BNB_MAINNET_DEPLOYMENT_GUIDE.md` - Comprehensive guide
- `/scripts/deployment/README.md` - Script documentation
- `/scripts/deployment/data-migration-plan.js` - Migration strategy

---

## Support

**Issues?** Contact:
- GitHub: Open an issue
- Email: dev@hypeai.io
- Discord: https://discord.gg/hypeai

---

**Ready to deploy?**

```bash
npm run deploy:mainnet
```

**Expected duration:** ~5 minutes
**Expected cost:** ~0.08 BNB (~$48)
**Difficulty:** Easy ⭐

Let's make HypeAI live on BNB Chain Mainnet! 🚀
