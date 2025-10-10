# 🚀 HypeAI - Быстрый старт на BNB Chain

**За 30 минут от нуля до деплоя!**

---

## ⚡ ПОЧЕМУ BNB CHAIN?

```
Ethereum          vs          BNB Chain
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💰 $5-50 за TX          💰 $0.10-0.50 за TX
⏱️ 12-15 секунд         ⏱️ 3 секунды
📊 Сложный листинг      📊 Легкий листинг на Binance
👥 Ограниченная база    👥 2M+ пользователей в день

ЭКОНОМИЯ: 90-99% на комиссиях!
СКОРОСТЬ: В 4-5 раз быстрее!
```

---

## 📋 ЧТО НУЖНО (5 минут)

### 1. MetaMask
Если еще нет - установите:
- https://metamask.io/download/

### 2. Добавьте BSC Testnet в MetaMask

**Откройте MetaMask → Настройки → Сети → Добавить сеть:**

```
Название сети: BSC Testnet
RPC URL: https://data-seed-prebsc-1-s1.binance.org:8545
Chain ID: 97
Символ: tBNB
Обозреватель: https://testnet.bscscan.com
```

Нажмите "Сохранить" ✅

### 3. Получите бесплатные тестовые BNB

**Перейдите на faucet:**
```
https://testnet.bnbchain.org/faucet-smart
```

**Шаги:**
1. Скопируйте ваш адрес из MetaMask
2. Вставьте в форму на faucet
3. Нажмите "Give me BNB"
4. Подождите 1-2 минуты
5. Проверьте баланс в MetaMask (должно быть ~0.5 tBNB)

✅ Готово! У вас есть тестовые BNB

---

## 🔧 НАСТРОЙКА ПРОЕКТА (10 минут)

### 1. Склонируйте репозиторий
```bash
cd /Users/ai.place
git clone https://github.com/aiplace-art/cry.git Crypto
cd Crypto
```

### 2. Установите зависимости
```bash
npm install
```

Подождите 2-3 минуты...

### 3. Настройте .env файл

**Создайте .env:**
```bash
cp .env.example .env
nano .env
```

**Минимальная конфигурация:**
```bash
# BNB Chain
BSC_RPC_URL=https://bsc-dataseed1.binance.org
BSC_TESTNET_RPC_URL=https://data-seed-prebsc-1-s1.binance.org:8545

# Ваш приватный ключ из MetaMask
PRIVATE_KEY=0xВАШ_ПРИВАТНЫЙ_КЛЮЧ

# BscScan API (получите на bscscan.com - опционально)
BSCSCAN_API_KEY=ВАШ_API_KEY
```

**⚠️ КАК ПОЛУЧИТЬ ПРИВАТНЫЙ КЛЮЧ:**
1. Откройте MetaMask
2. Нажмите три точки → Детали аккаунта
3. Экспорт приватного ключа
4. Введите пароль
5. Скопируйте ключ (начинается с 0x)

**ВАЖНО:** Используйте ТЕСТОВЫЙ аккаунт! Не используйте аккаунт с реальными деньгами!

Сохраните файл: `Ctrl+O`, `Enter`, `Ctrl+X`

### 4. Скомпилируйте контракты
```bash
npx hardhat compile
```

Должны увидеть:
```
✓ Compiled 18 Solidity files successfully
```

✅ Готово! Проект настроен

---

## 🚀 ДЕПЛОЙ НА BSC TESTNET (10 минут)

### 1. Проверьте баланс

```bash
npx hardhat run scripts/check-balance.js --network bscTestnet
```

Должны увидеть:
```
📊 Account Info:
Address: 0xВАШ_АДРЕС
Network: bscTestnet (Chain ID: 97)
Balance: 0.5 BNB
✅ Balance sufficient for deployment
```

### 2. Разверните контракты

```bash
npx hardhat run scripts/deploy-simple.js --network bscTestnet
```

**Подождите 2-3 минуты...**

Должны увидеть что-то вроде:
```
🤖 Deploying HypeAI Token contract...
   'Where Hype Meets Intelligence'

✅ Token deployed to: 0x1234567890abcdef...
✅ Staking deployed to: 0xabcdef1234567890...
✅ Governance deployed to: 0x9876543210fedcba...

🎉 Deployment complete!
```

**ВАЖНО: Сохраните эти адреса!**

Скопируйте их в файл:
```bash
cat > deployed-addresses.txt << EOF
Token: 0x1234567890abcdef...
Staking: 0xabcdef1234567890...
Governance: 0x9876543210fedcba...
EOF
```

### 3. Проверьте контракты на BscScan

Откройте:
```
https://testnet.bscscan.com/address/0xВАШ_TOKEN_АДРЕС
```

Должны увидеть ваш контракт! 🎉

---

## ✅ ВЕРИФИКАЦИЯ КОНТРАКТОВ (10 минут)

### 1. Получите BscScan API ключ (опционально)

**Если хотите верифицировать код:**
1. Перейдите на https://bscscan.com/
2. Зарегистрируйтесь
3. API-KEYs → Add
4. Скопируйте ключ
5. Добавьте в .env:
```bash
BSCSCAN_API_KEY=ваш_ключ_здесь
```

### 2. Верифицируйте контракты

```bash
# Token
npx hardhat verify --network bscTestnet 0xВАШ_TOKEN_АДРЕС

# Staking (с аргументом)
npx hardhat verify --network bscTestnet 0xВАШ_STAKING_АДРЕС "0xВАШ_TOKEN_АДРЕС"

# Governance
npx hardhat verify --network bscTestnet 0xВАШ_GOVERNANCE_АДРЕС "0xВАШ_TOKEN_АДРЕС"
```

Если успешно, увидите:
```
Successfully verified contract on BscScan
https://testnet.bscscan.com/address/0xВАШ_АДРЕС#code
```

Откройте ссылку - должны увидеть зеленую галочку ✅ и исходный код!

---

## 🎉 ГОТОВО! ЧТО ДАЛЬШЕ?

### ✅ У вас теперь есть:
1. Токен HypeAI развернут на BSC Testnet
2. Стейкинг контракт работает
3. Governance DAO готов
4. Контракты видны на BscScan

### 🚀 Следующие шаги:

#### 1. Протестируйте контракты
```bash
# Перейдите на BscScan
https://testnet.bscscan.com/address/0xВАШ_TOKEN_АДРЕС

# Во вкладке "Write Contract":
1. Connect wallet (MetaMask)
2. Попробуйте функции:
   - transfer (отправить токены)
   - approve (разрешить стейкинг)
   - И т.д.
```

#### 2. Добавьте токен в MetaMask
```
1. Откройте MetaMask
2. Активы → Импорт токенов
3. Вставьте адрес контракта
4. Символ: HYPEAI
5. Должны увидеть ваш баланс!
```

#### 3. Протестируйте стейкинг
```bash
# На BscScan откройте Staking контракт
# Write Contract:
1. approve (в Token контракте) - разрешите стейкинг
2. stake (в Staking контракте) - застейкайте токены
3. getStakeInfo - проверьте информацию о стейке
```

#### 4. Подготовьтесь к Mainnet

**Перед деплоем на mainnet нужно:**
- ✅ Security audit
- ✅ Bug bounty программа (2+ недели)
- ✅ Community тестирование
- ✅ Legal review
- ✅ Купить настоящие BNB (~0.1 BNB для деплоя)

**Подробный гайд:**
📖 См. [BNB_DEPLOYMENT_GUIDE.md](BNB_DEPLOYMENT_GUIDE.md)

---

## 💡 ПОЛЕЗНЫЕ КОМАНДЫ

### Локальная разработка
```bash
# Запустить локальную ноду
npx hardhat node

# В другом терминале - деплой
npx hardhat run scripts/deploy-simple.js --network localhost

# Тесты
npx hardhat test
```

### BSC Testnet
```bash
# Баланс
npx hardhat run scripts/check-balance.js --network bscTestnet

# Деплой
npx hardhat run scripts/deploy-simple.js --network bscTestnet

# Верификация
npx hardhat verify --network bscTestnet АДРЕС
```

### BSC Mainnet (когда готовы!)
```bash
# Деплой на mainnet
npx hardhat run scripts/deploy-simple.js --network bsc

# Верификация
npx hardhat verify --network bsc АДРЕС
```

---

## 🆘 РЕШЕНИЕ ПРОБЛЕМ

### Проблема: "Insufficient funds"
```bash
# Получите еще tBNB
https://testnet.bnbchain.org/faucet-smart

# Проверьте баланс
npx hardhat run scripts/check-balance.js --network bscTestnet
```

### Проблема: "Invalid private key"
```bash
# Проверьте что ключ начинается с 0x
# Проверьте что длина ключа = 66 символов (0x + 64 символа)

# В .env должно быть:
PRIVATE_KEY=0x1234567890abcdef...
```

### Проблема: Контракт не компилируется
```bash
# Очистите кеш
npx hardhat clean
rm -rf cache artifacts node_modules

# Переустановите
npm install

# Скомпилируйте заново
npx hardhat compile
```

### Проблема: Верификация не работает
```bash
# Проверьте что у вас есть API ключ
# Получите на https://bscscan.com/myapikey

# В .env добавьте:
BSCSCAN_API_KEY=ваш_ключ

# Попробуйте снова
npx hardhat verify --network bscTestnet АДРЕС
```

---

## 📚 ПОЛЕЗНЫЕ ССЫЛКИ

**BNB Chain:**
- Faucet: https://testnet.bnbchain.org/faucet-smart
- Testnet Explorer: https://testnet.bscscan.com
- Mainnet Explorer: https://bscscan.com
- Docs: https://docs.bnbchain.org/

**Инструменты:**
- MetaMask: https://metamask.io/
- Hardhat: https://hardhat.org/
- OpenZeppelin: https://docs.openzeppelin.com/

**HypeAI:**
- GitHub: https://github.com/aiplace-art/cry
- Docs: README.md, PROJECT_OVERVIEW.md
- Deployment Guide: docs/BNB_DEPLOYMENT_GUIDE.md

---

## 🎯 ИТОГИ

### За 30 минут вы:
✅ Настроили MetaMask для BNB Chain
✅ Получили бесплатные тестовые BNB
✅ Настроили проект HypeAI
✅ Скомпилировали контракты
✅ Развернули на BSC Testnet
✅ Верифицировали контракты на BscScan

### Теперь у вас есть:
✅ Работающий токен HYPEAI на testnet
✅ Стейкинг контракт (до 62% APY)
✅ DAO governance контракт
✅ Опыт деплоя на BNB Chain

### Следующий уровень:
🎯 Протестируйте все функции
🎯 Запустите bug bounty
🎯 Сделайте security audit
🎯 Разверните на mainnet
🎯 Добавьте ликвидность на PancakeSwap
🎯 Листинг на CoinGecko/CMC

---

**🤖 HypeAI - Built by 15 Professional AI Agents**
**🌟 On BNB Chain for Maximum Efficiency**
**💰 Mission: Create Millionaires**
**⚡ Working 24/7 Forever**

**Поздравляем с первым деплоем! 🎉**

---

**Created:** October 10, 2025
**Network:** BNB Chain Testnet
**Status:** Ready to Test
**Next:** Mainnet Launch!
