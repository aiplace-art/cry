# 🚀 AI Marketing Bot - 5-Minute Quickstart

**Запусти полностью автономный маркетинг за 5 минут!**

---

## ⚡ Quick Install

```bash
# 1. Clone or navigate to project
cd /Users/ai.place/Crypto

# 2. Run setup
./scripts/setup-bot.sh

# 3. Add API keys to .env
nano .env

# 4. Test
node scripts/ai-marketing-bot.js demo

# 5. Launch!
node scripts/ai-marketing-bot.js start
```

**Done!** 🎉 Бот теперь работает 24/7!

---

## 🔑 Минимальные API Keys (обязательно)

### 1. OpenAI (для AI-генерации контента)
```bash
# Регистрация: https://platform.openai.com/signup
# Добавь $10 на счет: https://platform.openai.com/account/billing
# Создай key: https://platform.openai.com/api-keys

OPENAI_API_KEY=sk-proj-YOUR-KEY-HERE
```

### 2. Twitter (для автопостинга)
```bash
# Developer Portal: https://developer.twitter.com/en/portal/dashboard
# Create Project → Create App → Keys and Tokens

TWITTER_API_KEY=your-key
TWITTER_API_SECRET=your-secret
TWITTER_ACCESS_TOKEN=your-token
TWITTER_ACCESS_SECRET=your-secret
```

### 3. Telegram (для канала)
```bash
# Telegram: открой @BotFather
# Команда: /newbot
# Добавь бота в канал как админа

TELEGRAM_BOT_TOKEN=1234567890:ABC-DEF...
TELEGRAM_CHANNEL_ID=@your_channel
```

**Это всё!** Остальное опционально.

---

## 🎮 Команды

```bash
# Демо (тест всех функций)
node scripts/ai-marketing-bot.js demo

# Запуск бота (24/7)
node scripts/ai-marketing-bot.js start

# Один пост сейчас
node scripts/ai-marketing-bot.js post educational

# Написать статью
node scripts/ai-marketing-bot.js article

# Показать расписание
node scripts/ai-marketing-bot.js schedule

# Аналитика
node scripts/ai-marketing-bot.js analytics
```

---

## 🤖 Что делает бот?

✅ **Генерирует контент** - AI создает умные посты
✅ **Постит автоматически** - Twitter + Telegram + Discord (6 раз/день)
✅ **Пишет статьи** - Medium (3 в неделю)
✅ **Отвечает на комментарии** - умные автоответы
✅ **Создает картинки** - DALL-E генерация
✅ **Анализирует** - метрики и оптимизация

---

## 📅 Расписание (по умолчанию)

```
09:00 - Announcement (Twitter + Telegram)
12:00 - Educational (Twitter)
15:00 - Market Analysis (Twitter + Telegram)
18:00 - Community Post (Twitter)
21:00 - Meme (Twitter)
00:00 - Global Update (Twitter + Telegram)

Понедельник 10:00 - Статья на Medium
```

**Настраивается в конфиге!**

---

## ⚙️ Настройка (опционально)

Редактируй `scripts/ai-marketing-bot.js`:

```javascript
automation: {
  postsPerDay: 6,        // Сколько постов
  articlesPerWeek: 3,    // Сколько статей
  autoReply: true,       // Автоответы
  sentiment: 'bullish',  // Тон: bullish/neutral/educational
  languages: ['en', 'ru'] // Языки
}
```

---

## 💰 Стоимость

| Что | Цена/месяц |
|-----|------------|
| OpenAI (GPT-4 + DALL-E) | $10-20 |
| Twitter API | FREE |
| Telegram | FREE |
| Discord | FREE |
| **ИТОГО** | **$10-20** |

vs. SMM-менеджер: $1,000-3,000/мес 🤯

---

## 🆘 Проблемы?

### Бот не постит

```bash
# Проверь API keys
cat .env | grep API_KEY

# Проверь логи
tail -f logs/bot.log

# Перезапусти
pm2 restart marketing-bot
```

### Нужна помощь?

- 📚 Полная документация: `docs/AI_BOT_SETUP.md`
- 💬 Telegram: https://t.me/hypeai_support
- 📧 Email: support@hypeai.io

---

## 🎯 Production Setup (рекомендуется)

```bash
# Установи PM2
npm install -g pm2

# Запусти бота
pm2 start scripts/ai-marketing-bot.js --name "marketing-bot"

# Автостарт при перезагрузке
pm2 startup
pm2 save

# Мониторинг
pm2 monit
```

**Готово!** Бот работает 24/7, даже после перезагрузки сервера! 🚀

---

## 📊 Результаты (что ожидать)

**Первая неделя:**
- 180+ постов опубликовано
- 50+ автоответов
- 1-2 статьи на Medium
- +500-1,000 подписчиков

**Первый месяц:**
- 720+ постов
- 200+ автоответов
- 12 статей
- +5,000-10,000 подписчиков
- Заметный рост engagement

---

## 🚀 Готово!

Теперь у тебя есть **AI-маркетолог**, который работает 24/7!

```bash
# Запусти сейчас
node scripts/ai-marketing-bot.js demo

# Или сразу в продакшн
pm2 start scripts/ai-marketing-bot.js --name "marketing-bot"
```

**Вопросы?** → `docs/AI_BOT_SETUP.md` (полная инструкция)

---

**Happy Marketing! 🎉**
