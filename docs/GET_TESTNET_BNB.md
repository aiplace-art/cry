# 💰 Получить Testnet BNB - Все Способы

## Способ 1: Official BNB Faucet (Рекомендуется)

### A. Получить Ваш Адрес

**В MetaMask:**
1. Убедиться что выбрана сеть **"BSC Testnet"** (вверху)
2. Кликнуть на имя аккаунта ("Account 1")
3. Адрес автоматически скопируется

**Адрес выглядит как:**
```
0x1234567890abcdef1234567890abcdef12345678
```

### B. Использовать Faucet

**Вариант 1: С формой для адреса**

1. Открыть: https://testnet.bnbchain.org/faucet-smart
2. **Вставить ваш адрес** в поле (если есть поле для ввода)
3. Нажать "Give me BNB" или "Get BNB"
4. Подождать 30-60 секунд

**Вариант 2: Если требуется подключение кошелька**

1. Кликнуть "Connect Wallet" (если есть)
2. Выбрать MetaMask
3. Подтвердить подключение
4. "Give me BNB"

---

## Способ 2: Alternative Faucets (Если первый не работает)

### Faucet #1: BNB Chain Official

```
https://www.bnbchain.org/en/testnet-faucet
```

**Инструкция:**
1. Скопировать ваш адрес из MetaMask
2. Вставить в поле на сайте
3. Пройти CAPTCHA (если есть)
4. Нажать "Get Testnet BNB"

---

### Faucet #2: QuickNode

```
https://faucet.quicknode.com/binance-smart-chain/bnb-testnet
```

**Инструкция:**
1. Выбрать "BNB Smart Chain Testnet"
2. Вставить ваш адрес
3. Пройти CAPTCHA
4. "Continue"
5. Получите 0.1 tBNB

---

### Faucet #3: ChainLink

```
https://faucets.chain.link/bnb-chain-testnet
```

**Инструкция:**
1. Подключить MetaMask (или вставить адрес)
2. Выбрать "BNB Chain Testnet"
3. "Send request"
4. Получите 0.1 tBNB

---

### Faucet #4: Alchemy BNB Testnet

```
https://bnbtestnetfaucet.com/
```

**Инструкция:**
1. Вставить ваш BNB testnet адрес
2. Пройти CAPTCHA
3. "Send Me BNB"

---

### Faucet #5: AllThatNode

```
https://www.allthatnode.com/faucet/bsc.dsrv
```

**Инструкция:**
1. Зарегистрироваться (бесплатно)
2. Вставить адрес
3. Получить до 0.3 BNB testnet

---

## Способ 3: Из Командной Строки (Программно)

Если все faucets не работают, можно попробовать использовать API:

```bash
# Ваш адрес из MetaMask
YOUR_ADDRESS="0x..."

# QuickNode API (пример)
curl -X POST https://faucet.quicknode.com/drip \
  -H "Content-Type: application/json" \
  -d "{\"address\":\"$YOUR_ADDRESS\",\"chain\":\"binance-testnet\"}"
```

---

## Проверка Баланса

### Способ 1: В MetaMask

1. Открыть MetaMask
2. Убедиться что на "BSC Testnet"
3. Посмотреть баланс (должно появиться через 30-60 секунд)

### Способ 2: BSCScan Testnet

```
https://testnet.bscscan.com/address/ВАШ_АДРЕС
```

### Способ 3: Из Командной Строки

```bash
cd /Users/ai.place/Crypto

npx hardhat console --network bscTestnet

# В консоли:
const [deployer] = await ethers.getSigners();
console.log("Address:", deployer.address);

const balance = await ethers.provider.getBalance(deployer.address);
console.log("Balance:", ethers.formatEther(balance), "BNB");
```

**Ожидаемый результат:**
```
Address: 0x1234567890abcdef1234567890abcdef12345678
Balance: 0.1 BNB
```

---

## Troubleshooting

### Проблема: "Address already received tokens today"

**Решение:**
- Faucets дают токены 1 раз в 24 часа
- Подождать до завтра
- Или попробовать другой faucet из списка выше

### Проблема: "Network congestion"

**Решение:**
- Подождать 5-10 минут
- Попробовать ещё раз
- Попробовать другой faucet

### Проблема: "Faucet empty"

**Решение:**
- Faucet закончились средства
- Попробовать другой faucet из списка выше
- Подождать несколько часов

### Проблема: "Invalid address"

**Решение:**
1. Проверить что адрес начинается с `0x`
2. Проверить что адрес 42 символа (0x + 40 hex символов)
3. Скопировать адрес заново из MetaMask

### Проблема: CAPTCHA не проходится

**Решение:**
- Попробовать другой браузер
- Отключить VPN
- Попробовать faucet без CAPTCHA

---

## Быстрый Тест: Есть ли у вас BNB?

```bash
# Проверка напрямую через RPC
curl -X POST https://data-seed-prebsc-1-s1.binance.org:8545 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_getBalance","params":["ВАШ_АДРЕС","latest"],"id":1}'
```

**Если баланс > 0:**
```json
{"result":"0x16345785d8a0000"} // Это 0.1 BNB в hex
```

**Если баланс = 0:**
```json
{"result":"0x0"}
```

---

## После Получения BNB

### Проверка Готовности:

```bash
cd /Users/ai.place/Crypto

# Быстрая проверка
npx hardhat console --network bscTestnet

# В консоли:
const [deployer] = await ethers.getSigners();
const balance = await ethers.provider.getBalance(deployer.address);
console.log("Balance:", ethers.formatEther(balance), "BNB");

// Если > 0.05 BNB - готовы к deployment!
```

### Если баланс >= 0.05 BNB:

```bash
# DEPLOY!
npx hardhat run scripts/deploy-testnet.js --network bscTestnet
```

---

## Рекомендуемый Порядок Faucets

**Попробуйте в таком порядке:**

1. ✅ **https://testnet.bnbchain.org/faucet-smart** (официальный, самый быстрый)
2. ✅ **https://faucet.quicknode.com/binance-smart-chain/bnb-testnet** (надёжный)
3. ✅ **https://www.bnbchain.org/en/testnet-faucet** (альтернативный официальный)
4. ✅ **https://faucets.chain.link/bnb-chain-testnet** (ChainLink, требует MetaMask)
5. ✅ **https://bnbtestnetfaucet.com/** (простой, без регистрации)

**Если ВСЕ не работают:**
- Попробовать через 24 часа
- Спросить в BSC Testnet Telegram/Discord
- Использовать AllThatNode (требует регистрацию, но даёт больше)

---

**Создано:** 18.10.2025, 02:10 MSK
**Статус:** Актуально ✅
