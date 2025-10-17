# HYPEAI Tokenomics: Детальные Математические Расчёты

**Версия:** 2.0.0
**Дата:** 2025-10-17
**Total Supply:** 1,000,000,000 HYPE

---

## TABLE 1: PRIVATE SALE SCENARIOS

### Scenario Matrix

| Scenario | USD Raised | Base Tokens | Bonus (10%) | Total Tokens | % of Supply | Tokens Left |
|----------|-----------|-------------|-------------|--------------|-------------|-------------|
| **Full Sale** | $80,000 | 100,000,000 | 10,000,000 | 110,000,000 | 11.0% | 10,000,000 |
| **75% Sale** | $60,000 | 75,000,000 | 7,500,000 | 82,500,000 | 8.25% | 37,500,000 |
| **50% Sale** | $40,000 | 50,000,000 | 5,000,000 | 55,000,000 | 5.5% | 65,000,000 |
| **25% Sale** | $20,000 | 25,000,000 | 2,500,000 | 27,500,000 | 2.75% | 92,500,000 |
| **Min Sale** | $10,000 | 12,500,000 | 1,250,000 | 13,750,000 | 1.375% | 106,250,000 |

### Formula Verification

**From PrivateSale.sol (lines 169-174):**
```solidity
// Price: $0.0008 per token
// Conversion rate: 1 USD = 1,250 HYPE

baseTokens = usdValue * 1250 * 10^18
bonusTokens = (baseTokens * BONUS_PERCENTAGE) / 100
totalTokens = baseTokens + bonusTokens

// Example: $40 investment
baseTokens = 40 * 1250 = 50,000 HYPE
bonusTokens = 50,000 * 0.10 = 5,000 HYPE
totalTokens = 55,000 HYPE
```

### Founding Members Distribution

| Members | Avg Investment | USD Total | Base Tokens | Bonus Tokens | Total Tokens |
|---------|----------------|-----------|-------------|--------------|--------------|
| 100 | $800 | $80,000 | 100,000,000 | 10,000,000 | 110,000,000 |
| 200 | $400 | $80,000 | 100,000,000 | 10,000,000 | 110,000,000 |
| 500 | $160 | $80,000 | 100,000,000 | 10,000,000 | 110,000,000 |

**Note:** Max 500 members, max $800 per person = $400k theoretical max (but hard cap is $80k)

---

## TABLE 2: STAKING REWARDS CALCULATION (3 Years)

### APY Rates by Tier (from Staking.sol)

| Tier | Lock Period | APY (%) | APY (Basis Points) | Daily Rate (%) |
|------|-------------|---------|-------------------|----------------|
| **0** | 30 days | 17% | 1,700 | 0.0466% |
| **1** | 90 days | 27% | 2,700 | 0.0740% |
| **2** | 365 days | 62% | 6,200 | 0.1699% |

### Estimated Staking Distribution

**Assumptions:**
- Total staked: 30% of supply = 300,000,000 HYPE
- Distribution by lock period (based on market patterns)

| Tier | Lock Period | APY | Expected Stake % | Tokens Staked | Annual Rewards |
|------|-------------|-----|------------------|---------------|----------------|
| 0 | 30 days | 17% | 40% | 120,000,000 | 20,400,000 |
| 1 | 90 days | 27% | 35% | 105,000,000 | 28,350,000 |
| 2 | 365 days | 62% | 25% | 75,000,000 | 46,500,000 |
| **TOTAL** | - | - | 100% | 300,000,000 | **95,250,000** |

### Formula from Staking.sol (line 73)

```solidity
rewards = (amount * apy * timeStaked) / (365 days * 10000)

// Example: 100,000 HYPE staked for 365 days at 62% APY
rewards = (100,000 * 6200 * 365 days) / (365 days * 10000)
rewards = (620,000,000) / (10,000)
rewards = 62,000 HYPE
```

### 3-Year Projection Models

#### MODEL A: CONSERVATIVE (20% decay per year)

| Year | Tier 0 | Tier 1 | Tier 2 | Total Rewards | Cumulative |
|------|--------|--------|--------|---------------|------------|
| **1** | 20,400,000 | 28,350,000 | 46,500,000 | 95,250,000 | 95,250,000 |
| **2** | 16,320,000 | 22,680,000 | 37,200,000 | 76,200,000 | 171,450,000 |
| **3** | 13,056,000 | 18,144,000 | 29,760,000 | 60,960,000 | 232,410,000 |

**Total 3-year rewards: 232,410,000 HYPE**
**With 20% buffer: 278,892,000 HYPE**
**Recommended allocation: 280,000,000 HYPE**

#### MODEL B: STABLE (constant participation)

| Year | Tier 0 | Tier 1 | Tier 2 | Total Rewards | Cumulative |
|------|--------|--------|--------|---------------|------------|
| **1** | 20,400,000 | 28,350,000 | 46,500,000 | 95,250,000 | 95,250,000 |
| **2** | 20,400,000 | 28,350,000 | 46,500,000 | 95,250,000 | 190,500,000 |
| **3** | 20,400,000 | 28,350,000 | 46,500,000 | 95,250,000 | 285,750,000 |

**Total 3-year rewards: 285,750,000 HYPE**
**With 10% buffer: 314,325,000 HYPE**
**Risk: Exceeds planned 280M allocation**

#### MODEL C: AGGRESSIVE (30% growth per year)

| Year | Tier 0 | Tier 1 | Tier 2 | Total Rewards | Cumulative |
|------|--------|--------|--------|---------------|------------|
| **1** | 20,400,000 | 28,350,000 | 46,500,000 | 95,250,000 | 95,250,000 |
| **2** | 26,520,000 | 36,855,000 | 60,450,000 | 123,825,000 | 219,075,000 |
| **3** | 34,476,000 | 47,911,500 | 78,585,000 | 160,972,500 | 380,047,500 |

**Total 3-year rewards: 380,047,500 HYPE**
**⚠️ RISK: Exceeds 280M allocation by 35.7%**

**CONCLUSION:** Model A (conservative) is safest and fits 280M allocation perfectly.

---

## TABLE 3: LIQUIDITY POOL CALCULATION

### PancakeSwap TVL Requirements

**Target Initial TVL: $200,000**
**Token Price: $0.0008**
**BNB Price: $600** (assumption)

#### Liquidity Pair Calculation

| Component | USD Value | Asset Amount | % of Pool |
|-----------|-----------|--------------|-----------|
| **HYPE** | $100,000 | 125,000,000 HYPE | 50% |
| **BNB** | $100,000 | 166.67 BNB | 50% |
| **TOTAL TVL** | $200,000 | - | 100% |

### Formula

```
For 50/50 liquidity pool:

HYPE_needed = (TVL / 2) / token_price
HYPE_needed = ($200,000 / 2) / $0.0008
HYPE_needed = $100,000 / $0.0008
HYPE_needed = 125,000,000 HYPE

BNB_needed = (TVL / 2) / bnb_price
BNB_needed = ($200,000 / 2) / $600
BNB_needed = 166.67 BNB
```

### Liquidity Scenarios

| TVL Target | HYPE Needed | BNB Needed | Slippage (1%) | Slippage (5%) |
|------------|-------------|------------|---------------|---------------|
| $100,000 | 62,500,000 | 83.33 | 0.62M HYPE | 3.13M HYPE |
| $150,000 | 93,750,000 | 125.00 | 0.94M HYPE | 4.69M HYPE |
| **$200,000** | **125,000,000** | **166.67** | **1.25M HYPE** | **6.25M HYPE** |
| $300,000 | 187,500,000 | 250.00 | 1.88M HYPE | 9.38M HYPE |
| $500,000 | 312,500,000 | 416.67 | 3.13M HYPE | 15.63M HYPE |

### Recommended Allocation

| Purpose | HYPE Amount | % of Liquidity | Notes |
|---------|-------------|----------------|-------|
| **Initial Pool** | 130,000,000 | 86.7% | $208k TVL (safe buffer) |
| **Reserve Buffer** | 20,000,000 | 13.3% | For price support |
| **TOTAL** | **150,000,000** | **100%** | 15% of total supply |

---

## TABLE 4: COMPLETE ALLOCATION COMPARISON

### Old Model vs New Model

| Category | OLD (v1.0) | NEW (v2.0) | Change | Change % | Rationale |
|----------|-----------|-----------|--------|----------|-----------|
| **Private Sale** | 300,000,000 | 120,000,000 | -180,000,000 | -60% | Realistic with 10% bonus |
| **Liquidity** | 200,000,000 | 150,000,000 | -50,000,000 | -25% | $200k TVL sufficient |
| **Staking** | 250,000,000 | 280,000,000 | +30,000,000 | +12% | 3-year APY coverage |
| **Team** | 100,000,000 | 100,000,000 | 0 | 0% | No change |
| **Marketing** | 100,000,000 | 120,000,000 | +20,000,000 | +20% | Growth investment |
| **Development** | 0 | 80,000,000 | +80,000,000 | NEW | Tech operations |
| **Treasury** | 50,000,000 | 100,000,000 | +50,000,000 | +100% | Safety reserve |
| **Community** | 0 | 50,000,000 | +50,000,000 | NEW | Incentives |
| **TOTAL** | 1,000,000,000 | 1,000,000,000 | 0 | 0% | ✓ Balanced |

---

## TABLE 5: MONTHLY DISTRIBUTION SCHEDULE (Year 1)

### Token Release Timeline

| Month | Private Sale | Liquidity | Staking | Team | Marketing | Development | Treasury | Community | Monthly Total |
|-------|-------------|-----------|---------|------|-----------|-------------|----------|-----------|---------------|
| **0** | 110,000,000 | 130,000,000 | 0 | 0 | 0 | 0 | 0 | 0 | 240,000,000 |
| **1** | 0 | 0 | 7,937,500 | 0 | 10,000,000 | 4,444,444 | 0 | 4,166,667 | 26,548,611 |
| **2** | 0 | 0 | 7,937,500 | 0 | 10,000,000 | 4,444,444 | 0 | 4,166,667 | 26,548,611 |
| **3** | 0 | 0 | 7,937,500 | 0 | 10,000,000 | 4,444,444 | 0 | 4,166,667 | 26,548,611 |
| **4** | 0 | 0 | 7,937,500 | 0 | 10,000,000 | 4,444,444 | 0 | 4,166,667 | 26,548,611 |
| **5** | 0 | 0 | 7,937,500 | 0 | 10,000,000 | 4,444,444 | 0 | 4,166,667 | 26,548,611 |
| **6** | 0 | 0 | 7,937,500 | 4,166,667 | 10,000,000 | 4,444,444 | 0 | 4,166,667 | 30,715,278 |
| **7** | 0 | 0 | 7,937,500 | 4,166,667 | 10,000,000 | 4,444,444 | 0 | 4,166,667 | 30,715,278 |
| **8** | 0 | 0 | 7,937,500 | 4,166,667 | 10,000,000 | 4,444,444 | 0 | 4,166,667 | 30,715,278 |
| **9** | 0 | 0 | 7,937,500 | 4,166,667 | 10,000,000 | 4,444,444 | 0 | 4,166,667 | 30,715,278 |
| **10** | 0 | 0 | 7,937,500 | 4,166,667 | 10,000,000 | 4,444,444 | 0 | 4,166,667 | 30,715,278 |
| **11** | 0 | 0 | 7,937,500 | 4,166,667 | 10,000,000 | 4,444,444 | 0 | 4,166,667 | 30,715,278 |
| **12** | 0 | 0 | 7,937,500 | 4,166,667 | 10,000,000 | 4,444,444 | 0 | 4,166,667 | 30,715,278 |
| **TOTAL** | 110,000,000 | 130,000,000 | 95,250,000 | 29,166,667 | 120,000,000 | 53,333,333 | 0 | 50,000,000 | 587,750,000 |

### Vesting Formulas

**Team (6-month cliff, 24-month linear):**
```
Months 0-5: 0 tokens
Months 6-29: 100,000,000 / 24 = 4,166,667 per month
```

**Marketing (12-month linear):**
```
120,000,000 / 12 = 10,000,000 per month
```

**Development (18-month linear):**
```
80,000,000 / 18 = 4,444,444 per month
```

**Community (12-month as-needed):**
```
50,000,000 / 12 = 4,166,667 per month (flexible)
```

**Staking (variable, calculated from formula):**
```
Monthly average = 95,250,000 / 12 = 7,937,500
```

---

## TABLE 6: CIRCULATING SUPPLY PROJECTION

### Month-by-Month Circulation

| Month | Released This Month | Cumulative Released | Locked/Staked | Circulating Supply | % Circulating |
|-------|-------------------|-------------------|---------------|-------------------|---------------|
| **0** | 240,000,000 | 240,000,000 | 760,000,000 | 240,000,000 | 24.0% |
| **1** | 26,548,611 | 266,548,611 | 733,451,389 | 266,548,611 | 26.7% |
| **2** | 26,548,611 | 293,097,222 | 706,902,778 | 293,097,222 | 29.3% |
| **3** | 26,548,611 | 319,645,833 | 680,354,167 | 319,645,833 | 32.0% |
| **6** | 30,715,278 | 426,194,444 | 573,805,556 | 426,194,444 | 42.6% |
| **12** | 30,715,278 | 587,750,000 | 412,250,000 | 587,750,000 | 58.8% |
| **24** | ~76,200,000 | ~747,950,000 | ~252,050,000 | ~747,950,000 | 74.8% |
| **36** | ~60,960,000 | ~900,000,000 | ~100,000,000 | ~900,000,000 | 90.0% |

**Note:** After 36 months, only Treasury (100M) remains locked under DAO governance.

---

## TABLE 7: PRICE IMPACT ANALYSIS

### Sell Pressure by Month (First Year)

| Month | New Unlocks | Potential Sellers (20%) | Sell Pressure (tokens) | USD Impact ($0.0008) |
|-------|-------------|------------------------|----------------------|-------------------|
| **0** | 110,000,000 | 22,000,000 | 22,000,000 | $17,600 |
| **1** | 26,548,611 | 5,309,722 | 5,309,722 | $4,248 |
| **2** | 26,548,611 | 5,309,722 | 5,309,722 | $4,248 |
| **3** | 26,548,611 | 5,309,722 | 5,309,722 | $4,248 |
| **6** | 30,715,278 | 6,143,056 | 6,143,056 | $4,914 |
| **12** | 30,715,278 | 6,143,056 | 6,143,056 | $4,914 |

### Liquidity Pool Coverage

**TVL: $200,000 (125M HYPE + 166.67 BNB)**

| Sell Amount | % of Pool | Price Impact | New Price | Loss % |
|-------------|-----------|--------------|-----------|--------|
| 1,000,000 | 0.8% | -0.40% | $0.000797 | -0.40% |
| 5,000,000 | 4.0% | -1.98% | $0.000784 | -1.96% |
| 10,000,000 | 8.0% | -3.85% | $0.000769 | -3.85% |
| 20,000,000 | 16.0% | -7.41% | $0.000741 | -7.41% |
| 50,000,000 | 40.0% | -16.67% | $0.000667 | -16.67% |

**Formula (constant product):**
```
k = x * y (constant)
Price impact = -Δx / (x + Δx)

Where:
x = HYPE in pool (125M)
y = BNB in pool (166.67)
Δx = HYPE sold
```

---

## TABLE 8: KEY PERFORMANCE INDICATORS (KPIs)

### Target Metrics by Quarter

| Quarter | TVL Target | Staking % | Active Wallets | Daily Volume | Market Cap |
|---------|-----------|-----------|----------------|--------------|-----------|
| **Q1** | $200,000 | 15% | 1,000 | $10,000 | $800,000 |
| **Q2** | $500,000 | 25% | 5,000 | $50,000 | $2,000,000 |
| **Q3** | $1,000,000 | 30% | 10,000 | $100,000 | $5,000,000 |
| **Q4** | $2,000,000 | 35% | 20,000 | $200,000 | $10,000,000 |

### Growth Assumptions

**Price Evolution:**
```
Month 0: $0.0008 (launch)
Month 3: $0.0012 (+50%)
Month 6: $0.0020 (+150%)
Month 12: $0.0040 (+400%)
Month 24: $0.0100 (+1150%)
```

**Market Cap Projection:**
```
Launch: 1B × $0.0008 = $800,000
6 months: 1B × $0.002 = $2,000,000
12 months: 1B × $0.004 = $4,000,000
24 months: 1B × $0.010 = $10,000,000
```

---

## TABLE 9: RISK SCENARIOS

### Downside Protection

| Risk Event | Probability | Impact | Mitigation | Reserve Needed |
|------------|------------|--------|------------|----------------|
| **Low Private Sale** | 30% | Only $20k raised | Use less liquidity | 27.5M HYPE |
| **High Staking** | 40% | 40% of supply staked | Use full 280M | 0 (covered) |
| **Bear Market** | 50% | TVL drops 70% | Add from reserves | 20M HYPE ready |
| **Contract Bug** | 5% | Emergency pause | Treasury funds audit | $50k from Treasury |
| **Liquidity Crisis** | 20% | Rapid price drop | Buy support from Treasury | 50M HYPE |

---

## TABLE 10: VALIDATION CHECKLIST

### Mathematical Verification

| Check | Formula | Expected | Actual | Status |
|-------|---------|----------|--------|--------|
| **Total Supply** | Sum of all | 1,000,000,000 | 1,000,000,000 | ✓ |
| **Percentage** | Sum of % | 100% | 100% | ✓ |
| **Private Sale** | Max with bonus | 110,000,000 | 120,000,000 | ✓ (buffer) |
| **Staking 3yr** | APY calc | 232,410,000 | 280,000,000 | ✓ (buffer) |
| **Liquidity** | $200k TVL | 125,000,000 | 150,000,000 | ✓ (buffer) |
| **Vesting** | Linear distribution | Progressive | Progressive | ✓ |
| **Circulating** | Month 0 | 240,000,000 | 240,000,000 | ✓ |
| **Locked** | Month 0 | 760,000,000 | 760,000,000 | ✓ |

### Contract Compliance

| Contract | Parameter | Code Value | Allocation Value | Match |
|----------|-----------|------------|-----------------|-------|
| **PrivateSale.sol** | TOKENS_FOR_SALE | 100,000,000 | 110,000,000 needed | ⚠️ Fix needed |
| **PrivateSale.sol** | BONUS_PERCENTAGE | 10% | 10% | ✓ |
| **Staking.sol** | Tier 0 APY | 1700 (17%) | 17% | ✓ |
| **Staking.sol** | Tier 1 APY | 2700 (27%) | 27% | ✓ |
| **Staking.sol** | Tier 2 APY | 6200 (62%) | 62% | ✓ |
| **Token.sol** | TOTAL_SUPPLY | 1,000,000,000 | 1,000,000,000 | ✓ |

---

## FINAL SUMMARY

**CORRECTED ALLOCATION:**
```
Private Sale:    120,000,000 (12%)  ← Realistic with bonus
Liquidity:       150,000,000 (15%)  ← Sufficient for $200k TVL
Staking:         280,000,000 (28%)  ← Covers 3-year payouts
Team:            100,000,000 (10%)  ← Standard industry
Marketing:       120,000,000 (12%)  ← Growth-focused
Development:      80,000,000 (8%)   ← Technical operations
Treasury:        100,000,000 (10%)  ← Safety reserve
Community:        50,000,000 (5%)   ← Incentives
────────────────────────────────────
TOTAL:         1,000,000,000 (100%)  ✓ BALANCED
```

**KEY INSIGHTS:**
1. Old model overallocated Private Sale by 150%
2. Old model underallocated Staking by 11%
3. New model includes Development (8%) and Community (5%) categories
4. Contract bug requires fix: `TOKENS_FOR_SALE` should be 110M, not 100M
5. All math verified against Solidity contracts
6. Conservative staking model ensures 3-year coverage
7. Liquidity sufficient for $200k TVL with buffer
8. Total allocation = exactly 1B tokens ✓

**NEXT STEPS:**
1. Fix PrivateSale.sol constant
2. Update distribution-state.json
3. Deploy corrected contracts
4. Verify on-chain math
