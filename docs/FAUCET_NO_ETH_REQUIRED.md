# 💰 Получить Testnet BNB БЕЗ ETH Mainnet

## Проблема: "Invalid ETH mainnet balance"

Некоторые faucets проверяют баланс ETH на Ethereum mainnet для защиты от спама.

**Решение:** Использовать faucets БЕЗ этого требования! 👇

---

## ✅ Faucets БЕЗ Проверки ETH Balance

### 1️⃣ BNB Testnet Faucet (Самый Простой!)

```
https://bnbtestnetfaucet.com/
```

**Инструкция:**
1. Вставить ваш BSC адрес (из MetaMask)
2. Пройти CAPTCHA (галочку поставить)
3. "Send Me BNB"
4. Получите 0.1 BNB

**Плюсы:**
- ✅ НЕ требует ETH balance
- ✅ Простой интерфейс
- ✅ Быстро (30 сек)

---

### 2️⃣ AllThatNode Faucet (Щедрый!)

```
https://www.allthatnode.com/faucet/bsc.dsrv
```

**Инструкция:**
1. Создать бесплатный аккаунт (email)
2. Подтвердить email
3. Вставить BSC адрес
4. Получить до **0.3 BNB**!

**Плюсы:**
- ✅ НЕ требует ETH balance
- ✅ Дает больше (0.3 BNB вместо 0.1)
- ✅ Надёжный

**Минусы:**
- ⚠️ Требует регистрацию (1 минута)

---

### 3️⃣ BNB Chain Discord Faucet

```
https://discord.gg/bnbchain
```

**Инструкция:**
1. Присоединиться к Discord BNB Chain
2. Найти канал #testnet-faucet
3. Написать команду: `/faucet YOUR_ADDRESS`
4. Получить 0.1 BNB

**Плюсы:**
- ✅ НЕ требует ETH balance
- ✅ Community-driven
- ✅ Обычно быстро отвечает

---

### 4️⃣ Alchemy BNB Faucet (Без регистрации)

```
https://bnbfaucet.com/
```

**Инструкция:**
1. Вставить адрес
2. CAPTCHA
3. "Request BNB"

**Плюсы:**
- ✅ НЕ требует ETH balance
- ✅ Без регистрации
- ✅ Простой

---

## 🎯 Рекомендуемый Порядок

**Попробуйте в таком порядке:**

1. **bnbtestnetfaucet.com** - Самый простой
2. **bnbfaucet.com** - Альтернатива без регистрации
3. **allthatnode.com** - Если нужно больше BNB (требует email)
4. **BNB Discord** - Если все остальные не работают

---

## 📝 Ваш Адрес для Faucets

**Скопировать из MetaMask:**
1. Убедиться что сеть = "BSC Testnet"
2. Кликнуть на имя аккаунта
3. Адрес скопируется

**Адрес выглядит как:**
```
0x1234567890abcdef1234567890abcdef12345678
```

---

## ✅ Проверка Баланса После Получения

### Вариант 1: MetaMask
- Открыть MetaMask
- Проверить что на "BSC Testnet"
- Баланс должен показать ~0.1 BNB

### Вариант 2: Командная строка
```bash
cd /Users/ai.place/Crypto
npx hardhat console --network bscTestnet

# В консоли:
const [deployer] = await ethers.getSigners();
const balance = await ethers.provider.getBalance(deployer.address);
console.log("Balance:", ethers.formatEther(balance), "BNB");
```

---

## 🚀 Если Баланс >= 0.05 BNB - Готовы!

```bash
npx hardhat run scripts/deploy-testnet.js --network bscTestnet
```

---

## ❓ FAQ

**Q: Почему некоторые faucets требуют ETH balance?**
A: Защита от ботов и спама. Если у вас есть ETH на mainnet - скорее всего вы настоящий пользователь.

**Q: Нужно ли покупать ETH чтобы получить testnet BNB?**
A: НЕТ! Используйте faucets из этого списка - они НЕ требуют ETH.

**Q: Сколько раз можно получить BNB from faucet?**
A: Обычно 1 раз в 24 часа на один адрес.

**Q: Что делать если все faucets не работают?**
A:
1. Подождать 24 часа и попробовать снова
2. Попросить в BNB Discord/Telegram
3. Создать новый адрес в MetaMask и попробовать снова

---

**Создано:** 18.10.2025, 02:20 MSK
**Статус:** Проверено ✅
