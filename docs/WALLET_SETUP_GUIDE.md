# 🦊 Инструкция: Подготовка MetaMask для Deployment

## Шаг 1: Установить MetaMask (5 минут)

### Вариант A: Browser Extension (Рекомендуется)

1. **Открыть сайт MetaMask:**
   ```
   https://metamask.io/download/
   ```

2. **Скачать для вашего браузера:**
   - Chrome/Brave: "Install MetaMask for Chrome"
   - Firefox: "Install MetaMask for Firefox"
   - Edge: "Install MetaMask for Edge"

3. **Установить расширение:**
   - Нажать "Add to Chrome" (или ваш браузер)
   - Подтвердить установку
   - Закрепить иконку в панели браузера

---

## Шаг 2: Создать Кошелек (5 минут)

### A. Первый Запуск

1. **Открыть MetaMask:**
   - Кликнуть на иконку 🦊 в браузере
   - Появится приветственный экран

2. **"Create a new wallet":**
   - Нажать "Create a new wallet"
   - Согласиться с условиями использования

### B. Придумать Пароль

1. **Создать надёжный пароль:**
   - Минимум 8 символов
   - Буквы + цифры + спецсимволы
   - Запомнить или сохранить в менеджере паролей

2. **Подтвердить пароль**

### C. Secret Recovery Phrase (ОЧЕНЬ ВАЖНО!)

1. **MetaMask покажет 12 слов:**
   ```
   Пример:
   apple banana cherry dog elephant ...
   ```

2. **⚠️ КРИТИЧЕСКИ ВАЖНО:**
   - **ЗАПИСАТЬ** эти 12 слов **НА БУМАГЕ**
   - Хранить в **БЕЗОПАСНОМ МЕСТЕ**
   - **НИКОМУ НЕ ПОКАЗЫВАТЬ** эти слова
   - С этими словами = полный доступ к кошельку

3. **Подтвердить слова:**
   - MetaMask попросит выбрать слова в правильном порядке
   - Это проверка что вы записали

✅ **Кошелек создан!**

---

## Шаг 3: Добавить BSC Testnet (3 минуты)

### A. Открыть Настройки Сетей

1. **В MetaMask:**
   - Нажать на название сети вверху (обычно "Ethereum Mainnet")
   - Нажать "Add network"
   - Нажать "Add a network manually"

### B. Ввести Параметры BSC Testnet

Скопировать и вставить эти данные:

```
Network Name: BSC Testnet
RPC URL: https://data-seed-prebsc-1-s1.binance.org:8545
Chain ID: 97
Currency Symbol: BNB
Block Explorer: https://testnet.bscscan.com
```

**Детально:**

| Поле | Значение |
|------|----------|
| Network Name | `BSC Testnet` |
| New RPC URL | `https://data-seed-prebsc-1-s1.binance.org:8545` |
| Chain ID | `97` |
| Currency Symbol | `BNB` |
| Block Explorer URL | `https://testnet.bscscan.com` |

3. **Нажать "Save"**

4. **Переключиться на BSC Testnet:**
   - Нажать на название сети вверху
   - Выбрать "BSC Testnet"

✅ **BSC Testnet добавлен!**

---

## Шаг 4: Получить Ваш Адрес Кошелька (1 минута)

1. **Открыть MetaMask**

2. **Скопировать адрес:**
   - Нажать на имя аккаунта ("Account 1")
   - Адрес автоматически скопируется
   - Выглядит как: `0x1234...5678`

3. **Проверить что на BSC Testnet:**
   - Вверху должно быть написано "BSC Testnet"
   - Баланс: 0 BNB

**Ваш адрес будет вида:**
```
0x1234567890abcdef1234567890abcdef12345678
```

---

## Шаг 5: Получить Testnet BNB (5 минут)

### Вариант A: Official BSC Testnet Faucet (Рекомендуется)

1. **Открыть faucet:**
   ```
   https://testnet.bnbchain.org/faucet-smart
   ```

2. **Подключить кошелек:**
   - Нажать "Connect Wallet"
   - Выбрать MetaMask
   - Подтвердить подключение

3. **Получить BNB:**
   - Faucet должен показать ваш адрес
   - Нажать "Give me BNB"
   - Подождать 10-30 секунд

4. **Проверить баланс в MetaMask:**
   - Должно появиться ~0.1 BNB
   - Этого хватит для deployment

### Вариант B: Alternative Faucets

Если официальный не работает, попробуйте:

**1. BNB Chain Faucet:**
```
https://www.bnbchain.org/en/testnet-faucet
```

**2. QuickNode Faucet:**
```
https://faucet.quicknode.com/binance-smart-chain/bnb-testnet
```

**3. ChainLink Faucet:**
```
https://faucets.chain.link/bnb-chain-testnet
```

### Troubleshooting Faucet

**Проблема: "Address already received tokens today"**
- Faucet даёт токены 1 раз в 24 часа
- Подождать до завтра или попробовать другой faucet

**Проблема: "Network congestion"**
- Подождать 5-10 минут
- Попробовать ещё раз

**Проблема: "Faucet empty"**
- Попробовать другой faucet из списка выше

---

## Шаг 6: Настроить Hardhat для Вашего Кошелька (5 минут)

### A. Экспортировать Private Key

⚠️ **ВНИМАНИЕ:** Private key = полный доступ к кошельку. Никому не показывать!

1. **В MetaMask:**
   - Нажать на три точки (⋮) справа вверху
   - "Account details"
   - "Show private key"
   - Ввести пароль MetaMask
   - Скопировать private key

2. **Private key выглядит так:**
   ```
   0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890
   ```

### B. Добавить в .env файл

1. **Открыть файл `.env` в проекте:**
   ```bash
   cd /Users/ai.place/Crypto
   nano .env
   ```

2. **Добавить строку:**
   ```bash
   PRIVATE_KEY=ваш_private_key_без_0x
   ```

   **Пример:**
   ```bash
   PRIVATE_KEY=abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890
   ```

   ⚠️ **Убрать `0x` в начале!**

3. **Сохранить файл:**
   - Ctrl+O (сохранить)
   - Enter (подтвердить)
   - Ctrl+X (выйти)

### C. Проверить .env

```bash
cat .env | grep PRIVATE_KEY
```

Должно показать:
```
PRIVATE_KEY=abcdef123...
```

### D. Проверить что .env в .gitignore

```bash
cat .gitignore | grep .env
```

Должно быть:
```
.env
```

✅ **Hardhat настроен!**

---

## Шаг 7: Проверка Готовности (2 минуты)

### Чеклист:

- [ ] MetaMask установлен
- [ ] Кошелек создан
- [ ] 12 слов записаны на бумаге
- [ ] BSC Testnet добавлен в MetaMask
- [ ] Переключились на BSC Testnet
- [ ] Получили testnet BNB (баланс > 0.05 BNB)
- [ ] Private key добавлен в `.env`
- [ ] `.env` в `.gitignore`

### Проверить баланс из командной строки:

```bash
cd /Users/ai.place/Crypto

npx hardhat console --network bscTestnet

# В консоли:
const [deployer] = await ethers.getSigners();
console.log("Deployer:", deployer.address);
const balance = await ethers.provider.getBalance(deployer.address);
console.log("Balance:", ethers.formatEther(balance), "BNB");
```

**Ожидаемый результат:**
```
Deployer: 0x1234567890abcdef1234567890abcdef12345678
Balance: 0.1 BNB
```

✅ **Всё готово к deployment!**

---

## Шаг 8: Deploy! 🚀

Теперь можно деплоить:

```bash
cd /Users/ai.place/Crypto
npx hardhat run scripts/deploy-testnet.js --network bscTestnet
```

---

## ⚠️ Безопасность

### ✅ Делать:

- ✅ Хранить 12 слов на бумаге в безопасном месте
- ✅ Хранить private key только в `.env` (который в `.gitignore`)
- ✅ Использовать надёжный пароль для MetaMask
- ✅ Проверять адрес сети перед транзакциями

### ❌ НЕ Делать:

- ❌ НЕ показывать 12 слов никому
- ❌ НЕ показывать private key никому
- ❌ НЕ отправлять скриншоты seed phrase
- ❌ НЕ хранить seed phrase в облаке/email
- ❌ НЕ коммитить `.env` в git
- ❌ НЕ вводить seed phrase на подозрительных сайтах

---

## Troubleshooting

### Проблема: MetaMask не подключается

**Решение:**
1. Проверить что выбрана сеть "BSC Testnet"
2. Перезагрузить страницу
3. Переподключить кошелек

### Проблема: "Insufficient funds"

**Решение:**
1. Проверить баланс: должно быть > 0.05 BNB
2. Получить больше BNB from faucet
3. Подождать 24 часа если faucet даёт ошибку

### Проблема: "Invalid private key"

**Решение:**
1. Проверить что убрали `0x` в начале
2. Проверить что скопировали полностью (64 символа)
3. Проверить что нет лишних пробелов

### Проблема: Hardhat не видит .env

**Решение:**
```bash
# Установить dotenv
npm install dotenv

# Проверить hardhat.config.js содержит:
require('dotenv').config();
```

---

## Полезные Ссылки

- **MetaMask Download:** https://metamask.io/download/
- **BSC Testnet Faucet:** https://testnet.bnbchain.org/faucet-smart
- **BSCScan Testnet:** https://testnet.bscscan.com
- **BSC Testnet RPC:** https://data-seed-prebsc-1-s1.binance.org:8545
- **Hardhat Docs:** https://hardhat.org/hardhat-runner/docs/getting-started

---

**Создано:** 18.10.2025, 01:55 MSK
**Для:** HypeAI BSC Testnet Deployment
**Статус:** Ready to Deploy ✅
