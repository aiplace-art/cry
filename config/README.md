# 🎨 Централизованная Конфигурация Цветов

## Быстрый Старт

```javascript
// Импорт всех цветов
import { HYPEAI_BRAND, BNB_CHAIN, COMBINED_PALETTE, LOGO_PATHS } from './brand-colors.js';

// Основные цвета HypeAI
HYPEAI_BRAND.primary    // #00E5FF - Electric Cyan
HYPEAI_BRAND.secondary  // #00AAFF - Blue
HYPEAI_BRAND.accent     // #0077FF - Dark Blue

// Основные цвета BNB Chain
BNB_CHAIN.gold    // #F3BA2F - BNB Gold
BNB_CHAIN.yellow  // #FFE900 - BNB Yellow

// Гибридная палитра
COMBINED_PALETTE.background // #0A0E27 - Темный космос
COMBINED_PALETTE.text       // #FFFFFF - Белый текст

// Логотипы
LOGO_PATHS.hypeai  // Полный логотип с текстом
LOGO_PATHS.icon    // Только иконка
```

## 📁 Структура

- **`brand-colors.js`** - Все цвета HypeAI + BNB Chain (единственный источник!)
- **`visual-config.js`** - Визуальные стили для медиа (8 стилей)

## 🚨 Правила

**ЗАПРЕЩЕНО:**
- ❌ Хардкодить цвета в коде
- ❌ Создавать локальные константы
- ❌ Использовать неправильные цвета

**ОБЯЗАТЕЛЬНО:**
- ✅ Импортировать из `brand-colors.js`
- ✅ Использовать готовые градиенты
- ✅ Применять alpha версии

## 📚 Документация

Полное руководство: `/Users/ai.place/Crypto/docs/BRAND_COLORS_GUIDE.md`
