# 🚀 HypeAI Telegram Bot - Quick Start (5 минут)

## ✅ Токен уже настроен!

Ваш бот готов к запуску. Осталось несколько простых шагов.

---

## 📋 Шаг 1: Установите зависимости

```bash
npm install node-telegram-bot-api axios dotenv
```

---

## 📋 Шаг 2: Получите ID канала/группы

### Вариант A: Через @userinfobot

1. **Добавьте @userinfobot** в вашу группу/канал
2. Бот автоматически покажет ID (например: `-1001234567890`)
3. **Скопируйте ID** и вставьте в `scripts/.env.telegram`
4. **Удалите @userinfobot** из группы

### Вариант B: Через @getidsbot

1. **Перешлите любое сообщение** из вашего канала в @getidsbot
2. Бот покажет ID канала
3. **Скопируйте и вставьте** в конфиг

---

## 📋 Шаг 3: Получите свой User ID (для админ-прав)

1. **Напишите @userinfobot** в личку
2. Бот покажет ваш User ID (например: `123456789`)
3. **Вставьте в конфиг** `TELEGRAM_ADMIN_IDS`

---

## 📋 Шаг 4: Настройте .env.telegram

Отредактируйте `scripts/.env.telegram`:

```bash
# Замените эти значения на реальные:

TELEGRAM_CHANNEL_ID=@your_channel      # Ваш канал
TELEGRAM_GROUP_ID=-1001234567890       # ID группы от @userinfobot
TELEGRAM_ADMIN_IDS=123456789           # Ваш User ID

# Социальные сети:
TASK_FOLLOW_TWITTER_HANDLE=@HypeAI_SOL
TASK_RETWEET_URL=https://twitter.com/HypeAI_SOL/status/...
TASK_JOIN_DISCORD_INVITE=https://discord.gg/...
```

---

## 📋 Шаг 5: Сделайте бота админом

1. **Откройте ваш канал/группу** в Telegram
2. **Настройки** → **Администраторы** → **Добавить администратора**
3. **Найдите вашего бота** (имя из @BotFather)
4. **Включите права:**
   - ✅ Post messages
   - ✅ Delete messages
   - ✅ Restrict members
   - ✅ Pin messages
   - ✅ Invite users via link
5. **Сохраните**

---

## 🚀 Шаг 6: Запустите бота!

### Development (тест):

```bash
cd /Users/ai.place/Crypto
node scripts/telegram-community-bot.js
```

**Вы должны увидеть:**
```
🤖 HypeAI Telegram Bot started!
📊 Polling for updates...
✅ Bot is ready!
```

### Production (с PM2):

```bash
# Установить PM2 (если еще нет)
npm install -g pm2

# Запустить бота
pm2 start scripts/telegram-community-bot.js --name hypeai-bot

# Посмотреть статус
pm2 status

# Логи в реальном времени
pm2 logs hypeai-bot

# Автозапуск при перезагрузке
pm2 startup
pm2 save
```

---

## 🧪 Шаг 7: Протестируйте команды

Откройте вашего бота в Telegram и попробуйте:

```
/start
/help
/airdrop
/referral
/price
/stats
/games
/quiz
```

**Все команды должны работать!** ✅

---

## 📊 Что дальше?

### Настройте автопостинг

Бот автоматически постит контент каждые 4 часа. Проверьте через:

```bash
# В логах PM2 вы увидите:
pm2 logs hypeai-bot

# Строки типа:
# [AUTO-POST] Posted: 🚀 HypeAI News...
```

### Мониторинг

```bash
# Статус бота
pm2 status hypeai-bot

# Ресурсы (CPU, RAM)
pm2 monit

# Перезапуск
pm2 restart hypeai-bot

# Остановка
pm2 stop hypeai-bot
```

### Аналитика

В Telegram отправьте боту:
```
/analytics
```

Или экспортируйте данные:
```
/export json
```

---

## 🎮 Включите игры и квизы

В `scripts/.env.telegram` убедитесь:

```bash
FEATURE_GAMES=true
```

Затем перезапустите:

```bash
pm2 restart hypeai-bot
```

Теперь доступны команды:
- `/quiz` - Crypto Quiz
- `/predict` - Price Prediction
- `/daily` - Daily Challenge
- `/trivia crypto` - Trivia Contest
- `/games` - Меню игр

---

## 🔧 Частые проблемы

### Бот не отвечает?

```bash
# 1. Проверьте статус
pm2 status hypeai-bot

# 2. Проверьте логи
pm2 logs hypeai-bot --err

# 3. Перезапустите
pm2 restart hypeai-bot
```

### "Bot was blocked by user"?

- Пользователь должен **первым написать боту** (`/start`)
- Или добавьте бота в канал/группу как админа

### Задания не верифицируются?

- Убедитесь, что бот **админ** в канале
- Проверьте, что `TELEGRAM_CHANNEL_ID` правильный
- Пользователь должен **реально выполнить** задания

---

## 📈 Ожидаемые результаты

### День 1:
- ✅ Бот запущен
- ✅ Команды работают
- ✅ Автопостинг активен
- ✅ Первые пользователи присоединились

### Неделя 1:
- 📊 500-1,000 участников
- 🎁 50-100 airdrop завершений
- 🔗 200-300 рефералов

### Месяц 1:
- 📊 10,000+ участников
- 🎁 1,000+ airdrop
- 🔗 5,000+ рефералов
- 💬 80%+ engagement

---

## 🎯 Чеклист готовности

Убедитесь, что всё настроено:

- [ ] `npm install` выполнен
- [ ] `.env.telegram` заполнен
- [ ] Channel ID получен
- [ ] Group ID получен
- [ ] Admin ID получен
- [ ] Бот сделан админом в канале/группе
- [ ] Бот запущен (`pm2 start`)
- [ ] Команды `/start`, `/help` работают
- [ ] Автопостинг включен
- [ ] `.gitignore` обновлен (токен не в Git!)

---

## 📞 Нужна помощь?

### Документация:
- 📖 [Полное руководство](TELEGRAM_BOT_SETUP.md)
- 📝 [README](../scripts/README_TELEGRAM_BOT.md)
- ❓ [FAQ](TELEGRAM_BOT_FAQ.md)

### Проблемы?
- Проверьте логи: `pm2 logs hypeai-bot`
- Включите debug: `DEBUG=true` в `.env.telegram`
- Читайте FAQ: [TELEGRAM_BOT_FAQ.md](TELEGRAM_BOT_FAQ.md)

---

## 🎉 Готово!

Ваш Telegram бот полностью настроен и готов к работе!

**Что дальше?**
1. Протестируйте все команды
2. Пригласите первых участников
3. Мониторьте аналитику
4. Масштабируйте по мере роста

**Удачи! 🚀**

---

*Создано с помощью Claude Code - HypeAI Team*
