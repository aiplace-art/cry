# HypeAI Private Sale Contract - Comprehensive Security Audit Report

**Contract:** `HypeAIPrivateSale.sol`
**Solidity Version:** 0.8.20
**Audit Date:** October 21, 2025
**Auditor:** SPARC Security Review Team
**Severity Scale:** CRITICAL | HIGH | MEDIUM | LOW | INFO

---

## Executive Summary

### Overall Security Rating: **MEDIUM-HIGH RISK**

The HypeAI Private Sale contract implements basic security measures including ReentrancyGuard, Pausable, and Ownable from OpenZeppelin. However, several **CRITICAL** and **HIGH** severity vulnerabilities were identified that could lead to fund loss, price manipulation, or incorrect token distribution.

### Critical Findings Summary
- **3 CRITICAL** vulnerabilities
- **5 HIGH** severity issues
- **4 MEDIUM** severity issues
- **6 LOW** severity issues
- **8 INFO** level optimizations

### Key Concerns
1. **CRITICAL**: Oracle price manipulation through division rounding
2. **CRITICAL**: No refund mechanism - users lose BNB if purchase fails
3. **CRITICAL**: Missing oracle circuit breaker checks
4. **HIGH**: Front-running vulnerability in BNB purchases
5. **HIGH**: USDT decimal assumption is incorrect for BSC
6. **HIGH**: Insufficient slippage protection

---

## Detailed Vulnerability Analysis

### 1. CRITICAL: Oracle Price Manipulation via Rounding Error

**Location:** `getBNBPrice()` - Line 414
**Severity:** CRITICAL
**CWE:** CWE-682 (Incorrect Calculation)

**Issue:**
```solidity
// Line 414: DANGEROUS - loses precision
return uint256(answer) / 10**8; // Convert to USD with 0 decimals (e.g., 600)
```

**Vulnerability:**
The function divides by `10**8`, converting Chainlink's 8-decimal price (e.g., `60000000000` for $600.00) to `600`. This loses all decimal precision, making the contract vulnerable to:
- Rounding errors in BNB price (always rounds down)
- User manipulation by timing purchases when BNB price is at fractional values
- Incorrect USD value calculations

**Example Attack:**
- Real BNB price: $599.99
- Chainlink returns: 59999000000 (8 decimals)
- Contract calculates: 59999000000 / 10^8 = 599 (lost $0.99 per BNB)
- User sends 100 BNB, gets calculated as $59,900 instead of $59,999
- User receives 99 fewer dollars worth of tokens

**Impact:**
- Users lose value on every BNB purchase
- Contract may distribute fewer tokens than intended
- Cumulative losses across 500 founding members could be significant

**Recommended Fix:**
```solidity
function getBNBPrice() public view returns (uint256) {
    (
        uint80 roundId,
        int256 answer,
        uint256 startedAt,
        uint256 updatedAt,
        uint80 answeredInRound
    ) = bnbPriceFeed.latestRoundData();

    require(answer > 0, "Invalid price from oracle");
    require(updatedAt > 0, "Price data not updated");
    require(block.timestamp - updatedAt < 3600, "Price data stale");

    // ADDED: Check for stale round
    require(answeredInRound >= roundId, "Stale price round");

    // FIXED: Return with 8 decimals preserved
    return uint256(answer); // Returns price with 8 decimals (e.g., 60000000000 = $600.00)
}

// Update purchaseWithBNB to handle 8 decimals:
function purchaseWithBNB() external payable nonReentrant whenNotPaused {
    // ... existing checks ...

    uint256 bnbPriceUSD = getBNBPrice(); // Now has 8 decimals

    // Calculate USD value with proper decimal handling:
    // (msg.value * bnbPriceUSD) / 10^18 / 10^8 = (msg.value * bnbPriceUSD) / 10^26
    uint256 usdValue = (msg.value * bnbPriceUSD) / 10**26;

    // ... rest of function ...
}
```

---

### 2. CRITICAL: No Refund Mechanism - User Funds Locked on Failed Purchase

**Location:** `purchaseWithBNB()` - Lines 126-150
**Severity:** CRITICAL
**CWE:** CWE-703 (Improper Check or Handling of Exceptional Conditions)

**Issue:**
When a user sends BNB and the purchase fails (e.g., not enough tokens left, exceeds max purchase, oracle fails), the BNB is NOT refunded.

**Vulnerable Code:**
```solidity
function purchaseWithBNB() external payable nonReentrant whenNotPaused {
    require(block.timestamp >= saleStartTime, "Sale not started");
    require(block.timestamp <= saleEndTime, "Sale ended");
    require(whitelist[msg.sender], "Not whitelisted");
    require(!saleFinalized, "Sale finalized");
    require(foundingMembersCount < MAX_FOUNDING_MEMBERS, "Max members reached");

    uint256 bnbPriceUSD = getBNBPrice(); // Could revert here
    uint256 usdValue = (msg.value * bnbPriceUSD) / 10**18;

    require(usdValue >= MIN_PURCHASE_USD, "Below minimum purchase");
    require(
        contributions[msg.sender] + usdValue <= MAX_PURCHASE_USD,
        "Exceeds maximum purchase" // BNB is stuck here
    );
    require(
        totalUSDRaised + usdValue <= HARD_CAP_USD,
        "Exceeds hard cap" // BNB is stuck here
    );

    _processPurchase(msg.sender, usdValue, true);
    // _processPurchase could also fail - BNB is stuck
}
```

**Attack Scenarios:**
1. User sends 10 BNB but already contributed $800 → BNB lost forever
2. Sale reaches hard cap between transaction submission and execution → User's BNB stuck
3. Oracle becomes stale mid-transaction → User's BNB stuck
4. Token transfer fails in `_processPurchase` → User's BNB stuck

**Impact:**
- **Permanent loss of user funds**
- Contract will hold BNB with no way to return it to the rightful owner
- Only owner can withdraw via `withdrawFunds()`, essentially stealing user funds

**Recommended Fix:**
```solidity
function purchaseWithBNB() external payable nonReentrant whenNotPaused {
    require(block.timestamp >= saleStartTime, "Sale not started");
    require(block.timestamp <= saleEndTime, "Sale ended");
    require(whitelist[msg.sender], "Not whitelisted");
    require(!saleFinalized, "Sale finalized");
    require(foundingMembersCount < MAX_FOUNDING_MEMBERS, "Max members reached");

    uint256 bnbPriceUSD = getBNBPrice();
    uint256 usdValue = (msg.value * bnbPriceUSD) / 10**26; // Fixed decimal handling

    // Validate BEFORE accepting payment
    if (usdValue < MIN_PURCHASE_USD) {
        revert("Below minimum purchase");
    }

    if (contributions[msg.sender] + usdValue > MAX_PURCHASE_USD) {
        revert("Exceeds maximum purchase");
    }

    if (totalUSDRaised + usdValue > HARD_CAP_USD) {
        revert("Exceeds hard cap");
    }

    // Process purchase - if this fails, nonReentrant will revert the entire transaction
    // including the BNB transfer
    _processPurchase(msg.sender, usdValue, true);
}

// ALTERNATIVE: Add explicit refund mechanism
mapping(address => uint256) public failedPurchaseRefunds;

function purchaseWithBNB() external payable nonReentrant whenNotPaused {
    // ... validation ...

    try this._processPurchaseExternal(msg.sender, usdValue, true) {
        // Success - do nothing
    } catch {
        // Failed - record refund
        failedPurchaseRefunds[msg.sender] += msg.value;
        revert("Purchase failed - please call claimRefund()");
    }
}

function claimRefund() external nonReentrant {
    uint256 refundAmount = failedPurchaseRefunds[msg.sender];
    require(refundAmount > 0, "No refund available");

    failedPurchaseRefunds[msg.sender] = 0;

    (bool success, ) = msg.sender.call{value: refundAmount}("");
    require(success, "Refund transfer failed");
}
```

---

### 3. CRITICAL: Missing Chainlink Circuit Breaker Checks

**Location:** `getBNBPrice()` - Lines 399-415
**Severity:** CRITICAL
**CWE:** CWE-841 (Improper Enforcement of Behavioral Workflow)

**Issue:**
The contract doesn't check `answeredInRound >= roundId`, which is critical for detecting stale or invalid oracle data.

**Vulnerable Code:**
```solidity
function getBNBPrice() public view returns (uint256) {
    (
        /* uint80 roundId */,  // ← IGNORED
        int256 answer,
        /* uint256 startedAt */,
        uint256 updatedAt,
        /* uint80 answeredInRound */  // ← IGNORED
    ) = bnbPriceFeed.latestRoundData();

    require(answer > 0, "Invalid price from oracle");
    require(updatedAt > 0, "Price data not updated");
    require(block.timestamp - updatedAt < 3600, "Price data stale");

    return uint256(answer) / 10**8;
}
```

**Vulnerability:**
According to Chainlink documentation, you MUST check:
1. `answeredInRound >= roundId` - ensures the answer is from the current round, not a previous one
2. `answer` within reasonable bounds (min/max price)
3. Oracle hasn't been deprecated or paused

**Attack Scenario:**
1. Chainlink feed temporarily fails
2. Oracle returns stale data from 5 rounds ago when BNB was $500
3. Current BNB price is $700
4. User purchases at $500 rate, getting 40% more tokens than they should
5. Protocol loses funds

**Recommended Fix:**
```solidity
// Add constants for circuit breaker
uint256 public constant MAX_PRICE_DEVIATION = 50; // 50% max change per hour
uint256 public constant MIN_BNB_PRICE = 100; // $100 minimum
uint256 public constant MAX_BNB_PRICE = 5000; // $5000 maximum
uint256 private lastBNBPrice;

function getBNBPrice() public view returns (uint256) {
    (
        uint80 roundId,
        int256 answer,
        uint256 startedAt,
        uint256 updatedAt,
        uint80 answeredInRound
    ) = bnbPriceFeed.latestRoundData();

    // CRITICAL CHECKS
    require(answer > 0, "Invalid price from oracle");
    require(updatedAt > 0, "Price data not updated");
    require(block.timestamp - updatedAt < 3600, "Price data stale (>1hr)");
    require(answeredInRound >= roundId, "Stale round data");

    uint256 price = uint256(answer); // Keep 8 decimals

    // Sanity bounds checking
    uint256 priceInUSD = price / 10**8;
    require(priceInUSD >= MIN_BNB_PRICE, "BNB price too low - oracle error?");
    require(priceInUSD <= MAX_BNB_PRICE, "BNB price too high - oracle error?");

    // OPTIONAL: Check for sudden price changes (flash crash protection)
    if (lastBNBPrice > 0) {
        uint256 priceDiff = price > lastBNBPrice
            ? price - lastBNBPrice
            : lastBNBPrice - price;
        uint256 percentChange = (priceDiff * 100) / lastBNBPrice;
        require(percentChange <= MAX_PRICE_DEVIATION, "Price changed too rapidly");
    }

    return price;
}

// Update price after successful purchase
function _processPurchase(...) internal {
    // ... existing code ...
    lastBNBPrice = getBNBPrice(); // Cache for next check
}
```

---

### 4. HIGH: USDT Decimal Assumption is INCORRECT for BSC

**Location:** `purchaseWithUSDT()` - Line 164
**Severity:** HIGH
**CWE:** CWE-682 (Incorrect Calculation)

**Issue:**
The code assumes USDT has 18 decimals on BSC, but **BSC USDT actually has 18 decimals** (you're correct), however, the calculation is still vulnerable:

**Vulnerable Code:**
```solidity
// Line 164
uint256 usdValue = _usdtAmount / 10**18; // DANGEROUS
```

**Problem:**
This calculation rounds DOWN heavily. Example:
- User sends 40.5 USDT = `40.5 * 10^18 = 40500000000000000000`
- Contract calculates: `40500000000000000000 / 10^18 = 40` USD
- User loses 0.5 USDT worth of tokens on every purchase

**Additional Issue:**
The comment on line 36 says BSC USDT is at `0x55d398326f99059fF775485246999027B3197955`, which is correct for BSC USDT (18 decimals). However, **Ethereum USDT has 6 decimals**, so if this contract is ever deployed on Ethereum, it will completely break.

**Impact:**
- Users lose fractional USD amounts on every purchase
- If deployed on wrong chain, calculation would be off by 10^12

**Recommended Fix:**
```solidity
// Add USDT decimals as a variable
uint8 public usdtDecimals;

constructor(...) {
    // ... existing code ...

    // Query USDT decimals dynamically
    usdtDecimals = IERC20Metadata(_usdtToken).decimals();
    require(usdtDecimals == 18, "USDT must have 18 decimals on BSC");
}

function purchaseWithUSDT(uint256 _usdtAmount) external nonReentrant whenNotPaused {
    // ... existing checks ...

    // FIXED: Proper decimal handling
    uint256 usdValue = _usdtAmount / (10 ** usdtDecimals);

    // BETTER: Keep precision and adjust calculations
    uint256 usdValueScaled = _usdtAmount; // Keep 18 decimals

    require(usdValueScaled >= MIN_PURCHASE_USD * 10**18, "Below minimum purchase");
    require(
        contributions[msg.sender] + (usdValueScaled / 10**18) <= MAX_PURCHASE_USD,
        "Exceeds maximum purchase"
    );

    // ... rest of function ...
}
```

---

### 5. HIGH: Front-Running Vulnerability in BNB Purchases

**Location:** `purchaseWithBNB()` - Lines 126-150
**Severity:** HIGH
**CWE:** CWE-362 (Concurrent Execution using Shared Resource)

**Issue:**
When a user submits a BNB purchase transaction, the BNB price is fetched at execution time, not submission time. This creates a front-running opportunity:

**Attack Scenario:**
1. Legitimate user submits `purchaseWithBNB()` with 10 BNB when BNB = $600
2. Attacker sees transaction in mempool
3. Attacker front-runs with higher gas, submitting their purchase first
4. If BNB price changes slightly between blocks, users get different token amounts
5. Attacker could also manipulate the founding member count

**More Critical Issue - Founding Member Race Condition:**
```solidity
// Line 131
require(foundingMembersCount < MAX_FOUNDING_MEMBERS, "Max members reached");

// Line 216-219
if (!isFoundingMember[_buyer]) {
    isFoundingMember[_buyer] = true;
    foundingMembersCount++;
}
```

If exactly 1 founding member slot remains and 5 users submit transactions simultaneously:
- All 5 pass the check on line 131 (count = 499)
- First transaction executes, count becomes 500
- Remaining 4 transactions execute and increment count to 504
- **Contract now has 504 founding members instead of 500**

**Impact:**
- Users may receive different token amounts than expected
- Founding member limit can be exceeded
- MEV bots can extract value by front-running purchases

**Recommended Fix:**
```solidity
// Add slippage protection
function purchaseWithBNB(uint256 minTokensExpected)
    external
    payable
    nonReentrant
    whenNotPaused
{
    require(block.timestamp >= saleStartTime, "Sale not started");
    require(block.timestamp <= saleEndTime, "Sale ended");
    require(whitelist[msg.sender], "Not whitelisted");
    require(!saleFinalized, "Sale finalized");

    // FIXED: Check BEFORE incrementing
    bool willBeFoundingMember = !isFoundingMember[msg.sender];
    if (willBeFoundingMember) {
        require(foundingMembersCount < MAX_FOUNDING_MEMBERS, "Max members reached");
    }

    uint256 bnbPriceUSD = getBNBPrice();
    uint256 usdValue = (msg.value * bnbPriceUSD) / 10**26;

    require(usdValue >= MIN_PURCHASE_USD, "Below minimum purchase");
    require(
        contributions[msg.sender] + usdValue <= MAX_PURCHASE_USD,
        "Exceeds maximum purchase"
    );
    require(
        totalUSDRaised + usdValue <= HARD_CAP_USD,
        "Exceeds hard cap"
    );

    // Calculate expected tokens
    uint256 baseTokens = usdValue * 12500 * 10**18;
    uint256 bonusTokens = (baseTokens * BONUS_PERCENTAGE) / 100;
    uint256 totalTokens = baseTokens + bonusTokens;

    // ADDED: Slippage protection
    require(totalTokens >= minTokensExpected, "Slippage: tokens below minimum");

    _processPurchase(msg.sender, usdValue, true, willBeFoundingMember);
}

// Update _processPurchase to accept founding member flag
function _processPurchase(
    address _buyer,
    uint256 _usdValue,
    bool _isBNB,
    bool _willBeFoundingMember
) internal {
    // ... existing token calculation ...

    // FIXED: Use pre-calculated flag
    if (_willBeFoundingMember) {
        isFoundingMember[_buyer] = true;
        foundingMembersCount++;
    }

    // ... rest of function ...
}
```

---

### 6. HIGH: Insufficient Token Balance Check Before Sale

**Location:** `_processPurchase()` - Lines 221-225
**Severity:** HIGH
**CWE:** CWE-703 (Improper Check or Handling of Exceptional Conditions)

**Issue:**
The contract assumes it has enough HYPEAI tokens, but doesn't verify this before accepting payments.

**Vulnerable Code:**
```solidity
// Line 221-225
require(
    hypeaiToken.transfer(_buyer, totalTokens),
    "Token transfer failed"
);
```

**Attack Scenario:**
1. Contract is deployed with insufficient token balance (e.g., only 500M instead of 1.1B)
2. First 100 users successfully purchase tokens
3. Contract runs out of tokens
4. User 101 sends BNB, but `transfer()` fails
5. Due to missing refund mechanism, user's BNB is stuck
6. Only owner can withdraw it via `withdrawFunds()`

**Impact:**
- Users lose funds if contract runs out of tokens
- No way to recover BNB/USDT sent after token depletion
- Requires owner intervention to manually refund users

**Recommended Fix:**
```solidity
// Add to constructor
constructor(...) {
    // ... existing code ...

    // Optional but recommended: Transfer tokens to contract immediately
    // require(
    //     IERC20(_hypeaiToken).balanceOf(address(this)) >= TOKENS_FOR_SALE,
    //     "Contract must hold all tokens before sale starts"
    // );
}

// Add view function to check contract readiness
function isContractReady() public view returns (bool ready, uint256 tokenBalance) {
    tokenBalance = hypeaiToken.balanceOf(address(this));
    ready = tokenBalance >= TOKENS_FOR_SALE;
}

// Add check in purchase functions
function purchaseWithBNB() external payable nonReentrant whenNotPaused {
    // ... existing checks ...

    // ADDED: Verify contract has enough tokens
    require(
        hypeaiToken.balanceOf(address(this)) >= TOKENS_FOR_SALE - totalTokensSold,
        "Contract insufficient token balance"
    );

    // ... rest of function ...
}

// Better: Check before specific purchase
function _processPurchase(...) internal {
    uint256 baseTokens = _usdValue * 12500 * 10**18;
    uint256 bonusTokens = (baseTokens * BONUS_PERCENTAGE) / 100;
    uint256 totalTokens = baseTokens + bonusTokens;

    require(
        totalTokensSold + totalTokens <= TOKENS_FOR_SALE,
        "Not enough tokens left"
    );

    // ADDED: Verify actual balance
    require(
        hypeaiToken.balanceOf(address(this)) >= totalTokens,
        "Contract insufficient balance for this purchase"
    );

    // ... rest of function ...
}
```

---

### 7. HIGH: Missing Sale Start Time Validation

**Location:** `constructor()` - Line 92
**Severity:** HIGH
**CWE:** CWE-20 (Improper Input Validation)

**Issue:**
The constructor allows `_saleStartTime = 1` (Unix timestamp 1 = Jan 1, 1970), which is in the past. This means the sale could start immediately upon deployment, even if unintended.

**Vulnerable Code:**
```solidity
// Line 92
require(_saleStartTime > 0, "Invalid start time");
```

**Impact:**
- Sale could start in the past, allowing immediate purchases before owner is ready
- Owner might deploy contract and expect delay before sale starts
- No whitelist could be set up before first purchase

**Recommended Fix:**
```solidity
constructor(
    address _hypeaiToken,
    address _usdtToken,
    address _bnbPriceFeed,
    uint256 _saleStartTime,
    uint256 _saleDuration
) Ownable(msg.sender) {
    require(_hypeaiToken != address(0), "Invalid token address");
    require(_usdtToken != address(0), "Invalid USDT address");
    require(_bnbPriceFeed != address(0), "Invalid price feed address");

    // FIXED: Ensure sale doesn't start in the past (with 1 hour buffer)
    require(
        _saleStartTime >= block.timestamp + 3600,
        "Sale must start at least 1 hour in the future"
    );
    require(_saleDuration > 0, "Sale duration must be positive");
    require(_saleDuration <= 365 days, "Sale duration too long");

    hypeaiToken = IERC20(_hypeaiToken);
    usdtToken = IERC20(_usdtToken);
    bnbPriceFeed = AggregatorV3Interface(_bnbPriceFeed);
    saleStartTime = _saleStartTime;
    saleEndTime = _saleStartTime + _saleDuration;
}
```

---

### 8. MEDIUM: Centralization Risk - Owner Can Drain Funds Anytime

**Location:** `withdrawFunds()` - Lines 350-369
**Severity:** MEDIUM
**CWE:** CWE-284 (Improper Access Control)

**Issue:**
The owner can call `withdrawFunds()` at any time after finalization, even if users are expecting refunds or have failed purchases.

**Vulnerable Code:**
```solidity
function withdrawFunds() external onlyOwner {
    require(saleFinalized, "Sale not finalized");
    // No other checks - owner can take everything
}
```

**Impact:**
- Owner could finalize sale and immediately drain all funds
- No timelock or multi-sig protection
- Users have no recourse if owner acts maliciously

**Recommended Fix:**
```solidity
// Add timelock for withdrawals
uint256 public constant WITHDRAWAL_DELAY = 7 days;
uint256 public finalizationTime;

function finalizeSale() external onlyOwner {
    require(block.timestamp > saleEndTime || totalUSDRaised >= HARD_CAP_USD, "Sale still active");
    require(!saleFinalized, "Already finalized");

    saleFinalized = true;
    finalizationTime = block.timestamp; // Record when finalized

    emit SaleFinalized(totalUSDRaised, totalTokensSold);
}

function withdrawFunds() external onlyOwner {
    require(saleFinalized, "Sale not finalized");

    // ADDED: Timelock protection
    require(
        block.timestamp >= finalizationTime + WITHDRAWAL_DELAY,
        "Must wait 7 days after finalization to withdraw"
    );

    // ... rest of function ...
}

// BETTER: Use multi-sig or DAO for withdrawals
// Import Gnosis Safe or OpenZeppelin TimelockController
```

---

### 9. MEDIUM: Token Price Hardcoded - Cannot Update During Sale

**Location:** Constants - Lines 45-49
**Severity:** MEDIUM
**CWE:** CWE-1126 (Declaration of Variable with Unnecessary Modifier)

**Issue:**
The token price ($0.00008) is hardcoded as a constant. If market conditions change or there's an error in the initial price, it cannot be updated.

**Code:**
```solidity
uint256 public constant TOKEN_PRICE = 8 * 10**13; // $0.00008 in wei (assuming BNB = $600)
```

**Note:** This constant is actually NOT USED anywhere in the contract! The price calculation is hardcoded in `_processPurchase()` line 198.

**Impact:**
- Dead code (unused constant)
- Price calculation is magic number: `usdValue * 12500`
- If price needs to change, must deploy new contract

**Recommended Fix:**
```solidity
// Remove constant TOKEN_PRICE (it's unused)

// Add mutable price variable
uint256 public tokenPriceUSD; // Price in USD with 8 decimals (e.g., 8000 = $0.00008)
uint256 public constant MAX_TOKEN_PRICE = 1000000; // $0.01 max (anti-rug pull)

constructor(...) {
    // ... existing code ...
    tokenPriceUSD = 8000; // $0.00008 with 8 decimals
}

function updateTokenPrice(uint256 newPrice) external onlyOwner {
    require(!saleFinalized, "Cannot change price after finalization");
    require(block.timestamp < saleStartTime, "Cannot change price after sale starts");
    require(newPrice > 0 && newPrice <= MAX_TOKEN_PRICE, "Price out of bounds");

    uint256 oldPrice = tokenPriceUSD;
    tokenPriceUSD = newPrice;

    emit TokenPriceUpdated(oldPrice, newPrice);
}

// Update _processPurchase to use dynamic price
function _processPurchase(...) internal {
    // Calculate tokens dynamically
    // If price = 8000 (with 8 decimals), then 1 USD = 1 / (8000 / 10^8) = 12500 tokens
    uint256 baseTokens = (_usdValue * 10**8 / tokenPriceUSD) * 10**18;

    // ... rest of function ...
}
```

---

### 10. MEDIUM: Missing Event for Critical State Changes

**Location:** Various functions
**Severity:** MEDIUM
**CWE:** CWE-778 (Insufficient Logging)

**Issue:**
Several critical state changes don't emit events, making it impossible to track them off-chain.

**Missing Events:**
1. `updatePriceFeed()` - No event when oracle address changes
2. `extendSale()` - No event when sale is extended
3. `pause()` / `unpause()` - Uses internal `_pause()` but no custom event

**Impact:**
- Off-chain monitoring systems cannot detect critical changes
- Users may not know when oracle is updated or sale extended
- Difficult to audit contract history

**Recommended Fix:**
```solidity
// Add events
event PriceFeedUpdated(address indexed oldFeed, address indexed newFeed);
event SaleExtended(uint256 oldEndTime, uint256 newEndTime);
event TokenPriceUpdated(uint256 oldPrice, uint256 newPrice);

function updatePriceFeed(address _newPriceFeed) external onlyOwner {
    require(_newPriceFeed != address(0), "Invalid price feed address");

    address oldFeed = address(bnbPriceFeed);
    bnbPriceFeed = AggregatorV3Interface(_newPriceFeed);

    emit PriceFeedUpdated(oldFeed, _newPriceFeed);
}

function extendSale(uint256 _newEndTime) external onlyOwner {
    require(_newEndTime > saleEndTime, "Must extend, not shorten");
    require(block.timestamp < saleEndTime, "Sale already ended");

    uint256 oldEndTime = saleEndTime;
    saleEndTime = _newEndTime;

    emit SaleExtended(oldEndTime, _newEndTime);
}
```

---

### 11. MEDIUM: Whitelist Manipulation After User Contribution

**Location:** `removeFromWhitelist()` - Lines 116-121
**Severity:** MEDIUM
**CWE:** CWE-841 (Improper Enforcement of Behavioral Workflow)

**Issue:**
Owner can remove users from whitelist even after they've contributed, but their contribution and founding member status remain.

**Attack Scenario:**
1. User is whitelisted and purchases $800 worth of tokens
2. Owner removes user from whitelist
3. User's `contributions[user] = 800` and `isFoundingMember[user] = true` remain
4. User cannot purchase more (not whitelisted)
5. User's data is inconsistent with whitelist status

**Impact:**
- Inconsistent state between whitelist and contribution data
- Users may be unfairly locked out after contributing
- Founding member status persists even if removed from whitelist

**Recommended Fix:**
```solidity
function removeFromWhitelist(address[] calldata _addresses) external onlyOwner {
    for (uint256 i = 0; i < _addresses.length; i++) {
        // ADDED: Check if user has already contributed
        require(
            contributions[_addresses[i]] == 0,
            "Cannot remove address that has already contributed"
        );

        whitelist[_addresses[i]] = false;
        emit WhitelistUpdated(_addresses[i], false);
    }
}

// OR: Allow removal but emit warning event
event WhitelistRemovedAfterContribution(
    address indexed user,
    uint256 existingContribution
);

function removeFromWhitelist(address[] calldata _addresses) external onlyOwner {
    for (uint256 i = 0; i < _addresses.length; i++) {
        if (contributions[_addresses[i]] > 0) {
            emit WhitelistRemovedAfterContribution(
                _addresses[i],
                contributions[_addresses[i]]
            );
        }

        whitelist[_addresses[i]] = false;
        emit WhitelistUpdated(_addresses[i], false);
    }
}
```

---

## Low Severity Issues

### 12. LOW: No Zero Address Check for USDT Transfer

**Location:** `purchaseWithUSDT()` - Line 177-180
**Severity:** LOW

**Issue:**
While unlikely, if `usdtToken` is set to zero address or a non-standard token, `transferFrom` could behave unexpectedly.

**Fix:**
Add checks in constructor (already present) and validate USDT balance before purchase.

---

### 13. LOW: Integer Overflow in Token Calculation (Unlikely)

**Location:** `_processPurchase()` - Line 198
**Severity:** LOW

**Issue:**
```solidity
uint256 baseTokens = _usdValue * 12500 * 10**18;
```

With max purchase of $800:
- `800 * 12500 * 10^18 = 10^22`
- Well within `uint256` max (`2^256 - 1 ≈ 10^77`)

**Status:** Not a real issue due to Solidity 0.8.20 overflow protection and reasonable bounds.

---

### 14. LOW: Gas Optimization - Redundant Storage Reads

**Location:** Various functions
**Severity:** LOW

**Issue:**
Multiple functions read `totalTokensSold`, `totalUSDRaised` from storage multiple times.

**Fix:**
```solidity
function getSaleStats() external view returns (...) {
    // Cache storage variables
    uint256 _sold = totalTokensSold;
    uint256 _raised = totalUSDRaised;

    return (
        _raised,
        _sold,
        foundingMembersCount,
        TOKENS_FOR_SALE - _sold, // Use cached value
        HARD_CAP_USD - _raised,   // Use cached value
        // ...
    );
}
```

---

### 15. LOW: Potential for Sale Extension Griefing

**Location:** `extendSale()` - Lines 388-393
**Severity:** LOW

**Issue:**
Owner can extend sale indefinitely, preventing finalization.

**Fix:**
```solidity
uint256 public constant MAX_SALE_DURATION = 180 days;

function extendSale(uint256 _newEndTime) external onlyOwner {
    require(_newEndTime > saleEndTime, "Must extend, not shorten");
    require(block.timestamp < saleEndTime, "Sale already ended");

    // ADDED: Limit total duration
    require(
        _newEndTime <= saleStartTime + MAX_SALE_DURATION,
        "Cannot extend beyond max duration"
    );

    saleEndTime = _newEndTime;
    emit SaleExtended(saleEndTime, _newEndTime);
}
```

---

### 16. LOW: No Check for Duplicate Whitelist Additions

**Location:** `addToWhitelist()` - Lines 105-110
**Severity:** LOW

**Issue:**
Adding an already whitelisted address emits unnecessary event.

**Fix:**
```solidity
function addToWhitelist(address[] calldata _addresses) external onlyOwner {
    for (uint256 i = 0; i < _addresses.length; i++) {
        if (!whitelist[_addresses[i]]) { // Only add if not already whitelisted
            whitelist[_addresses[i]] = true;
            emit WhitelistUpdated(_addresses[i], true);
        }
    }
}
```

---

### 17. LOW: Receive Function Revert Message Could Be More Gas Efficient

**Location:** `receive()` - Lines 428-430
**Severity:** LOW

**Issue:**
Using `revert("string")` costs more gas than custom errors.

**Fix:**
```solidity
error DirectPaymentNotAllowed();

receive() external payable {
    revert DirectPaymentNotAllowed();
}
```

---

## Informational / Gas Optimizations

### 18. INFO: Unused Constant TOKEN_PRICE

**Location:** Line 45
**Recommendation:** Remove unused constant or use it in calculations.

---

### 19. INFO: Magic Number in Token Calculation

**Location:** Line 198
**Issue:** `12500` is a magic number (should be `10^8 / tokenPrice`)

**Fix:**
```solidity
// Make it clear where 12500 comes from
// 1 USD / $0.00008 = 12500 tokens per USD
uint256 public constant TOKENS_PER_USD = 12500;
uint256 baseTokens = _usdValue * TOKENS_PER_USD * 10**18;
```

---

### 20. INFO: Consider Using SafeERC20

**Location:** All ERC20 interactions
**Recommendation:**
```solidity
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

using SafeERC20 for IERC20;

// Then use:
usdtToken.safeTransferFrom(msg.sender, address(this), _usdtAmount);
hypeaiToken.safeTransfer(_buyer, totalTokens);
```

This handles tokens that don't return bool properly.

---

### 21. INFO: Add NatSpec Documentation

**Recommendation:** Add `@param` and `@return` tags to all functions for better documentation.

---

### 22. INFO: Consider Two-Step Ownership Transfer

**Recommendation:** Use OpenZeppelin's `Ownable2Step` instead of `Ownable` to prevent accidental ownership transfer to wrong address.

---

### 23. INFO: Add Pause Reasons

**Recommendation:**
```solidity
string public pauseReason;

function pause(string calldata reason) external onlyOwner {
    pauseReason = reason;
    _pause();
    emit SalePaused(reason);
}
```

---

### 24. INFO: Add Purchase Cooldown to Prevent Spam

**Recommendation:**
```solidity
mapping(address => uint256) public lastPurchaseTime;
uint256 public constant PURCHASE_COOLDOWN = 5 minutes;

function purchaseWithBNB() external payable nonReentrant whenNotPaused {
    require(
        block.timestamp >= lastPurchaseTime[msg.sender] + PURCHASE_COOLDOWN,
        "Purchase cooldown active"
    );

    // ... existing code ...

    lastPurchaseTime[msg.sender] = block.timestamp;
}
```

---

### 25. INFO: Add View Function to Simulate Purchase

**Recommendation:**
```solidity
function simulatePurchase(uint256 bnbAmount)
    external
    view
    returns (
        uint256 usdValue,
        uint256 baseTokens,
        uint256 bonusTokens,
        uint256 totalTokens,
        bool wouldSucceed,
        string memory reason
    )
{
    if (block.timestamp < saleStartTime) {
        return (0, 0, 0, 0, false, "Sale not started");
    }

    if (block.timestamp > saleEndTime) {
        return (0, 0, 0, 0, false, "Sale ended");
    }

    uint256 bnbPrice = getBNBPrice();
    usdValue = (bnbAmount * bnbPrice) / 10**26;

    if (usdValue < MIN_PURCHASE_USD) {
        return (usdValue, 0, 0, 0, false, "Below minimum");
    }

    // ... more checks ...

    baseTokens = usdValue * 12500 * 10**18;
    bonusTokens = (baseTokens * BONUS_PERCENTAGE) / 100;
    totalTokens = baseTokens + bonusTokens;

    wouldSucceed = true;
    reason = "Purchase would succeed";
}
```

---

## Business Logic Issues

### 26. CRITICAL BUSINESS LOGIC ERROR: No Vesting Implementation

**Severity:** CRITICAL (Business Logic)

**Issue:**
The contract description and requirements mention:
- TGE unlock (20%)
- Linear vesting (80% over 21 months)
- Cliff periods

**Reality:**
The contract transfers 100% of tokens IMMEDIATELY in `_processPurchase()` line 221-225:

```solidity
// Transfer tokens immediately
require(
    hypeaiToken.transfer(_buyer, totalTokens),
    "Token transfer failed"
);
```

**Impact:**
- **ALL users receive 100% of tokens immediately**
- **NO vesting schedule is enforced**
- Users can dump all tokens immediately after purchase
- This completely contradicts the stated tokenomics

**Recommended Fix:**
You need a separate vesting contract. Example:

```solidity
// NEW CONTRACT: VestingSchedule.sol
contract HypeAIVesting {
    struct VestingPlan {
        uint256 totalAmount;
        uint256 tgeAmount;       // 20% unlocked at TGE
        uint256 vestedAmount;    // Amount already claimed
        uint256 startTime;       // Vesting start time
        uint256 duration;        // 21 months in seconds
    }

    mapping(address => VestingPlan) public vestingPlans;

    function claim() external {
        VestingPlan storage plan = vestingPlans[msg.sender];
        uint256 claimable = calculateClaimable(msg.sender);
        require(claimable > 0, "Nothing to claim");

        plan.vestedAmount += claimable;
        hypeaiToken.transfer(msg.sender, claimable);
    }

    function calculateClaimable(address user) public view returns (uint256) {
        VestingPlan storage plan = vestingPlans[user];

        // TGE amount (20%)
        uint256 unlocked = plan.tgeAmount;

        // Linear vesting (80%)
        if (block.timestamp > plan.startTime) {
            uint256 elapsed = block.timestamp - plan.startTime;
            uint256 vestingAmount = plan.totalAmount - plan.tgeAmount;

            if (elapsed >= plan.duration) {
                unlocked = plan.totalAmount; // Fully vested
            } else {
                unlocked += (vestingAmount * elapsed) / plan.duration;
            }
        }

        return unlocked - plan.vestedAmount;
    }
}

// UPDATE: HypeAIPrivateSale.sol
contract HypeAIPrivateSale is Ownable, ReentrancyGuard, Pausable {
    HypeAIVesting public vestingContract;

    function _processPurchase(...) internal {
        // ... calculate tokens ...

        // CHANGED: Transfer to vesting contract instead of buyer
        require(
            hypeaiToken.transfer(address(vestingContract), totalTokens),
            "Token transfer to vesting failed"
        );

        // Create vesting schedule
        vestingContract.createVestingPlan(
            _buyer,
            totalTokens,
            block.timestamp, // TGE time
            21 * 30 days     // 21 months
        );

        emit TokensPurchased(_buyer, _usdValue, baseTokens, bonusTokens, _isBNB);
    }
}
```

---

## Gas Optimization Opportunities

### Summary of Gas Savings

1. **Use `calldata` instead of `memory` for read-only arrays** - Saves ~200 gas per array element
2. **Cache storage variables in memory** - Saves ~100 gas per SLOAD
3. **Use custom errors instead of string reverts** - Saves ~50 gas per revert
4. **Pack structs efficiently** - Could save significant storage costs
5. **Use `unchecked` for safe arithmetic** - Saves ~20 gas per operation

**Total Estimated Savings:** ~500-1000 gas per transaction

---

## Recommended Immediate Actions

### Priority 1 (CRITICAL - Fix Before Deployment)
1. Fix oracle price division (losing precision)
2. Add refund mechanism for failed BNB purchases
3. Implement circuit breaker checks for Chainlink oracle
4. Implement proper vesting contract (if required by tokenomics)
5. Add token balance verification before sale starts

### Priority 2 (HIGH - Fix Before Mainnet)
1. Fix front-running vulnerability with slippage protection
2. Fix founding member count race condition
3. Add proper sale start time validation
4. Review USDT decimal handling

### Priority 3 (MEDIUM - Recommended)
1. Add withdrawal timelock or multi-sig
2. Add events for all state changes
3. Prevent whitelist removal after contribution
4. Make token price updatable (before sale)

### Priority 4 (LOW - Nice to Have)
1. Gas optimizations
2. Add purchase simulation function
3. Add cooldown periods
4. Use SafeERC20

---

## Testing Recommendations

### Critical Test Cases

1. **Oracle Tests:**
   - Test with stale oracle data (>1 hour old)
   - Test with negative oracle answer
   - Test with zero oracle answer
   - Test with answeredInRound < roundId
   - Test with extreme price changes (±50%)

2. **Payment Tests:**
   - Test BNB purchase with insufficient value (should refund)
   - Test USDT purchase with fractional amounts
   - Test purchases at exact min/max limits
   - Test purchase exceeding hard cap (should refund)

3. **Vesting Tests (if implemented):**
   - Test TGE unlock (exactly 20%)
   - Test linear vesting over 21 months
   - Test early claim attempts
   - Test full vesting after 21 months

4. **Race Condition Tests:**
   - Test 10 simultaneous purchases when 1 founding slot remains
   - Test front-running scenarios
   - Test reentrancy attempts (should fail)

5. **Edge Cases:**
   - Deploy with zero token balance
   - Extend sale multiple times
   - Remove whitelisted user after contribution
   - Pause during active purchase
   - Finalize sale before end time (at hard cap)

---

## Conclusion

The HypeAI Private Sale contract has **several critical vulnerabilities** that MUST be fixed before deployment:

1. **Oracle price precision loss** - Could cause significant financial losses
2. **No refund mechanism** - Users can permanently lose funds
3. **Missing circuit breaker checks** - Vulnerable to stale/manipulated oracle data
4. **Front-running vulnerability** - MEV extractable value
5. **No vesting implementation** - Contradicts stated tokenomics

**Overall Risk Level:** HIGH

**Recommendation:** DO NOT DEPLOY to mainnet until critical and high severity issues are resolved.

---

## Security Audit Checklist

- [x] Reentrancy protection (OpenZeppelin ReentrancyGuard)
- [x] Integer overflow protection (Solidity 0.8.20)
- [x] Access control (OpenZeppelin Ownable)
- [x] Pausable functionality
- [ ] Oracle manipulation resistance (PARTIAL - needs improvement)
- [ ] Front-running protection (MISSING)
- [ ] Refund mechanism (MISSING)
- [ ] Slippage protection (MISSING)
- [ ] Circuit breaker for oracle (MISSING)
- [ ] Vesting implementation (MISSING)
- [ ] Multi-sig or timelock for fund withdrawals (MISSING)
- [x] Event logging (PARTIAL - some missing)
- [ ] Comprehensive test coverage (NOT VERIFIED)

---

**Audit Completed By:** SPARC Security Review Mode
**Date:** October 21, 2025
**Contract Version:** HypeAIPrivateSale.sol (as provided)
**Recommended Review Period:** 2 weeks before mainnet deployment

For questions or clarifications, please review the detailed vulnerability descriptions above.
