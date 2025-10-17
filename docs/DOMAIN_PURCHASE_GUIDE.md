# 🌐 Покупка hypeai.com - Пошаговая инструкция

## 🎯 Выбор регистратора

### 🥇 РЕКОМЕНДУЮ: Porkbun ($9/год - САМОЕ ДЕШЁВОЕ)

**Почему Porkbun:**
- ✅ **$9/год** - самая низкая цена
- ✅ Бесплатный SSL
- ✅ Бесплатный WHOIS privacy
- ✅ Простая регистрация
- ✅ Надёжный сервис

---

## 📝 Инструкция: Покупка на Porkbun (5-10 минут)

### Шаг 1: Открой Porkbun

**Прямая ссылка для покупки:**
```
https://porkbun.com/checkout/search?q=hypeai.com
```

### Шаг 2: Проверка доступности

1. Откроется страница с результатом поиска
2. Если домен **свободен** → увидишь цену (~$9)
3. Если **занят** → увидишь "Not Available" (тогда пиши мне)

### Шаг 3: Add to Cart

1. Нажми **"Add to Cart"** рядом с hypeai.com
2. Выбери срок:
   - **1 год: $9** ✅ (рекомендую для старта)
   - 2 года: $18
   - 5 лет: $45

### Шаг 4: Checkout

1. Нажми **"Checkout"** (справа вверху)
2. Создай аккаунт:
   - Email (важно - туда придут данные!)
   - Password
   - Confirm password
3. Нажми **"Create Account"**

### Шаг 5: Оплата

**Методы оплаты:**
- Credit/Debit Card ✅ (проще всего)
- PayPal
- Bitcoin (если есть)

**Заполни:**
1. Данные карты
2. Billing address (любой адрес)
3. Нажми **"Complete Purchase"**

### Шаг 6: Подтверждение

1. **Мгновенно** получишь email от Porkbun
2. В письме:
   - Подтверждение покупки
   - Login данные
   - Ссылка на управление доменом

**ГОТОВО! Домен твой!** ✅

---

## ⚙️ Шаг 7: Setup DNS (сразу после покупки)

**Опция A: Через Cloudflare (рекомендую - бесплатный CDN)**

1. Иди на Cloudflare:
   ```
   https://dash.cloudflare.com/sign-up
   ```

2. Создай аккаунт (бесплатно)

3. **"Add a Site"**
   - Введи: `hypeai.com`
   - Выбери Free plan
   - Continue

4. Cloudflare покажет **nameservers:**
   ```
   amy.ns.cloudflare.com
   john.ns.cloudflare.com
   ```

5. **Вернись в Porkbun:**
   - Login: https://porkbun.com/account/domains
   - Нажми на `hypeai.com`
   - "Authoritative Nameservers"
   - Вставь Cloudflare nameservers
   - Save

6. **Подожди 5-30 минут** (DNS propagation)

7. **Готово!** Cloudflare активирован ✅

**Опция B: Использовать Porkbun DNS (проще, но без CDN)**

1. Оставь всё как есть
2. Сразу переходи к Vercel setup

---

## 🚀 Шаг 8: Deploy на Vercel (бесплатный хостинг)

### 1. Создай аккаунт Vercel

```
https://vercel.com/signup
```

- Sign up with GitHub (проще всего)
- Или с email

### 2. Import проект

**Если код на GitHub:**
1. "New Project"
2. Import Git Repository
3. Выбери репозиторий HypeAI
4. Deploy

**Если код локально:**
1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. В папке проекта:
   ```bash
   cd /Users/ai.place/Crypto/src/frontend
   vercel
   ```

3. Следуй инструкциям:
   - Login to Vercel (откроет браузер)
   - Setup project: Yes
   - Deploy: Yes

### 3. Подключи домен к Vercel

**В Vercel Dashboard:**

1. Открой свой проект
2. "Settings" → "Domains"
3. "Add Domain"
4. Введи: `hypeai.com`
5. Add

**Vercel покажет DNS записи:**
```
A Record:
Name: @
Value: 76.76.21.21

CNAME Record:
Name: www
Value: cname.vercel-dns.com
```

### 4. Добавь DNS записи

**Если используешь Cloudflare:**

1. В Cloudflare Dashboard
2. DNS → Records
3. Add record:
   - Type: A
   - Name: @
   - IPv4: 76.76.21.21
   - Proxy: On (оранжевое облако)
   - Save

4. Add record:
   - Type: CNAME
   - Name: www
   - Target: cname.vercel-dns.com
   - Proxy: On
   - Save

**Если используешь Porkbun DNS:**

1. В Porkbun: hypeai.com → DNS Records
2. Add:
   - Type: A
   - Host: @
   - Answer: 76.76.21.21
   - Save

3. Add:
   - Type: CNAME
   - Host: www
   - Answer: cname.vercel-dns.com
   - Save

### 5. Проверка (5-30 минут)

1. Подожди DNS propagation
2. Открой: https://hypeai.com
3. Если видишь сайт → **SUCCESS!** 🎉

---

## ✅ Что получишь после setup

- ✅ **hypeai.com** - твой домен
- ✅ **Бесплатный SSL** (https://)
- ✅ **Бесплатный хостинг** (Vercel)
- ✅ **CDN** (если Cloudflare)
- ✅ **Auto-deploy** (при push в GitHub)

---

## 🎯 Альтернативные регистраторы

### Cloudflare Registrar ($10-12/год)

**Плюсы:** Лучший сервис, интеграция с CDN

**Ссылка:**
```
https://dash.cloudflare.com/sign-up
```

**После регистрации:**
1. Domain Registration → Transfer
2. Или купи новый домен через них

### Namecheap ($12-15/год)

**Плюсы:** Проще для новичков

**Ссылка:**
```
https://www.namecheap.com/domains/registration/results/?domain=hypeai.com
```

**Процесс аналогичен Porkbun**

---

## 📋 Checklist

**ПОСЛЕ ПОКУПКИ:**

- [ ] Домен куплен на Porkbun/Cloudflare/Namecheap
- [ ] Email подтверждение получено
- [ ] DNS настроен (Cloudflare или родной)
- [ ] Vercel аккаунт создан
- [ ] Проект deploy на Vercel
- [ ] Домен подключён к Vercel
- [ ] DNS записи добавлены
- [ ] Сайт открывается на https://hypeai.com
- [ ] Обновил Twitter bio с доменом
- [ ] Обновил Telegram description с доменом

---

## 🆘 Если что-то не работает

**Домен не открывается:**
- Подожди 30 минут (DNS propagation)
- Проверь DNS записи правильные
- Check: https://dnschecker.org/#A/hypeai.com

**Vercel не видит домен:**
- Проверь DNS записи
- Подожди propagation
- Remove и add заново в Vercel

**SSL не работает:**
- Если Cloudflare: убедись SSL/TLS = Full
- Если Porkbun: подожди 1-2 часа

---

## 💰 Итоговая стоимость

| Сервис | Стоимость |
|--------|-----------|
| **Домен (Porkbun)** | $9/год |
| **Cloudflare** | $0 (бесплатно) |
| **Vercel hosting** | $0 (бесплатно) |
| **SSL сертификат** | $0 (бесплатно) |
| **ИТОГО** | **$9/год** |

---

## 🎉 После успешного setup

**Обнови везде:**

1. **pump.fun** (когда создашь токен):
   - Website: https://hypeai.com

2. **Twitter:**
   - Bio: 🌐 hypeai.com

3. **Telegram:**
   - Description: Website: hypeai.com

4. **Документация:**
   - Обнови все docs с новым доменом

---

## 🚀 Готов!

**Время:** 15-30 минут весь процесс

**Следующий шаг:** Deploy frontend на домен!

Пиши если застрянешь на любом шаге! 💪
