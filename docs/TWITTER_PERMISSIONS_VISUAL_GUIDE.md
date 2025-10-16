# 🎯 Как проверить и изменить права Twitter API

## ШАГ ЗА ШАГОМ (с картинками того, что ты увидишь)

---

## Шаг 1: Открой Developer Portal

**Открой в браузере:**
```
https://developer.twitter.com/en/portal/dashboard
```

**Что увидишь:**
```
┌─────────────────────────────────────────┐
│  Twitter Developer Portal               │
├─────────────────────────────────────────┤
│                                         │
│  📱 Projects & Apps                     │
│                                         │
│  ▶ HypeAI Bot (или твое название)      │
│     └─ HypeAI Community Bot            │
│                                         │
└─────────────────────────────────────────┘
```

---

## Шаг 2: Нажми на название App

**Нажми на:** `HypeAI Community Bot` (или как ты назвал приложение)

**Откроется страница с настройками:**
```
┌─────────────────────────────────────────┐
│  HypeAI Community Bot                   │
├─────────────────────────────────────────┤
│                                         │
│  ⚙️ Settings                            │
│  🔑 Keys and tokens                     │
│  👤 User authentication settings        │
│                                         │
└─────────────────────────────────────────┘
```

---

## Шаг 3: Найди "User authentication settings"

**Ищи на странице раздел:** `User authentication settings`

**Что увидишь (2 варианта):**

### ВАРИАНТ А (если еще не настроено):
```
┌─────────────────────────────────────────┐
│  👤 User authentication settings        │
├─────────────────────────────────────────┤
│                                         │
│  Set up user authentication to get     │
│  access to additional endpoints         │
│                                         │
│  [Set up] кнопка                        │
│                                         │
└─────────────────────────────────────────┘
```
**→ Если видишь это, нажми [Set up]**

---

### ВАРИАНТ Б (если уже настроено):
```
┌─────────────────────────────────────────┐
│  👤 User authentication settings        │
├─────────────────────────────────────────┤
│                                         │
│  App permissions: Read only  ← ЭТО!    │
│                                         │
│  [Edit] кнопка                          │
│                                         │
└─────────────────────────────────────────┘
```

**ИЛИ:**

```
┌─────────────────────────────────────────┐
│  👤 User authentication settings        │
├─────────────────────────────────────────┤
│                                         │
│  App permissions: Read and Write  ✅    │
│                                         │
│  [Edit] кнопка                          │
│                                         │
└─────────────────────────────────────────┘
```

---

## Шаг 4: Проверь права

**Смотри на строку:** `App permissions: ...`

### ❌ Если там написано: `Read only`
**→ Нужно изменить на Read and Write**

### ✅ Если там написано: `Read and Write`
**→ Все ок! Переходи к Шагу 6**

---

## Шаг 5: Измени права (если Read only)

**1. Нажми кнопку [Edit]**

**2. Откроется форма:**
```
┌─────────────────────────────────────────┐
│  Edit user authentication settings      │
├─────────────────────────────────────────┤
│                                         │
│  App permissions                        │
│                                         │
│  ○ Read                                 │
│  ● Read and Write   ← ВЫБЕРИ ЭТО!      │
│  ○ Read and Write and Direct Messages  │
│                                         │
│  Callback URL:                          │
│  http://localhost:3000/callback         │
│                                         │
│  Website URL:                           │
│  https://hypeai.io                      │
│                                         │
│  [Save] кнопка                          │
│                                         │
└─────────────────────────────────────────┘
```

**3. Выбери (поставь точку):** `● Read and Write`

**4. Нажми кнопку [Save] внизу**

**5. Подожди 2-3 секунды**

---

## Шаг 6: Перегенерируй токены

⚠️ **ВАЖНО!** После изменения прав ОБЯЗАТЕЛЬНО нужны новые токены!

**1. На той же странице найди вкладку:** `🔑 Keys and tokens`

**Или перейди прямо туда:**
```
https://developer.twitter.com/en/portal/projects-and-apps
```

**2. Найди раздел:** `Access Token and Secret`

**Что увидишь:**
```
┌─────────────────────────────────────────┐
│  🔑 Access Token and Secret             │
├─────────────────────────────────────────┤
│                                         │
│  Access Token                           │
│  1390354277353336836-sTaj...            │
│                                         │
│  Access Token Secret                    │
│  NdNg8...                               │
│                                         │
│  Created with Read and Write            │
│                                         │
│  [Regenerate] [Revoke]                  │
│                                         │
└─────────────────────────────────────────┘
```

**3. ПРОВЕРЬ строку под токенами:**

### ✅ Если там написано:
```
Created with Read and Write
```
**→ ОТЛИЧНО! Значит твои токены уже правильные!**

### ❌ Если там написано:
```
Created with Read
```
**→ Нужно перегенерировать!**

**4. Если нужно перегенерировать:**
- Нажми кнопку **[Regenerate]**
- Скопируй **НОВЫЕ** токены:
  - Access Token (начинается с 1390354277353336836-...)
  - Access Token Secret (длинная строка)
- Пришли их мне

---

## ЧТО СКАЗАТЬ МНЕ:

### Если все ок:
```
"Там написано: Created with Read and Write"
```
**→ Тогда я проверю что-то другое**

### Если нужны новые токены:
```
"Было написано Created with Read, вот новые токены:
Access Token: 1390354277353336836-xxxxx
Access Token Secret: xxxxxx"
```
**→ Я обновлю и запостим!**

### Если не можешь найти:
```
"Не вижу User authentication settings"
или
"Не вижу где App permissions"
```
**→ Я помогу дальше!**

---

## 📸 Краткая шпаргалка

```
1. https://developer.twitter.com/en/portal/dashboard
2. Нажми на название приложения
3. Найди: "User authentication settings"
4. Посмотри: "App permissions: ???"
5. Должно быть: "Read and Write" ✅
6. Если "Read only" → Нажми [Edit] → Выбери "Read and Write" → [Save]
7. Перейди в: "Keys and tokens"
8. Найди: "Access Token and Secret"
9. Посмотри: "Created with ???"
10. Должно быть: "Created with Read and Write" ✅
11. Если "Created with Read" → [Regenerate] → Скопируй новые
```

---

## Что сказать мне прямо сейчас:

**Просто напиши одно из:**

- "Created with Read and Write" ✅
- "Created with Read" ❌ (и я объясню что делать дальше)
- "Не вижу где это" (пришлю скриншот)

---

**Жду твоего ответа! 😊**
