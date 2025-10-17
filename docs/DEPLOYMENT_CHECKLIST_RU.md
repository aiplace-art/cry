# 📋 ЧЕКЛИСТ DEPLOYMENT НА BSC TESTNET - 10B ТОКЕНОМИКА

**Дата создания:** 17 октября 2025
**Версия:** 10B Tokenomics Final
**Сеть:** BSC Testnet (Chain ID: 97)

---

## ✅ ПРЕДВАРИТЕЛЬНАЯ ПОДГОТОВКА

### 1. Проверка Окружения

- [ ] **Node.js установлен** (v18+)
  ```bash
  node --version
  ```

- [ ] **Hardhat установлен**
  ```bash
  npx hardhat --version
  ```

- [ ] **Все зависимости установлены**
  ```bash
  npm install
  ```

- [ ] **Контракты скомпилированы**
  ```bash
  npx hardhat compile
  # Ожидаем: "Compiled 4 Solidity files successfully"
  ```

### 2. Настройка Кошелька

- [ ] **MetaMask установлен**

- [ ] **BSC Testnet добавлен в MetaMask**
  - Network Name: BSC Testnet
  - RPC URL: https://data-seed-prebsc-1-s1.binance.org:8545
  - Chain ID: 97
  - Currency Symbol: BNB
  - Block Explorer: https://testnet.bscscan.com

- [ ] **Testnet BNB получен** (минимум 0.1 BNB)
  - Faucet: https://testnet.bnbchain.org/faucet-smart
  - Проверка баланса:
    ```bash
    # В MetaMask или через Hardhat console
    ```

- [ ] **Private key экспортирован из MetaMask**
  - MetaMask → Account Details → Export Private Key
  - ⚠️ **НИКОГДА не коммитить в Git!**

### 3. Переменные Окружения

- [ ] **Создан файл `.env`** в корне проекта

- [ ] **Заполнены все необходимые переменные:**
  ```bash
  # Обязательные для deployment
  PRIVATE_KEY=0xYOUR_PRIVATE_KEY_HERE  # БЕЗ пробелов, 66 символов

  # Обязательные для verification
  BSCSCAN_API_KEY=YOUR_API_KEY  # Получить на https://bscscan.com/myapikey

  # Опциональные
  BSC_TESTNET_RPC_URL=https://data-seed-prebsc-1-s1.binance.org:8545
  ```

- [ ] **Проверка формата PRIVATE_KEY:**
  - Начинается с `0x`
  - Длина 66 символов (0x + 64 hex symbols)
  - Пример: `0x1234567890abcdef...` (полная длина 66)

- [ ] **Получен BSCScan API Key**
  - Регистрация: https://bscscan.com/register
  - API Keys: https://bscscan.com/myapikey
  - Создать новый: "Create New API Key"

### 4. Финальная Проверка Контрактов

- [ ] **Token.sol**
  - Total Supply: 10,000,000,000 (10B) ✓
  - Max Transaction: 50,000,000 (50M) ✓
  - Max Wallet: 200,000,000 (200M) ✓

- [ ] **PrivateSale.sol**
  - TOKEN_PRICE: 8 * 10**13 ($0.00008) ✓
  - TOKENS_FOR_SALE: 1,100,000,000 (1.1B) ✓
  - MIN_PURCHASE_USD: 40 ($40) ✓
  - MAX_PURCHASE_USD: 800 ($800) ✓
  - HARD_CAP_USD: 80000 ($80,000) ✓
  - Formula: usdValue * 12500 * 10**18 ✓

- [ ] **ReferralSystem.sol**
  - MIN_REFERRAL_PURCHASE: 400 ($400) ✓
  - Formula: rewardUSD * 12500 * 10**18 ✓
  - MAX_REWARD_CAP_USD: 10000 ($10,000) ✓

- [ ] **PrivateSaleWithReferral.sol**
  - Interface IReferralSystem на верхнем уровне ✓
  - Все параметры совпадают с PrivateSale ✓

---

## 🚀 DEPLOYMENT

### Шаг 1: Проверка Баланса

```bash
npx hardhat console --network bscTestnet
```

```javascript
const [deployer] = await ethers.getSigners();
console.log("Address:", deployer.address);
console.log("Balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "BNB");
```

- [ ] **Баланс >= 0.1 BNB** (на gas fees)

### Шаг 2: Запуск Deployment Скрипта

```bash
node scripts/deploy-10b-testnet.js
```

**Ожидаемое время:** 3-5 минут

**Ожидаемый вывод:**
```
🚀 DEPLOYING HYPEAI 10B TOKENOMICS TO BSC TESTNET
================================================================================
📍 Deployer Address: 0x...
💰 Balance: 0.5 BNB
🌐 Network: bscTestnet
🔗 Chain ID: 97
================================================================================

📦 [1/4] Deploying HypeAI Token (10B supply)...
✅ HypeAI Token deployed to: 0x...
   Total Supply: 10,000,000,000 HYPE
   ⏳ Waiting for 3 confirmations...
   ✅ Confirmed!

📦 [2/4] Deploying PrivateSale Contract...
✅ PrivateSale deployed to: 0x...
   ...

🎉 DEPLOYMENT SUCCESSFUL!
```

- [ ] **Все 4 контракта успешно deployed**
- [ ] **Создан файл `deployments/bsc-testnet-10b.json`**
- [ ] **Создан файл `src/frontend/.env.testnet`**

### Шаг 3: Сохранить Адреса Контрактов

Скопировать из вывода:

```
HypeAI Token:              0x_____________________
PrivateSale:               0x_____________________
ReferralSystem:            0x_____________________
PrivateSaleWithReferral:   0x_____________________
```

- [ ] **Адреса сохранены** (в блокнот или отдельный файл)

---

## 🔍 VERIFICATION НА BSCSCAN

### Шаг 4: Подождать 30-60 секунд

⏳ **ВАЖНО:** Подождать минимум 30 секунд после deployment перед verification!

- [ ] **Прошло 30+ секунд после deployment**

### Шаг 5: Запустить Verification

```bash
node scripts/verify-contracts.js
```

**Ожидаемый вывод:**
```
🔍 VERIFYING CONTRACTS ON BSCSCAN TESTNET
================================================================================

🔍 [1/4] Verifying HypeAI Token...
   Address: 0x...
   ✅ HypeAI Token verified!

🔍 [2/4] Verifying PrivateSale Contract...
   ✅ PrivateSale verified!

🔍 [3/4] Verifying ReferralSystem Contract...
   ✅ ReferralSystem verified!

🔍 [4/4] Verifying PrivateSaleWithReferral Contract...
   ✅ PrivateSaleWithReferral verified!

✅ ALL CONTRACTS VERIFIED!
```

- [ ] **Все 4 контракта verified**

### Шаг 6: Проверить на BSCScan

Открыть в браузере (заменить `0x...` на реальные адреса):

```
https://testnet.bscscan.com/address/0x_HYPEAI_TOKEN_ADDRESS_
https://testnet.bscscan.com/address/0x_PRIVATE_SALE_ADDRESS_
https://testnet.bscscan.com/address/0x_REFERRAL_SYSTEM_ADDRESS_
https://testnet.bscscan.com/address/0x_PRIVATE_SALE_WITH_REFERRAL_ADDRESS_
```

- [ ] **Контракты видны на BSCScan**
- [ ] **Вкладка "Contract" показывает зелёную галочку ✓**
- [ ] **Можно читать код контракта**
- [ ] **Можно вызывать Read/Write функции**

---

## 🧪 ТЕСТИРОВАНИЕ

### Шаг 7: Получить Testnet USDT

**Вариант A: Swap BNB → USDT на PancakeSwap Testnet**
- URL: https://pancake.kiemtienonline360.com/#/swap (testnet)
- Swap ~0.05 BNB → USDT

**Вариант B: Deploy Mock USDT**
```bash
npx hardhat console --network bscTestnet
const MockUSDT = await ethers.getContractFactory("MockERC20");
const usdt = await MockUSDT.deploy("Tether USD", "USDT", 18);
await usdt.mint(deployer.address, ethers.parseUnits("10000", 18));
```

- [ ] **Получен testnet USDT** (минимум 100 USDT для теста)

### Шаг 8: Запустить Тестовые Покупки

```bash
node scripts/test-purchase.js
```

**Ожидаемый вывод:**
```
🧪 TESTING PURCHASE FLOWS ON BSC TESTNET
================================================================================

🔍 Checking purchase eligibility...
   Eligible: true
   ✅ Eligible to purchase!

💰 TEST 1: Purchase with BNB
   Purchasing $100 worth (0.1667 BNB)...
   Expected total: 1,375,000 HYPE
   Tokens received: 1,375,000 HYPE
   ✅ CALCULATION CORRECT!
   ✅ BNB purchase successful!

💵 TEST 2: Purchase with USDT
   Purchasing $100 worth (100 USDT)...
   Tokens received: 1,375,000 HYPE
   ✅ CALCULATION CORRECT!
   ✅ USDT purchase successful!

✅ PURCHASE TESTING COMPLETE!
```

- [ ] **BNB покупка работает ✓**
- [ ] **USDT покупка работает ✓**
- [ ] **Расчёт токенов правильный (×12500) ✓**
- [ ] **Бонус 10% начисляется ✓**

### Шаг 9: Тестирование Referral System

```bash
npx hardhat console --network bscTestnet
```

```javascript
const deployment = require('./deployments/bsc-testnet-10b.json');
const referralSystem = await ethers.getContractAt("HypeAIReferralSystem", deployment.contracts.referralSystem);

// Регистрация реферала
const [deployer, referrer, buyer] = await ethers.getSigners();
await referralSystem.connect(buyer).registerReferral(buyer.address, referrer.address);

// Проверка статистики
const stats = await referralSystem.getReferralStats(referrer.address);
console.log("Referrals:", stats.totalReferred.toString());
```

- [ ] **Можно регистрировать рефералов**
- [ ] **Покупки начисляют rewards**
- [ ] **Можно claim rewards**

---

## 📊 ФИНАЛЬНАЯ ПРОВЕРКА

### Шаг 10: Проверить Все Балансы

```javascript
// В Hardhat console
const hypeai = await ethers.getContractAt("HypeAI", deployment.contracts.hypeaiToken);
const privateSale = await ethers.getContractAt("HypeAIPrivateSale", deployment.contracts.privateSale);

console.log("Total Supply:", ethers.formatUnits(await hypeai.totalSupply(), 18));
console.log("PrivateSale Balance:", ethers.formatUnits(await hypeai.balanceOf(deployment.contracts.privateSale), 18));
console.log("ReferralSystem Balance:", ethers.formatUnits(await hypeai.balanceOf(deployment.contracts.referralSystem), 18));
```

**Ожидаемые значения:**
```
Total Supply: 10,000,000,000 HYPE
PrivateSale Balance: 1,100,000,000 HYPE
ReferralSystem Balance: 500,000,000 HYPE
```

- [ ] **Total Supply = 10B ✓**
- [ ] **PrivateSale имеет 1.1B ✓**
- [ ] **ReferralSystem имеет 500M ✓**

### Шаг 11: Проверить Sale Stats

```javascript
const stats = await privateSale.getSaleStats();
console.log("Total USD Raised:", stats._totalUSDRaised.toString());
console.log("Total Tokens Sold:", ethers.formatUnits(stats._totalTokensSold, 18));
console.log("Founding Members:", stats._foundingMembersCount.toString());
console.log("Is Active:", stats._isActive);
```

- [ ] **Sale активен (isActive = true)**
- [ ] **Статистика обновляется после покупок**

---

## 📝 ДОКУМЕНТАЦИЯ

### Шаг 12: Создать Summary Report

- [ ] **Создан deployment report** с адресами всех контрактов
- [ ] **Записаны все transaction hashes**
- [ ] **Сохранены BSCScan links**
- [ ] **Документированы тестовые результаты**

**Пример:**
```markdown
# HypeAI BSC Testnet Deployment - 10B Tokenomics

## Deployment Date
17 октября 2025, 15:30 MSK

## Contract Addresses
- HypeAI Token: 0x...
- PrivateSale: 0x...
- ReferralSystem: 0x...
- PrivateSaleWithReferral: 0x...

## Test Results
✅ All contracts deployed
✅ All contracts verified
✅ BNB purchase tested: SUCCESS
✅ USDT purchase tested: SUCCESS
✅ Referral system tested: SUCCESS

## Next Steps
- 7-day community testing
- Bug bounty program
- Mainnet deployment preparation
```

---

## 🎯 СЛЕДУЮЩИЕ ШАГИ

### Community Testing (7 дней минимум)

- [ ] **Whitelist добавлено 10+ тестеров**
- [ ] **Проведено 50+ тестовых покупок**
- [ ] **Протестированы edge cases:**
  - Минимальная покупка ($40)
  - Максимальная покупка ($800)
  - Hard cap ($80,000)
  - Referral rewards
  - Multiple purchases

- [ ] **Собран feedback от тестеров**
- [ ] **Все баги исправлены**

### Bug Bounty Program

- [ ] **Запущен bug bounty** ($500-1000 в токенах)
- [ ] **Нет критических уязвимостей**

### Legal & Compliance

- [ ] **Legal review завершён**
- [ ] **Terms & Conditions готовы**
- [ ] **Privacy Policy готов**

### Mainnet Preparation

- [ ] **Получен mainnet BNB** (~0.5 BNB на gas)
- [ ] **Mainnet USDT адрес подтверждён**
  - BSC Mainnet USDT: `0x55d398326f99059fF775485246999027B3197955`
- [ ] **Treasury wallet настроен** (hardware wallet recommended)
- [ ] **Liquidity wallet настроен**

---

## ⚠️ TROUBLESHOOTING

### Ошибка: "Insufficient balance"
```
❌ Insufficient balance! Need at least 0.1 BNB
```
**Решение:** Получить testnet BNB с faucet: https://testnet.bnbchain.org/faucet-smart

---

### Ошибка: "Private key invalid"
```
Error HH110: Invalid private key
```
**Решение:**
1. Проверить формат: должен начинаться с `0x`
2. Длина должна быть 66 символов
3. Нет пробелов в .env файле
4. Пример правильного формата: `PRIVATE_KEY=0x1234...` (без кавычек)

---

### Ошибка: "Already Verified"
```
Error: Already Verified
```
**Решение:** Это OK! Контракт уже verified ранее.

---

### Ошибка: "USDT transfer failed"
```
Error: USDT transfer failed
```
**Решение:**
1. Проверить USDT balance
2. Approve USDT перед покупкой
3. Использовать правильный USDT address для testnet

---

### Ошибка: "Sale not started"
```
Error: Sale not started
```
**Решение:**
1. Проверить `saleStartTime` в deployment скрипте
2. Подождать до начала sale
3. Или изменить start time на `Math.floor(Date.now() / 1000) + 60` (через 1 минуту)

---

## ✅ ФИНАЛЬНЫЙ ЧЕКЛИСТ

**Перед объявлением Testnet готовым:**

- [ ] ✅ Все 4 контракта deployed
- [ ] ✅ Все 4 контракта verified на BSCScan
- [ ] ✅ Токены transferred to contracts
- [ ] ✅ BNB покупки работают
- [ ] ✅ USDT покупки работают
- [ ] ✅ Referral system работает
- [ ] ✅ Расчёты правильные (×12500, +10% bonus)
- [ ] ✅ 7+ дней community testing
- [ ] ✅ Все баги исправлены
- [ ] ✅ Legal review завершён
- [ ] ✅ Bug bounty program завершён

**Когда все пункты ✅ → ГОТОВО К MAINNET DEPLOYMENT! 🚀**

---

**Создано:** Claude Code + AI Agents
**Дата:** 17 октября 2025
**Версия:** 10B Tokenomics Testnet Deployment Checklist v1.0
