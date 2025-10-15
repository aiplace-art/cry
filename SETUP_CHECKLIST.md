# ✅ HypeAI Telegram Bot - Setup Checklist

Выполните эти шаги по порядку:

## 1️⃣ Получите токен бота (✅ ГОТОВО)

- [x] Создали бота через @BotFather
- [x] Получили токен
- [x] Токен добавлен в `.env.telegram`

## 2️⃣ Установите зависимости (✅ ГОТОВО)

- [x] Node.js установлен
- [x] Зависимости установлены (`npm install`)

## 3️⃣ Получите Telegram IDs (⚠️ НУЖНО СДЕЛАТЬ)

### Как получить:

1. Откройте @userinfobot в Telegram
2. Добавьте его в канал → скопируйте Channel ID
3. Добавьте его в группу → скопируйте Group ID  
4. Напишите ему в личку → скопируйте Your User ID
5. Удалите бота из канала/группы

**📖 Подробная инструкция:** [GET_TELEGRAM_IDS.md](GET_TELEGRAM_IDS.md)

### Заполните в `scripts/.env.telegram`:

```bash
TELEGRAM_CHANNEL_ID=-100xxxxxxxxxx    # ← Вставьте ID канала
TELEGRAM_GROUP_ID=-100yyyyyyyyyyyy    # ← Вставьте ID группы
TELEGRAM_ADMIN_IDS=123456789          # ← Вставьте ваш User ID
```

- [ ] Channel ID получен и вставлен
- [ ] Group ID получен и вставлен
- [ ] Admin ID получен и вставлен

## 4️⃣ Сделайте бота админом (⚠️ НУЖНО СДЕЛАТЬ)

### В канале:

1. Откройте канал → Настройки → Администраторы
2. Добавить администратора → Найдите бота
3. Включите права:
   - [x] Post messages
   - [x] Delete messages
   - [x] Restrict members
   - [x] Pin messages
   - [x] Invite users via link
4. Сохранить

- [ ] Бот добавлен в канал как админ
- [ ] Все права включены

### В группе (если есть):

Повторите те же шаги для группы.

- [ ] Бот добавлен в группу как админ

## 5️⃣ Настройте социальные сети (опционально)

В `scripts/.env.telegram` обновите:

```bash
TASK_FOLLOW_TWITTER_HANDLE=@HypeAI_SOL
TASK_RETWEET_URL=https://twitter.com/HypeAI_SOL/status/...
TASK_JOIN_DISCORD_INVITE=https://discord.gg/...
```

- [ ] Twitter handle обновлен
- [ ] Retweet URL указан
- [ ] Discord invite обновлен

## 6️⃣ Запустите бота! 🚀

### Тестовый запуск:

```bash
./START_TELEGRAM_BOT.sh
```

Должно появиться:
```
🤖 HypeAI Telegram Bot started!
📊 Polling for updates...
✅ Bot is ready!
```

- [ ] Бот запустился без ошибок

### Production запуск (PM2):

```bash
pm2 start scripts/telegram-community-bot.js --name hypeai-bot
pm2 save
pm2 startup
```

- [ ] PM2 установлен
- [ ] Бот запущен через PM2
- [ ] Автозапуск настроен

## 7️⃣ Протестируйте команды

Откройте бота в Telegram и отправьте:

- [ ] `/start` - работает
- [ ] `/help` - показывает справку
- [ ] `/airdrop` - показывает задания
- [ ] `/referral` - показывает реф. ссылку
- [ ] `/price` - показывает цену (может быть ошибка если нет API)
- [ ] `/stats` - показывает статистику
- [ ] `/games` - показывает меню игр
- [ ] `/quiz` - запускает квиз

## 8️⃣ Проверьте автопостинг

Через 4 часа после запуска бот автоматически запостит первое сообщение.

Или проверьте логи:

```bash
pm2 logs hypeai-bot
```

- [ ] Автопостинг работает (видно в логах)

## 9️⃣ Проверьте модерацию

Попробуйте отправить 6+ сообщений подряд (превысить лимит 5 msg/min):

- [ ] Бот отправил предупреждение
- [ ] Спам-защита работает

## 🔟 Анализ и мониторинг

Отправьте боту (от админа):

```
/analytics
```

- [ ] Аналитика работает
- [ ] Данные сохраняются

```
/export json
```

- [ ] Экспорт работает

---

## ✅ Готово!

Если все пункты выполнены - **ваш бот полностью настроен!** 🎉

### Следующие шаги:

1. **Анонсируйте** бот в сообществе
2. **Мониторьте** аналитику
3. **Оптимизируйте** на основе данных
4. **Масштабируйте** по мере роста

---

## 📚 Полезные команды

```bash
# Статус бота
pm2 status hypeai-bot

# Логи
pm2 logs hypeai-bot

# Рестарт
pm2 restart hypeai-bot

# Остановка
pm2 stop hypeai-bot

# Мониторинг (CPU, RAM)
pm2 monit
```

---

## 🆘 Проблемы?

- 📖 Читайте [FAQ](docs/TELEGRAM_BOT_FAQ.md)
- 📖 Читайте [Quick Start](docs/TELEGRAM_QUICK_START.md)
- 📖 Читайте [Setup Guide](docs/TELEGRAM_BOT_SETUP.md)
- 📝 Проверяйте логи: `pm2 logs hypeai-bot --err`

---

*HypeAI Telegram Bot - Ready to launch! 🚀*
