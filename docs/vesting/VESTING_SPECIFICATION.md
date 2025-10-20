# HypeAI Private Sale Vesting System - Complete Specification

## CRITICAL PARAMETERS (MUST MATCH EVERYWHERE)

### Vesting Formula
```
IMMEDIATE_UNLOCK_PERCENTAGE = 40% (0.40)
VESTING_PERCENTAGE = 60% (0.60)
VESTING_DURATION = 180 days (6 months)
VESTING_TYPE = Linear
CLIFF_PERIOD = None (0 days)
CLAIM_FREQUENCY = Anytime (continuous unlock)
```

### Mathematical Formula
```solidity
// At purchase time (T0)
immediateTokens = totalTokens * 0.40
vestedTokens = totalTokens * 0.60

// At any time T after purchase
elapsedTime = currentTimestamp - purchaseTimestamp
vestingDuration = 180 days = 15552000 seconds

// Calculate vesting progress (0.0 to 1.0)
if (elapsedTime >= vestingDuration) {
    vestingProgress = 1.0
} else {
    vestingProgress = elapsedTime / vestingDuration
}

// Calculate unlocked amount from vesting portion
unlockedFromVesting = vestedTokens * vestingProgress

// Total unlocked tokens
totalUnlocked = immediateTokens + unlockedFromVesting

// Claimable tokens (excluding already claimed)
claimableTokens = totalUnlocked - alreadyClaimed
```

### Presale Parameters (MUST MATCH EXISTING SYSTEM)
```
TOKEN_PRICE = $0.00008 USD per HYPE
MIN_PURCHASE = $400 USD
MAX_PURCHASE = $8,000 USD
BONUS_PERCENTAGE = 10% (for referrals/early birds)
TOKEN_DECIMALS = 18
```

## Example Calculation (VERIFY IN ALL LAYERS)

### Scenario: $1,000 Investment

**Step 1: Calculate Base Tokens**
```
Investment Amount: $1,000
Token Price: $0.00008
Base Tokens = $1,000 / $0.00008 = 12,500,000 HYPE
```

**Step 2: Add Bonus**
```
Bonus Percentage: 10%
Bonus Tokens = 12,500,000 * 0.10 = 1,250,000 HYPE
Total Tokens = 12,500,000 + 1,250,000 = 13,750,000 HYPE
```

**Step 3: Split into Immediate and Vested**
```
Immediate (40%) = 13,750,000 * 0.40 = 5,500,000 HYPE
Vested (60%) = 13,750,000 * 0.60 = 8,250,000 HYPE
```

**Step 4: Unlock Schedule**

| Days Elapsed | Progress | Unlocked from Vesting | Total Unlocked | Percentage |
|--------------|----------|----------------------|----------------|------------|
| 0 (Purchase) | 0% | 0 HYPE | 5,500,000 HYPE | 40.00% |
| 30 (Month 1) | 16.67% | 1,375,000 HYPE | 6,875,000 HYPE | 50.00% |
| 60 (Month 2) | 33.33% | 2,750,000 HYPE | 8,250,000 HYPE | 60.00% |
| 90 (Month 3) | 50.00% | 4,125,000 HYPE | 9,625,000 HYPE | 70.00% |
| 120 (Month 4) | 66.67% | 5,500,000 HYPE | 11,000,000 HYPE | 80.00% |
| 150 (Month 5) | 83.33% | 6,875,000 HYPE | 12,375,000 HYPE | 90.00% |
| 180 (Month 6) | 100.00% | 8,250,000 HYPE | 13,750,000 HYPE | 100.00% |
| 181+ (After) | 100.00% | 8,250,000 HYPE | 13,750,000 HYPE | 100.00% |

**THIS TABLE MUST BE VERIFIED IN:**
- Smart contract unit tests
- Frontend calculator tests
- Backend API tests
- Integration tests
- Documentation examples

## Security Requirements

### MUST PREVENT
1. Double claiming (track claimed amounts)
2. Claiming more than unlocked (enforce calculation)
3. Reentrancy attacks (use ReentrancyGuard)
4. Timestamp manipulation (use block.timestamp safely)
5. Integer overflow/underflow (use Solidity 0.8+ or SafeMath)
6. Unauthorized access (only buyer can claim their tokens)

### MUST IMPLEMENT
1. ReentrancyGuard on all claim functions
2. Ownership verification (only token owner can claim)
3. Event emission for audit trail
4. Proper error messages
5. Emergency pause mechanism
6. Safe token transfer (SafeERC20)

### MUST VALIDATE
1. Purchase amount >= MIN_PURCHASE
2. Purchase amount <= MAX_PURCHASE
3. Claim amount > 0
4. Contract has sufficient token balance
5. User hasn't been blacklisted
6. Vesting schedule exists for user

## Edge Cases to Handle

### Time-based Edge Cases
1. Claim exactly at purchase time (Day 0)
   - Should unlock 40% immediately

2. Claim at exactly 180 days
   - Should unlock 100% (no rounding errors)

3. Claim after 180 days (e.g., Day 365)
   - Should still be 100% (not >100%)

4. Multiple claims at different times
   - Each claim should be cumulative, not overlapping

### Amount-based Edge Cases
1. Very small purchase ($400 minimum)
2. Very large purchase ($8,000 maximum)
3. Purchase with referral bonus
4. Purchase without referral bonus
5. Fractional token amounts (handle wei precision)

### User Behavior Edge Cases
1. User never claims (passive vesting)
2. User claims every day (gas intensive)
3. User claims once after full vesting
4. User claims partially multiple times

## Integration Points

### With Existing Contracts
1. **HypeAI Token Contract**
   - Interface: IERC20
   - Function: `transfer(address to, uint256 amount)`
   - Event: `Transfer(address from, address to, uint256 value)`

2. **Referral System Contract**
   - Purchase recording includes vesting info
   - Referral rewards NOT subject to vesting
   - Bonus tokens ARE subject to vesting

### With Frontend
1. Real-time unlock calculation
2. Visual timeline/progress bar
3. Claim button enabled when claimable > 0
4. Transaction status tracking
5. Event listeners for claims

### With Backend API
1. `/api/vesting/unlocked` - Get current unlocked amount
2. `/api/vesting/schedule` - Get full vesting schedule
3. `/api/vesting/claim` - Initiate claim transaction
4. `/api/vesting/history` - Get claim history

## Testing Requirements

### Unit Tests (Smart Contract)
- [ ] Purchase creates vesting schedule correctly
- [ ] Immediate unlock is exactly 40%
- [ ] Vesting portion is exactly 60%
- [ ] Linear unlock calculation matches formula
- [ ] Claim function transfers correct amount
- [ ] Cannot claim more than unlocked
- [ ] Cannot double claim same amount
- [ ] Multiple claims work correctly
- [ ] Events emitted correctly
- [ ] ReentrancyGuard prevents attacks
- [ ] Unauthorized users cannot claim

### Integration Tests
- [ ] Purchase flow creates vesting entry
- [ ] Frontend calculator matches contract
- [ ] Backend API matches contract
- [ ] Event indexing works
- [ ] Gas costs are reasonable

### E2E Tests
- [ ] Complete user journey (buy → claim)
- [ ] Multiple users with different schedules
- [ ] Referral + vesting interaction
- [ ] UI updates on blockchain events

### Verification Tests
- [ ] All parameters match across layers
- [ ] Example calculations identical everywhere
- [ ] No rounding errors
- [ ] Precision maintained (18 decimals)

## Success Criteria

### MUST ACHIEVE
1. ✅ 100% parameter synchronization across all layers
2. ✅ 100% test coverage (all code paths)
3. ✅ 0 security vulnerabilities
4. ✅ 0 calculation errors (verified 10,000x)
5. ✅ Production-ready code quality

### Verification Matrix
All parameters MUST show ✅ across all layers:
- Contract
- Frontend
- Backend
- Documentation
- Tests

## Deployment Checklist

### Testnet Deployment
- [ ] Deploy contract to BSC Testnet
- [ ] Verify contract on BscScan
- [ ] Test purchase function
- [ ] Test claim function
- [ ] Test edge cases
- [ ] Monitor gas costs
- [ ] Verify events emission

### Mainnet Deployment
- [ ] Full security audit passed
- [ ] All tests passing (100%)
- [ ] Frontend tested on testnet
- [ ] Backend tested on testnet
- [ ] Documentation complete
- [ ] Emergency procedures documented
- [ ] Admin multisig configured
- [ ] Initial token funding complete

---

**STATUS: SPECIFICATION COMPLETE**
**NEXT PHASE: ARCHITECTURE DESIGN**
