# Pseudocode для СУПЕР-ПРОСТОГО дашборда

## 🎯 ГЛАВНЫЕ КОМПОНЕНТЫ

---

## 1️⃣ BigNumber Component

### Назначение:
Отображает ОДНУ большую цифру (токены пользователя)

### Pseudocode:

```
COMPONENT BigNumber(value, token, label):

  RENDER:
    IF label exists:
      DISPLAY label (small text, gray, centered)

    DISPLAY value as huge number (text-7xl, cyan, bold)
      FORMAT: value.toLocaleString() // 315,600

    DISPLAY token symbol (text-3xl, gray, below value)
      FORMAT: token string // "HYPE"

  STYLING:
    Container: centered, vertical layout, padding 12
    Label: text-xl, gray-400, margin-bottom 4
    Value: text-7xl, bold, cyan-400
    Token: text-3xl, gray-300, margin-top 2

END COMPONENT
```

### Логика:
1. Принимает: `value` (число), `token` (строка), `label` (опционально)
2. Форматирует число с разделителями
3. Отображает центрированно
4. НЕТ дополнительной логики

---

## 2️⃣ SimpleProgress Component

### Назначение:
Показывает прогресс разблокировки (% и сумма)

### Pseudocode:

```
COMPONENT SimpleProgress(percentage, unlockedAmount, token):

  RENDER:
    // Прогресс-бар
    Container (max-width 2xl, centered, padding):
      ProgressBar (height 6, rounded, background gray-700):
        Fill (gradient cyan→blue, width = percentage%):
          ANIMATE transition-all duration-500

        Label (centered, inside bar):
          DISPLAY "{percentage}%" (bold, white)

    // Подпись под баром
    Text (centered, large, gray-300, margin-top 3):
      DISPLAY "Разблокировано {unlockedAmount} {token}"
        FORMAT: unlockedAmount.toLocaleString()

  STYLING:
    Progress bar:
      - Background: gray-700
      - Fill: gradient from cyan-400 to blue-500
      - Height: 24px (h-6)
      - Rounded: full

    Percentage label:
      - Inside bar, centered
      - Bold, white, small font

END COMPONENT
```

### Логика:
1. Принимает: `percentage` (0-100), `unlockedAmount` (число), `token` (строка)
2. Отображает заполненный прогресс-бар
3. Показывает процент внутри бара
4. Показывает абсолютное значение под баром

---

## 3️⃣ TwoButtons Component

### Назначение:
Две главные кнопки действия (Купить / Забрать)

### Pseudocode:

```
COMPONENT TwoButtons(onBuy, onClaim, claimDisabled):

  RENDER:
    Container (flex, gap 6, centered, margin-top 12, padding 8):

      // Кнопка "Купить ещё"
      Button:
        TEXT: "КУПИТЬ ЕЩЁ"
        SIZE: large (px-12 py-6, text-xl)
        COLOR: cyan-500, hover cyan-600
        SHADOW: large, glow on hover (cyan-500/50)
        ON_CLICK: call onBuy()

      // Кнопка "Забрать"
      Button:
        TEXT: "ЗАБРАТЬ"
        SIZE: large (px-12 py-6, text-xl)
        COLOR: blue-500, hover blue-600
        SHADOW: large, glow on hover (blue-500/50)
        DISABLED: claimDisabled
        ON_CLICK: call onClaim()

        IF claimDisabled:
          OPACITY: 50%
          CURSOR: not-allowed

  STYLING:
    Container: flex row, gap 24px, center aligned
    Buttons:
      - Large padding (48px horizontal, 24px vertical)
      - Bold text (text-xl)
      - Rounded corners (rounded-xl)
      - Shadow with glow effect

END COMPONENT
```

### Логика:
1. Принимает: `onBuy` (callback), `onClaim` (callback), `claimDisabled` (boolean)
2. Отображает 2 кнопки рядом
3. Кнопка "Забрать" может быть disabled
4. Callback вызываются при клике

---

## 4️⃣ SimpleDashboard (Main Page)

### Назначение:
Главная страница с 3 элементами

### Pseudocode:

```
COMPONENT SimpleDashboard():

  // STATE & HOOKS
  router = useRouter()
  {userPurchases, calculateUnlockedAmount} = usePrivateSale()

  // COMPUTED VALUES
  totalTokens = SUM(userPurchases[].tokenAmount)
  unlockedTokens = SUM(userPurchases[].calculateUnlockedAmount())
  percentage = IF totalTokens > 0:
                 ROUND((unlockedTokens / totalTokens) * 100)
               ELSE:
                 0

  // EVENT HANDLERS
  handleBuy():
    router.push('/buy')

  handleClaim():
    router.push('/claim')

  // RENDER
  LAYOUT:
    Container (full screen height, gradient background, padding 12):
      Content (max-width 4xl, centered):

        // 1. ЭЛЕМЕНТ: Большая цифра
        BigNumber(
          value = totalTokens,
          token = "HYPE",
          label = "💎 У ВАС ТОКЕНОВ"
        )

        // 2. ЭЛЕМЕНТ: Прогресс-бар
        SimpleProgress(
          percentage = percentage,
          unlockedAmount = unlockedTokens,
          token = "HYPE"
        )

        // 3. ЭЛЕМЕНТ: Две кнопки
        TwoButtons(
          onBuy = handleBuy,
          onClaim = handleClaim,
          claimDisabled = (unlockedTokens === 0)
        )

        // Простое объяснение (опционально)
        Text (centered, gray-300, margin-top 12, text-lg):
          "20% получаете сразу, остальное разблокируется за 21 месяц"

  STYLING:
    Background: gradient from gray-900 via blue-900 to cyan-900
    Container: full viewport height, centered content
    Max width: 4xl (1024px)

END COMPONENT
```

### Логика:
1. Загружает данные пользователя (`usePrivateSale`)
2. Подсчитывает общее количество токенов
3. Подсчитывает разблокированные токены
4. Вычисляет процент разблокировки
5. Отображает только 3 элемента
6. Навигация через роутер

---

## 5️⃣ SimpleBuyPage

### Назначение:
Страница покупки с 1 полем ввода

### Pseudocode:

```
COMPONENT SimpleBuyPage():

  // STATE
  amount = useState('')
  currency = useState('BNB') // 'BNB' or 'USDT'

  // HOOKS
  {currentPrice, buyTokens, loading} = usePrivateSale()

  // COMPUTED
  tokenAmount = IF amount exists:
                  (parseFloat(amount) / currentPrice) * 1_000_000
                ELSE:
                  0

  // HANDLERS
  handleBuy():
    IF amount is empty:
      RETURN

    AWAIT buyTokens(parseFloat(amount), currency)

  handleCurrencyChange(newCurrency):
    currency = newCurrency

  // RENDER
  LAYOUT:
    Container (full screen, gradient background, padding 12):
      Content (max-width 2xl, centered, padding 8):

        // Заголовок
        Heading (text-4xl, bold, centered, white, margin-bottom 12):
          "💰 КУПИТЬ HYPE ТОКЕНЫ"

        // Карточка с формой
        Card (background gray-800/50, rounded-2xl, padding 8, backdrop-blur):

          // Поле ввода
          Label (text-xl, gray-300, margin-bottom 4):
            "Сколько хотите потратить?"

          Flex (gap 4):
            Input (flex-1, large):
              TYPE: number
              VALUE: amount
              PLACEHOLDER: "0.5"
              ON_CHANGE: setAmount(event.value)
              STYLE: text-2xl, gray-700 bg, white text, cyan border on focus

            // Переключатель валюты
            ButtonGroup:
              Button (BNB):
                ACTIVE: currency === 'BNB'
                ON_CLICK: handleCurrencyChange('BNB')
                STYLE: IF active: cyan-500 bg ELSE: gray-700 bg

              Button (USDT):
                ACTIVE: currency === 'USDT'
                ON_CLICK: handleCurrencyChange('USDT')
                STYLE: IF active: cyan-500 bg ELSE: gray-700 bg

          // Результат (показывать только если amount > 0)
          IF amount > 0:
            Divider (border-top gray-600, margin-top 8, padding-top 8)

            Text (gray-300, text-lg, margin-bottom 2):
              "↓ Вы получите"

            Text (text-5xl, bold, cyan-400):
              "{tokenAmount.toLocaleString()} HYPE"

        // Кнопка покупки
        Flex (centered, margin-top 8):
          Button:
            TEXT: IF loading: "ПОКУПАЕМ..." ELSE: "КУПИТЬ"
            SIZE: extra large (px-16 py-6, text-2xl)
            COLOR: cyan-500, hover cyan-600
            DISABLED: !amount OR loading
            ON_CLICK: handleBuy()

  STYLING:
    Input field: Large (py-4), 2xl text, rounded-xl
    Currency buttons: Medium (px-6 py-4), rounded-xl
    Buy button: Extra large, bold, shadow with glow

END COMPONENT
```

### Логика:
1. Пользователь вводит сумму
2. Автоматически рассчитывается количество токенов
3. Выбор валюты (BNB/USDT)
4. Кнопка "Купить" вызывает `buyTokens`

---

## 6️⃣ SimpleClaimPage

### Назначение:
Страница забрать токены

### Pseudocode:

```
COMPONENT SimpleClaimPage():

  // HOOKS
  {userPurchases, claimTokens, calculateUnlockedAmount, loading} = usePrivateSale()

  // COMPUTED
  availableTokens = SUM(userPurchases[].calculateUnlockedAmount())

  nextUnlock = userPurchases[0]?.vestingSchedule
                 .find(v => !v.claimed)

  // HANDLERS
  handleClaim():
    AWAIT claimTokens()

  // RENDER
  LAYOUT:
    Container (full screen, gradient background, padding 12):
      Content (max-width 2xl, centered, padding 8, text-center):

        // Заголовок
        Heading (text-4xl, bold, white, margin-bottom 12):
          "💸 ЗАБРАТЬ ТОКЕНЫ"

        // Карточка с доступной суммой
        Card (background gray-800/50, rounded-2xl, padding 12, backdrop-blur, margin-bottom 8):

          Text (text-xl, gray-300, margin-bottom 4):
            "Доступно к получению:"

          Text (text-7xl, bold, cyan-400, margin-bottom 8):
            "{availableTokens.toLocaleString()}"

          Text (text-2xl, gray-300):
            "HYPE"

        // Кнопка забрать
        Button:
          TEXT: IF loading: "ОТПРАВЛЯЕМ..." ELSE: "ЗАБРАТЬ"
          SIZE: extra large (px-16 py-6, text-2xl)
          COLOR: cyan-500, hover cyan-600
          DISABLED: availableTokens === 0 OR loading
          ON_CLICK: handleClaim()

        // Следующая разблокировка
        IF nextUnlock exists:
          Text (margin-top 12, gray-300, text-lg):
            "Следующая разблокировка:"
            <br>
            Date (cyan-400, bold):
              "{nextUnlock.date} - {nextUnlock.amount.toLocaleString()} токенов"

  STYLING:
    Available amount: Huge (text-7xl), bold, cyan
    Claim button: Extra large, shadow with glow
    Next unlock: Medium text, cyan accent

END COMPONENT
```

### Логика:
1. Подсчитывает доступные токены
2. Находит следующую дату разблокировки
3. Кнопка "Забрать" вызывает `claimTokens`
4. Disabled если нет доступных токенов

---

## 7️⃣ SimplePurchasesList

### Назначение:
История покупок (простой список)

### Pseudocode:

```
COMPONENT SimplePurchasesList():

  // HOOKS
  {userPurchases, calculateUnlockedAmount} = usePrivateSale()

  // RENDER
  LAYOUT:
    Container (full screen, gradient background, padding 12):
      Content (max-width 2xl, centered, padding 8):

        // Заголовок
        Heading (text-4xl, bold, white, centered, margin-bottom 12):
          "📜 ИСТОРИЯ ПОКУПОК"

        // Список покупок
        List (vertical spacing 6):
          FOR EACH purchase IN userPurchases:

            unlockedAmount = calculateUnlockedAmount(purchase)
            percentage = ROUND((unlockedAmount / purchase.tokenAmount) * 100)

            Card (background gray-800/50, rounded-2xl, padding 8, backdrop-blur):

              // Дата
              Text (gray-400, text-lg, margin-bottom 4):
                DATE_FORMAT(purchase.purchaseDate, 'ru-RU', long)
                // "15 октября 2025"

              // Количество токенов
              Text (text-4xl, bold, cyan-400, margin-bottom 6):
                "{purchase.tokenAmount.toLocaleString()} HYPE"

              // Прогресс-бар
              ProgressBar (height 4, rounded-full, background gray-700):
                Fill (gradient cyan→blue, width percentage%):
                  ANIMATE transition-all

              // Текст под баром
              Text (gray-300, text-lg, margin-top 3):
                "Разблокировано {percentage}% ({unlockedAmount.toLocaleString()} токенов)"

  STYLING:
    Cards: Separated by 24px gap
    Progress bars: Small (h-4), rounded
    Dates: Gray-400, medium size
    Amounts: Large (text-4xl), cyan-400

END COMPONENT
```

### Логика:
1. Загружает список покупок
2. Для каждой покупки вычисляет процент разблокировки
3. Отображает простые карточки
4. Нет таблицы, нет лишних деталей

---

## 8️⃣ SimpleNav (Navigation)

### Назначение:
Простое меню (4 пункта)

### Pseudocode:

```
COMPONENT SimpleNav():

  // HOOKS
  router = useRouter()
  currentPath = router.pathname

  // CONFIG
  links = [
    {href: '/dashboard', label: 'Главная'},
    {href: '/buy', label: 'Купить'},
    {href: '/purchases', label: 'Мои покупки'},
    {href: '/claim', label: 'Забрать'}
  ]

  // RENDER
  LAYOUT:
    Nav (sticky top, z-50, background gray-900/80, backdrop-blur, border-bottom gray-700):
      Container (max-width 6xl, centered, padding 8 vertical 4):

        Flex (gap 8, centered):
          FOR EACH link IN links:

            Link:
              HREF: link.href
              TEXT: link.label
              ACTIVE: currentPath === link.href

              STYLE:
                IF active:
                  background: cyan-500
                  color: white
                ELSE:
                  color: gray-300
                  hover: white, gray-800 background

                padding: px-6 py-3
                rounded: xl
                text: lg, bold
                transition: all

  STYLING:
    Nav: Sticky, translucent background with blur
    Links: Large, bold, rounded pills
    Active link: Cyan background

END COMPONENT
```

### Логика:
1. Определяет текущий путь
2. Отображает 4 ссылки
3. Подсвечивает активную страницу
4. Sticky навигация (всегда сверху)

---

## 🧮 UTILITY FUNCTIONS

### formatNumber(value):
```
FUNCTION formatNumber(value):
  RETURN value.toLocaleString('ru-RU')
  // 315600 → "315,600"
END FUNCTION
```

### formatDate(date, locale, format):
```
FUNCTION formatDate(date, locale = 'ru-RU', format = 'long'):
  RETURN new Date(date).toLocaleDateString(locale, {
    day: 'numeric',
    month: format,
    year: 'numeric'
  })
  // "2025-10-15" → "15 октября 2025"
END FUNCTION
```

### calculatePercentage(part, total):
```
FUNCTION calculatePercentage(part, total):
  IF total === 0:
    RETURN 0

  RETURN ROUND((part / total) * 100)
  // 211752 / 315600 → 67
END FUNCTION
```

---

## 🔄 DATA FLOW

### Главная страница (SimpleDashboard):

```
1. MOUNT:
   usePrivateSale() → FETCH userPurchases

2. COMPUTE:
   totalTokens = SUM(purchases)
   unlockedTokens = SUM(calculateUnlockedAmount)
   percentage = (unlocked / total) * 100

3. RENDER:
   BigNumber(totalTokens)
   SimpleProgress(percentage, unlockedTokens)
   TwoButtons(onBuy, onClaim)

4. USER CLICK "КУПИТЬ ЕЩЁ":
   router.push('/buy')

5. USER CLICK "ЗАБРАТЬ":
   router.push('/claim')
```

### Страница покупки (SimpleBuyPage):

```
1. MOUNT:
   usePrivateSale() → GET currentPrice

2. USER INPUT amount:
   tokenAmount = (amount / currentPrice) * 1M
   RENDER result

3. USER CLICK currency button:
   currency = 'BNB' or 'USDT'

4. USER CLICK "КУПИТЬ":
   buyTokens(amount, currency) → AWAIT transaction
   ON_SUCCESS: redirect to dashboard
```

### Страница забрать (SimpleClaimPage):

```
1. MOUNT:
   usePrivateSale() → FETCH userPurchases
   COMPUTE availableTokens = SUM(unlocked)
   FIND nextUnlock date

2. USER CLICK "ЗАБРАТЬ":
   claimTokens() → AWAIT transaction
   ON_SUCCESS: refresh purchases
```

---

## 🎯 КЛЮЧЕВЫЕ ПРИНЦИПЫ PSEUDOCODE

### 1. Простота:
- Минимум логики
- Максимум 3 элемента на экране
- Никаких сложных вычислений

### 2. Производительность:
- Computed values вычисляются один раз
- Transitions для плавности
- Lazy loading не нужен (мало компонентов)

### 3. UX:
- Автоматический расчёт (Buy page)
- Disabled states (Claim button)
- Loading states (buttons)

### 4. Модульность:
- Компоненты независимы
- Hooks для данных
- Callbacks для действий

---

## 🧪 VALIDATION LOGIC

### SimpleDashboard:
```
VALIDATE:
  - userPurchases is array
  - totalTokens >= 0
  - percentage in range [0, 100]
  - claimDisabled if unlockedTokens === 0
```

### SimpleBuyPage:
```
VALIDATE:
  - amount > 0
  - currency in ['BNB', 'USDT']
  - tokenAmount > 0
  - disable buy if amount empty or loading
```

### SimpleClaimPage:
```
VALIDATE:
  - availableTokens >= 0
  - disable claim if availableTokens === 0
  - nextUnlock can be null (no future unlocks)
```

---

## 🚀 ИТОГ

**Pseudocode готов для:**
1. BigNumber - главная цифра
2. SimpleProgress - прогресс-бар
3. TwoButtons - две кнопки
4. SimpleDashboard - главная страница (3 элемента)
5. SimpleBuyPage - покупка (1 поле)
6. SimpleClaimPage - забрать (1 кнопка)
7. SimplePurchasesList - история (простой список)
8. SimpleNav - навигация (4 пункта)

**Логика:** Минимальная, понятная, без сложных вычислений.
**Цель:** Бабушка поймёт за 10 секунд ✅
