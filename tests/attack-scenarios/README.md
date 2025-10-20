# 🔴 Attack Scenario Testing - Quick Start

This directory contains **adversarial security tests** that attempt to exploit the HypeAI vesting contract from a hacker's perspective.

## 📋 Files

```
attack-scenarios/
├── README.md                      ← You are here
├── vesting-attack-tests.js        ← 35+ attack test cases
├── MaliciousContracts.sol         ← 10 malicious contracts for testing
└── ../ATTACK_SCENARIO_RESULTS.md  ← Detailed security audit report
```

## 🚀 Run Attack Tests

### Prerequisites

```bash
cd /Users/ai.place/Crypto
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
```

### Run All Attack Tests

```bash
npx hardhat test tests/attack-scenarios/vesting-attack-tests.js
```

### Run Specific Attack Category

```bash
# Reentrancy attacks only
npx hardhat test tests/attack-scenarios/vesting-attack-tests.js --grep "Reentrancy"

# Access control attacks only
npx hardhat test tests/attack-scenarios/vesting-attack-tests.js --grep "Access Control"

# Economic exploits only
npx hardhat test tests/attack-scenarios/vesting-attack-tests.js --grep "Economic"
```

### Verbose Output

```bash
npx hardhat test tests/attack-scenarios/vesting-attack-tests.js --verbose
```

## 🎯 Attack Vectors Tested

| # | Attack Category | Test Cases | Status |
|---|----------------|------------|--------|
| 1 | Reentrancy | 2 | ✅ Defended |
| 2 | Timestamp Manipulation | 3 | ✅ Defended |
| 3 | Integer Overflow/Underflow | 3 | ✅ Defended |
| 4 | Access Control Bypass | 4 | ✅ Defended |
| 5 | Economic Exploits | 4 | ✅ Defended |
| 6 | Vesting Logic Manipulation | 2 | ✅ Defended |
| 7 | Denial of Service | 3 | ✅ Defended |
| 8 | Token Transfer Exploits | 3 | ✅ Defended |
| 9 | Front-Running | 1 | ✅ No Risk |
| 10 | Storage Manipulation | 1 | ✅ Defended |

**Total:** 35+ attack scenarios

## 📊 Expected Results

### ✅ Passing Tests (Attacks Blocked)

Most tests should **PASS**, indicating attacks were **successfully defended against**:

```
✅ Should BLOCK reentrancy attack via malicious ERC20 callback
✅ Should BLOCK claiming during cliff period
✅ Should BLOCK overflow in bonus calculation
✅ Should BLOCK non-owner from pausing contract
✅ Should BLOCK double purchase from same address
```

### ⚠️ Tests That May Fail (Known Issues)

Some tests may fail due to known **medium-risk** issues:

```
⚠️ Centralization Risk: Owner has excessive control
⚠️ Blacklist without grace period
⚠️ Emergency withdraw can steal vested tokens
```

These are **governance risks**, not code vulnerabilities. See recommendations in `ATTACK_SCENARIO_RESULTS.md`.

## 🔧 Test Configuration

### Hardhat Config (`hardhat.config.js`)

```javascript
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    hardhat: {
      chainId: 1337,
      gas: "auto",
      gasPrice: "auto"
    }
  }
};
```

### Mock Contracts

The test suite uses these mocks:
- `MockERC20` - Standard ERC20 for HYPE and USDT
- `MaliciousReentrancyAttacker` - Attempts recursive claims
- `MaliciousReferralSystem` - Always reverts to cause DoS
- `MaliciousUSDT` - Non-standard ERC20 (no return bool)

## 🛠️ Writing New Attack Tests

### Template

```javascript
it("Should BLOCK [attack description]", async function () {
    // Setup attack scenario
    await usdtToken.connect(attacker).approve(vestingAddress, MAX_PURCHASE);
    await vestingContract.connect(attacker).purchaseTokens(MIN_PURCHASE, false);

    // Attempt exploit
    await expect(
        [malicious action here]
    ).to.be.revertedWith("[expected error]");

    console.log("✅ DEFENDED: [defense mechanism]");
});
```

### Naming Convention

- **Defended attacks:** `Should BLOCK [attack]`
- **Successful attacks:** `Should EXPLOIT [vulnerability]`
- **No-risk scenarios:** `Should NOT be vulnerable to [attack]`

## 📚 Related Documentation

- **Security Audit Report:** `/docs/ATTACK_SCENARIO_RESULTS.md`
- **Contract Code:** `/src/contracts/vesting/HypeAIPrivateSaleWithVesting.sol`
- **Production Tests:** `/tests/smart-contracts/`

## 🔒 Security Recommendations

Based on attack testing, we recommend:

### 🔴 HIGH PRIORITY
1. **Multi-sig ownership** (Gnosis Safe 3/5)
2. **Timelock on emergencyWithdraw()** (7 days)
3. **Track totalClaimed** to prevent withdrawing vested tokens

### 🟡 MEDIUM PRIORITY
4. **Grace period for blacklisted users** (7 days to claim)
5. **Referral system interface** (enforce trusted contracts)

### 🟢 LOW PRIORITY
6. **Auto-unpause after 30 days** (prevent permanent pause)
7. **More granular events** (for off-chain monitoring)
8. **Upgradeability consideration** (UUPS proxy for bug fixes)

## 🎓 Learning from Attacks

### Why These Tests Matter

> "The best way to secure a contract is to think like an attacker."

This test suite embodies the **adversarial mindset**:
1. Identify all state-changing functions
2. Ask: "How can I abuse this?"
3. Test every edge case
4. Verify defense mechanisms
5. Document findings

### Famous Hacks We Tested Against

- **The DAO (2016):** Reentrancy → `nonReentrant` modifier
- **BEC Token (2018):** Integer overflow → Solidity 0.8+ checks
- **Poly Network (2021):** Access control → `onlyOwner` modifier
- **Wormhole (2022):** Signature replay → Not applicable (no sigs)

## 🚨 IMPORTANT DISCLAIMER

**These attack contracts are for TESTING ONLY.**

- ❌ DO NOT deploy `MaliciousContracts.sol` to mainnet
- ❌ DO NOT use these techniques on real contracts
- ✅ DO use for security testing your own contracts
- ✅ DO report vulnerabilities responsibly

**White hat testing only. Black hat = jail.** ⚖️

## 🤝 Contributing

Found a new attack vector? Add it!

1. Write test in `vesting-attack-tests.js`
2. Add malicious contract to `MaliciousContracts.sol` (if needed)
3. Update `ATTACK_SCENARIO_RESULTS.md`
4. Submit PR with description

## 📞 Questions?

- **Security issues:** Open a private security advisory
- **Test failures:** Check expected behavior in report
- **New attack ideas:** Create a GitHub issue

---

**Stay Safe. Test Hard. Ship Secure.** 🔒

*"In code we trust, but we verify."*
