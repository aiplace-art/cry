# HYPEAI Token Allocation: Точный Анализ и Расчёт

**Дата анализа:** 2025-10-17
**Total Supply:** 1,000,000,000 HYPE
**Источники данных:**
- `/src/contracts/PrivateSale.sol`
- `/src/contracts/Token.sol`
- `/src/contracts/Staking.sol`
- `/data/tokenomics/distribution-state.json`

---

## 1. PRIVATE SALE: Точный Расчёт

### 1.1. Данные из контракта (PrivateSale.sol)

```solidity
TOKENS_FOR_SALE = 100,000,000 * 10^18  // 100M токенов
BONUS_PERCENTAGE = 10                   // 10% бонус
HARD_CAP_USD = $80,000
TOKEN_PRICE = $0.0008
MIN_PURCHASE = $40
MAX_PURCHASE = $800
MAX_FOUNDING_MEMBERS = 500
```

### 1.2. Расчёт реального allocation

**Формула из контракта (строка 170-174):**
```solidity
baseTokens = usdValue * 1250 * 10^18
bonusTokens = (baseTokens * 10) / 100
totalTokens = baseTokens + bonusTokens
```

**Сценарии:**

#### Сценарий A: ПОЛНАЯ РАСПРОДАЖА ($80,000)
```
USD Raised: $80,000
Base Tokens = $80,000 / $0.0008 = 100,000,000 HYPE
Bonus Tokens (10%) = 10,000,000 HYPE
─────────────────────────────────────────────────
TOTAL ALLOCATION: 110,000,000 HYPE (11% от supply)
```

#### Сценарий B: 50% РАСПРОДАЖА ($40,000)
```
USD Raised: $40,000
Base Tokens = 50,000,000 HYPE
Bonus Tokens = 5,000,000 HYPE
─────────────────────────────────────────────────
TOTAL ALLOCATION: 55,000,000 HYPE (5.5% от supply)
```

#### Сценарий C: 25% РАСПРОДАЖА ($20,000)
```
USD Raised: $20,000
Base Tokens = 25,000,000 HYPE
Bonus Tokens = 2,500,000 HYPE
─────────────────────────────────────────────────
TOTAL ALLOCATION: 27,500,000 HYPE (2.75% от supply)
```

### 1.3. КРИТИЧЕСКАЯ ПРОБЛЕМА

**Контракт утверждает:**
```solidity
uint256 public constant TOKENS_FOR_SALE = 100_000_000 * 10**18;
```

**Но реально уйдёт:**
- При полной распродаже: **110,000,000 HYPE**
- Превышение на: **10,000,000 HYPE (10%)**

**⚠️ ОШИБКА:** Контракт не учитывает бонус в константе `TOKENS_FOR_SALE`!

**Проверка в контракте (строка 177-179):**
```solidity
require(
    totalTokensSold + totalTokens <= TOKENS_FOR_SALE,
    "Not enough tokens left"
);
```

**ВЫВОД:** Контракт НЕ СМОЖЕТ продать все токены, так как лимит 100M, но с бонусом нужно 110M!

---

## 2. STAKING REWARDS: Расчёт на 3 года

### 2.1. Данные из контрактов

**Из Staking.sol (строки 45-47):**
```solidity
Tier 0: 30 days  → APY 17%  (1700 basis points)
Tier 1: 90 days  → APY 27%  (2700 basis points)
Tier 2: 365 days → APY 62%  (6200 basis points)
```

**Из Token.sol (строки 71-74):**
```solidity
BASE_APY = 12%              (1200 basis points)
BONUS_30_DAYS = +5%         (500 basis points)
BONUS_90_DAYS = +15%        (1500 basis points)
BONUS_365_DAYS = +50%       (5000 basis points)
```

**⚠️ НЕСООТВЕТСТВИЕ:** Два разных контракта имеют РАЗНЫЕ APY!

### 2.2. Расчёт по Staking.sol (более актуальный)

**Предположения:**
- 30% от supply в стейкинге = 300,000,000 HYPE
- Распределение по tier'ам:
  - 30 days (17% APY): 40% стейкеров = 120M HYPE
  - 90 days (27% APY): 35% стейкеров = 105M HYPE
  - 365 days (62% APY): 25% стейкеров = 75M HYPE

**Формула из контракта (строка 73):**
```solidity
rewards = (amount * apy * timeStaked) / (365 days * 10000)
```

#### ГОДОВЫЕ НАГРАДЫ (Year 1):

**Tier 0 (30 days, 17% APY):**
```
Staked: 120,000,000 HYPE
Rewards = 120M × 0.17 = 20,400,000 HYPE/год
```

**Tier 1 (90 days, 27% APY):**
```
Staked: 105,000,000 HYPE
Rewards = 105M × 0.27 = 28,350,000 HYPE/год
```

**Tier 2 (365 days, 62% APY):**
```
Staked: 75,000,000 HYPE
Rewards = 75M × 0.62 = 46,500,000 HYPE/год
```

**TOTAL YEAR 1:**
```
20,400,000 + 28,350,000 + 46,500,000 = 95,250,000 HYPE/год
```

#### 3-YEAR PROJECTION:

**Conservative (снижение на 20% в год):**
```
Year 1: 95,250,000 HYPE
Year 2: 76,200,000 HYPE (80% от Year 1)
Year 3: 60,960,000 HYPE (80% от Year 2)
───────────────────────────────────
TOTAL 3 YEARS: 232,410,000 HYPE
```

**Aggressive (стабильная активность):**
```
Year 1: 95,250,000 HYPE
Year 2: 95,250,000 HYPE
Year 3: 95,250,000 HYPE
───────────────────────────────────
TOTAL 3 YEARS: 285,750,000 HYPE
```

### 2.3. РЕКОМЕНДУЕМЫЙ ALLOCATION

**Для безопасности (консервативный + буфер 20%):**
```
232,410,000 × 1.2 = 278,892,000 HYPE
───────────────────────────────────
RECOMMENDED: 280,000,000 HYPE (28% от supply)
```

---

## 3. LIQUIDITY: Расчёт для PancakeSwap

### 3.1. Минимальные требования

**Стандартная формула для DEX:**
- Начальная цена: $0.0008 per HYPE
- TVL target: $100,000 (минимум для листинга)

**Расчёт HYPE tokens:**
```
Liquidity Pool должен быть 50/50:
$50,000 в HYPE + $50,000 в BNB

HYPE needed = $50,000 / $0.0008 = 62,500,000 HYPE
```

**BNB needed (при BNB = $600):**
```
BNB needed = $50,000 / $600 = 83.33 BNB
```

### 3.2. РЕКОМЕНДАЦИЯ

**Оптимальная ликвидность для стабильности:**
```
TVL Target: $200,000
HYPE: 125,000,000 (50% от $200k)
BNB: 166.67 BNB (50% от $200k)
───────────────────────────────────
RECOMMENDED ALLOCATION: 130,000,000 HYPE (13% от supply)
```

**Буфер для доливок:**
```
Additional reserves: 20,000,000 HYPE (2%)
───────────────────────────────────
TOTAL LIQUIDITY: 150,000,000 HYPE (15% от supply)
```

---

## 4. ИТОГОВОЕ РАСПРЕДЕЛЕНИЕ: Правильная модель

### 4.1. Текущая модель (из distribution-state.json)

```json
{
  "presale": 300,000,000 (30%)      ← ОШИБКА: слишком много
  "liquidity": 200,000,000 (20%)    ← ОШИБКА: избыточно
  "staking": 250,000,000 (25%)      ← ОШИБКА: недостаточно
  "team": 100,000,000 (10%)
  "marketing": 100,000,000 (10%)
  "treasury": 50,000,000 (5%)
  ─────────────────────────────────
  TOTAL: 1,000,000,000 (100%)
}
```

### 4.2. ИСПРАВЛЕННАЯ МОДЕЛЬ

```
┌─────────────────────────────────────────────────────────┐
│ HYPEAI TOKEN DISTRIBUTION (1,000,000,000 HYPE)          │
├─────────────────────────────────────────────────────────┤
│ 1. Private Sale (с бонусом 10%)                         │
│    • Max possible: 110,000,000 HYPE (11%)               │
│    • Reserved: 120,000,000 HYPE (12%)                   │
│    • Vesting: Immediate (no lock)                       │
├─────────────────────────────────────────────────────────┤
│ 2. Liquidity Pool (PancakeSwap)                         │
│    • Initial: 130,000,000 HYPE (13%)                    │
│    • Reserves: 20,000,000 HYPE (2%)                     │
│    • Total: 150,000,000 HYPE (15%)                      │
│    • Lock: Permanent                                    │
├─────────────────────────────────────────────────────────┤
│ 3. Staking Rewards (3 years)                            │
│    • Allocation: 280,000,000 HYPE (28%)                 │
│    • Distribution: По требованию                         │
│    • Vesting: Linear over 3 years                       │
├─────────────────────────────────────────────────────────┤
│ 4. Team & Advisors                                      │
│    • Allocation: 100,000,000 HYPE (10%)                 │
│    • Vesting: 6 months cliff, 24 months linear          │
│    • Lock: Smart contract                               │
├─────────────────────────────────────────────────────────┤
│ 5. Marketing & Partnerships                             │
│    • Allocation: 120,000,000 HYPE (12%)                 │
│    • Vesting: 12 months linear                          │
│    • Use: Community, airdrops, campaigns                │
├─────────────────────────────────────────────────────────┤
│ 6. Development & Operations                             │
│    • Allocation: 80,000,000 HYPE (8%)                   │
│    • Vesting: 18 months linear                          │
│    • Use: Infrastructure, audits, exchanges             │
├─────────────────────────────────────────────────────────┤
│ 7. Treasury Reserve                                     │
│    • Allocation: 100,000,000 HYPE (10%)                 │
│    • Lock: DAO governance                               │
│    • Use: Emergency fund, future growth                 │
├─────────────────────────────────────────────────────────┤
│ 8. Community Incentives                                 │
│    • Allocation: 50,000,000 HYPE (5%)                   │
│    • Use: Bug bounties, grants, contests                │
│    • Distribution: As needed                            │
├─────────────────────────────────────────────────────────┤
│ TOTAL: 1,000,000,000 HYPE (100%)                        │
└─────────────────────────────────────────────────────────┘
```

### 4.3. ПРОВЕРКА MATH

```
Private Sale:       120,000,000 (12%)
Liquidity:          150,000,000 (15%)
Staking Rewards:    280,000,000 (28%)
Team:               100,000,000 (10%)
Marketing:          120,000,000 (12%)
Development:         80,000,000 (8%)
Treasury:           100,000,000 (10%)
Community:           50,000,000 (5%)
────────────────────────────────────
TOTAL:            1,000,000,000 (100%) ✓
```

---

## 5. СРАВНЕНИЕ: Старая vs Новая модель

### 5.1. Изменения

| Category | OLD | NEW | Δ | Reason |
|----------|-----|-----|---|--------|
| **Private Sale** | 300M (30%) | 120M (12%) | -180M | Realistic с бонусом 10% |
| **Liquidity** | 200M (20%) | 150M (15%) | -50M | Достаточно для $200k TVL |
| **Staking** | 250M (25%) | 280M (28%) | +30M | Реальные расчёты APY |
| **Team** | 100M (10%) | 100M (10%) | 0 | Без изменений |
| **Marketing** | 100M (10%) | 120M (12%) | +20M | Больше на рост |
| **Development** | 0M (0%) | 80M (8%) | +80M | НОВАЯ категория |
| **Treasury** | 50M (5%) | 100M (10%) | +50M | Больше резервов |
| **Community** | 0M (0%) | 50M (5%) | +50M | НОВАЯ категория |

### 5.2. Почему старая модель НЕВЕРНА

**1. Private Sale (300M → 120M):**
- 300M = 37.5% от hard cap ($80k)
- Нереалистично большой allocation
- Контракт не поддерживает такой объём

**2. Liquidity (200M → 150M):**
- 200M = $160,000 в HYPE (при $0.0008)
- Избыточно для начального листинга
- 150M даёт $200k TVL (оптимально)

**3. Staking (250M → 280M):**
- 250M недостаточно для 3 лет
- С учётом APY 17-62% нужно минимум 280M

---

## 6. КРИТИЧЕСКИЕ ПРОБЛЕМЫ И РЕШЕНИЯ

### 6.1. Проблема #1: Private Sale Contract Bug

**Проблема:**
```solidity
TOKENS_FOR_SALE = 100,000,000
Но с бонусом 10% уйдёт 110,000,000
```

**Решение:**
```solidity
// ИСПРАВИТЬ В КОНТРАКТЕ:
uint256 public constant TOKENS_FOR_SALE = 110_000_000 * 10**18;

// ИЛИ изменить проверку:
require(
    totalTokensSold + baseTokens <= TOKENS_FOR_SALE,
    "Not enough tokens left"
);
// (проверять без бонуса)
```

### 6.2. Проблема #2: Расхождение APY

**Проблема:**
- `Staking.sol`: 17%, 27%, 62%
- `Token.sol`: 12% + 5%, 12% + 15%, 12% + 50%

**Решение:**
- Использовать ТОЛЬКО `Staking.sol`
- Удалить стейкинг из `Token.sol` или синхронизировать

### 6.3. Проблема #3: Недостаток Staking Rewards

**Проблема:**
- Текущий allocation: 250M
- Нужно на 3 года: 280M минимум

**Решение:**
- Увеличить до 280M (консервативный)
- Или до 300M (с буфером 15%)

---

## 7. ФИНАЛЬНЫЕ РЕКОМЕНДАЦИИ

### 7.1. Немедленные действия

1. **Исправить PrivateSale.sol:**
   ```solidity
   uint256 public constant TOKENS_FOR_SALE = 110_000_000 * 10**18;
   ```

2. **Обновить distribution-state.json:**
   ```json
   {
     "presale": 120000000,
     "liquidity": 150000000,
     "staking": 280000000,
     "team": 100000000,
     "marketing": 120000000,
     "development": 80000000,
     "treasury": 100000000,
     "community": 50000000
   }
   ```

3. **Синхронизировать APY в контрактах:**
   - Использовать единые значения из `Staking.sol`

### 7.2. Долгосрочная стратегия

**Month 1-3: Launch Phase**
- Private Sale: распродать 110M HYPE
- Добавить ликвидность: 130M HYPE + 166 BNB
- Запустить стейкинг: начать с 50M HYPE locked

**Month 4-6: Growth Phase**
- Marketing: 30M HYPE на кампании
- Staking rewards: ~24M HYPE distributed
- Development: 20M HYPE на биржи и аудиты

**Month 7-12: Expansion**
- Community: 20M HYPE на incentives
- Staking: ~95M HYPE distributed (full year)
- Treasury: сохранить 100M нетронутыми

---

## 8. ФОРМУЛЫ ДЛЯ ПРОВЕРКИ

### 8.1. Private Sale
```
tokens = (usdValue / tokenPrice) × (1 + bonusPercentage)
tokens = (usdValue / 0.0008) × 1.10
```

### 8.2. Staking Rewards
```
annualRewards = stakedAmount × APY
monthlyRewards = annualRewards / 12
dailyRewards = annualRewards / 365
```

### 8.3. Liquidity Pool
```
hypeNeeded = targetTVL / 2 / tokenPrice
bnbNeeded = targetTVL / 2 / bnbPrice
```

---

## 9. COMPLIANCE CHECKLIST

✅ **Total Supply = 1,000,000,000 HYPE**
✅ **All allocations sum to 100%**
✅ **Private Sale с учётом бонуса**
✅ **Staking rewards на 3 года обеспечены**
✅ **Liquidity достаточна для $200k TVL**
✅ **Team vesting защищён**
✅ **Treasury reserve для emergencies**
✅ **Marketing budget на 12 месяцев**

---

**ИТОГ:** Старая модель завышала Private Sale на 150%, занижала Staking на 11%, и не учитывала Development и Community categories. Новая модель реалистична, безопасна, и соответствует контрактам.
