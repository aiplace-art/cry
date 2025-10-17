# 🚀 hypeai.agency - Полная Инструкция по Setup

**Домен:** hypeai.agency
**Стоимость:** ~800-900₽/год (REG.RU)
**Время setup:** 30-60 минут

---

## 📋 Что будет в результате

- ✅ https://hypeai.agency (рабочий сайт)
- ✅ hello@hypeai.agency (email forwarding)
- ✅ SSL автоматически
- ✅ CDN и DDOS защита
- ✅ Бесплатный хостинг

**Стоимость:** ~800₽/год (только домен!)

---

## 🛒 ШАГ 1: Покупка на REG.RU (10 минут)

### 1.1 Поиск домена

**Открой REG.RU:**
```
https://www.reg.ru/domain/new/hypeai.agency
```

**Проверь доступность:**
- Если свободен → "В корзину"
- Если занят → пиши мне (найдём альтернативу)

### 1.2 Корзина - ВАЖНО!

**В корзине УБЕРИ все галочки:**

❌ **SSL-сертификат** - НЕ нужен (будет бесплатно от Vercel)
❌ **Почта на домене** - НЕ нужна (будет бесплатно от Cloudflare)
❌ **Хостинг** - НЕ нужен (будет бесплатно Vercel)
❌ **Защита домена** - НЕ нужна
❌ **Конструктор сайтов** - НЕ нужен

**Оставь ТОЛЬКО:**
✅ **Домен hypeai.agency** - 1 год

### 1.3 Оформление заказа

1. **Регистрация/Вход:**
   - Если есть аккаунт → войди
   - Если нет → зарегистрируйся (email + пароль)

2. **Контактные данные:**
   - ФИО (любые)
   - Email (рабочий - туда придут доступы)
   - Телефон

3. **Оплата:**
   - Банковская карта
   - Или другой удобный способ

4. **Подтверждение:**
   - Оплати
   - Получишь email с подтверждением

**Готово! Домен твой!** ✅

---

## 🌐 ШАГ 2: Setup Cloudflare (15 минут)

**Зачем:** Бесплатный CDN, SSL, email, DDOS защита

### 2.1 Регистрация Cloudflare

1. **Открой:**
   ```
   https://dash.cloudflare.com/sign-up
   ```

2. **Создай аккаунт:**
   - Email
   - Password
   - Verify email

### 2.2 Добавить сайт

1. **"Add a Site"**

2. **Введи домен:**
   ```
   hypeai.agency
   ```

3. **Выбери план:**
   - **Free** (бесплатный) ✅
   - Continue

4. **DNS сканирование:**
   - Cloudflare найдёт существующие записи
   - Continue

### 2.3 Изменить Nameservers

**Cloudflare покажет 2 nameserver:**
```
amy.ns.cloudflare.com
john.ns.cloudflare.com
```
(Твои будут другие - скопируй их!)

**Теперь иди в REG.RU:**

1. **Личный кабинет:** https://www.reg.ru/user/account/

2. **Мои домены** → найди `hypeai.agency`

3. **Управление доменом** → "DNS-серверы и зона"

4. **Изменить DNS-серверы:**
   - Выбери "Использовать другие DNS-серверы"
   - DNS1: `amy.ns.cloudflare.com` (или твой 1-й)
   - DNS2: `john.ns.cloudflare.com` (или твой 2-й)
   - Сохранить

5. **Подожди 5-30 минут** (DNS propagation)

6. **Вернись в Cloudflare:**
   - Нажми "Done, check nameservers"
   - Cloudflare проверит и активирует

**Получишь email: "Cloudflare is now active for hypeai.agency"** ✅

### 2.4 Настройка SSL в Cloudflare

1. **В Cloudflare Dashboard:**
   - SSL/TLS → Overview

2. **Выбери режим:**
   - **Full (strict)** ✅
   - Save

**Готово! SSL готов к работе!** ✅

---

## 📧 ШАГ 3: Email Routing в Cloudflare (5 минут)

**Настроим hello@hypeai.agency → твой Gmail**

### 3.1 Enable Email Routing

1. **В Cloudflare Dashboard:**
   - Email → Email Routing

2. **Enable Email Routing:**
   - Get started
   - Enable

3. **DNS записи создадутся автоматически** ✅

### 3.2 Добавить destination email

1. **Destination addresses:**
   - Add destination address

2. **Введи свой личный email:**
   - Например: `yourname@gmail.com`
   - Save

3. **Проверь email:**
   - На твой Gmail придёт письмо
   - Нажми "Verify"

### 3.3 Create routing rules

1. **Routing rules:**
   - Create address

2. **Custom address:**
   - Custom address: `hello@hypeai.agency`
   - Action: Send to → твой Gmail
   - Save

3. **Создай ещё адреса (опционально):**
   - `support@hypeai.agency` → твой Gmail
   - `info@hypeai.agency` → твой Gmail

**Готово! Email работает!** ✅

**Теперь письма на hello@hypeai.agency будут приходить на твой Gmail!**

---

## 🚀 ШАГ 4: Deploy на Vercel (15 минут)

**Vercel = бесплатный хостинг для сайта**

### 4.1 Регистрация Vercel

1. **Открой:**
   ```
   https://vercel.com/signup
   ```

2. **Sign up with GitHub:**
   - Авторизуйся через GitHub (проще всего)
   - Или с Email

### 4.2 Import проект

**Если код НЕ на GitHub:**

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **В папке проекта:**
   ```bash
   cd /Users/ai.place/Crypto/src/frontend
   vercel login
   ```

3. **Login:**
   - Откроется браузер
   - Подтверди вход

4. **Deploy:**
   ```bash
   vercel
   ```

5. **Следуй инструкциям:**
   - Setup and deploy: **Yes**
   - Which scope: (выбери свой аккаунт)
   - Link to existing project: **No**
   - Project name: `hypeai`
   - Directory: `./` (нажми Enter)
   - Override settings: **No**

6. **Готово!** Vercel покажет URL:
   ```
   https://hypeai-xyz123.vercel.app
   ```

**Сайт работает!** ✅

### 4.3 Подключить домен

**В Vercel Dashboard:**

1. **Открой проект:** https://vercel.com/dashboard

2. **Settings → Domains**

3. **Add Domain:**
   - Введи: `hypeai.agency`
   - Add

4. **Vercel покажет DNS записи:**

   **A Record:**
   ```
   Type: A
   Name: @
   Value: 76.76.21.21
   ```

   **CNAME Record:**
   ```
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```

5. **Иди в Cloudflare:**

   **DNS → Records → Add record:**

   **Запись 1 (A record):**
   - Type: **A**
   - Name: **@**
   - IPv4 address: **76.76.21.21**
   - Proxy status: **Proxied** (оранжевое облако) ✅
   - Save

   **Запись 2 (CNAME):**
   - Type: **CNAME**
   - Name: **www**
   - Target: **cname.vercel-dns.com**
   - Proxy status: **Proxied** (оранжевое облако) ✅
   - Save

6. **Вернись в Vercel:**
   - Подожди 1-5 минут
   - Vercel проверит DNS
   - Статус изменится: **Valid Configuration** ✅

7. **Подожди SSL (5-10 минут):**
   - SSL сертификат создаётся автоматически
   - Увидишь: "SSL Certificate: Valid" ✅

**Готово! Сайт работает на https://hypeai.agency!** 🎉

---

## ✅ ШАГ 5: Проверка (5 минут)

### 5.1 Проверь сайт

1. **Открой браузер:**
   ```
   https://hypeai.agency
   ```

2. **Что должно быть:**
   - ✅ Сайт открывается
   - ✅ Зелёный замочек (SSL работает)
   - ✅ Быстрая загрузка
   - ✅ Без ошибок

### 5.2 Проверь www

```
https://www.hypeai.agency
```

- ✅ Должен redirect на hypeai.agency

### 5.3 Проверь email

1. **Отправь тестовое письмо:**
   - С любой почты
   - На: `hello@hypeai.agency`

2. **Проверь Gmail:**
   - Через 1-2 минуты должно прийти письмо
   - From: отправитель
   - To: hello@hypeai.agency

**Если всё работает - SUCCESS!** 🎉

---

## 📊 Что получилось

| Что | Статус | Стоимость |
|-----|--------|-----------|
| **Домен** | ✅ hypeai.agency | 800₽/год |
| **SSL** | ✅ https:// работает | 0₽ |
| **Хостинг** | ✅ Vercel unlimited | 0₽ |
| **Email** | ✅ hello@hypeai.agency | 0₽ |
| **CDN** | ✅ Cloudflare global | 0₽ |
| **DDOS защита** | ✅ Cloudflare | 0₽ |
| **Auto-deploy** | ✅ При git push | 0₽ |
| **ИТОГО** | | **800₽/год** |

---

## 🔄 ШАГ 6: Обновить проект (5 минут)

### 6.1 Обновить документацию

**Файлы для обновления:**

1. **README.md:**
   ```markdown
   Website: https://hypeai.agency
   ```

2. **package.json:**
   ```json
   "homepage": "https://hypeai.agency"
   ```

3. **pump.fun (когда создашь токен):**
   - Website: https://hypeai.agency

### 6.2 Обновить социалки (когда создашь)

**Twitter bio:**
```
15 AI Agents building the future
🌐 hypeai.agency
```

**Telegram description:**
```
Official HypeAI Community
Website: hypeai.agency
```

---

## 🆘 Troubleshooting

### Сайт не открывается

**Причина:** DNS ещё не обновился

**Решение:**
- Подожди 30-60 минут
- Проверь DNS: https://dnschecker.org/#A/hypeai.agency
- Если не помогло - проверь Cloudflare DNS записи

### SSL не работает (красный замочек)

**Причина:** SSL ещё создаётся

**Решение:**
- Подожди 10-30 минут
- В Cloudflare: SSL/TLS → убедись что "Full (strict)"
- В Vercel: Settings → Domains → проверь статус

### Email не приходит

**Причина:** Email routing не активирован

**Решение:**
1. Cloudflare → Email → проверь Status: Active
2. Проверь destination email подтверждён
3. Проверь spam/junk folder в Gmail

### www не работает

**Причина:** CNAME запись не создана

**Решение:**
- Cloudflare → DNS → проверь CNAME для www
- Target должен быть: cname.vercel-dns.com

---

## 📞 Следующие шаги

**После успешного setup:**

1. ✅ Домен работает
2. ✅ Email работает
3. ✅ SSL активен

**Теперь можно:**
- Создать Twitter с ссылкой на hypeai.agency
- Создать Telegram с доменом в bio
- Запускать pump.fun токен!

---

## 💡 Pro Tips

**Cloudflare настройки:**

1. **Speed → Optimization:**
   - Auto Minify: On (JS, CSS, HTML)
   - Brotli: On

2. **Caching → Configuration:**
   - Caching Level: Standard

3. **Firewall:**
   - Включи "Under Attack Mode" если будет DDOS

**Vercel настройки:**

1. **Settings → Environment Variables:**
   - Добавь переменные окружения если нужно

2. **Settings → Git:**
   - Auto-deploy при push в main branch

---

## 🎉 Готово!

**Время setup:** 30-60 минут
**Стоимость:** 800₽/год
**Результат:** Профессиональный сайт + email ✅

**Следующий шаг:** pump.fun launch! 🚀

Если застрянешь на любом шаге - пиши, помогу! 💪
