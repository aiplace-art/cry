# 🚂 Railway.app Deployment - Twitter Auto-Poster

## 📋 Что нужно:
- GitHub аккаунт
- Railway.app аккаунт (бесплатно)
- 5 минут времени

## 🚀 Шаг 1: Подготовка проекта

```bash
# 1. Создать railway.json для настройки cron
cat > railway.json << 'EOF'
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "node scripts/cron-twitter.sh",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
EOF

# 2. Создать Procfile
cat > Procfile << 'EOF'
worker: node scripts/twitter-scheduler.js
EOF

# 3. Убедиться что package.json правильный
cat > package.json << 'EOF'
{
  "name": "hypeai-twitter-automation",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "start": "node scripts/twitter-scheduler.js"
  },
  "dependencies": {
    "twitter-api-v2": "^1.15.0",
    "canvas": "^2.11.2",
    "dotenv": "^16.3.1"
  }
}
EOF

# 4. Закоммитить изменения
git add .
git commit -m "Add Railway deployment config"
git push origin main
```

## 🚀 Шаг 2: Деплой на Railway

### Через Web UI:

1. **Зайти на railway.app:**
   - Регистрация через GitHub
   - Создать новый проект: "New Project"
   - Выбрать "Deploy from GitHub repo"
   - Выбрать репозиторий `Crypto`

2. **Настроить переменные окружения:**
   ```
   Variables → Add Variable:

   TWITTER_API_KEY=fNfTLRfg9PwGVDkqBk13lBlNv
   TWITTER_API_SECRET=7Y8MQ9ROX6u1ErY22BaOyw25IotcWaHitddQepUO5LNnpghXL7
   TWITTER_ACCESS_TOKEN=1390354277353336836-nBCyDadSN4I06THZHtR3DgK2QqD0Rc
   TWITTER_ACCESS_TOKEN_SECRET=E1nuYmpAqdEfcm8ybOr5i3BcKM3IRqMU9PMfkK0CHgbPs
   NODE_ENV=production
   TZ=Europe/Moscow
   ```

3. **Настроить Cron:**
   ```
   Settings → Cron Jobs → Add Cron Job

   Name: Twitter Posting
   Schedule: 0 8-22 * * *  (every hour 8am-10pm)
   Command: node scripts/twitter-scheduler.js
   ```

4. **Деплой:**
   - Нажать "Deploy"
   - Ждать ~2-3 минуты
   - ✅ Готово!

### Через Railway CLI (альтернатива):

```bash
# 1. Установить Railway CLI
npm install -g @railway/cli

# 2. Логин
railway login

# 3. Инициализация проекта
railway init

# 4. Добавить переменные
railway variables set TWITTER_API_KEY="fNfTLRfg9PwGVDkqBk13lBlNv"
railway variables set TWITTER_API_SECRET="7Y8MQ9ROX6u1ErY22BaOyw25IotcWaHitddQepUO5LNnpghXL7"
railway variables set TWITTER_ACCESS_TOKEN="1390354277353336836-nBCyDadSN4I06THZHtR3DgK2QqD0Rc"
railway variables set TWITTER_ACCESS_TOKEN_SECRET="E1nuYmpAqdEfcm8ybOr5i3BcKM3IRqMU9PMfkK0CHgbPs"
railway variables set TZ="Europe/Moscow"

# 5. Деплой
railway up
```

## 📊 Мониторинг

```bash
# Просмотр логов
railway logs

# Статус
railway status

# Перезапуск
railway restart
```

## 💰 Лимиты бесплатного tier:

- ⏰ **500 часов/месяц** (достаточно для 20 дней 24/7)
- 💾 **512 MB RAM**
- 🔄 **Unlimited deploys**
- 📊 **Metrics included**

## 🎯 Продакшн готово!

✅ Автоматические посты каждый час (8-22)
✅ Работает 24/7 без вашего участия
✅ Авто-деплой при push в GitHub
✅ Логи и мониторинг

---

## 🆙 Апгрейд на платный план ($5/мес):

- ⏰ **Unlimited hours**
- 💾 **8 GB RAM**
- 🚀 **Better performance**

```bash
railway subscription upgrade
```
