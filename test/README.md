# HypeAI Token Test Suite

Comprehensive test coverage for HypeAI tokenomics smart contracts.

## Test Files

### 1. Token.DynamicAPY.test.js
Tests for dynamic staking APY based on pool health.

**Coverage:**
- Pool health calculation (100%, 75%, 50%, 25%, 10%)
- APY adjustment (62% → 31% → 6.2%)
- Staking at different pool levels
- Unstaking mechanics
- Minimum pool health enforcement (10%)
- Edge cases and security

**Key Scenarios:**
```javascript
// Full pool = Maximum APY (62%)
await stake(amount) → getPoolHealth() === 100

// Half pool = Reduced APY (~31%)
await stake(largeAmount) → getPoolHealth() === 50

// Minimum pool = Minimum APY (~6.2%)
await stake(massiveAmount) → getPoolHealth() === 10
```

### 2. PrivateSale.Oracle.test.js
Tests for Chainlink oracle integration in private sale.

**Coverage:**
- Real-time BNB price fetching
- Token amount calculation based on BNB price
- Stale price protection (>1 hour)
- Invalid price protection (zero/negative)
- Price feed updates by owner
- Access control

**Key Scenarios:**
```javascript
// Purchase with current BNB price
getBNBPrice() → $300
buyTokens(1 BNB) → ~200M tokens

// Price changes affect token amount
getBNBPrice() → $400
buyTokens(1 BNB) → ~266M tokens

// Stale price reverts
time.increase(3601) → buyTokens() reverts
```

### 3. TeamTokenVesting.test.js
Tests for team token vesting with 6-month cliff and 24-month linear vesting.

**Coverage:**
- Add beneficiaries before vesting starts
- Cannot add after vesting starts
- Start vesting (one-time only)
- No releases during 6-month cliff
- Linear vesting over 24 months
- Release tokens to beneficiaries
- Revoke vesting (returns unvested)
- Multiple beneficiaries
- getVestingInfo() view function

**Key Scenarios:**
```javascript
// Before cliff (6 months): 0% vested
await getReleasableAmount() → 0

// Month 12 (25% through vesting): 25% vested
await getReleasableAmount() → 25% of allocation

// Month 30 (100% vested): Full allocation
await getReleasableAmount() → 100% of allocation
```

## Test Utilities

### helpers/test-helpers.js
Reusable utilities for testing:

**Time Helpers:**
- `increaseTime(seconds)` - Fast forward time
- `getCurrentTime()` - Get current timestamp
- `mineBlocks(n)` - Mine blocks

**Calculation Helpers:**
- `calculateStakingRewards(principal, apy, duration)` - Expected rewards
- `calculateVestedAmount(allocation, start, current, cliff, duration)` - Vested amount
- `calculateTokensFromBNB(bnb, price, tokenPrice)` - Token amount from BNB
- `calculateBonus(usdValue)` - Bonus tier calculation

**Setup Helpers:**
- `setupTestEnvironment()` - Deploy all contracts
- `deployMockPriceFeed(price)` - Deploy mock oracle
- `takeSnapshot()` / `restoreSnapshot(id)` - State management

**Constants:**
- `TIME` - Time durations (MINUTE, HOUR, DAY, WEEK, MONTH, YEAR)
- `TOKENS` - Token allocations (TOTAL_SUPPLY, STAKING_POOL, etc.)
- `VESTING` - Vesting parameters (CLIFF, DURATION, TOTAL)
- `APY` - APY values (MAX: 62, MID: 31, MIN: 6.2)

## Mock Contracts

### MockV3Aggregator.sol
Chainlink price feed simulator for testing.

**Features:**
- Set custom prices
- Simulate stale prices
- Test invalid prices
- Emit price update events

## Running Tests

```bash
# Run all tests
npx hardhat test

# Run specific test file
npx hardhat test test/Token.DynamicAPY.test.js
npx hardhat test test/PrivateSale.Oracle.test.js
npx hardhat test test/TeamTokenVesting.test.js

# Run with gas reporting
REPORT_GAS=true npx hardhat test

# Run with coverage
npx hardhat coverage
```

## Test Structure

Each test file follows this pattern:

```javascript
describe("Contract Name", function () {
  // Setup
  beforeEach(async function () {
    // Deploy contracts, setup state
  });

  describe("Feature Name", function () {
    it("should behave correctly", async function () {
      // Arrange
      const input = setupInput();

      // Act
      await contract.method(input);

      // Assert
      expect(result).to.equal(expected);
    });
  });
});
```

## Coverage Goals

- **Statements:** >80%
- **Branches:** >75%
- **Functions:** >80%
- **Lines:** >80%

## Key Testing Principles

1. **Isolation:** Each test is independent
2. **Clarity:** Test names describe behavior
3. **Completeness:** Cover happy paths and edge cases
4. **Repeatability:** Same result every time
5. **Speed:** Fast execution (<2s per test)

## Edge Cases Covered

### Dynamic APY:
- Very small stakes
- Rapid stake/unstake cycles
- Multiple concurrent stakers
- Pool depletion attempts
- Overflow protection

### Oracle:
- Stale prices (>1 hour)
- Invalid prices (0, negative)
- Extreme price values
- Rapid price updates
- Price feed changes

### Vesting:
- Cliff boundary conditions
- Partial releases
- Multiple beneficiaries
- Revoke scenarios
- Very small allocations
- Rapid release attempts

## Security Testing

All tests include security checks for:
- Access control (owner-only functions)
- Input validation
- Overflow/underflow protection
- Reentrancy protection
- State consistency

## Debugging Tips

Use the `debugLog()` helper for debugging:

```javascript
const { debugLog } = require("./helpers/test-helpers");

debugLog("Balance", await token.balanceOf(user));
debugLog("Pool Health", await token.getPoolHealth());
```

## Continuous Integration

Tests run automatically on:
- Every commit
- Pull requests
- Pre-deployment

Ensure all tests pass before deployment!
