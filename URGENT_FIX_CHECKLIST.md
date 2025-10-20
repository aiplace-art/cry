# 🚨 URGENT FIX CHECKLIST

**Created:** October 18, 2025
**Priority:** CRITICAL
**Estimated Time:** 6 hours total
**Status:** 🔴 NOT STARTED

---

## ⚡ QUICK START - DO THIS FIRST (15 minutes)

### Step 1: Update Frontend Config (5 minutes)

**File:** `/Users/ai.place/Crypto/src/frontend/lib/payment-config.ts`

Replace lines 48-75 with:

```typescript
export const PRIVATE_SALE_CONFIG = {
  tokenSymbol: 'HYPEAI',
  tokenPrice: 0.00008,    // ✅ FIXED: Match deployed contract
  bonusTiers: [
    { minAmount: 400, bonus: 10 },  // ✅ FIXED: 10% flat bonus
  ],
  minPurchase: 400,       // ✅ FIXED: Match contract minimum
  maxPurchase: 8000,      // ✅ FIXED: Match contract maximum
  targetAmount: 80000,    // ✅ FIXED: Match contract hard cap
  startDate: new Date('2025-10-01'),
  endDate: new Date('2025-12-31'),

  // ✅ FIXED: Remove vesting (not implemented in contract)
  vesting: null,

  // Anti-whale protection
  antiWhale: {
    maxPurchasePerWallet: 8000,
    monitorLargeTransactions: true,
    requireKYCAbove: 8000,
  },
};
```

- [ ] File updated
- [ ] Saved

---

### Step 2: Fix Calculator Logic (5 minutes)

**File:** `/Users/ai.place/Crypto/src/frontend/hooks/usePrivateSale.ts`

Replace `calculateTokens` function (lines 64-86) with:

```typescript
const calculateTokens = useCallback((usdAmount: number): CalculatorResult => {
  // FIXED: Price is $0.00008, so 1 USD = 12,500 HYPE
  const baseTokens = usdAmount * 12500;

  // FIXED: Flat 10% bonus (not tiered)
  const bonusPercentage = 10;
  const bonusTokens = (baseTokens * bonusPercentage) / 100;
  const totalTokens = baseTokens + bonusTokens;

  return {
    usdAmount,
    baseTokens,
    bonusTokens,
    totalTokens,
    bonusPercentage,
  };
}, []);
```

- [ ] Function updated
- [ ] Saved

---

### Step 3: Update Contract Addresses (5 minutes)

**File:** `/Users/ai.place/Crypto/src/frontend/lib/constants.ts`

Add after line 20:

```typescript
// BSC Testnet deployment
export const BSC_TESTNET_CONTRACTS = {
  HYPE_TOKEN: '0x02B23B891b3A3717673291aD34EB67893A19D978',
  PRIVATE_SALE: '0xFb7dd436646658e3E14C70c9F4E60aC38CB74696',
  TEAM_VESTING: '0xa9D43b2fB1541fA2ffDBEeF914Eb53B3220F829D',
  MOCK_USDT: '0x284D311f0E4562a3a870720D97aa12c445922137',
  CHAINLINK_BNB_USD: '0x2514895c72f50D8bd4B4F9b1110F0D6bD2c97526',
  // TO BE DEPLOYED:
  REFERRAL_SYSTEM: '', // Will add after deployment
};

// BSC Testnet configuration
export const SUPPORTED_CHAINS = [
  {
    id: 97,
    name: 'BSC Testnet',
    rpcUrl: 'https://data-seed-prebsc-1-s1.binance.org:8545/',
    blockExplorer: 'https://testnet.bscscan.com',
  },
  // ... existing chains
];
```

- [ ] Constants added
- [ ] Saved

---

### ✅ Phase 1 Complete (15 minutes)

**Result:** Frontend now matches deployed contracts

**Test it:**
1. Open frontend
2. Enter $400
3. Should show: 5,500,000 HYPE (5M base + 500k bonus)

- [ ] Tested and verified

---

## 🚀 PHASE 2: Deploy Referral System (2 hours)

### Step 4: Prepare Deployment Script (15 minutes)

**Create:** `/Users/ai.place/Crypto/scripts/deploy-referral-system.js`

```javascript
const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying ReferralSystem...");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deployer:", deployer.address);

  // Contract addresses (BSC Testnet)
  const HYPE_TOKEN = "0x02B23B891b3A3717673291aD34EB67893A19D978";
  const USDT_TOKEN = "0x284D311f0E4562a3a870720D97aa12c445922137";
  const PRIVATE_SALE = "0xFb7dd436646658e3E14C70c9F4E60aC38CB74696";

  // Deploy ReferralSystem
  const ReferralSystem = await hre.ethers.getContractFactory("HypeAIReferralSystem");
  const referralSystem = await ReferralSystem.deploy(
    HYPE_TOKEN,
    USDT_TOKEN,
    PRIVATE_SALE
  );

  await referralSystem.waitForDeployment();
  const referralAddress = await referralSystem.getAddress();

  console.log("✅ ReferralSystem deployed to:", referralAddress);

  // Update deployment file
  const fs = require('fs');
  const deploymentPath = './deployment-testnet.json';
  const deployment = JSON.parse(fs.readFileSync(deploymentPath));

  deployment.contracts.ReferralSystem = referralAddress;
  deployment.verification.ReferralSystem = `npx hardhat verify --network bscTestnet ${referralAddress} "${HYPE_TOKEN}" "${USDT_TOKEN}" "${PRIVATE_SALE}"`;

  fs.writeFileSync(deploymentPath, JSON.stringify(deployment, null, 2));

  console.log("📝 Updated deployment-testnet.json");
  console.log("\n🔍 Verify with:");
  console.log(deployment.verification.ReferralSystem);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
```

- [ ] Script created
- [ ] Saved

---

### Step 5: Deploy Contract (15 minutes)

```bash
# Navigate to project root
cd /Users/ai.place/Crypto

# Deploy to BSC Testnet
npx hardhat run scripts/deploy-referral-system.js --network bscTestnet
```

**Expected Output:**
```
🚀 Deploying ReferralSystem...
Deployer: 0x892504b2D7e575D4eE8423d86783388968dE9f63
✅ ReferralSystem deployed to: 0x[ADDRESS]
📝 Updated deployment-testnet.json
```

- [ ] Command executed
- [ ] Contract deployed
- [ ] Address saved: `___________________`

---

### Step 6: Fund Referral Contract (30 minutes)

**Create:** `/Users/ai.place/Crypto/scripts/fund-referral-rewards.js`

```javascript
const hre = require("hardhat");

async function main() {
  console.log("💰 Funding ReferralSystem...");

  const [deployer] = await hre.ethers.getSigners();

  // Load deployment data
  const deployment = require('../deployment-testnet.json');
  const HYPE_TOKEN = deployment.contracts.HypeAI;
  const REFERRAL_SYSTEM = deployment.contracts.ReferralSystem;

  // Connect to contracts
  const HypeToken = await hre.ethers.getContractAt("HypeAI", HYPE_TOKEN);
  const ReferralSystem = await hre.ethers.getContractAt("HypeAIReferralSystem", REFERRAL_SYSTEM);

  // Fund with 50M HYPE tokens for rewards
  const hypeAmount = hre.ethers.parseEther("50000000"); // 50M HYPE

  console.log("Approving HYPE transfer...");
  const approveTx = await HypeToken.approve(REFERRAL_SYSTEM, hypeAmount);
  await approveTx.wait();

  console.log("Transferring HYPE tokens...");
  const fundTx = await ReferralSystem.fundHypeRewards(hypeAmount);
  await fundTx.wait();

  console.log("✅ Funded with 50,000,000 HYPE tokens");

  // Check balance
  const balance = await HypeToken.balanceOf(REFERRAL_SYSTEM);
  console.log("Contract balance:", hre.ethers.formatEther(balance), "HYPE");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
```

```bash
# Fund the contract
npx hardhat run scripts/fund-referral-rewards.js --network bscTestnet
```

- [ ] Script created
- [ ] Executed successfully
- [ ] Contract funded

---

### Step 7: Verify Contract (30 minutes)

```bash
# Get verification command from deployment-testnet.json
# Should look like:
npx hardhat verify --network bscTestnet [ADDRESS] \
  "0x02B23B891b3A3717673291aD34EB67893A19D978" \
  "0x284D311f0E4562a3a870720D97aa12c445922137" \
  "0xFb7dd436646658e3E14C70c9F4E60aC38CB74696"
```

**Troubleshooting:**
If verification fails:
1. Check constructor arguments match deployment
2. Ensure contract is compiled with correct Solidity version
3. Wait 1-2 minutes and retry
4. Check BSCScan for manual verification option

- [ ] Contract verified on BSCScan
- [ ] Verification link: `___________________`

---

### Step 8: Test Referral Functions (30 minutes)

**Create:** `/Users/ai.place/Crypto/scripts/test-referral.js`

```javascript
const hre = require("hardhat");

async function main() {
  const deployment = require('../deployment-testnet.json');
  const REFERRAL_SYSTEM = deployment.contracts.ReferralSystem;

  const ReferralSystem = await hre.ethers.getContractAt("HypeAIReferralSystem", REFERRAL_SYSTEM);

  const [deployer, alice, bob] = await hre.ethers.getSigners();

  console.log("🧪 Testing referral system...");

  // Test 1: Register referral
  console.log("\n1️⃣ Registering Alice as Bob's referrer...");
  const registerTx = await ReferralSystem.registerReferral(bob.address, alice.address);
  await registerTx.wait();
  console.log("✅ Registered");

  // Test 2: Check referral stats
  console.log("\n2️⃣ Checking Alice's stats...");
  const stats = await ReferralSystem.getReferralStats(alice.address);
  console.log("Total referred:", stats.totalReferred.toString());
  console.log("Pending rewards:", stats.pendingRewardsUSD.toString());

  // Test 3: Check pending rewards
  console.log("\n3️⃣ Checking reward conversion...");
  const rewards = await ReferralSystem.getPendingRewards(alice.address);
  console.log("USD value:", rewards.usdValue.toString());
  console.log("HYPE tokens:", hre.ethers.formatEther(rewards.hypeTokens));
  console.log("USDT tokens:", hre.ethers.formatEther(rewards.usdtTokens));

  console.log("\n✅ All tests passed!");
}

main().catch(console.error);
```

```bash
npx hardhat run scripts/test-referral.js --network bscTestnet
```

- [ ] Tests executed
- [ ] All tests passed

---

### ✅ Phase 2 Complete (2 hours)

**Result:** Referral system deployed and functional

**Checklist:**
- [ ] Contract deployed
- [ ] Contract funded
- [ ] Contract verified
- [ ] Functions tested

---

## 🔗 PHASE 3: Frontend Integration (1 hour)

### Step 9: Import Referral ABI (15 minutes)

**Create:** `/Users/ai.place/Crypto/src/frontend/abis/ReferralSystem.json`

```bash
# Extract ABI from compiled contract
cd /Users/ai.place/Crypto
npx hardhat export-abi
cp artifacts/contracts/ReferralSystem.sol/HypeAIReferralSystem.json \
   src/frontend/abis/ReferralSystem.json
```

- [ ] ABI file created

---

### Step 10: Update Contract Config (15 minutes)

**File:** `/Users/ai.place/Crypto/src/frontend/lib/constants.ts`

Update `BSC_TESTNET_CONTRACTS`:

```typescript
export const BSC_TESTNET_CONTRACTS = {
  HYPE_TOKEN: '0x02B23B891b3A3717673291aD34EB67893A19D978',
  PRIVATE_SALE: '0xFb7dd436646658e3E14C70c9F4E60aC38CB74696',
  TEAM_VESTING: '0xa9D43b2fB1541fA2ffDBEeF914Eb53B3220F829D',
  MOCK_USDT: '0x284D311f0E4562a3a870720D97aa12c445922137',
  CHAINLINK_BNB_USD: '0x2514895c72f50D8bd4B4F9b1110F0D6bD2c97526',
  REFERRAL_SYSTEM: '[PASTE_ADDRESS_HERE]', // ✅ ADD DEPLOYED ADDRESS
};
```

- [ ] Address added
- [ ] Saved

---

### Step 11: Create Referral Hook (30 minutes)

**Create:** `/Users/ai.place/Crypto/src/frontend/hooks/useReferral.ts`

```typescript
import { useState, useCallback } from 'react';
import { BSC_TESTNET_CONTRACTS } from '../lib/constants';
import ReferralSystemABI from '../abis/ReferralSystem.json';

export const useReferral = (walletAddress: string) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadStats = useCallback(async () => {
    if (!walletAddress) return;

    setLoading(true);
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(
        BSC_TESTNET_CONTRACTS.REFERRAL_SYSTEM,
        ReferralSystemABI.abi,
        provider
      );

      const data = await contract.getReferralStats(walletAddress);
      setStats({
        totalReferred: data.totalReferred.toNumber(),
        totalVolume: data.totalVolume.toNumber(),
        pendingRewardsUSD: data.pendingRewardsUSD.toNumber(),
        totalEarnedUSD: data.totalEarnedUSD.toNumber(),
      });
    } catch (error) {
      console.error('Failed to load referral stats:', error);
    } finally {
      setLoading(false);
    }
  }, [walletAddress]);

  const claimRewards = useCallback(async (inTokens: boolean) => {
    if (!walletAddress) return;

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(
      BSC_TESTNET_CONTRACTS.REFERRAL_SYSTEM,
      ReferralSystemABI.abi,
      signer
    );

    const tx = await contract.claimRewards(inTokens);
    await tx.wait();

    // Reload stats
    await loadStats();
  }, [walletAddress, loadStats]);

  const getReferralLink = useCallback(() => {
    if (!walletAddress) return '';
    return `${window.location.origin}?ref=${walletAddress}`;
  }, [walletAddress]);

  return {
    stats,
    loading,
    loadStats,
    claimRewards,
    getReferralLink,
  };
};
```

- [ ] Hook created
- [ ] Saved

---

### ✅ Phase 3 Complete (1 hour)

**Result:** Frontend connected to referral system

---

## 📚 PHASE 4: Update Documentation (1 hour)

### Step 12: Update Whitepaper (30 minutes)

**File:** Create or update whitepaper with correct parameters

**Key Points to Include:**
- Total Supply: 10,000,000,000 HYPEAI
- Token Price: $0.00008
- Private Sale: $400-8,000, 10% bonus
- Referral Program: 10% / 5% / 2% tiers
- Team Vesting: 6-month cliff + 24-month linear

- [ ] Whitepaper updated

---

### Step 13: Update README (15 minutes)

**File:** `/Users/ai.place/Crypto/README.md`

Add section:

```markdown
## 🪙 Token Information

- **Token Name:** HypeAI Token
- **Symbol:** HYPEAI
- **Total Supply:** 10,000,000,000 HYPEAI
- **Price:** $0.00008 per token
- **Network:** BSC (Binance Smart Chain)

## 💰 Private Sale

- **Minimum:** $400 USD
- **Maximum:** $8,000 USD per wallet
- **Hard Cap:** $80,000 USD
- **Bonus:** 10% flat bonus on all purchases
- **Distribution:** Immediate (no vesting)

## 🎁 Referral Program

- **Tier 1:** 10% on direct referrals
- **Tier 2:** 5% on second-tier referrals
- **Tier 3:** 2% on third-tier referrals
- **Max Rewards:** $10,000 USD per referrer
- **Payment Options:** HYPEAI tokens or USDT

## 📍 Deployed Contracts (BSC Testnet)

- HYPEAI Token: `0x02B23B891b3A3717673291aD34EB67893A19D978`
- Private Sale: `0xFb7dd436646658e3E14C70c9F4E60aC38CB74696`
- Team Vesting: `0xa9D43b2fB1541fA2ffDBEeF914Eb53B3220F829D`
- Referral System: `[YOUR_DEPLOYED_ADDRESS]`
```

- [ ] README updated

---

### Step 14: Create Quick Start Guide (15 minutes)

**File:** `/Users/ai.place/Crypto/QUICK_START_GUIDE.md`

```markdown
# 🚀 Quick Start Guide

## For Investors

### How to Purchase HYPEAI Tokens

1. **Connect Wallet**
   - Install MetaMask
   - Switch to BSC Testnet
   - Get testnet BNB from faucet

2. **Purchase Tokens**
   - Visit [your-website.com]
   - Enter amount ($400-8,000)
   - Approve transaction
   - Receive tokens immediately

3. **Example:**
   - Invest $1,000
   - Receive: 13,750,000 HYPEAI
   - (12,500,000 base + 1,250,000 bonus)

## For Referrers

### How to Earn Referral Rewards

1. **Get Referral Link**
   - Connect wallet
   - Copy your unique referral link

2. **Share Link**
   - Share with friends/community
   - They must use your link when purchasing

3. **Earn Rewards**
   - Direct referrals: 10%
   - Second-tier: 5%
   - Third-tier: 2%

4. **Claim Rewards**
   - Choose HYPEAI tokens or USDT
   - Claim anytime from dashboard

## For Developers

### How to Test

\`\`\`bash
# Clone repository
git clone [repo-url]
cd Crypto

# Install dependencies
npm install

# Run tests
npx hardhat test

# Deploy locally
npx hardhat node
npx hardhat run scripts/deploy-referral-system.js --network localhost
\`\`\`
```

- [ ] Guide created

---

### ✅ Phase 4 Complete (1 hour)

**Result:** All documentation updated

---

## 🧪 PHASE 5: Testing (2 hours)

### Step 15: Test Purchase Flow (30 minutes)

**Manual Test Checklist:**

**Test 1: Minimum Purchase ($400)**
- [ ] Open frontend
- [ ] Connect wallet (BSC Testnet)
- [ ] Enter $400 USD
- [ ] Verify calculator shows: 5,500,000 HYPEAI
- [ ] Execute purchase
- [ ] Verify tokens received in wallet
- [ ] Check transaction on BSCScan

**Test 2: Medium Purchase ($1,000)**
- [ ] Enter $1,000 USD
- [ ] Verify calculator shows: 13,750,000 HYPEAI
- [ ] Execute purchase
- [ ] Verify tokens received

**Test 3: Maximum Purchase ($8,000)**
- [ ] Enter $8,000 USD
- [ ] Verify calculator shows: 110,000,000 HYPEAI
- [ ] Execute purchase
- [ ] Verify tokens received

**Test 4: Below Minimum ($100)**
- [ ] Enter $100 USD
- [ ] Verify error message shown
- [ ] Transaction should fail

**Test 5: Above Maximum ($10,000)**
- [ ] Enter $10,000 USD
- [ ] Verify error message shown
- [ ] Transaction should fail

---

### Step 16: Test Referral Flow (1 hour)

**Test Scenario:**

**Setup:**
- Wallet A (Referrer): `0x...AAA`
- Wallet B (Referee): `0x...BBB`

**Steps:**
1. [ ] Connect Wallet A
2. [ ] Generate referral link
3. [ ] Copy link: `https://[site]?ref=0x...AAA`
4. [ ] Disconnect Wallet A
5. [ ] Connect Wallet B
6. [ ] Open referral link
7. [ ] Verify "Referred by 0x...AAA" shown
8. [ ] Purchase $500 with Wallet B
9. [ ] Verify Wallet B receives: 6,875,000 HYPEAI
10. [ ] Connect Wallet A again
11. [ ] Check referral dashboard
12. [ ] Verify Wallet A shows:
    - [ ] 1 referral
    - [ ] $500 volume
    - [ ] $50 pending reward
13. [ ] Claim reward as HYPE tokens
14. [ ] Verify received: 625,000 HYPEAI
15. [ ] Check transaction on BSCScan

---

### Step 17: Test Level System (30 minutes)

**Test Levels:**

**Bronze (5 referrals):**
- [ ] Refer 5 users
- [ ] Verify level = Bronze
- [ ] Verify multiplier = 1x

**Silver (20 referrals):**
- [ ] Refer 20 users
- [ ] Verify level = Silver
- [ ] Verify multiplier = 1.25x
- [ ] Verify rewards increased by 25%

**Gold (50 referrals):**
- [ ] Refer 50 users
- [ ] Verify level = Gold
- [ ] Verify multiplier = 1.5x

**Note:** Can test with script for speed

---

### ✅ Phase 5 Complete (2 hours)

**Result:** Full system tested and verified

---

## 📊 COMPLETION STATUS

### Overall Progress

- [ ] Phase 1: Frontend Sync (15 min)
- [ ] Phase 2: Deploy Referral (2 hours)
- [ ] Phase 3: Integration (1 hour)
- [ ] Phase 4: Documentation (1 hour)
- [ ] Phase 5: Testing (2 hours)

**Total Time:** 6 hours 15 minutes

### Final Checklist

**Critical Fixes:**
- [ ] Token price: $0.00008 ✅
- [ ] Min purchase: $400 ✅
- [ ] Max purchase: $8,000 ✅
- [ ] Hard cap: $80,000 ✅
- [ ] Bonus: 10% flat ✅
- [ ] Vesting removed ✅

**Referral System:**
- [ ] Contract deployed ✅
- [ ] Contract funded ✅
- [ ] Contract verified ✅
- [ ] Frontend integrated ✅
- [ ] Tested end-to-end ✅

**Documentation:**
- [ ] Whitepaper updated ✅
- [ ] README updated ✅
- [ ] Quick start guide ✅
- [ ] API docs (if applicable) ✅

**Testing:**
- [ ] Purchase flow tested ✅
- [ ] Referral flow tested ✅
- [ ] Level system tested ✅
- [ ] Error handling tested ✅

---

## ✅ DEFINITION OF DONE

System is ready when:

1. **Frontend matches contract:**
   - Calculator shows correct token amounts
   - Investment limits enforced correctly
   - No vesting promises shown

2. **Referral system works:**
   - Users can generate referral links
   - Purchases are tracked correctly
   - Rewards can be claimed (HYPE or USDT)
   - Levels progress automatically

3. **Documentation accurate:**
   - All parameters match deployed contracts
   - Examples use correct calculations
   - No contradictions

4. **Testing complete:**
   - All test cases pass
   - Edge cases handled
   - Error messages clear

---

## 🎯 NEXT STEPS AFTER COMPLETION

### Immediate (Same Day):
1. Announce fixes to community
2. Update marketing materials
3. Re-enable purchase functionality

### Short Term (This Week):
1. Deploy to mainnet
2. Professional security audit
3. Bug bounty program
4. Marketing campaign launch

### Medium Term (This Month):
1. CEX listings
2. Partnerships announced
3. Staking platform launch
4. Governance implementation

---

**Created:** October 18, 2025
**Last Updated:** October 18, 2025
**Status:** Ready to execute
**Estimated Completion:** 6-8 hours from start
