# 🚂 Railway.app Quickstart - 5 минут до деплоя!

## ✅ ШАГ 1: Закоммитить изменения (1 мин)

```bash
# В терминале выполни:
cd /Users/ai.place/Crypto

# Добавить файлы
git add Procfile docs/deployment/ scripts/cron-twitter.sh

# Закоммитить
git commit -m "Add Railway deployment config"

# Отправить в GitHub (если репозиторий приватный - это безопасно)
git push origin variant-2-website
```

## ✅ ШАГ 2: Зарегистрироваться на Railway (1 мин)

1. Открой: **https://railway.app**
2. Нажми **"Login with GitHub"**
3. Разреши доступ

## ✅ ШАГ 3: Создать проект (1 мин)

1. Нажми **"New Project"**
2. Выбери **"Deploy from GitHub repo"**
3. Найди и выбери репозиторий **"Crypto"**
4. Выбери ветку **"variant-2-website"**
5. Нажми **"Deploy"**

## ✅ ШАГ 4: Добавить переменные окружения (2 мин)

1. В проекте нажми на сервис (он появится автоматически)
2. Перейди во вкладку **"Variables"**
3. Нажми **"+ New Variable"**
4. Добавь по одной:

```
TWITTER_API_KEY
fNfTLRfg9PwGVDkqBk13lBlNv

TWITTER_API_SECRET
7Y8MQ9ROX6u1ErY22BaOyw25IotcWaHitddQepUO5LNnpghXL7

TWITTER_ACCESS_TOKEN
1390354277353336836-nBCyDadSN4I06THZHtR3DgK2QqD0Rc

TWITTER_ACCESS_TOKEN_SECRET
E1nuYmpAqdEfcm8ybOr5i3BcKM3IRqMU9PMfkK0CHgbPs

NODE_ENV
production

TZ
Europe/Moscow
```

## ✅ ШАГ 5: Настроить Cron Job (1 мин)

1. Во вкладке **"Settings"**
2. Прокрутить до **"Cron"**
3. Нажать **"+ Add Cron Job"**
4. Заполнить:
   - **Name:** Twitter Posting
   - **Schedule:** `0 8-22 * * *` (каждый час с 8 до 22)
   - **Command:** `node scripts/twitter-scheduler.js`
5. Нажать **"Add"**

## 🎉 ГОТОВО!

Теперь система работает 24/7!

### 📊 Как проверить что работает:

1. Открой вкладку **"Deployments"** - там должно быть "Success ✓"
2. Открой вкладку **"Logs"** - увидишь логи запуска
3. Жди следующего часа (8, 9, 10... до 22) - пост опубликуется автоматически!

### 🔍 Просмотр логов:

```
Railway Dashboard → твой проект → Logs
```

Там увидишь:
```
✅ IN SCHEDULED WINDOW
🚀 EXECUTING AUTO-POSTER
✅ Posted successfully!
Tweet ID: 1234567890
```

### ⚠️ Если что-то не работает:

1. **Проверь Variables** - все 6 переменных должны быть добавлены
2. **Проверь Logs** - там будет видно ошибки
3. **Проверь Cron** - должна быть задача с расписанием `0 8-22 * * *`

---

## 💰 Стоимость:

- **Бесплатно:** 500 часов/месяц (~20 дней работы)
- **Hobby plan:** $5/мес для unlimited hours

## 🎯 Что дальше:

Система готова! Посты будут публиковаться автоматически каждый час с 8 утра до 10 вечера (МСК).

Можешь закрыть Mac и забыть - всё работает в облаке! 🚀
