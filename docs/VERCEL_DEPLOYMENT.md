# 🚀 Deployment на Vercel - Полная Инструкция

## 📋 Что будет задеплоено

Твой обновленный **HypeAI Presale сайт** с:
- ✅ Solana launch страница
- ✅ "Why Solana First?" секция
- ✅ 15 AI агентов презентация
- ✅ Countdown до 15 ноября 2025
- ✅ Ссылки на Twitter, Telegram, pump.fun

---

## 🚀 Вариант 1: Через Vercel Dashboard (ПРОЩЕ - 5 минут)

### Шаг 1: Создай аккаунт на Vercel
1. Открой https://vercel.com
2. Нажми "Sign Up"
3. Войди через GitHub (рекомендуется)

### Шаг 2: Подключи GitHub репозиторий

**Если проект УЖЕ на GitHub:**
1. В Vercel нажми "Add New" → "Project"
2. Выбери свой репозиторий
3. Vercel автоматически определит Next.js
4. Нажми "Deploy"
5. Готово! 🎉

**Если проекта НЕТ на GitHub:**
Сначала запуши на GitHub:
```bash
cd /Users/ai.place/Crypto

# Инициализируй git (если еще не сделано)
git init

# Добавь все файлы
git add src/frontend

# Коммит
git commit -m "🚀 HypeAI Solana Launch - Ready for Vercel"

# Создай репозиторий на github.com, затем:
git remote add origin https://github.com/ТВОЙ_USERNAME/hypeai.git
git push -u origin main
```

Потом повтори шаги выше.

---

## 🚀 Вариант 2: Через Vercel CLI (БЫСТРЕЕ - 2 минуты)

### Шаг 1: Установи Vercel CLI
```bash
npm install -g vercel
```

### Шаг 2: Залогинься
```bash
vercel login
```

### Шаг 3: Деплой
```bash
cd /Users/ai.place/Crypto/src/frontend
vercel
```

Vercel спросит:
```
? Set up and deploy? [Y/n] Y
? Which scope? (выбери свой аккаунт)
? Link to existing project? [y/N] N
? What's your project's name? hypeai-solana
? In which directory is your code located? ./
```

Нажми Enter для всех defaults.

### Шаг 4: Production деплой
```bash
vercel --prod
```

Готово! Получишь URL типа: `https://hypeai-solana.vercel.app`

---

## ⚙️ Environment Variables (важно!)

После деплоя, добавь переменные окружения:

### В Vercel Dashboard:
1. Открой свой проект
2. Settings → Environment Variables
3. Добавь:

```
NEXT_PUBLIC_CHAIN_ID=97
NEXT_PUBLIC_NETWORK_NAME=Solana
NEXT_PUBLIC_PRESALE_CONTRACT=TBD_AFTER_LAUNCH
NEXT_PUBLIC_HYPEAI_TOKEN=TBD_AFTER_LAUNCH
```

Или через CLI:
```bash
vercel env add NEXT_PUBLIC_CHAIN_ID
# Введи: 97

vercel env add NEXT_PUBLIC_NETWORK_NAME
# Введи: Solana
```

---

## 🔧 Custom Domain (опционально)

### Добавить свой домен:

1. **В Vercel Dashboard:**
   - Settings → Domains
   - Добавь домен: `hypeai.com` (или свой)
   - Vercel даст DNS записи

2. **В регистраторе домена:**
   - Добавь A record: `76.76.21.21`
   - Добавь CNAME: `cname.vercel-dns.com`

3. **Подожди 24 часа** для propagation

---

## 🎯 После деплоя

### Обнови ссылки в Telegram боте:

```javascript
// В solana-bot-config.json
"links": {
  "website": "https://hypeai-solana.vercel.app",
  // или твой custom домен
  "twitter": "https://twitter.com/HypeAI_SOL",
  "telegram": "https://t.me/HypeAI_Community"
}
```

### Перезапусти ботов:
```bash
pkill -f telegram-bot
node /Users/ai.place/Crypto/src/bots/start-telegram-bot.js &
```

---

## 🐛 Troubleshooting

### "Build failed"
```bash
# Проверь что build работает локально
cd /Users/ai.place/Crypto/src/frontend
npm run build
```

Если локально работает, но на Vercel нет:
- Проверь Node version (должна быть 18+)
- Settings → General → Node.js Version → 18.x

### "Module not found"
Убедись что все зависимости в `package.json`:
```bash
cd /Users/ai.place/Crypto/src/frontend
npm install
```

### "Environment variables не работают"
- Все переменные для Next.js должны начинаться с `NEXT_PUBLIC_`
- После добавления переменных нужен redeploy: `vercel --prod`

---

## 📊 Monitoring

### Vercel Analytics (бесплатно):
1. Dashboard → Analytics
2. Видишь:
   - Visitors
   - Page views
   - Performance metrics

### Vercel Logs:
```bash
vercel logs
```

---

## 🚀 Continuous Deployment

После первого деплоя, каждый `git push` автоматически деплоит:
- `main` branch → Production
- Другие branches → Preview deployments

```bash
# Сделай изменения
git add .
git commit -m "Update content"
git push

# Автоматически деплоится на Vercel! 🎉
```

---

## 💡 Pro Tips

1. **Preview Deployments:**
   - Каждый PR создает preview URL
   - Тестируй перед мержем в production

2. **Rollback:**
   - Dashboard → Deployments
   - Выбери старую версию → "Promote to Production"

3. **Speed Optimization:**
   - Vercel автоматически оптимизирует images
   - Использует Edge Network (CDN)
   - Кэширование автоматическое

4. **Custom Headers:**
   Добавь в `vercel.json`:
   ```json
   {
     "headers": [
       {
         "source": "/(.*)",
         "headers": [
           {
             "key": "X-Frame-Options",
             "value": "DENY"
           }
         ]
       }
     ]
   }
   ```

---

## 📱 Mobile Preview

Проверь на мобильных:
1. Открой URL на телефоне
2. Или используй Chrome DevTools:
   - F12 → Toggle device toolbar (Ctrl+Shift+M)
   - Выбери iPhone/Android

---

## 🎉 Checklist перед Launch

- [ ] Build проходит локально
- [ ] Environment variables настроены
- [ ] Custom domain добавлен (если есть)
- [ ] Mobile version протестирована
- [ ] Links обновлены (Twitter, Telegram)
- [ ] Telegram боты обновлены с новым URL
- [ ] Analytics настроены
- [ ] SSL сертификат активен (Vercel делает автоматически)

---

## 🔗 Полезные ссылки

- [Vercel Dashboard](https://vercel.com/dashboard)
- [Vercel Docs](https://vercel.com/docs)
- [Next.js on Vercel](https://vercel.com/docs/frameworks/nextjs)
- [Domain Setup Guide](https://vercel.com/docs/concepts/projects/domains)

---

## 💰 Стоимость

- **Hobby Plan:** $0/месяц
  - 100 GB bandwidth
  - Unlimited websites
  - Automatic HTTPS
  - Идеально для старта!

- **Pro Plan:** $20/месяц
  - 1 TB bandwidth
  - Advanced analytics
  - Team features
  - Апгрейд когда нужно

---

**Готов деплоить? Используй Вариант 2 (CLI) для самого быстрого результата!** 🚀

Время от начала до live сайта: **2-3 минуты**! ⚡
