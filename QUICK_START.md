# ⚡ QUICK START - Deployment за 20 Минут

## 📋 Краткая Инструкция

### 1️⃣ Установить MetaMask (5 мин)

```
1. Открыть: https://metamask.io/download/
2. Install MetaMask for Chrome (или ваш браузер)
3. Create a new wallet
4. Записать 12 слов на бумаге (ВАЖНО!)
5. Подтвердить пароль
```

✅ **Кошелек готов!**

---

### 2️⃣ Добавить BSC Testnet (3 мин)

В MetaMask:
```
1. Нажать на сеть вверху → "Add network" → "Add manually"

2. Вставить данные:
   Network Name: BSC Testnet
   RPC URL: https://data-seed-prebsc-1-s1.binance.org:8545
   Chain ID: 97
   Symbol: BNB
   Explorer: https://testnet.bscscan.com

3. Save → Переключиться на BSC Testnet
```

✅ **BSC Testnet добавлен!**

---

### 3️⃣ Получить BNB (5 мин)

```
1. Открыть: https://testnet.bnbchain.org/faucet-smart
2. Connect Wallet → MetaMask
3. Give me BNB
4. Подождать 30 сек
5. Проверить баланс в MetaMask (должно быть ~0.1 BNB)
```

✅ **BNB получен!**

---

### 4️⃣ Настроить .env (5 мин)

1. **Экспортировать Private Key из MetaMask:**
   ```
   MetaMask → ⋮ (три точки) → Account details
   → Show private key → Ввести пароль
   → Скопировать (БЕЗ 0x в начале!)
   ```

2. **Создать .env файл:**
   ```bash
   cd /Users/ai.place/Crypto
   nano .env
   ```

3. **Добавить строку:**
   ```bash
   PRIVATE_KEY=ваш_private_key_без_0x
   ```

4. **Сохранить:**
   ```
   Ctrl+O → Enter → Ctrl+X
   ```

✅ **Hardhat настроен!**

---

### 5️⃣ Deploy! (3 мин) 🚀

```bash
cd /Users/ai.place/Crypto
npx hardhat run scripts/deploy-testnet.js --network bscTestnet
```

**Ожидайте вывод:**
```
🚀 DEPLOYING HYPEAI TO BSC TESTNET
...
✅ HypeAI Token deployed to: 0x...
✅ TeamTokenVesting deployed to: 0x...
✅ HypeAIPrivateSale deployed to: 0x...
✅ Mock USDT deployed to: 0x...
🎉 DEPLOYMENT COMPLETE!
```

✅ **Всё задеплоено!**

---

### 6️⃣ Verify Контракты (2 мин)

```bash
bash scripts/verify-testnet.sh
```

✅ **Готово!** Теперь можно тестировать на BSC Testnet!

---

## 🆘 Что-то не работает?

**Подробные инструкции:**
- `docs/WALLET_SETUP_GUIDE.md` - полная инструкция по MetaMask
- `docs/BSC_TESTNET_DEPLOYMENT_GUIDE.md` - детальное руководство по deployment

**Проблемы:**
- Нет BNB? → Попробуйте другие faucets в WALLET_SETUP_GUIDE.md
- Ошибка "Invalid private key"? → Проверьте что убрали `0x` в начале
- Ошибка "Insufficient funds"? → Нужно минимум 0.05 BNB

---

**Время: ~20 минут**
**Сложность: Лёгкая** ✅
