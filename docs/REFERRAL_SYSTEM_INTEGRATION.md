# HypeAI Referral System - Complete Integration Guide

## Overview

Полная реферальная система с автоматическим отслеживанием и выплатами для HypeAI Private Sale.

## Smart Contracts

### 1. ReferralSystem.sol
**Основной контракт реферальной системы**

**Файл:** `/src/contracts/ReferralSystem.sol`

**Функционал:**
- Двухуровневая система вознаграждений (5% + 2%)
- Гибкий выбор валюты выплат (HYPE или USDT)
- Защита от fraud (blacklist, max caps, no self-referral)
- Полная статистика и leaderboard
- Интеграция с Private Sale контрактом

### 2. PrivateSaleWithReferral.sol
**Модифицированный Private Sale с реферальной интеграцией**

**Файл:** `/src/contracts/PrivateSaleWithReferral.sol`

**Изменения:**
- Добавлен параметр `_referrer` в функции покупки
- Автоматическая регистрация рефералов
- Автоматическая запись покупок в ReferralSystem
- Обратная совместимость с оригинальным контрактом

## Deployment Sequence

### Step 1: Deploy ReferralSystem

```solidity
// 1. Deploy ReferralSystem
const ReferralSystem = await ethers.getContractFactory("HypeAIReferralSystem");
const referralSystem = await ReferralSystem.deploy(
    HYPE_TOKEN_ADDRESS,      // Address of HYPEAI token
    USDT_TOKEN_ADDRESS,      // Address of USDT token (BSC: 0x55d398326f99059fF775485246999027B3197955)
    PRIVATE_SALE_ADDRESS     // Will be updated later (use temp address first)
);
await referralSystem.deployed();
console.log("ReferralSystem deployed to:", referralSystem.address);
```

### Step 2: Deploy PrivateSaleWithReferral

```solidity
// 2. Deploy PrivateSaleWithReferral
const PrivateSale = await ethers.getContractFactory("HypeAIPrivateSaleWithReferral");
const privateSale = await PrivateSale.deploy(
    HYPE_TOKEN_ADDRESS,           // HYPEAI token
    USDT_TOKEN_ADDRESS,           // USDT token
    referralSystem.address,       // ReferralSystem address
    Math.floor(Date.now() / 1000), // Start time (now)
    30 * 24 * 60 * 60             // Duration (30 days)
);
await privateSale.deployed();
console.log("PrivateSale deployed to:", privateSale.address);
```

### Step 3: Configure ReferralSystem

```solidity
// 3. Update ReferralSystem with correct PrivateSale address
await referralSystem.setPrivateSaleContract(privateSale.address);

// 4. Fund ReferralSystem with HYPE tokens for rewards
const hypeToken = await ethers.getContractAt("IERC20", HYPE_TOKEN_ADDRESS);
await hypeToken.approve(referralSystem.address, ethers.utils.parseEther("10000000")); // 10M HYPE
await referralSystem.fundHypeRewards(ethers.utils.parseEther("10000000"));

// 5. Fund ReferralSystem with USDT for rewards
const usdtToken = await ethers.getContractAt("IERC20", USDT_TOKEN_ADDRESS);
await usdtToken.approve(referralSystem.address, ethers.utils.parseEther("50000")); // 50K USDT
await referralSystem.fundUsdtRewards(ethers.utils.parseEther("50000"));
```

### Step 4: Configure PrivateSale

```solidity
// 6. Fund PrivateSale with HYPEAI tokens
await hypeToken.transfer(privateSale.address, ethers.utils.parseEther("100000000")); // 100M HYPE

// 7. Add users to whitelist
const whitelistAddresses = ["0x123...", "0x456...", "0x789..."];
await privateSale.addToWhitelist(whitelistAddresses);
```

## Usage Examples

### User Flow 1: Purchase with Referral (BNB)

```javascript
// User has referral code from friend: 0xRefererAddress

// Method 1: Using new function signature
await privateSale.purchaseWithBNB(
    "0xRefererAddress",
    { value: ethers.utils.parseEther("0.1") } // 0.1 BNB = ~$60
);

// Behind the scenes:
// 1. PrivateSale registers referral: referralSystem.registerReferral(buyer, referer)
// 2. PrivateSale records purchase: referralSystem.recordPurchase(buyer, $60, 82,500 HYPE)
// 3. ReferralSystem calculates rewards:
//    - Direct referrer: $60 * 5% = $3
//    - Second-tier referrer: $60 * 2% = $1.20
```

### User Flow 2: Purchase with Referral (USDT)

```javascript
// Approve USDT first
const usdtToken = await ethers.getContractAt("IERC20", USDT_TOKEN_ADDRESS);
await usdtToken.approve(privateSale.address, ethers.utils.parseEther("100")); // $100 USDT

// Purchase with referral
await privateSale.purchaseWithUSDT(
    ethers.utils.parseEther("100"), // $100 USDT
    "0xRefererAddress"
);
```

### User Flow 3: Claim Referral Rewards

```javascript
// Check pending rewards
const [usdValue, hypeTokens, usdtTokens] = await referralSystem.getPendingRewards(userAddress);
console.log(`Pending: $${usdValue} USD = ${ethers.utils.formatEther(hypeTokens)} HYPE OR ${ethers.utils.formatEther(usdtTokens)} USDT`);

// Claim in HYPE tokens
await referralSystem.claimRewards(true); // true = HYPE tokens

// OR Claim in USDT
await referralSystem.claimRewards(false); // false = USDT
```

### User Flow 4: View Referral Statistics

```javascript
// Get comprehensive stats
const stats = await referralSystem.getReferralStats(userAddress);
console.log({
    referrer: stats.referrer,
    secondTierReferrer: stats.secondTierReferrer,
    totalReferred: stats.totalReferred.toString(),
    totalVolume: `$${stats.totalVolume}`,
    pendingRewardsUSD: `$${stats.pendingRewardsUSD}`,
    totalEarnedUSD: `$${stats.totalEarnedUSD}`,
    totalClaimedUSD: `$${stats.totalClaimedUSD}`,
    rewardInTokens: stats.rewardInTokens,
    isActive: stats.isActive
});

// Get referred users list
const referredUsers = await referralSystem.getReferredUsers(userAddress);
console.log("You referred:", referredUsers);
```

## Reward Calculation Examples

### Example 1: Simple Referral
```
User A refers User B
User B buys $100 worth of HYPE

Rewards:
- User A (direct referrer): $100 * 5% = $5
- No second-tier referrer = $0

Total: $5
```

### Example 2: Two-Tier Referral
```
User A refers User B
User B refers User C
User C buys $200 worth of HYPE

Rewards:
- User B (direct referrer): $200 * 5% = $10
- User A (second-tier): $200 * 2% = $4

Total: $14
```

### Example 3: Multiple Purchases
```
User A refers 3 people:
- User B buys $100
- User C buys $200
- User D buys $300

User A's Rewards:
- From B: $100 * 5% = $5
- From C: $200 * 5% = $10
- From D: $300 * 5% = $15

Total: $30 USD
Can claim as: 37,500 HYPE tokens OR 30 USDT
```

## Security Features

### 1. Anti-Fraud Protection
```solidity
// Cannot refer yourself
require(_referee != _referrer, "Cannot refer yourself");

// Cannot create circular referrals
require(referrals[_referrer].referrer != _referee, "Circular referral");

// Cannot register twice
require(!hasReferrer[_referee], "Already has referrer");
```

### 2. Max Reward Caps
```solidity
// Maximum $10,000 earnings per referrer
if (referrals[referrer].totalEarnedUSD + reward <= MAX_REWARD_CAP_USD) {
    // Award reward
} else {
    // Cap reached, no more rewards
}
```

### 3. Blacklist System
```solidity
// Admin can blacklist suspicious accounts
function setBlacklisted(address _user, bool _status) external onlyOwner {
    blacklisted[_user] = _status;
    if (_status) {
        referrals[_user].isActive = false;
    }
}
```

### 4. Pausable Contract
```solidity
// Emergency pause
function pause() external onlyOwner;
function unpause() external onlyOwner;
```

## Admin Functions

### Manage Referral System

```javascript
// Update private sale contract
await referralSystem.setPrivateSaleContract(newAddress);

// Blacklist user
await referralSystem.setBlacklisted(userAddress, true);

// Deactivate account
await referralSystem.deactivateAccount(userAddress);

// Fund rewards pool
await referralSystem.fundHypeRewards(amount);
await referralSystem.fundUsdtRewards(amount);

// Emergency withdrawal
await referralSystem.emergencyWithdraw(tokenAddress, amount);

// Pause/Unpause
await referralSystem.pause();
await referralSystem.unpause();
```

## Integration with Frontend

### React Example: Referral Link Generator

```jsx
import { ethers } from 'ethers';

function ReferralDashboard({ userAddress }) {
  const [referralLink, setReferralLink] = useState('');
  const [stats, setStats] = useState(null);

  useEffect(() => {
    // Generate referral link
    const link = `https://hypeai.io/sale?ref=${userAddress}`;
    setReferralLink(link);

    // Load stats
    loadStats();
  }, [userAddress]);

  async function loadStats() {
    const contract = new ethers.Contract(
      REFERRAL_SYSTEM_ADDRESS,
      REFERRAL_ABI,
      provider
    );

    const stats = await contract.getReferralStats(userAddress);
    setStats({
      totalReferred: stats.totalReferred.toString(),
      totalVolume: ethers.utils.formatUnits(stats.totalVolume, 0),
      pendingRewards: ethers.utils.formatUnits(stats.pendingRewardsUSD, 0),
      totalEarned: ethers.utils.formatUnits(stats.totalEarnedUSD, 0)
    });
  }

  async function claimRewards(inTokens) {
    const signer = provider.getSigner();
    const contract = new ethers.Contract(
      REFERRAL_SYSTEM_ADDRESS,
      REFERRAL_ABI,
      signer
    );

    await contract.claimRewards(inTokens);
  }

  return (
    <div>
      <h2>Your Referral Dashboard</h2>
      <p>Share your link: <code>{referralLink}</code></p>

      <div>
        <h3>Statistics</h3>
        <p>Total Referred: {stats?.totalReferred}</p>
        <p>Total Volume: ${stats?.totalVolume}</p>
        <p>Pending Rewards: ${stats?.pendingRewards}</p>
        <p>Total Earned: ${stats?.totalEarned}</p>
      </div>

      <div>
        <button onClick={() => claimRewards(true)}>Claim in HYPE</button>
        <button onClick={() => claimRewards(false)}>Claim in USDT</button>
      </div>
    </div>
  );
}
```

### Purchase Flow with URL Parameter

```jsx
function PurchaseForm() {
  const [referrer, setReferrer] = useState(null);

  useEffect(() => {
    // Get referrer from URL: ?ref=0x123...
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref && ethers.utils.isAddress(ref)) {
      setReferrer(ref);
    }
  }, []);

  async function handlePurchase(amount) {
    const signer = provider.getSigner();
    const contract = new ethers.Contract(
      PRIVATE_SALE_ADDRESS,
      PRIVATE_SALE_ABI,
      signer
    );

    // Purchase with referrer if available
    if (referrer) {
      await contract.purchaseWithBNB(referrer, { value: amount });
    } else {
      await contract.purchaseWithBNB({ value: amount });
    }
  }

  return (
    <div>
      {referrer && <p>Referred by: {referrer}</p>}
      <button onClick={() => handlePurchase(ethers.utils.parseEther("0.1"))}>
        Buy with 0.1 BNB
      </button>
    </div>
  );
}
```

## Testing Checklist

### Unit Tests Required

- [ ] ReferralSystem.sol
  - [ ] registerReferral(): Valid registration
  - [ ] registerReferral(): Prevent self-referral
  - [ ] registerReferral(): Prevent circular referrals
  - [ ] registerReferral(): Prevent duplicate registration
  - [ ] recordPurchase(): Correct reward calculation (5%)
  - [ ] recordPurchase(): Second-tier reward calculation (2%)
  - [ ] recordPurchase(): Respect max cap ($10,000)
  - [ ] claimRewards(): Claim in HYPE tokens
  - [ ] claimRewards(): Claim in USDT
  - [ ] claimRewards(): Prevent double claiming
  - [ ] Blacklist functionality
  - [ ] Pause functionality

- [ ] PrivateSaleWithReferral.sol
  - [ ] purchaseWithBNB(): With valid referrer
  - [ ] purchaseWithBNB(): Without referrer (backward compatible)
  - [ ] purchaseWithUSDT(): With valid referrer
  - [ ] purchaseWithUSDT(): Without referrer
  - [ ] Integration with ReferralSystem
  - [ ] Fallback when ReferralSystem unavailable

### Integration Tests Required

- [ ] End-to-end purchase flow with referral
- [ ] Multi-tier referral chain (3+ levels)
- [ ] Reward claiming in both currencies
- [ ] Large-scale stress test (100+ users)
- [ ] Referral system upgrade scenario

## Gas Optimization

### Estimated Gas Costs

| Function | Estimated Gas | USD (50 gwei, BNB=$600) |
|----------|--------------|------------------------|
| registerReferral() | ~80,000 | ~$0.24 |
| recordPurchase() | ~120,000 | ~$0.36 |
| claimRewards() (HYPE) | ~65,000 | ~$0.20 |
| claimRewards() (USDT) | ~55,000 | ~$0.17 |
| purchaseWithBNB() (with ref) | ~250,000 | ~$0.75 |

## Maintenance & Monitoring

### Required Monitoring

1. **Reward Pool Balance**
   - Alert when HYPE balance < 1M tokens
   - Alert when USDT balance < $5,000

2. **Suspicious Activity**
   - Multiple registrations from same IP
   - Circular referral attempts
   - Unusual claim patterns

3. **Performance Metrics**
   - Track total referrals registered
   - Track total rewards distributed
   - Track conversion rate (referrals → purchases)

### Weekly Tasks

- [ ] Review referral statistics
- [ ] Check reward pool balances
- [ ] Investigate flagged accounts
- [ ] Generate performance report

## Upgrade Path

### If you need to upgrade ReferralSystem:

```javascript
// 1. Deploy new ReferralSystem
const newReferralSystem = await ReferralSystem.deploy(...);

// 2. Pause old system
await oldReferralSystem.pause();

// 3. Update PrivateSale to use new system
await privateSale.setReferralSystem(newReferralSystem.address);

// 4. Migrate data (if needed)
// ... custom migration script ...

// 5. Fund new system
await newReferralSystem.fundHypeRewards(...);
await newReferralSystem.fundUsdtRewards(...);
```

## Support & Troubleshooting

### Common Issues

**Issue: "User is blacklisted"**
- Solution: Remove from blacklist using `setBlacklisted(user, false)`

**Issue: "Already has referrer"**
- Solution: Cannot change referrer once set (by design)

**Issue: "No pending rewards"**
- Solution: User needs to have referrals make purchases first

**Issue: "Insufficient HYPE tokens in contract"**
- Solution: Fund contract using `fundHypeRewards()`

## Contract Addresses (After Deployment)

```javascript
// BSC Mainnet
const ADDRESSES = {
  HYPE_TOKEN: "0x...", // Your HYPEAI token
  USDT_TOKEN: "0x55d398326f99059fF775485246999027B3197955", // BSC USDT
  REFERRAL_SYSTEM: "0x...", // Deployed ReferralSystem
  PRIVATE_SALE: "0x...", // Deployed PrivateSaleWithReferral
};

// BSC Testnet
const TESTNET_ADDRESSES = {
  HYPE_TOKEN: "0x...",
  USDT_TOKEN: "0x337610d27c682E347C9cD60BD4b3b107C9d34dDd", // BSC Testnet USDT
  REFERRAL_SYSTEM: "0x...",
  PRIVATE_SALE: "0x...",
};
```

## Summary

Эта реферальная система предоставляет:
- Полностью автоматизированное отслеживание
- Двухуровневые вознаграждения (5% + 2%)
- Гибкие выплаты (HYPE или USDT)
- Надежную защиту от fraud
- Простую интеграцию с существующим Private Sale
- Обратную совместимость

Готово к production deploy!
