# 🚀 Команды для деплоя на Vercel

## Статус подготовки
- ✅ Build успешен (0 ошибок)
- ✅ vercel.json настроен
- ✅ Environment variables добавлены
- ✅ Vercel CLI установлен (v48.3.0)
- ⏳ Требуется авторизация

---

## Вариант 1: Vercel CLI (быстро, 2 минуты)

### Шаг 1: Авторизация
```bash
cd /Users/ai.place/Crypto/src/frontend
vercel login
```

Откроется браузер → войдите через GitHub → вернитесь в терминал

### Шаг 2: Деплой
```bash
vercel --prod
```

Готово! Получите URL типа: `https://hypeai-solana.vercel.app`

---

## Вариант 2: Vercel Dashboard (проще, 3 минуты)

### Шаг 1: Создайте GitHub репозиторий
```bash
cd /Users/ai.place/Crypto

# Если git не инициализирован
git init

# Добавьте файлы
git add .
git commit -m "🚀 HypeAI Solana Launch - Ready for Vercel"

# Создайте репозиторий на github.com, затем:
git remote add origin https://github.com/ВАШ_USERNAME/hypeai.git
git push -u origin main
```

### Шаг 2: Импортируйте в Vercel
1. Откройте https://vercel.com/new
2. Войдите через GitHub
3. Выберите репозиторий `hypeai`
4. **Важно:** Root Directory = `src/frontend`
5. Нажмите "Deploy"

### Шаг 3: Настройте Environment Variables (опционально)
Settings → Environment Variables → Добавьте:
```
NEXT_PUBLIC_CHAIN_ID=97
NEXT_PUBLIC_NETWORK_NAME=Solana
NEXT_PUBLIC_PRESALE_CONTRACT=TBD
NEXT_PUBLIC_HYPEAI_TOKEN=TBD
```

---

## После деплоя

### Получите Production URL
Vercel покажет URL типа: `https://hypeai-solana-xyz123.vercel.app`

### Обновите боты
```bash
# 1. Обновите конфиг
nano /Users/ai.place/Crypto/src/bots/solana-bot-config.json

# Замените:
"website": "http://localhost:3000/presale"
# На:
"website": "https://hypeai-solana-xyz123.vercel.app/presale"

# 2. Перезапустите ботов
pkill -f telegram-bot
node /Users/ai.place/Crypto/src/bots/start-telegram-bot.js &
```

---

## Проверка после деплоя

### 1. Откройте сайт
```bash
open https://ваш-url.vercel.app/presale
```

### 2. Проверьте в браузере
- ✅ Страница загружается
- ✅ Анимации работают
- ✅ Countdown показывает корректную дату
- ✅ Ссылки на соцсети работают
- ✅ Mobile версия адаптивная

### 3. Проверьте логи
```bash
vercel logs
```

---

## Custom Domain (опционально)

Если есть свой домен (например, hypeai.com):

```bash
vercel domains add hypeai.com
```

Или в Dashboard:
Settings → Domains → Add Domain

Vercel даст DNS записи для вашего регистратора.

---

## Continuous Deployment

После первого деплоя:
```bash
# Любой push автоматически деплоит
git add .
git commit -m "Update content"
git push

# Vercel автоматически деплоит! 🎉
```

---

## Troubleshooting

### "Build failed"
```bash
# Проверьте локально
npm run build

# Если работает локально, проверьте Node version в Vercel
Settings → General → Node.js Version → 18.x
```

### "Module not found"
```bash
# Убедитесь что все зависимости установлены
cd /Users/ai.place/Crypto/src/frontend
npm install
git add package.json package-lock.json
git commit -m "Update dependencies"
git push
```

### "Environment variables не работают"
- Все переменные для Next.js должны начинаться с `NEXT_PUBLIC_`
- После добавления переменных: `vercel --prod` (redeploy)

---

## Полезные команды

```bash
# Статус деплоя
vercel ls

# Логи
vercel logs

# Алиасы (для custom domains)
vercel alias set hypeai-xyz123.vercel.app hypeai.com

# Rollback к предыдущей версии
vercel rollback

# Удалить проект
vercel remove hypeai-solana
```

---

## Следующие шаги после деплоя

1. ✅ Получите production URL
2. ✅ Обновите конфиги ботов
3. ✅ Перезапустите Telegram ботов
4. ✅ Протестируйте сайт на мобильных
5. ✅ Запустите Content Creator Bot
6. ✅ Запустите Mention Monitor Bot
7. ✅ Запустите Growth Hacker Bot
8. ✅ Создайте Twitter аккаунт @HypeAI_SOL
9. ✅ Создайте Telegram группу
10. ✅ Начните pre-launch маркетинг (7 дней)

---

**Выберите любой вариант и следуйте инструкциям! 🚀**
