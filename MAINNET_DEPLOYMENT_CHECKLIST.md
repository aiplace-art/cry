# 🚀 MAINNET DEPLOYMENT QUICK CHECKLIST

**Project:** HypeAI Token
**Network:** BNB Chain Mainnet (Chain ID: 56)
**Status:** ⚠️ NOT READY - Complete checklist first

---

## ⚡ CRITICAL BLOCKERS (MUST FIX)

- [ ] ❌ **Security Audit** - NOT conducted (4 weeks needed)
- [ ] ❌ **Multisig Wallets** - NOT created (Treasury + Liquidity)
- [ ] ❌ **Mainnet Script** - deploy-mainnet.js missing
- [ ] ❌ **Liquidity Funds** - Need 100+ BNB (~$60k)
- [ ] ❌ **Testnet Testing** - Full deployment test incomplete

**🚨 DO NOT DEPLOY TO MAINNET UNTIL ALL BLOCKERS ARE RESOLVED 🚨**

---

## 📋 PRE-DEPLOYMENT CHECKLIST

### 1️⃣ SECURITY (4 weeks)

- [ ] Request security audit quotes (3 firms minimum)
- [ ] Select audit firm and sign contract
- [ ] Complete security audit (2-3 weeks)
- [ ] Fix all CRITICAL and HIGH findings
- [ ] Re-audit critical fixes
- [ ] Launch bug bounty program (2+ weeks)
- [ ] Verify all contract addresses in comments
  - [ ] USDT: `0x55d398326f99059fF775485246999027B3197955`
  - [ ] Chainlink BNB/USD: `0x0567F2323251f0Aab15c8dFb1967E4e8A7D42aeE`

**Audit Firms:**
- CertiK: https://www.certik.com/ ($50k-150k)
- PeckShield: https://peckshield.com/ ($20k-60k)
- Hacken: https://hacken.io/ ($10k-40k)

---

### 2️⃣ INFRASTRUCTURE (1 week)

#### Multisig Wallets

- [ ] Create Treasury multisig (3-of-5)
  - [ ] Deploy Gnosis Safe on BSC
  - [ ] Add 5 signers (team members)
  - [ ] Set threshold: 3 confirmations
  - [ ] Test with small transaction
  - [ ] Save address: `_________________`

- [ ] Create Liquidity multisig (2-of-3)
  - [ ] Deploy Gnosis Safe on BSC
  - [ ] Add 3 signers
  - [ ] Set threshold: 2 confirmations
  - [ ] Test with small transaction
  - [ ] Save address: `_________________`

**Tool:** https://gnosis-safe.io/app/bnb:

#### Private Key Management

- [ ] Generate new hardware wallet (Ledger/Trezor)
- [ ] Never store private key on computer
- [ ] Backup seed phrase (3 copies, secure locations)
- [ ] Test signing transactions
- [ ] Fund wallet with 1+ BNB for deployment

---

### 3️⃣ DEPLOYMENT SCRIPTS (2 days)

- [ ] Create `/scripts/deploy-mainnet.js`
  - [ ] Constructor args: treasuryMultisig, liquidityMultisig
  - [ ] Token distribution logic
  - [ ] Trading delay (24 hours)
  - [ ] Contract verification
  - [ ] Ownership transfer to multisig

- [ ] Create `/scripts/verify-contracts.js`
  - [ ] Auto-verify all contracts on BscScan
  - [ ] Save verification URLs

- [ ] Create `/scripts/setup-liquidity.js`
  - [ ] PancakeSwap integration
  - [ ] LP token lock setup
  - [ ] Verification steps

- [ ] Create `/scripts/emergency-pause.js`
  - [ ] Quick pause all contracts
  - [ ] For emergency use only

---

### 4️⃣ CONFIGURATION (1 day)

#### Create `.env.mainnet`

```bash
# BNB Chain Mainnet
BSC_RPC_URL=https://bsc-dataseed1.binance.org
CHAIN_ID=56

# Deployer (Hardware Wallet)
PRIVATE_KEY=0xYOUR_HARDWARE_WALLET_KEY

# Multisig Wallets (UPDATE AFTER CREATION)
TREASURY_WALLET=0xYOUR_TREASURY_MULTISIG
LIQUIDITY_WALLET=0xYOUR_LIQUIDITY_MULTISIG

# BSC Mainnet Contract Addresses (VERIFIED)
USDT_ADDRESS=0x55d398326f99059fF775485246999027B3197955
CHAINLINK_BNB_USD=0x0567F2323251f0Aab15c8dFb1967E4e8A7D42aeE

# API Keys
BSCSCAN_API_KEY=YOUR_REAL_API_KEY
COINMARKETCAP_API_KEY=YOUR_REAL_API_KEY

# Gas Settings
GAS_PRICE=10000000000
GAS_LIMIT=5000000

# Security
ENABLE_TRADING_DELAY=86400
```

#### Checklist

- [ ] Copy `.env.example` to `.env.mainnet`
- [ ] Update all values with REAL addresses
- [ ] Verify USDT address on BscScan
- [ ] Verify Chainlink oracle on BscScan
- [ ] Get BscScan API key
- [ ] Test RPC connection
- [ ] NEVER commit `.env.mainnet` to Git

---

### 5️⃣ TESTNET VALIDATION (3 days)

- [ ] Deploy complete system to BSC Testnet
  ```bash
  npx hardhat run scripts/deploy-mainnet.js --network bscTestnet
  ```

- [ ] Test Token contract
  - [ ] Check total supply (10B)
  - [ ] Verify treasury wallet
  - [ ] Verify liquidity wallet
  - [ ] Test pause/unpause
  - [ ] Test staking functions

- [ ] Test PrivateSale contract
  - [ ] Verify Chainlink oracle works
  - [ ] Test BNB purchases
  - [ ] Test USDT purchases
  - [ ] Verify bonus calculation (10%)
  - [ ] Test whitelist

- [ ] Test ReferralSystem contract
  - [ ] Register referrals
  - [ ] Record purchases
  - [ ] Claim rewards
  - [ ] Verify tier bonuses

- [ ] Test integrations
  - [ ] Token → PrivateSale
  - [ ] PrivateSale → ReferralSystem
  - [ ] Token → Staking

- [ ] Verify all contracts on Testnet BscScan

- [ ] Test ownership transfer to multisig
  - [ ] Transfer ownership
  - [ ] Execute multisig transaction
  - [ ] Confirm ownership changed

---

### 6️⃣ LIQUIDITY PREPARATION (Before deployment)

#### Funds Required

- [ ] **BNB for Deployment:** 1 BNB (~$600)
- [ ] **BNB for Liquidity:** 100-250 BNB (~$60k-150k)
- [ ] **Total:** 101-251 BNB

#### Acquire BNB

- [ ] Purchase BNB on Binance
- [ ] Withdraw to deployment wallet (BSC network)
- [ ] Verify balance: `npx hardhat run scripts/check-balance.js --network bsc`
- [ ] Keep safe until deployment day

#### PancakeSwap Setup

- [ ] Test PancakeSwap on testnet
- [ ] Understand liquidity addition process
- [ ] Prepare LP lock strategy
  - Option 1: Mudra Lock (https://mudra.website/)
  - Option 2: PinkSale Lock (https://www.pinksale.finance/)
  - Option 3: Team.Finance (https://team.finance/)
- [ ] Lock duration: Minimum 1 year (2+ years recommended)

---

### 7️⃣ LEGAL & COMPLIANCE (Optional but recommended)

- [ ] Draft Terms of Service
- [ ] Draft Privacy Policy
- [ ] Add risk disclaimers to website
- [ ] Legal review (if budget allows)
- [ ] Verify compliance with local regulations

---

### 8️⃣ COMMUNITY & MARKETING (Before launch)

- [ ] Publish Whitepaper
- [ ] Website live and tested
- [ ] Create Discord server
- [ ] Create Telegram group
- [ ] Setup Twitter account
- [ ] Prepare announcement materials
- [ ] Line up influencer partnerships
- [ ] Create tutorial videos
- [ ] Prepare FAQ document

---

## 🚀 DEPLOYMENT DAY CHECKLIST

### Morning (Setup)

- [ ] **Final Code Review**
  - [ ] All tests passing: `npm test`
  - [ ] Compilation successful: `npx hardhat compile`
  - [ ] No linter errors: `npm run lint`

- [ ] **Environment Check**
  - [ ] `.env.mainnet` has correct values
  - [ ] Multisig addresses verified
  - [ ] BscScan API key working
  - [ ] RPC connection stable

- [ ] **Funds Check**
  - [ ] 1+ BNB in deployer wallet
  - [ ] 100+ BNB ready for liquidity
  - [ ] Hardware wallet connected
  - [ ] Backup wallet ready

---

### Deployment Sequence

#### Step 1: Deploy Contracts (30 minutes)

```bash
# 1. Final check
npm run compile
npm test

# 2. Deploy to mainnet
npx hardhat run scripts/deploy-mainnet.js --network bsc

# 3. Save contract addresses
# (Script should output addresses)
```

- [ ] Token deployed: `0x_________________`
- [ ] Staking deployed: `0x_________________`
- [ ] Private Sale deployed: `0x_________________`
- [ ] Referral System deployed: `0x_________________`
- [ ] Team Vesting deployed: `0x_________________`

#### Step 2: Verify Contracts (30 minutes)

```bash
# Auto-verify all contracts
npx hardhat run scripts/verify-contracts.js --network bsc

# Or manually verify each:
npx hardhat verify --network bsc TOKEN_ADDRESS "TREASURY" "LIQUIDITY"
```

- [ ] Token verified on BscScan ✅
- [ ] Staking verified ✅
- [ ] Private Sale verified ✅
- [ ] Referral System verified ✅
- [ ] Team Vesting verified ✅

#### Step 3: Token Distribution (20 minutes)

```bash
# Transfer allocations (from deploy script or manual)
# - Private Sale: 1.1B
# - Staking Pool: 2.5B
# - Team Vesting: 1B
# - Liquidity: 1.5B (DON'T TRANSFER - use for PancakeSwap)
# - Marketing: 1B
# - Treasury: 900M
```

- [ ] Private Sale funded (1.1B HYPE)
- [ ] Staking contract funded (2.5B HYPE)
- [ ] Team Vesting funded (1B HYPE)
- [ ] Marketing wallet funded (1B HYPE)
- [ ] Treasury funded (900M HYPE)
- [ ] Liquidity reserved (1.5B HYPE in deployer wallet)
- [ ] Verify total = 10B

#### Step 4: Transfer Ownership (15 minutes)

```bash
# Transfer all contracts to multisig
npx hardhat run scripts/transfer-ownership.js --network bsc
```

- [ ] Token ownership → Treasury Multisig
- [ ] Staking ownership → Treasury Multisig
- [ ] Private Sale ownership → Treasury Multisig
- [ ] Referral System ownership → Treasury Multisig
- [ ] Verify on BscScan

#### Step 5: Add Liquidity (30 minutes)

```bash
# Go to PancakeSwap
# https://pancakeswap.finance/add/BNB
```

1. Connect wallet with BNB + HYPE
2. Add liquidity:
   - BNB: 100-250 BNB
   - HYPE: Equivalent amount (calculate based on $0.00008/token)
3. Approve transactions
4. Receive LP tokens
5. **IMMEDIATELY LOCK LP TOKENS**

- [ ] Liquidity added on PancakeSwap
- [ ] LP tokens received
- [ ] LP tokens locked for 1+ year
- [ ] Lock verified on explorer
- [ ] Lock address saved: `0x_________________`

#### Step 6: Enable Trading (After 24h delay)

**⚠️ WAIT 24 HOURS AFTER DEPLOYMENT**

```bash
# Day 2: Enable trading via multisig
# This requires 3-of-5 signers to confirm
```

- [ ] 24 hours passed
- [ ] Multisig transaction created
- [ ] 3+ signers confirmed
- [ ] Trading enabled
- [ ] Verify on BscScan

---

### Post-Deployment (Day 1-2)

#### Monitoring Setup

- [ ] Add contracts to Tenderly
- [ ] Configure Discord alerts
- [ ] Setup wallet alerts on BscScan
- [ ] Monitor first transactions
- [ ] Check for unusual activity

#### Announcements

- [ ] Twitter announcement
- [ ] Discord/Telegram announcement
- [ ] Update website with addresses
- [ ] Medium article
- [ ] Reddit post

#### Listings

- [ ] Submit to CoinGecko
- [ ] Submit to CoinMarketCap
- [ ] Submit to DexTools
- [ ] Submit to PooCoin
- [ ] Submit to DexScreener

---

## 📊 POST-LAUNCH MONITORING (Week 1)

### Daily Checks

- [ ] **Day 1:** Monitor deployment, check for errors
- [ ] **Day 2:** Enable trading, monitor first trades
- [ ] **Day 3:** Check liquidity, trading volume
- [ ] **Day 4:** Community feedback, bug reports
- [ ] **Day 5:** Analytics review, optimization
- [ ] **Day 6-7:** Continuous monitoring

### Key Metrics

- [ ] Trading volume > $10k/day
- [ ] Unique holders > 100
- [ ] Liquidity > $100k
- [ ] No critical bugs reported
- [ ] Community growth positive
- [ ] Social media engagement good

---

## 🚨 EMERGENCY CONTACTS

**Create emergency contact list BEFORE deployment:**

**Team Leads:**
- Lead Developer: `[Phone/Telegram]`
- Security Lead: `[Contact]`
- Community Manager: `[Contact]`

**External:**
- Audit Firm Emergency: `[Contact]`
- Legal Advisor: `[Contact]`
- Infrastructure (RPC): `[Support contact]`

**Emergency Procedures:**
- Pause contract: `npx hardhat run scripts/emergency-pause.js --network bsc`
- Multisig emergency meeting: `[Process]`
- Community announcement template: `[Ready]`

---

## ✅ FINAL GO/NO-GO DECISION

### Review Before Deployment

**Answer honestly:**

1. [ ] Has a professional security audit been completed? (YES/NO)
2. [ ] Have all CRITICAL and HIGH findings been fixed? (YES/NO)
3. [ ] Are multisig wallets created and tested? (YES/NO)
4. [ ] Has full deployment been tested on BSC Testnet? (YES/NO)
5. [ ] Is liquidity (100+ BNB) ready? (YES/NO)
6. [ ] Are all team members available for launch day? (YES/NO)
7. [ ] Is emergency response plan ready? (YES/NO)
8. [ ] Is community aware and excited? (YES/NO)

**DECISION:**
- **ALL YES:** ✅ GO for mainnet deployment
- **ANY NO:** ❌ NO-GO - Complete checklist first

---

## 💰 COST SUMMARY

**Required for Mainnet:**

| Item | Cost | Priority |
|------|------|----------|
| Security Audit | $20k-60k | CRITICAL |
| Bug Bounty | $5k-10k | HIGH |
| Deployment BNB | $600 (1 BNB) | CRITICAL |
| Liquidity | $60k (100 BNB) | CRITICAL |
| Legal Review | $5k-15k | MEDIUM |
| Marketing | $10k-50k | MEDIUM |
| Infrastructure | $250/month | MEDIUM |
| **TOTAL** | **$90k-150k** | |

**Minimum Budget:** ~$90,000
**Recommended Budget:** ~$150,000

---

## 📞 SUPPORT RESOURCES

**Documentation:**
- Full Analysis: `/docs/BNB_MAINNET_DEPLOYMENT_READINESS.md`
- BNB Guide: `/docs/BNB_DEPLOYMENT_GUIDE.md`
- Testnet Guide: `/docs/BSC_TESTNET_DEPLOYMENT_GUIDE.md`

**External:**
- BNB Chain Docs: https://docs.bnbchain.org/
- Hardhat Docs: https://hardhat.org/
- OpenZeppelin: https://docs.openzeppelin.com/
- PancakeSwap: https://docs.pancakeswap.finance/

**Audit Firms:**
- CertiK: https://www.certik.com/
- PeckShield: https://peckshield.com/
- Hacken: https://hacken.io/

**Tools:**
- Gnosis Safe: https://gnosis-safe.io/
- Tenderly: https://tenderly.co/
- BscScan: https://bscscan.com/

---

## 🎯 TIMELINE TO MAINNET

**Conservative Estimate:**

```
Week 1-2:  Security Audit
Week 3:    Fix Issues
Week 4:    Re-audit + Testing
Week 5:    Infrastructure Setup
Week 6:    Final Testing
Week 7:    MAINNET DEPLOYMENT

Total: 7 weeks from today
```

**Aggressive Estimate (NOT RECOMMENDED):**

```
Week 1-2:  Security Audit
Week 3:    Fix + Deploy

Total: 3 weeks (RISKY - not enough testing time)
```

---

## 📝 SIGNATURE

**Before deploying to mainnet, all team leads must sign off:**

- [ ] **Lead Developer:** `________________` Date: `_______`
- [ ] **Security Lead:** `________________` Date: `_______`
- [ ] **Project Manager:** `________________` Date: `_______`

**Deployment Authorization:**

- [ ] **CEO/Founder:** `________________` Date: `_______`

**I confirm that all items in this checklist have been completed and verified.**

---

**🚀 Good luck with your mainnet deployment!**

**Built by 15 Professional AI Agents**
**HypeAI - Where Hype Meets Intelligence**

---

**Last Updated:** 2025-10-21
**Version:** 1.0
**Next Review:** Before deployment day
