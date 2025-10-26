# 🎨 Руководство по Централизованным Цветам Бренда

## ⚠️ КРИТИЧЕСКИ ВАЖНО: ЕДИНСТВЕННЫЙ ИСТОЧНИК ПРАВДЫ

**Все цвета бренда HypeAI + BNB Chain находятся в:**
```
/Users/ai.place/Crypto/config/brand-colors.js
```

**ЗАПРЕЩЕНО:**
- ❌ Хардкодить цвета в коде (`#00E5FF`, `#F3BA2F` и т.д.)
- ❌ Создавать локальные константы цветов
- ❌ Копировать цвета из старых файлов
- ❌ Использовать неправильные цвета

**ОБЯЗАТЕЛЬНО:**
- ✅ Всегда импортировать из `brand-colors.js`
- ✅ Использовать готовые градиенты
- ✅ Применять прозрачные версии (alpha)
- ✅ Следовать гибридной палитре

---

## 📦 Импорт Цветов

### JavaScript/Node.js
```javascript
import { HYPEAI_BRAND, BNB_CHAIN, COMBINED_PALETTE, LOGO_PATHS } from '../config/brand-colors.js';
```

### CSS (через переменные)
```css
:root {
  --hypeai-primary: #00E5FF;
  --hypeai-secondary: #00AAFF;
  --hypeai-accent: #0077FF;
  --bnb-gold: #F3BA2F;
  --bnb-yellow: #FFE900;
}
```

---

## 🎨 Основные Палитры

### 1. HypeAI Brand Colors
```javascript
HYPEAI_BRAND.primary    // #00E5FF - Electric Cyan (основной)
HYPEAI_BRAND.secondary  // #00AAFF - Blue (вспомогательный)
HYPEAI_BRAND.accent     // #0077FF - Dark Blue (акценты)
```

**Градиенты HypeAI:**
```javascript
HYPEAI_BRAND.gradient.primary  // Cyan → Dark Blue
HYPEAI_BRAND.gradient.cosmic   // Dark Blue → Cyan → Blue (космический)
HYPEAI_BRAND.gradient.energy   // Radial: Cyan → Dark Blue
HYPEAI_BRAND.gradient.glow     // Cyan → Blue → Dark Blue (свечение)
```

**Прозрачные версии:**
```javascript
HYPEAI_BRAND.alpha.primary10  // 10% прозрачности
HYPEAI_BRAND.alpha.primary20  // 20% прозрачности
HYPEAI_BRAND.alpha.primary50  // 50% прозрачности
```

### 2. BNB Chain Colors
```javascript
BNB_CHAIN.gold    // #F3BA2F - BNB Gold (основной)
BNB_CHAIN.yellow  // #FFE900 - BNB Yellow (яркий акцент)
BNB_CHAIN.dark    // #14151A - BNB Dark (темный фон)
```

**Градиенты BNB:**
```javascript
BNB_CHAIN.gradient.golden  // Yellow → Gold
BNB_CHAIN.gradient.hybrid  // Gold → Cyan (HypeAI + BNB)
BNB_CHAIN.gradient.energyFlow // Gold → Cyan → Gold (двусторонний)
```

**Прозрачные версии:**
```javascript
BNB_CHAIN.alpha.gold20   // 20% прозрачности
BNB_CHAIN.alpha.gold50   // 50% прозрачности
BNB_CHAIN.alpha.yellow20 // 20% прозрачности
```

### 3. Combined Palette (Гибридная)
```javascript
COMBINED_PALETTE.hypeai          // #00E5FF (основной HypeAI)
COMBINED_PALETTE.bnb             // #F3BA2F (основной BNB)
COMBINED_PALETTE.background      // #0A0E27 (темный космос)
COMBINED_PALETTE.backgroundLight // #1A1E37 (светлее для карточек)
COMBINED_PALETTE.text            // #FFFFFF (белый текст)
COMBINED_PALETTE.textSecondary   // #B0B8C8 (серый текст)
COMBINED_PALETTE.textMuted       // #6B7280 (приглушенный текст)
```

---

## 🖼️ Визуальные Стили

### Импорт стилей
```javascript
import { VISUAL_STYLES } from '../config/visual-config.js';
```

### 8 готовых стилей:
1. **minimalist** - Минимализм (cyan + blue)
2. **techGradient** - Технологичный градиент
3. **neonGlow** - Неоновое свечение
4. **corporate** - Корпоративный стиль
5. **energyFlow** - Энергетический поток
6. **cyberpunk** - Киберпанк (cyan + magenta + gold)
7. **clean** - Чистый дизайн (белый фон)
8. **cosmic** - Космический (радиальный градиент)

### Пример использования:
```javascript
const style = VISUAL_STYLES.techGradient;
ctx.fillStyle = style.gradient; // Готовый градиент
ctx.strokeStyle = style.accent; // BNB gold
```

---

## 🎯 Правильное Использование

### ✅ ПРАВИЛЬНО:
```javascript
// Canvas
ctx.fillStyle = HYPEAI_BRAND.primary;
ctx.strokeStyle = BNB_CHAIN.gold;

// Gradient
const gradient = ctx.createLinearGradient(0, 0, width, height);
gradient.addColorStop(0, HYPEAI_BRAND.primary);
gradient.addColorStop(1, BNB_CHAIN.gold);

// Прозрачность
ctx.strokeStyle = HYPEAI_BRAND.alpha.primary20;

// CSS
element.style.backgroundColor = COMBINED_PALETTE.background;
element.style.color = HYPEAI_BRAND.primary;
```

### ❌ НЕПРАВИЛЬНО:
```javascript
// НЕ ДЕЛАЙ ТАК!
ctx.fillStyle = '#00E5FF';           // Хардкод цвета
const gold = '#F3BA2F';              // Локальная константа
ctx.strokeStyle = 'rgba(0, 229, 255, 0.2)'; // Прямой RGBA

// ИСПОЛЬЗУЙ ВМЕСТО ЭТОГО:
ctx.fillStyle = HYPEAI_BRAND.primary;
const gold = BNB_CHAIN.gold;
ctx.strokeStyle = HYPEAI_BRAND.alpha.primary20;
```

---

## 🚀 Миграция Существующего Кода

### Шаг 1: Найди все хардкоженные цвета
```bash
grep -r "#00E5FF\|#00AAFF\|#0077FF\|#F3BA2F\|#FFE900" scripts/
```

### Шаг 2: Замени на импорт
```javascript
// Было:
const cyan = '#00E5FF';
const gold = '#F3BA2F';

// Стало:
import { HYPEAI_BRAND, BNB_CHAIN } from '../config/brand-colors.js';
```

### Шаг 3: Обнови использование
```javascript
// Было:
ctx.fillStyle = cyan;
ctx.strokeStyle = 'rgba(243, 186, 47, 0.5)';

// Стало:
ctx.fillStyle = HYPEAI_BRAND.primary;
ctx.strokeStyle = BNB_CHAIN.alpha.gold50;
```

---

## 🎨 Цветовые Схемы для Разных Контекстов

### Social Media
```javascript
import { COLOR_SCHEMES } from '../config/brand-colors.js';

const social = COLOR_SCHEMES.social;
// primary: #00E5FF (HypeAI cyan)
// secondary: #F3BA2F (BNB gold)
// background: #0A0E27 (dark)
```

### Website
```javascript
const website = COLOR_SCHEMES.website;
// primary: #00E5FF
// secondary: #00AAFF
// accent: #F3BA2F
```

### Presentation
```javascript
const presentation = COLOR_SCHEMES.presentation;
// primary: gradient (cosmic)
// accent: #F3BA2F
```

---

## 📐 Логотипы

### Официальные пути к логотипам:
```javascript
import { LOGO_PATHS } from '../config/brand-colors.js';

LOGO_PATHS.hypeai  // /Users/ai.place/Crypto/website/logo-official-BRIGHT.svg
LOGO_PATHS.icon    // /Users/ai.place/Crypto/website/logo-icon-only.svg
```

### Использование в Canvas:
```javascript
const logo = await loadImage(LOGO_PATHS.icon);
ctx.drawImage(logo, x, y, width, height);
```

---

## 🔄 Обновление Цветов

**ВАЖНО:** Все изменения цветов ТОЛЬКО в `brand-colors.js`!

```javascript
// config/brand-colors.js
export const HYPEAI_BRAND = {
  primary: '#00E5FF',  // ← ЕДИНСТВЕННОЕ место для изменения!
  // ...
};
```

После изменения:
1. Перезапусти все скрипты
2. Очисти кеш браузера
3. Пересобери CSS (если используется)

---

## 📚 Примеры

### Canvas Image Generation
```javascript
import { HYPEAI_BRAND, BNB_CHAIN, LOGO_PATHS } from '../config/brand-colors.js';

const canvas = createCanvas(1200, 675);
const ctx = canvas.getContext('2d');

// Градиентный фон
const gradient = ctx.createLinearGradient(0, 0, 1200, 675);
gradient.addColorStop(0, HYPEAI_BRAND.primary);
gradient.addColorStop(1, BNB_CHAIN.gold);
ctx.fillStyle = gradient;
ctx.fillRect(0, 0, 1200, 675);

// Декоративные элементы
ctx.strokeStyle = HYPEAI_BRAND.alpha.primary20;
ctx.lineWidth = 2;
// ... рисование

// Логотип
const logo = await loadImage(LOGO_PATHS.icon);
ctx.drawImage(logo, 50, 50, 200, 200);

// Текст
ctx.fillStyle = HYPEAI_BRAND.primary;
ctx.font = 'bold 60px sans-serif';
ctx.fillText('HypeAI', 100, 300);

ctx.fillStyle = BNB_CHAIN.gold;
ctx.font = '28px sans-serif';
ctx.fillText('Built on BNB Chain', 100, 340);
```

### CSS Variables
```javascript
// Генерация CSS переменных из brand-colors.js
import { HYPEAI_BRAND, BNB_CHAIN, COMBINED_PALETTE } from '../config/brand-colors.js';

const cssVars = `
:root {
  --hypeai-primary: ${HYPEAI_BRAND.primary};
  --hypeai-secondary: ${HYPEAI_BRAND.secondary};
  --hypeai-accent: ${HYPEAI_BRAND.accent};
  --bnb-gold: ${BNB_CHAIN.gold};
  --bnb-yellow: ${BNB_CHAIN.yellow};
  --bg-dark: ${COMBINED_PALETTE.background};
  --text-primary: ${COMBINED_PALETTE.text};
}
`;
```

---

## 🛠️ Инструменты

### Проверка консистентности цветов
```bash
# Найти все хардкоженные цвета (НЕ ДОЛЖНО БЫТЬ!)
grep -rn "#[0-9A-Fa-f]{6}" scripts/ --exclude-dir=node_modules

# Проверить импорт brand-colors.js
grep -rn "brand-colors.js" scripts/
```

### Валидация цветов
```javascript
// scripts/validate-colors.js
import { HYPEAI_BRAND, BNB_CHAIN } from '../config/brand-colors.js';

console.log('✅ HypeAI Primary:', HYPEAI_BRAND.primary);
console.log('✅ BNB Gold:', BNB_CHAIN.gold);
```

---

## 📝 Чеклист Миграции

- [ ] Импортировать `brand-colors.js` в файл
- [ ] Удалить локальные константы цветов
- [ ] Заменить хардкоженные hex коды на импортированные
- [ ] Использовать готовые градиенты вместо ручных
- [ ] Применить alpha версии вместо rgba()
- [ ] Обновить пути к логотипам на `LOGO_PATHS`
- [ ] Протестировать визуальный результат
- [ ] Удалить устаревшие комментарии с цветами

---

## 🎯 Итоги

**Золотое правило:** Один источник правды = `brand-colors.js`

**Преимущества:**
- ✅ Единая точка управления цветами
- ✅ Легкое обновление бренда
- ✅ Консистентность во всех скриптах
- ✅ Автоматическая типизация (TypeScript)
- ✅ Готовые градиенты и alpha версии
- ✅ Гибридная палитра (HypeAI + BNB)

**Контакты:**
- Основная документация: `/Users/ai.place/Crypto/branding/OFFICIAL_BRAND_ASSETS.md`
- Цвета: `/Users/ai.place/Crypto/config/brand-colors.js`
- Визуальные стили: `/Users/ai.place/Crypto/config/visual-config.js`
