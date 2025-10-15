# 🤖 AI Marketing Bot - Complete Setup Guide

**Полностью автономная система для маркетинга криптопроекта**

Просто добавь API ключи → Бот делает всё сам! 🚀

---

## 🎯 Что умеет бот?

✅ **Генерирует контент** - тексты, картинки, статьи с помощью AI
✅ **Постит автоматически** - Twitter, Telegram, Discord (6+ раз в день)
✅ **Пишет статьи** - Medium, Mirror.xyz (3 статьи в неделю)
✅ **Отвечает на комментарии** - автоматические умные ответы
✅ **Создает изображения** - DALL-E, Stable Diffusion
✅ **Анализирует** - метрики, engagement, оптимизация
✅ **Работает 24/7** - без вмешательства человека

---

## 📋 Что нужно (API ключи)

### 1️⃣ **OpenAI API** (Главный - обязательно!)

**Для чего:** Генерация текстов (GPT-4) + картинок (DALL-E 3)

**Как получить:**
1. Регистрация: https://platform.openai.com/signup
2. Добавь $10-20 на баланс: https://platform.openai.com/account/billing
3. Создай API key: https://platform.openai.com/api-keys
4. Скопируй ключ (начинается с `sk-proj-...`)

**Цена:** ~$10-20/месяц (6 постов в день)

```bash
# Добавь в .env
OPENAI_API_KEY=sk-proj-YOUR-KEY-HERE
```

---

### 2️⃣ **Twitter API** (Обязательно!)

**Для чего:** Автоматический постинг в Twitter

**Как получить:**
1. Регистрация: https://developer.twitter.com/en/portal/dashboard
2. Create Project → Create App
3. User authentication settings → Read and Write
4. Keys and tokens → Generate (API Key, Secret, Access Token, Access Secret)

**Цена:** БЕСПЛАТНО (Essential access)

```bash
# Добавь в .env
TWITTER_API_KEY=your-key
TWITTER_API_SECRET=your-secret
TWITTER_ACCESS_TOKEN=your-token
TWITTER_ACCESS_SECRET=your-secret
TWITTER_BEARER_TOKEN=your-bearer
```

**Видео-инструкция:** https://www.youtube.com/watch?v=... (TODO)

---

### 3️⃣ **Telegram Bot** (Обязательно!)

**Для чего:** Постинг в Telegram канал/группу

**Как получить:**
1. Открой Telegram
2. Найди @BotFather
3. Отправь `/newbot`
4. Следуй инструкциям (название бота)
5. Скопируй токен (выглядит как `1234567890:ABCdef...`)
6. Добавь бота в свой канал как админа

**Как получить Channel ID:**
```bash
# Способ 1: Отправь сообщение в канал, потом:
curl https://api.telegram.org/bot<TOKEN>/getUpdates

# Способ 2: Используй @userinfobot
```

**Цена:** БЕСПЛАТНО

```bash
# Добавь в .env
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHI...
TELEGRAM_CHANNEL_ID=@your_channel  # или -1001234567890
```

---

### 4️⃣ **Discord Webhook** (Рекомендуется)

**Для чего:** Постинг в Discord сервер

**Как получить:**
1. Открой Discord сервер (где ты админ)
2. Server Settings → Integrations
3. Webhooks → New Webhook
4. Выбери канал (#announcements)
5. Copy Webhook URL

**Цена:** БЕСПЛАТНО

```bash
# Добавь в .env
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/1234.../abc123...
```

---

### 5️⃣ **Medium API** (Опционально)

**Для чего:** Публикация статей на Medium

**Как получить:**
1. Войди на Medium.com
2. Settings → Integration tokens
3. Create new token
4. Копируй токен

**Цена:** БЕСПЛАТНО

```bash
# Добавь в .env
MEDIUM_API_TOKEN=your-integration-token
```

---

## 🚀 Установка и Запуск

### Шаг 1: Установи зависимости

```bash
cd /Users/ai.place/Crypto

# Установка Node.js пакетов
npm install openai axios dotenv twitter-api-v2 node-telegram-bot-api

# Или используй yarn
yarn add openai axios dotenv twitter-api-v2 node-telegram-bot-api
```

### Шаг 2: Настрой .env файл

```bash
# Копируй example
cp .env.example .env

# Открой в редакторе
nano .env
# или
code .env
```

**Добавь минимум эти ключи:**
```bash
OPENAI_API_KEY=sk-proj-...
TWITTER_API_KEY=...
TWITTER_API_SECRET=...
TWITTER_ACCESS_TOKEN=...
TWITTER_ACCESS_SECRET=...
TWITTER_BEARER_TOKEN=...
TELEGRAM_BOT_TOKEN=1234567890:ABC...
TELEGRAM_CHANNEL_ID=@your_channel
```

### Шаг 3: Тестовый запуск (Demo)

```bash
# Запусти демо
node scripts/ai-marketing-bot.js demo
```

**Что произойдет:**
- ✅ Сгенерирует 3 поста для Twitter
- ✅ Сгенерирует пост для Telegram
- ✅ Напишет полную статью для Medium
- ✅ Покажет примеры авто-ответов
- ✅ Выведет dashboard с аналитикой

**Если всё работает → переходи к шагу 4!**

### Шаг 4: Запуск в Production (24/7)

**Вариант А: Простой запуск (foreground)**
```bash
node scripts/ai-marketing-bot.js start
```

**Вариант Б: Background с nohup**
```bash
nohup node scripts/ai-marketing-bot.js start > marketing-bot.log 2>&1 &

# Проверить процесс
ps aux | grep ai-marketing-bot

# Остановить
kill <PID>
```

**Вариант В: PM2 (рекомендуется) 🔥**
```bash
# Установи PM2
npm install -g pm2

# Запуск
pm2 start scripts/ai-marketing-bot.js --name "marketing-bot"

# Посмотреть логи
pm2 logs marketing-bot

# Остановить
pm2 stop marketing-bot

# Перезапустить
pm2 restart marketing-bot

# Автозапуск при reboot
pm2 startup
pm2 save
```

---

## 📅 Как работает расписание?

Бот автоматически постит по расписанию:

```
09:00 - Announcement post (Twitter + Telegram)
12:00 - Educational post (Twitter)
15:00 - Market analysis (Twitter + Telegram)
18:00 - Community engagement (Twitter)
21:00 - Meme post (Twitter)
00:00 - Global community post (Twitter + Telegram)
```

**Плюс:**
- 🔄 Авто-ответы на комментарии (24/7)
- 📰 Статья на Medium каждый понедельник в 10:00
- 📊 Обновление аналитики каждый час

---

## 🎛️ Настройка поведения бота

Редактируй `scripts/ai-marketing-bot.js`:

```javascript
// Найди CONFIG.automation
automation: {
  postsPerDay: 6,            // Количество постов в день
  articlesPerWeek: 3,        // Статей в неделю
  imagesPerPost: 1,          // Картинок на пост
  autoReply: true,           // Авто-ответы вкл/выкл
  sentiment: 'bullish',      // Тон: bullish, neutral, educational
  languages: ['en', 'ru'],   // Языки
  timezone: 'UTC'            // Часовой пояс
}
```

**Изменил настройки? Перезапусти бота:**
```bash
pm2 restart marketing-bot
```

---

## 📊 Мониторинг и Аналитика

### Команды

```bash
# Показать аналитику
node scripts/ai-marketing-bot.js analytics

# Показать расписание
node scripts/ai-marketing-bot.js schedule

# Показать конфиг
node scripts/ai-marketing-bot.js config

# Ручной пост (тестирование)
node scripts/ai-marketing-bot.js post educational
```

### Web Dashboard (TODO)

```bash
# Запуск web-интерфейса
npm run dashboard

# Открой http://localhost:3000
```

**Dashboard покажет:**
- 📊 Посты сегодня / за неделю / за месяц
- 📈 Рост подписчиков по платформам
- 💬 Engagement (лайки, ретвиты, комментарии)
- 🎯 Самые успешные посты
- ⚠️ Ошибки и предупреждения
- 💰 Стоимость API calls

---

## 💰 Расходы (ежемесячно)

| Сервис | Стоимость | Описание |
|--------|-----------|----------|
| **OpenAI GPT-4** | $5-10 | Генерация текстов |
| **DALL-E 3** | $5-10 | Генерация изображений |
| **Twitter API** | FREE | Постинг (Essential) |
| **Telegram Bot** | FREE | Постинг |
| **Discord** | FREE | Webhooks |
| **Medium** | FREE | Публикация статей |
| **Сервер** | $5-20 | VPS (DigitalOcean/Hetzner) |
| **ИТОГО** | **$15-40** | **Полностью автономный маркетинг!** |

**Для сравнения:**
- SMM-менеджер: $1,000-3,000/месяц
- Копирайтер: $500-1,500/месяц
- Дизайнер: $500-1,000/месяц

**Экономия: 97%** 🤯

---

## 🎯 Примеры контента

### Twitter Post (Educational)
```
💡 How HypeAI AI Works:

Our ML models analyze:
📊 Price patterns
📈 Volume trends
🐦 Social sentiment
📰 News impact

→ Generates accurate predictions
→ You make smarter trades

Simple as that! 🧠

#DeFi #AI #CryptoEducation
```

### Telegram Update
```
📢 **HypeAI Update**

We're excited to announce new developments:

✅ Smart contract upgrades deployed
✅ New staking tier added (47% APY)
✅ Partnership with major DeFi protocol
✅ Mobile app beta testing starts

Thank you for your continued support! 🚀

https://hypeai.io

$HYPE #DeFi #Crypto
```

### Medium Article
```
# HypeAI: Revolutionizing DeFi with Artificial Intelligence

How machine learning and blockchain technology are coming together
to create the future of decentralized finance...

[8-minute read, 2,500+ words, SEO-optimized]
```

---

## 🛠️ Troubleshooting

### Бот не постит в Twitter

**Проблема:** `Error: 401 Unauthorized`

**Решение:**
1. Проверь API ключи в .env
2. Убедись, что у app есть Read and Write permissions
3. Regenerate Access Token and Secret
4. Перезапусти бота

```bash
# Тест Twitter API
curl -X GET "https://api.twitter.com/2/users/me" \
  -H "Authorization: Bearer $TWITTER_BEARER_TOKEN"
```

### Бот не постит в Telegram

**Проблема:** `Error: 403 Forbidden`

**Решение:**
1. Убедись, что бот добавлен в канал как админ
2. Дай боту права на posting messages
3. Проверь правильность Channel ID (может быть @username или -100...)

```bash
# Тест Telegram Bot
curl "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/getMe"
```

### OpenAI возвращает ошибку

**Проблема:** `Error: Insufficient quota`

**Решение:**
1. Проверь баланс: https://platform.openai.com/account/billing
2. Добавь $10+ на аккаунт
3. Проверь rate limits (не больше 3 requests/minute на free tier)

### Бот падает после запуска

**Проблема:** Missing dependencies

**Решение:**
```bash
# Переустанови все зависимости
rm -rf node_modules package-lock.json
npm install

# Или установи вручную
npm install openai axios dotenv twitter-api-v2 node-telegram-bot-api
```

---

## 🚀 Продвинутые Фичи

### 1. Генерация Изображений

```bash
# Включи DALL-E генерацию
GENERATE_IMAGES=true

# Бот будет создавать картинки для каждого поста
```

### 2. Мультиязычность

```javascript
// В config
languages: ['en', 'ru', 'es', 'zh']

// Бот будет постить на всех языках
```

### 3. A/B Тестирование

```javascript
// Бот автоматически тестирует разные стили постов
// и выбирает самые эффективные
abTesting: true
```

### 4. Sentiment Analysis

```javascript
// Анализ настроений в комментариях
// Автоматическая адаптация тона
sentimentAnalysis: true
```

### 5. Influencer Monitoring

```javascript
// Отслеживание упоминаний от инфлюенсеров
// Автоматические умные ответы
influencerEngagement: true
```

---

## 📈 Оптимизация и Масштабирование

### Увеличь частоту постов

```javascript
automation: {
  postsPerDay: 12,  // С 6 до 12
  // Посты каждые 2 часа
}
```

### Добавь больше платформ

```javascript
// Instagram (через API)
// TikTok (через API)
// YouTube (community posts)
// LinkedIn
// Reddit
```

### Мультиаккаунты

```bash
# Запусти несколько ботов с разными .env
pm2 start ai-marketing-bot.js --name "bot-english" -- start
pm2 start ai-marketing-bot.js --name "bot-russian" -- start
```

---

## 🔒 Безопасность

### Best Practices

1. **Никогда не коммить .env в Git**
```bash
# Добавь в .gitignore
echo ".env" >> .gitignore
```

2. **Используй переменные окружения на сервере**
```bash
# На production сервере
export OPENAI_API_KEY=sk-proj-...
export TWITTER_API_KEY=...
```

3. **Ротация ключей**
- Меняй API ключи каждые 90 дней
- Используй разные ключи для dev/production

4. **Rate Limiting**
```javascript
// Встроенная защита от бана
rateLimits: {
  twitter: { max: 50, window: '15m' },
  telegram: { max: 30, window: '1s' }
}
```

5. **Мониторинг аномалий**
- Настрой алерты на Sentry/LogRocket
- Email уведомления при ошибках

---

## 📞 Поддержка

### Проблемы с настройкой?

1. **Проверь логи:**
```bash
pm2 logs marketing-bot --lines 100
```

2. **Github Issues:**
https://github.com/hypeai/marketing-bot/issues

3. **Telegram Support:**
https://t.me/hypeai_support

4. **Email:**
support@hypeai.io

---

## 🎉 Готово!

Теперь у тебя есть **полностью автономный AI маркетинг-бот**, который:

✅ Постит 6+ раз в день
✅ Пишет статьи
✅ Отвечает на комментарии
✅ Создает картинки
✅ Анализирует метрики
✅ Работает 24/7

**Всё что нужно делать тебе:** Мониторить dashboard раз в день! 📊

---

## 🚀 Что дальше?

1. **Запусти демо** - протестируй все фичи
2. **Добавь API ключи** - настрой .env
3. **Запусти в production** - `pm2 start`
4. **Мониторь результаты** - смотри аналитику
5. **Оптимизируй** - подстраивай под аудиторию

**Вопросы? Напиши в Telegram: @hypeai_support**

---

**Последнее обновление:** 2025-10-15
**Версия:** 1.0.0
**Статус:** Production Ready ✅

🤖 **AI-Powered Marketing Made Easy!**
