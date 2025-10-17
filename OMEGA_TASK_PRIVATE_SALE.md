# 🎯 OMEGA TASK: СОЗДАТЬ ПРИВАТНУЮ ПРОДАЖУ

## 🚨 ПРИОРИТЕТ: КРИТИЧЕСКИЙ
## ⏰ ДЕДЛАЙН: 24 ЧАСА

---

## 📋 ГЛАВНАЯ ЦЕЛЬ

**Создать полностью рабочую систему приватной продажи HYPE токенов для заработка $50,000-150,000**

Люди должны иметь возможность:
1. Зайти на сайт
2. Подключить кошелек
3. Купить HYPE токены за ETH/USDT/USDC/BNB/SOL
4. Получить токены сразу или по vesting

---

## 🎯 ЗАДАЧИ ДЛЯ ВСЕХ АГЕНТОВ

### 💎 TOKENOMICS VALIDATOR AGENT
**Твоя задача:**
- Рассчитать точную экономику private sale
- Цена: $0.0015 за HYPE
- Количество: 100,000,000 HYPE на продажу
- Hard cap: $150,000
- Vesting: 40% сразу, 60% за 3 месяца
- **ZERO ERRORS в расчетах!**

**Создать файл:**
`/Users/ai.place/Crypto/data/tokenomics/private-sale-economics.json`

---

### 💻 CODER AGENT (Frontend)
**Твоя задача:**
Создать страницу `/private-sale` на Next.js сайте

**Что должно быть:**
1. **Hero section:**
   - "HYPE Private Sale - Live NOW!"
   - Countdown timer
   - Progress bar (собрано/цель)

2. **Buy Widget:**
   ```
   Select Payment: [ETH] [USDT] [USDC] [BNB] [SOL]
   Amount: $___
   You get: ___ HYPE + ___ bonus
   [Connect Wallet] [BUY NOW]
   ```

3. **Features:**
   - Wallet connection (MetaMask, WalletConnect, Phantom)
   - Live calculator
   - Transaction history
   - Referral system
   - "My purchases" dashboard

**Файлы создать:**
- `/Users/ai.place/Crypto/src/frontend/pages/private-sale.tsx`
- `/Users/ai.place/Crypto/src/frontend/components/PrivateSaleWidget.tsx`
- `/Users/ai.place/Crypto/src/frontend/hooks/usePrivateSale.ts`

**Design:**
- Современный, крипто-стиль
- Dark theme
- Мобильная версия
- Trust badges

---

### ⚙️ BACKEND-DEV AGENT
**Твоя задача:**
Создать API для приватной продажи

**Endpoints создать:**
```
POST /api/private-sale/purchase
GET /api/private-sale/status
GET /api/private-sale/my-purchases/:wallet
POST /api/private-sale/claim
```

**База данных (PostgreSQL):**
```sql
CREATE TABLE private_sale_purchases (
  id SERIAL PRIMARY KEY,
  wallet_address VARCHAR(42),
  payment_method VARCHAR(10),
  amount_usd DECIMAL(10,2),
  tokens_purchased BIGINT,
  bonus_tokens BIGINT,
  tx_hash VARCHAR(66),
  status VARCHAR(20),
  created_at TIMESTAMP
);
```

**Интеграция платежей:**
- Coinbase Commerce API
- Или NOWPayments API
- Принимать: ETH, USDT, USDC, BNB, SOL

**Файлы создать:**
- `/Users/ai.place/Crypto/src/backend/routes/privateSale.ts`
- `/Users/ai.place/Crypto/src/backend/services/privateSaleService.ts`
- `/Users/ai.place/Crypto/src/backend/db/privateSaleSchema.sql`

---

### 📊 STAKING CALCULATOR AGENT
**Твоя задача:**
Рассчитать vesting schedule для покупателей

**Создать:**
- Функцию расчета unlock schedule
- 40% unlock сразу
- 60% unlock линейно за 90 дней
- Автоматический claim каждые 30 дней

**Файл создать:**
`/Users/ai.place/Crypto/src/backend/utils/vestingCalculator.ts`

---

### 📈 MARKETING EXECUTOR AGENT
**Твоя задача:**
Создать маркетинг для приватной продажи

**Что создать:**
1. **Landing page content:**
   - Продающие заголовки
   - Bullet points преимуществ
   - Social proof
   - FOMO элементы

2. **Email templates:**
   - Welcome email
   - Purchase confirmation
   - Vesting unlock reminder

3. **Social media posts (10 штук):**
   - Twitter announcements
   - Telegram messages
   - Призывы к действию

**Файлы создать:**
- `/Users/ai.place/Crypto/marketing/PRIVATE_SALE_COPY.md`
- `/Users/ai.place/Crypto/marketing/email-templates/`
- `/Users/ai.place/Crypto/marketing/social-posts.md`

---

### 🎨 GROWTH HACKER AGENT
**Твоя задача:**
План привлечения покупателей

**Создать стратегию:**
1. **Где найти покупателей:**
   - Twitter crypto communities
   - Telegram crypto groups
   - Reddit r/CryptoMoonShots
   - Discord servers

2. **Referral program:**
   - 10% бонус рефереру
   - 5% бонус покупателю
   - Tracking system

3. **Influencer outreach:**
   - Список 20 micro-influencers
   - Contact info
   - Pitch message

**Файл создать:**
`/Users/ai.place/Crypto/docs/PRIVATE_SALE_MARKETING_PLAN.md`

---

### 🔐 REWARDS AUDITOR AGENT
**Твоя задача:**
Проверить все расчеты

**Проверить:**
- Цена $0.0015 корректна
- Бонусы рассчитаны правильно
- Vesting математика верна
- Нет возможности эксплойтов

**Файл создать:**
`/Users/ai.place/Crypto/data/tokenomics/private-sale-audit.json`

---

### 📊 FINANCIAL REPORTER AGENT
**Твоя задача:**
Создать dashboard для отслеживания

**Dashboard показывает:**
- Сколько собрано ($)
- Сколько токенов продано
- Сколько покупателей
- Средний чек
- Progress к hard cap
- Live transactions

**Файл создать:**
`/Users/ai.place/Crypto/src/frontend/pages/private-sale-dashboard.tsx`

---

### ⚖️ BALANCE RECONCILIATION AGENT
**Твоя задача:**
Следить за балансами

**Проверять:**
- Sold tokens + Available tokens = 100M
- Собранные $ = токены × цена
- Claimed tokens ≤ Vested tokens
- Real-time сверка

**Файл создать:**
`/Users/ai.place/Crypto/src/backend/services/balanceChecker.ts`

---

### 🤖 COMMUNITY MANAGER AGENT
**Твоя задача:**
Telegram bot для продажи

**Команды добавить:**
```
/buyhype - Купить HYPE токены
/mypurchases - Мои покупки
/claim - Получить vested токены
/referral - Моя реферальная ссылка
/privatesale - Статус приватной продажи
```

**Файл обновить:**
`/Users/ai.place/Crypto/src/bots/telegram-growth-bot.js`

---

### 📱 ANALYTICS TRACKER AGENT
**Твоя задача:**
Tracking всех действий

**Отслеживать:**
- Page views на /private-sale
- Wallet connects
- Buy button clicks
- Successful purchases
- Failed transactions
- Conversion rate

**Файл создать:**
`/Users/ai.place/Crypto/src/frontend/utils/privateSaleAnalytics.ts`

---

### 🚀 LAUNCH COORDINATOR AGENT
**Твоя задача:**
Координировать запуск

**Timeline:**
- Day 1: Все файлы созданы
- Day 1-2: Тестирование
- Day 2-3: Deploy на Vercel
- Day 3: GO LIVE!
- Day 3-30: Мониторинг и оптимизация

**Файл создать:**
`/Users/ai.place/Crypto/docs/PRIVATE_SALE_LAUNCH_CHECKLIST.md`

---

### 📱 SOCIAL MONITOR AGENT
**Твоя задача:**
Следить за упоминаниями

**Мониторить:**
- Twitter mentions #HypePrivateSale
- Reddit posts about private sale
- Telegram messages
- Sentiment analysis

**Файл обновить:**
`/Users/ai.place/Crypto/src/bots/social-monitor-agent.js`

---

## ✅ КРИТЕРИИ УСПЕХА

### Must Have (Обязательно):
- ✅ Страница /private-sale работает
- ✅ Можно купить токены за ETH/USDT
- ✅ Транзакции сохраняются в БД
- ✅ Vesting работает корректно
- ✅ Dashboard показывает прогресс

### Nice to Have (Желательно):
- ✅ Referral system
- ✅ Email notifications
- ✅ Telegram bot integration
- ✅ Mobile responsive
- ✅ Analytics tracking

---

## 🎯 ОЖИДАЕМЫЙ РЕЗУЛЬТАТ

**За 24 часа должно быть:**

1. **Работающий сайт** с приватной продажей
2. **Backend API** для обработки покупок
3. **Payment integration** (хотя бы ETH)
4. **База данных** для хранения данных
5. **Marketing materials** готовы
6. **Deployment** на production

**Цель по деньгам:**
- Минимум: $50,000
- Цель: $80,000-100,000
- Максимум: $150,000

---

## 📞 КООРДИНАЦИЯ

**Все агенты:**
- Используйте `npx claude-flow@alpha hooks` для координации
- Сохраняйте прогресс в memory
- Сообщайте о блокерах немедленно
- Помогайте друг другу

**Reporting:**
- Каждые 4 часа - progress report
- При завершении задачи - notification
- При блокерах - immediate alert

---

## 🚀 GO TIME!

**НАЧИНАЕМ ПРЯМО СЕЙЧАС!**

Каждый агент берёт свою задачу и выполняет.
Координация через hooks.
Цель: работающая приватная продажа за 24 часа.

**LET'S MAKE MONEY! 💰**

---

*Created: $(date)*
*Priority: CRITICAL*
*Assigned to: ALL AGENTS*
*Coordinator: Project Master (Omega)*
