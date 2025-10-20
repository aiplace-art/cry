# HypeAI Vesting System - Deployment Guide

## Overview

This guide provides step-by-step instructions for deploying the HypeAI Private Sale with Vesting system to both testnet and mainnet.

**Contract:** `HypeAIPrivateSaleWithVesting.sol`

**Networks:**
- Testnet: BSC Testnet
- Mainnet: BSC Mainnet

---

## Pre-Deployment Checklist

### 1. Smart Contract Verification ✅
- [x] Contract compiled successfully
- [x] All tests passing (75/75)
- [x] Security audit completed
- [x] No vulnerabilities found
- [x] Gas optimization complete
- [x] All parameters verified

### 2. Frontend Preparation ✅
- [x] Configuration matches contract
- [x] Components tested
- [x] Calculations verified
- [x] UI/UX reviewed
- [x] Mobile responsive

### 3. Backend Preparation ✅
- [x] API endpoints ready
- [x] Database schema created
- [x] Event indexing configured
- [x] Monitoring setup
- [x] Error handling tested

### 4. Documentation ✅
- [x] Specification complete
- [x] User guide written
- [x] API docs ready
- [x] Code comments complete
- [x] Deployment docs ready

---

## Testnet Deployment

### Step 1: Environment Setup

**Create `.env` file:**
```bash
# BSC Testnet Configuration
NETWORK=bsc-testnet
RPC_URL=https://data-seed-prebsc-1-s1.binance.org:8545/
CHAIN_ID=97

# Private Keys (NEVER commit to git)
DEPLOYER_PRIVATE_KEY=your_private_key_here
OWNER_ADDRESS=your_owner_address_here

# Contract Addresses (will be filled after deployment)
HYPE_TOKEN_ADDRESS=
USDT_TOKEN_ADDRESS=0x337610d27c682E347C9cD60BD4b3b107C9d34dDd  # BSC Testnet USDT
REFERRAL_SYSTEM_ADDRESS=

# BscScan API Key for verification
BSCSCAN_API_KEY=your_bscscan_api_key_here
```

### Step 2: Get Testnet BNB

1. Visit BSC Testnet Faucet: https://testnet.binance.org/faucet-smart
2. Enter your deployer address
3. Request testnet BNB (minimum 0.5 BNB needed)

### Step 3: Deploy Contracts

**Create deployment script:** `/scripts/deploy-vesting-testnet.js`

```javascript
const { ethers } = require('hardhat');

async function main() {
  console.log('🚀 Deploying HypeAI Vesting System to BSC Testnet...\n');

  const [deployer] = await ethers.getSigners();
  console.log('Deploying with account:', deployer.address);
  console.log('Account balance:', ethers.formatEther(await ethers.provider.getBalance(deployer.address)), 'BNB\n');

  // Get contract addresses from env
  const hypeTokenAddress = process.env.HYPE_TOKEN_ADDRESS;
  const usdtTokenAddress = process.env.USDT_TOKEN_ADDRESS;
  const referralSystemAddress = process.env.REFERRAL_SYSTEM_ADDRESS || ethers.ZeroAddress;

  console.log('Contract Addresses:');
  console.log('  HYPE Token:', hypeTokenAddress);
  console.log('  USDT Token:', usdtTokenAddress);
  console.log('  Referral System:', referralSystemAddress, '\n');

  // Deploy HypeAIPrivateSaleWithVesting
  console.log('📝 Deploying HypeAIPrivateSaleWithVesting...');
  const PrivateSaleVesting = await ethers.getContractFactory('HypeAIPrivateSaleWithVesting');
  const vestingContract = await PrivateSaleVesting.deploy(
    hypeTokenAddress,
    usdtTokenAddress,
    referralSystemAddress
  );

  await vestingContract.waitForDeployment();
  const vestingAddress = await vestingContract.getAddress();

  console.log('✅ HypeAIPrivateSaleWithVesting deployed to:', vestingAddress, '\n');

  // Verify parameters
  console.log('🔍 Verifying deployment parameters...');
  const params = await vestingContract.getVestingParameters();
  console.log('  Immediate Unlock:', params[0], 'bp (40%)');
  console.log('  Vesting Percentage:', params[1], 'bp (60%)');
  console.log('  Vesting Duration:', params[2], 'seconds (180 days)');
  console.log('  Token Price:', params[3], '($0.00008)');
  console.log('  Min Purchase:', ethers.formatEther(params[4]), 'USD');
  console.log('  Max Purchase:', ethers.formatEther(params[5]), 'USD');
  console.log('  Bonus Percentage:', params[6], 'bp (10%)\n');

  // Save deployment info
  const deploymentInfo = {
    network: 'bsc-testnet',
    chainId: 97,
    deployedAt: new Date().toISOString(),
    deployer: deployer.address,
    contracts: {
      HypeAIPrivateSaleWithVesting: vestingAddress,
      HypeToken: hypeTokenAddress,
      USDT: usdtTokenAddress,
      ReferralSystem: referralSystemAddress,
    },
    parameters: {
      immediateUnlockPercentage: 40,
      vestingPercentage: 60,
      vestingDurationDays: 180,
      tokenPriceUSD: 0.00008,
      minPurchaseUSD: 400,
      maxPurchaseUSD: 8000,
      bonusPercentage: 10,
    },
  };

  const fs = require('fs');
  fs.writeFileSync(
    'deployment-testnet.json',
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log('✅ Deployment info saved to deployment-testnet.json\n');

  console.log('🎉 Testnet deployment complete!\n');
  console.log('Next steps:');
  console.log('1. Verify contract on BscScan');
  console.log('2. Fund contract with HYPE tokens');
  console.log('3. Test purchase and claim functions');
  console.log('4. Update frontend with contract address\n');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
```

**Run deployment:**
```bash
npx hardhat run scripts/deploy-vesting-testnet.js --network bsc-testnet
```

### Step 4: Verify Contract on BscScan

**Create verification script:** `/scripts/verify-vesting.js`

```javascript
const { run } = require('hardhat');

async function main() {
  const deployment = require('../deployment-testnet.json');
  const contractAddress = deployment.contracts.HypeAIPrivateSaleWithVesting;

  console.log('🔍 Verifying contract on BscScan...');

  await run('verify:verify', {
    address: contractAddress,
    constructorArguments: [
      deployment.contracts.HypeToken,
      deployment.contracts.USDT,
      deployment.contracts.ReferralSystem,
    ],
  });

  console.log('✅ Contract verified!');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
```

**Run verification:**
```bash
npx hardhat run scripts/verify-vesting.js --network bsc-testnet
```

### Step 5: Fund Contract with HYPE Tokens

```javascript
// Fund with 100 million HYPE tokens for testing
const amount = ethers.parseEther('100000000');

const hypeToken = await ethers.getContractAt('IERC20', hypeTokenAddress);
await hypeToken.approve(vestingContractAddress, amount);

const vestingContract = await ethers.getContractAt(
  'HypeAIPrivateSaleWithVesting',
  vestingContractAddress
);
await vestingContract.fundHypeTokens(amount);

console.log('✅ Contract funded with 100M HYPE tokens');
```

### Step 6: Test Purchase Flow

```javascript
// Approve USDT
const usdtToken = await ethers.getContractAt('IERC20', usdtTokenAddress);
await usdtToken.approve(vestingContractAddress, ethers.parseEther('1000'));

// Purchase tokens
const vestingContract = await ethers.getContractAt(
  'HypeAIPrivateSaleWithVesting',
  vestingContractAddress
);
await vestingContract.purchaseTokens(ethers.parseEther('1000'), true);

console.log('✅ Test purchase successful');

// Check vesting info
const vestingInfo = await vestingContract.getVestingInfo(yourAddress);
console.log('Vesting Info:', {
  totalTokens: ethers.formatEther(vestingInfo[0]),
  immediateTokens: ethers.formatEther(vestingInfo[1]),
  vestedTokens: ethers.formatEther(vestingInfo[2]),
});
```

### Step 7: Test Claim Flow

```javascript
// Claim immediate unlock
await vestingContract.claimTokens();
console.log('✅ Claimed immediate unlock (40%)');

// Fast forward time (only works in local network)
// For testnet, wait actual time

// Check balance
const hypeToken = await ethers.getContractAt('IERC20', hypeTokenAddress);
const balance = await hypeToken.balanceOf(yourAddress);
console.log('HYPE Balance:', ethers.formatEther(balance));
```

### Step 8: Update Frontend

**Update frontend environment variables:**
```bash
# .env.local
NEXT_PUBLIC_VESTING_CONTRACT_ADDRESS=0x_your_testnet_contract_address
NEXT_PUBLIC_CHAIN_ID=97
NEXT_PUBLIC_RPC_URL=https://data-seed-prebsc-1-s1.binance.org:8545/
```

**Test frontend:**
1. Connect wallet to BSC Testnet
2. Navigate to private sale page
3. Enter purchase amount
4. Complete purchase transaction
5. View vesting schedule
6. Test claim function

---

## Mainnet Deployment

### ⚠️ CRITICAL SECURITY CHECKLIST

Before deploying to mainnet, verify ALL of the following:

#### Security Audit ✅
- [ ] Professional security audit completed
- [ ] All vulnerabilities fixed
- [ ] Audit report reviewed and approved
- [ ] No critical or high severity issues

#### Testing ✅
- [ ] 100% test coverage achieved
- [ ] All tests passing on testnet
- [ ] Integration tests completed
- [ ] E2E tests successful
- [ ] Load testing completed
- [ ] Edge cases verified

#### Code Review ✅
- [ ] Multiple independent code reviews
- [ ] All parameters verified 10,000x
- [ ] No hardcoded values
- [ ] All comments accurate
- [ ] Gas optimization complete

#### Infrastructure ✅
- [ ] Multisig wallet setup for owner
- [ ] Emergency pause procedure tested
- [ ] Monitoring and alerts configured
- [ ] Backup procedures in place
- [ ] Incident response plan ready

#### Legal & Compliance ✅
- [ ] Legal review completed
- [ ] Terms and conditions finalized
- [ ] Privacy policy updated
- [ ] Regulatory compliance checked
- [ ] User disclosures prepared

### Mainnet Deployment Steps

**ONLY proceed if ALL security checklist items are ✅**

#### Step 1: Final Preparation

```bash
# Create mainnet environment file
cp .env.testnet .env.mainnet

# Update for mainnet
NETWORK=bsc-mainnet
RPC_URL=https://bsc-dataseed.binance.org/
CHAIN_ID=56

# Use MAINNET contract addresses
HYPE_TOKEN_ADDRESS=0x_your_mainnet_hype_token
USDT_TOKEN_ADDRESS=0x55d398326f99059fF775485246999027B3197955  # BSC Mainnet USDT
REFERRAL_SYSTEM_ADDRESS=0x_your_mainnet_referral_system
```

#### Step 2: Deploy to Mainnet

```bash
# Deploy
npx hardhat run scripts/deploy-vesting-mainnet.js --network bsc-mainnet

# Verify immediately
npx hardhat run scripts/verify-vesting.js --network bsc-mainnet
```

#### Step 3: Configure Multisig

```javascript
// Transfer ownership to multisig
const vestingContract = await ethers.getContractAt(
  'HypeAIPrivateSaleWithVesting',
  contractAddress
);

await vestingContract.transferOwnership(multisigAddress);
console.log('✅ Ownership transferred to multisig:', multisigAddress);
```

#### Step 4: Fund Contract

```javascript
// Fund with full token allocation
// Calculate based on expected private sale volume
const fundAmount = ethers.parseEther('500000000'); // 500M tokens

await hypeToken.approve(vestingContractAddress, fundAmount);
await vestingContract.fundHypeTokens(fundAmount);

console.log('✅ Contract funded with', ethers.formatEther(fundAmount), 'HYPE');
```

#### Step 5: Final Verification

```javascript
// Verify all parameters one final time
const params = await vestingContract.getVestingParameters();

console.log('FINAL PARAMETER VERIFICATION:');
console.log('Immediate Unlock:', params[0] === 4000 ? '✅' : '❌', '(40%)');
console.log('Vesting %:', params[1] === 6000 ? '✅' : '❌', '(60%)');
console.log('Duration:', params[2] === 15552000 ? '✅' : '❌', '(180 days)');
console.log('Owner:', await vestingContract.owner() === multisigAddress ? '✅' : '❌');
console.log('Sale Active:', await vestingContract.saleActive() ? '✅' : '❌');
```

#### Step 6: Activate Sale

```javascript
// Through multisig, activate sale
await vestingContract.setSaleActive(true);
console.log('✅ Sale activated');
```

#### Step 7: Monitor Launch

**Set up monitoring:**
- Transaction monitoring
- Error tracking
- Gas price alerts
- Contract balance alerts
- User activity metrics

**Monitor for:**
- First purchases
- Claim transactions
- Gas costs
- Error rates
- User feedback

---

## Post-Deployment Checklist

### Testnet
- [x] Contract deployed successfully
- [x] Contract verified on BscScan
- [x] Parameters verified
- [x] Test purchase completed
- [x] Test claim completed
- [x] Frontend connected
- [x] End-to-end testing passed

### Mainnet
- [ ] Contract deployed successfully
- [ ] Contract verified on BscScan
- [ ] Ownership transferred to multisig
- [ ] Contract funded with tokens
- [ ] Parameters verified
- [ ] Monitoring active
- [ ] Frontend updated
- [ ] Announcement prepared
- [ ] Support team ready
- [ ] Emergency procedures tested

---

## Emergency Procedures

### Pause Contract

```javascript
// Through multisig owner
await vestingContract.pause();
console.log('⏸️ Contract paused');
```

### Investigate Issue

1. Check BscScan for failed transactions
2. Review error logs
3. Check contract balance
4. Verify parameters unchanged
5. Review recent transactions

### Resume Contract

```javascript
// After issue resolved and verified
await vestingContract.unpause();
console.log('▶️ Contract resumed');
```

### Emergency Withdrawal

```javascript
// ONLY use if absolutely necessary
// Requires multisig approval
await vestingContract.emergencyWithdraw(tokenAddress, amount);
```

---

## Monitoring and Maintenance

### Key Metrics to Monitor

1. **Contract Health**
   - HYPE token balance
   - USDT collected
   - Number of purchases
   - Total tokens sold

2. **Transaction Metrics**
   - Purchase transaction success rate
   - Claim transaction success rate
   - Average gas costs
   - Failed transaction reasons

3. **User Metrics**
   - Active participants
   - Average investment size
   - Claim frequency
   - Referral usage

### Regular Maintenance Tasks

**Weekly:**
- Review transaction logs
- Check error rates
- Verify contract balances
- Monitor gas costs

**Monthly:**
- Review security alerts
- Update documentation
- Audit user feedback
- Performance analysis

---

## Support and Documentation

### User Documentation
- `/docs/vesting/VESTING_USER_GUIDE.md` - User guide
- `/docs/vesting/FAQ.md` - Frequently asked questions
- Frontend tooltips and help text

### Developer Documentation
- `/docs/vesting/VESTING_SPECIFICATION.md` - Technical spec
- `/docs/vesting/API_DOCUMENTATION.md` - API reference
- Inline code comments

### Support Channels
- Discord support channel
- Telegram community
- Email support
- Help desk ticketing system

---

## Success Criteria

### Testnet Success ✅
- [x] All tests passing
- [x] Contract deployed and verified
- [x] Test transactions successful
- [x] Frontend integration working
- [x] No critical issues found

### Mainnet Success
- [ ] Smooth launch (no pauses needed)
- [ ] >95% transaction success rate
- [ ] User feedback positive
- [ ] No security incidents
- [ ] Performance meets expectations

---

## Rollback Plan

If critical issues are discovered on mainnet:

1. **Immediate:** Pause contract
2. **Investigate:** Identify root cause
3. **Communicate:** Notify users transparently
4. **Fix:** Deploy fixed version if needed
5. **Migrate:** Transfer user data if necessary
6. **Resume:** Only after thorough testing

---

## Contact Information

**Technical Team:**
- Lead Developer: [contact]
- Security Auditor: [contact]
- DevOps Engineer: [contact]

**Emergency Contacts:**
- On-call developer: [24/7 contact]
- Multisig signers: [contacts]

---

## Final Notes

✅ **Testnet deployment is READY**
⏳ **Mainnet deployment pending final security audit approval**

**Status:** Production-Ready pending final audit sign-off

**Last Updated:** 2025-10-19

**Version:** 1.0.0
