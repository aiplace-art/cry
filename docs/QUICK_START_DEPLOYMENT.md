# 🚀 QUICK START: BSC TESTNET DEPLOYMENT

**3-шаговая быстрая инструкция для deployment 10B токеномики на BSC Testnet**

---

## ⚡ ТРИ КОМАНДЫ ДЛЯ DEPLOYMENT

### 1️⃣ SETUP (.env файл)

Создайте `.env` в корне проекта:

```bash
PRIVATE_KEY=0xYOUR_66_CHARACTER_PRIVATE_KEY_FROM_METAMASK
BSCSCAN_API_KEY=YOUR_API_KEY_FROM_BSCSCAN
```

**Где взять:**
- Private Key: MetaMask → Account Details → Export Private Key
- BSCScan API: https://bscscan.com/myapikey (Create New API Key)

**Получить testnet BNB:**
- https://testnet.bnbchain.org/faucet-smart
- Нужно минимум 0.1 BNB

---

### 2️⃣ DEPLOY (4 контракта)

```bash
node scripts/deploy-10b-testnet.js
```

**Время:** 3-5 минут
**Gas:** ~0.05 BNB (~$30)

**Результат:**
- ✅ HypeAI Token (10B supply)
- ✅ PrivateSale (1.1B allocation)
- ✅ ReferralSystem (500M rewards)
- ✅ PrivateSaleWithReferral

**Файлы созданы:**
- `deployments/bsc-testnet-10b.json` - адреса контрактов
- `src/frontend/.env.testnet` - конфиг для фронтенда

---

### 3️⃣ VERIFY (на BSCScan)

⏳ **Подождать 30 секунд после deployment!**

```bash
node scripts/verify-contracts.js
```

**Время:** 1-2 минуты

**Результат:**
- ✅ Все 4 контракта verified на https://testnet.bscscan.com
- ✅ Можно читать/писать функции через BSCScan UI
- ✅ Источники кода видны публично

---

## 🧪 БОНУС: ТЕСТИРОВАНИЕ

```bash
node scripts/test-purchase.js
```

**Тестирует:**
- ✅ BNB покупку ($100 = 1,375,000 HYPE)
- ✅ USDT покупку
- ✅ Расчёт токенов (×12500)
- ✅ Бонус 10%

---

## 📊 ЧТО DEPLOYED

### Контракты и Токены:

| Контракт | Allocation | Назначение |
|----------|-----------|------------|
| **HypeAI Token** | 10,000,000,000 | ERC-20 token с 10B supply |
| **PrivateSale** | 1,100,000,000 | Private sale ($0.00008/HYPE) |
| **ReferralSystem** | 500,000,000 | Referral rewards (5%+2%) |
| **PrivateSaleWithReferral** | 1,100,000,000 | Private sale + referral tracking |

### Private Sale Параметры:

```
💵 Price:        $0.00008 per HYPE
💰 Min Purchase: $40  (500,000 HYPE)
💰 Max Purchase: $800 (11,000,000 HYPE with bonus)
🎯 Hard Cap:     $80,000
🎁 Bonus:        +10% tokens
```

### Пример Покупки:

```
За $100 получаешь:
- Base tokens:  1,250,000 HYPE
- Bonus (10%):  +125,000 HYPE
- Total:        1,375,000 HYPE ✅

За $800 (максимум) получаешь:
- Base tokens:  10,000,000 HYPE
- Bonus (10%):  +1,000,000 HYPE
- Total:        11,000,000 HYPE ✅
```

---

## 🔗 ПОЛЕЗНЫЕ ССЫЛКИ

**BSC Testnet:**
- Faucet: https://testnet.bnbchain.org/faucet-smart
- Explorer: https://testnet.bscscan.com
- RPC: https://data-seed-prebsc-1-s1.binance.org:8545
- Chain ID: 97

**MetaMask Setup:**
1. Networks → Add Network → Add Manually
2. Заполнить:
   - Network Name: BSC Testnet
   - RPC URL: https://data-seed-prebsc-1-s1.binance.org:8545
   - Chain ID: 97
   - Symbol: BNB
   - Explorer: https://testnet.bscscan.com

**API Keys:**
- BSCScan: https://bscscan.com/myapikey

---

## ⚠️ TROUBLESHOOTING

### "Insufficient balance"
→ Получи testnet BNB: https://testnet.bnbchain.org/faucet-smart

### "Invalid private key"
→ Проверь формат: должен быть `0x` + 64 символа (итого 66)

### "Already Verified"
→ OK! Контракт уже verified ранее

### "USDT transfer failed"
→ Нужен testnet USDT:
- Swap BNB → USDT на PancakeSwap Testnet
- Или deploy mock USDT

---

## 📝 СЛЕДУЮЩИЕ ШАГИ

После successful deployment:

1. **Проверь на BSCScan** (все 4 контракта)
2. **Тестируй покупки** (`node scripts/test-purchase.js`)
3. **Community testing** (7 дней минимум)
4. **Bug bounty program** ($500-1000)
5. **Mainnet deployment** 🚀

---

## 📋 ДЕТАЛЬНЫЙ ЧЕКЛИСТ

Для полного checklist смотри: `docs/DEPLOYMENT_CHECKLIST_RU.md`

---

**Создано:** Claude Code + AI Agents
**Дата:** 17 октября 2025
**Версия:** 10B Tokenomics Quick Start v1.0

**Удачного deployment! 🎉**
