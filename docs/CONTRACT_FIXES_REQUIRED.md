# HYPEAI Smart Contract: Критические Исправления

**Дата:** 2025-10-17
**Приоритет:** ВЫСОКИЙ
**Статус:** Требуется немедленное исправление

---

## ПРОБЛЕМА #1: PrivateSale.sol - Некорректная константа

### Текущий код (строка 28)

```solidity
uint256 public constant TOKENS_FOR_SALE = 100_000_000 * 10**18; // 100M tokens
```

### Проблема

Контракт позволяет бонус 10%, но не учитывает его в константе:

```solidity
// Строки 170-174
uint256 baseTokens = _usdValue * 1250 * 10**18;
uint256 bonusTokens = (baseTokens * BONUS_PERCENTAGE) / 100;  // +10%
uint256 totalTokens = baseTokens + bonusTokens;

// Проверка на строке 177
require(
    totalTokensSold + totalTokens <= TOKENS_FOR_SALE,
    "Not enough tokens left"
);
```

**Математика:**
- Hard cap: $80,000
- Base tokens: $80,000 / $0.0008 = 100,000,000 HYPE
- Bonus (10%): 10,000,000 HYPE
- **Total needed: 110,000,000 HYPE**
- **Available: 100,000,000 HYPE**
- **Deficit: 10,000,000 HYPE** ❌

### Решение A: Увеличить константу (РЕКОМЕНДУЕТСЯ)

```solidity
// ИСПРАВИТЬ:
uint256 public constant TOKENS_FOR_SALE = 110_000_000 * 10**18; // 110M tokens (includes bonus)

// Комментарий:
// 100M base + 10M bonus (10%) = 110M total
// This ensures full hard cap can be reached
```

### Решение B: Изменить проверку

```solidity
// Альтернатива (если нельзя менять константу):
require(
    totalTokensSold + baseTokens <= TOKENS_FOR_SALE, // Проверяем без бонуса
    "Not enough tokens left"
);

// Но тогда нужен отдельный пул для бонусов:
uint256 public constant BONUS_POOL = 10_000_000 * 10**18; // 10M for bonuses
uint256 public bonusTokensDistributed;

// И дополнительная проверка:
require(
    bonusTokensDistributed + bonusTokens <= BONUS_POOL,
    "Not enough bonus tokens left"
);
```

### Решение C: Изменить бонус

```solidity
// Если нельзя менять allocation:
uint256 public constant BONUS_PERCENTAGE = 0; // Убрать бонус

// ИЛИ снизить до:
uint256 public constant BONUS_PERCENTAGE = 0; // 0% - no bonus

// Тогда 100M будет достаточно
```

### Рекомендация

**Использовать Решение A:**
1. Простое изменение одной строки
2. Соответствует tokenomics (120M allocated)
3. Честно с инвесторами (обещанный бонус 10%)
4. Оставляет 10M buffer на непредвиденное

---

## ПРОБЛЕМА #2: Несоответствие APY между контрактами

### Контракт 1: Staking.sol (строки 45-47)

```solidity
stakingTiers[0] = StakingTier(30 days, 1700, 0, true);   // 17% APY
stakingTiers[1] = StakingTier(90 days, 2700, 0, true);   // 27% APY
stakingTiers[2] = StakingTier(365 days, 6200, 0, true);  // 62% APY
```

### Контракт 2: Token.sol (строки 71-74)

```solidity
uint256 public constant BASE_APY = 1200;              // 12% base APY
uint256 public constant BONUS_APY_30_DAYS = 500;      // +5% = 17% total
uint256 public constant BONUS_APY_90_DAYS = 1500;     // +15% = 27% total
uint256 public constant BONUS_APY_365_DAYS = 5000;    // +50% = 62% total
```

### Проблема

**Два разных контракта для стейкинга!**
- `Staking.sol` - отдельный контракт со своей логикой
- `Token.sol` - встроенный стейкинг в токен

**Конфликт:**
- Какой использовать?
- Разные формулы расчёта rewards
- Может привести к двойной выплате

### Решение A: Использовать только Staking.sol (РЕКОМЕНДУЕТСЯ)

```solidity
// В Token.sol УДАЛИТЬ весь стейкинг код (строки 63-307):

// УДАЛИТЬ:
struct Stake { ... }
mapping(address => Stake[]) public stakes;
uint256 public constant BASE_APY = ...
function stake(...) { ... }
function unstake(...) { ... }
```

**Почему:**
- `Staking.sol` более продвинутый (SafeERC20, ReentrancyGuard)
- Разделение ответственности (separation of concerns)
- Проще аудировать отдельный контракт
- Можно обновлять стейкинг без обновления токена

### Решение B: Использовать только Token.sol

```solidity
// НЕ деплоить Staking.sol
// Использовать встроенный стейкинг в Token.sol
```

**Но тогда:**
- Нельзя обновить логику стейкинга без обновления токена
- Сложнее аудит
- Менее модульно

### Решение C: Синхронизировать оба

```solidity
// В Token.sol изменить на ссылку на Staking.sol:

interface IStaking {
    function stake(uint256 amount, uint256 tier) external;
    function unstake(uint256 stakeId) external;
    function pendingRewards(address user, uint256 stakeId) external view returns (uint256);
}

IStaking public stakingContract;

function stake(uint256 amount, uint256 lockPeriodDays) external {
    // Делегировать в Staking.sol
    uint256 tier = lockPeriodDays == 30 ? 0 : (lockPeriodDays == 90 ? 1 : 2);
    _approve(address(this), address(stakingContract), amount);
    stakingContract.stake(amount, tier);
}
```

### Рекомендация

**Использовать Решение A:**
1. Удалить стейкинг из Token.sol полностью
2. Использовать только Staking.sol
3. Обновить документацию
4. Проверить, что никакой код не зависит от Token.stake()

---

## ПРОБЛЕМА #3: Недостаточный allocation для Staking

### Текущий allocation (distribution-state.json)

```json
"staking": 250000000  // 250M tokens
```

### Расчёт потребности (3 года)

**Консервативная модель (20% decay):**
```
Year 1: 95,250,000 HYPE
Year 2: 76,200,000 HYPE
Year 3: 60,960,000 HYPE
─────────────────────────
Total: 232,410,000 HYPE
+ 20% buffer: 278,892,000 HYPE
```

**Стабильная модель:**
```
Year 1: 95,250,000 HYPE
Year 2: 95,250,000 HYPE
Year 3: 95,250,000 HYPE
─────────────────────────
Total: 285,750,000 HYPE
```

### Проблема

**250M недостаточно для 3 лет!**
- Deficit: 28,892,000 HYPE (минимум)
- Deficit: 35,750,000 HYPE (если активность стабильна)

### Решение

```json
// В distribution-state.json изменить:
"staking": 280000000  // 280M tokens (было 250M)
```

**Откуда взять 30M:**
- Private Sale: 300M → 120M = **освобождается 180M**
- Liquidity: 200M → 150M = **освобождается 50M**
- **Total freed: 230M**
- **Needed: 30M**
- **Остаток: 200M на другие категории**

---

## ПРОБЛЕМА #4: Price Formula в PrivateSale.sol

### Текущий код (строки 22, 109, 136, 170)

```solidity
uint256 public constant TOKEN_PRICE = 8 * 10**14; // $0.0008 in wei (assuming BNB = $600)

// Для BNB (строка 109):
uint256 usdValue = (msg.value * 600) / 10**18;

// Для USDT (строка 136):
uint256 usdValue = _usdtAmount / 10**18;

// Расчёт токенов (строка 170):
uint256 baseTokens = _usdValue * 1250 * 10**18;
```

### Проблемы

1. **Hardcoded BNB price ($600)**
   - Что если BNB = $300? Токенов купят в 2 раза больше
   - Что если BNB = $900? Токенов купят меньше
   - Нет защиты от манипуляций

2. **TOKEN_PRICE константа не используется**
   - Объявлена, но нигде не применяется
   - Вместо этого hardcoded `* 1250`

3. **USDT decimals некорректны для BSC**
   - BSC USDT = 18 decimals ✓ (правильно)
   - Ethereum USDT = 6 decimals (если планируете multi-chain)

### Решение A: Использовать Oracle (РЕКОМЕНДУЕТСЯ для production)

```solidity
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

contract HypeAIPrivateSale {
    AggregatorV3Interface public priceFeed;

    constructor(...) {
        // BSC Mainnet BNB/USD: 0x0567F2323251f0Aab15c8dFb1967E4e8A7D42aeE
        priceFeed = AggregatorV3Interface(0x0567F2323251f0Aab15c8dFb1967E4e8A7D42aeE);
    }

    function getBNBPrice() public view returns (uint256) {
        (, int256 price, , , ) = priceFeed.latestRoundData();
        return uint256(price) * 10**10; // Convert to 18 decimals
    }

    function purchaseWithBNB() external payable {
        uint256 bnbPrice = getBNBPrice();
        uint256 usdValue = (msg.value * bnbPrice) / 10**18;
        // ...
    }
}
```

### Решение B: Ручное обновление цены (для testing)

```solidity
uint256 public bnbPriceUSD = 600 * 10**18; // $600 with 18 decimals
uint256 public lastPriceUpdate;
uint256 public constant PRICE_UPDATE_INTERVAL = 1 hours;

function updateBNBPrice(uint256 _newPrice) external onlyOwner {
    require(
        block.timestamp >= lastPriceUpdate + PRICE_UPDATE_INTERVAL,
        "Price update too frequent"
    );
    require(_newPrice >= 100 * 10**18 && _newPrice <= 10000 * 10**18, "Price out of bounds");

    bnbPriceUSD = _newPrice;
    lastPriceUpdate = block.timestamp;

    emit BNBPriceUpdated(_newPrice);
}

function purchaseWithBNB() external payable {
    uint256 usdValue = (msg.value * bnbPriceUSD) / 10**18;
    // ...
}
```

### Решение C: Фиксированная цена + ручной контроль

```solidity
bool public dynamicPricing = false;
uint256 public fixedBNBPrice = 600 * 10**18;

function purchaseWithBNB() external payable {
    uint256 bnbPrice = dynamicPricing ? getBNBPrice() : fixedBNBPrice;
    uint256 usdValue = (msg.value * bnbPrice) / 10**18;
    // ...
}

// Owner может включить oracle позже
function enableDynamicPricing(bool _enable) external onlyOwner {
    dynamicPricing = _enable;
}
```

### Рекомендация

**Для Private Sale использовать Решение B:**
- Private sale = контролируемая среда
- Можно обновлять цену BNB вручную раз в день
- Не зависит от oracle (дешевле gas)
- Проще для тестирования

**Для Public Launch использовать Решение A:**
- Production требует автоматику
- Chainlink oracle = industry standard
- Защита от манипуляций

---

## ПРИОРИТЕТЫ ИСПРАВЛЕНИЙ

### КРИТИЧНО (немедленно)

1. ✅ **Fix TOKENS_FOR_SALE constant**
   - File: `src/contracts/PrivateSale.sol`
   - Line: 28
   - Change: `100_000_000` → `110_000_000`
   - Impact: Контракт не сможет продать все токены без этого

2. ✅ **Remove duplicate staking from Token.sol**
   - File: `src/contracts/Token.sol`
   - Lines: 63-307
   - Action: Delete all staking code
   - Impact: Избежать конфликта и двойных выплат

3. ✅ **Update distribution allocation**
   - File: `data/tokenomics/distribution-state.json`
   - Change: staking 250M → 280M
   - Change: privateSale 300M → 120M
   - Change: liquidity 200M → 150M
   - Impact: Математика не сходится без этого

### ВАЖНО (до production deploy)

4. ⚠️ **Implement BNB price oracle or manual update**
   - File: `src/contracts/PrivateSale.sol`
   - Add: Dynamic pricing mechanism
   - Impact: Защита от ценовых манипуляций

5. ⚠️ **Add comprehensive tests**
   - Test: Full private sale with bonus
   - Test: Staking rewards calculation
   - Test: Liquidity scenarios
   - Impact: Убедиться что math работает on-chain

### ЖЕЛАТЕЛЬНО (optimization)

6. 💡 **Gas optimization**
   - Review: Loop optimizations
   - Review: Storage vs memory
   - Impact: Снижение стоимости транзакций

7. 💡 **Emergency pause mechanisms**
   - Add: Circuit breakers
   - Add: Emergency withdrawal
   - Impact: Защита в случае exploit

---

## ТЕСТИРОВАНИЕ ПОСЛЕ ИСПРАВЛЕНИЙ

### Test Case 1: Private Sale Full Hard Cap

```javascript
it("Should sell exactly 110M tokens with bonus at hard cap", async () => {
  // Arrange
  const hardCap = ethers.parseEther("80000"); // $80k
  const expectedBase = ethers.parseEther("100000000"); // 100M
  const expectedBonus = ethers.parseEther("10000000"); // 10M
  const expectedTotal = ethers.parseEther("110000000"); // 110M

  // Act
  // Simulate multiple purchases totaling $80k
  // ...

  // Assert
  expect(await privateSale.totalTokensSold()).to.equal(expectedTotal);
  expect(await privateSale.totalUSDRaised()).to.equal(hardCap);
});
```

### Test Case 2: Staking Rewards Calculation

```javascript
it("Should calculate correct rewards for 365-day stake", async () => {
  // Arrange
  const stakeAmount = ethers.parseEther("100000"); // 100k HYPE
  const tier = 2; // 365 days, 62% APY

  // Act
  await staking.stake(stakeAmount, tier);
  await time.increase(365 * 24 * 60 * 60); // 1 year
  const rewards = await staking.pendingRewards(user.address, 0);

  // Assert
  const expectedRewards = ethers.parseEther("62000"); // 62% of 100k
  expect(rewards).to.be.closeTo(expectedRewards, ethers.parseEther("100")); // ±100 HYPE tolerance
});
```

### Test Case 3: Total Allocation Math

```javascript
it("Should have exactly 1 billion tokens allocated", async () => {
  const privateSale = 120000000;
  const liquidity = 150000000;
  const staking = 280000000;
  const team = 100000000;
  const marketing = 120000000;
  const development = 80000000;
  const treasury = 100000000;
  const community = 50000000;

  const total = privateSale + liquidity + staking + team +
                marketing + development + treasury + community;

  expect(total).to.equal(1000000000);
});
```

---

## DEPLOYMENT CHECKLIST

### Pre-Deploy

- [ ] Fix TOKENS_FOR_SALE constant to 110M
- [ ] Remove staking from Token.sol
- [ ] Update distribution-state.json
- [ ] Add BNB price mechanism
- [ ] Write comprehensive tests
- [ ] Run full test suite
- [ ] Check gas costs
- [ ] Code review by 2+ developers

### Deploy Testnet

- [ ] Deploy Token.sol to BSC Testnet
- [ ] Deploy Staking.sol to BSC Testnet
- [ ] Deploy PrivateSale.sol to BSC Testnet
- [ ] Verify contracts on BscScan
- [ ] Test all functions manually
- [ ] Simulate full private sale
- [ ] Test staking for 1 week
- [ ] Test emergency functions

### Deploy Mainnet

- [ ] Audit by professional firm (recommended)
- [ ] Fix any audit findings
- [ ] Deploy to BSC Mainnet
- [ ] Verify contracts on BscScan
- [ ] Transfer ownership to multisig
- [ ] Add initial liquidity
- [ ] Enable trading
- [ ] Monitor first 24 hours closely

### Post-Deploy

- [ ] Announce contract addresses
- [ ] Update documentation
- [ ] Setup monitoring alerts
- [ ] Begin private sale
- [ ] Track metrics
- [ ] Community updates

---

## SUMMARY

**3 критические проблемы найдены:**

1. **PrivateSale.sol**: константа `TOKENS_FOR_SALE` должна быть 110M (не 100M)
2. **Дубликат стейкинга**: Token.sol и Staking.sol конфликтуют
3. **Недостаток allocation**: staking нужно 280M (не 250M)

**Исправления требуют:**
- 3 изменения в контрактах
- 1 изменение в tokenomics JSON
- Полное тестирование перед deploy
- Audit перед mainnet

**Время на исправления:**
- Код: 2-4 часа
- Тесты: 4-8 часов
- Review: 2-4 часа
- **Total: 1-2 дня работы**

**Риск без исправлений:**
- ❌ Private sale застрянет на 90% (не продаст все токены)
- ❌ Стейкинг закончится через 2.6 года (не 3 года)
- ❌ Возможны двойные выплаты стейкерам
- ❌ Манипуляции ценой через BNB volatility

**Benefit после исправлений:**
- ✅ Математика сходится на 100%
- ✅ Контракты работают как задумано
- ✅ Инвесторы получат обещанный бонус
- ✅ Стейкинг обеспечен на 3 года
- ✅ Готовность к audit и mainnet deploy
