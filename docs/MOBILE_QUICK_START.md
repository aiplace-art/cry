# Mobile Dashboard - Quick Start Guide

## 🚀 Быстрый старт

### 1. Проверка установки

```bash
# Убедитесь что все файлы на месте
ls src/frontend/components/dashboard/mobile/
ls src/frontend/hooks/useMediaQuery.ts
ls src/frontend/utils/pwa.ts
ls public/sw.js
```

### 2. Использование в проекте

#### Вариант А: Мобильная страница

```typescript
// pages/dashboard/mobile.tsx
import { MobileDashboard } from '@/components/dashboard/mobile';

export default function MobileDashboardPage() {
  return (
    <MobileDashboard
      tokenPrice={0.0012}
      totalRaised={125430}
      participants={1247}
      timeRemaining="5d 12h"
    />
  );
}
```

#### Вариант Б: Адаптивный компонент

```typescript
// pages/dashboard.tsx
import { useResponsive } from '@/hooks/useMediaQuery';
import { MobileDashboard } from '@/components/dashboard/mobile';
import { DesktopDashboard } from '@/components/dashboard/desktop';

export default function DashboardPage() {
  const { isMobile } = useResponsive();
  
  return isMobile ? <MobileDashboard /> : <DesktopDashboard />;
}
```

### 3. Тестирование

#### В браузере (Chrome DevTools)
```
1. Открыть DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Выбрать iPhone 12 Pro или другое устройство
4. Проверить:
   - Bottom navigation работает
   - Swipe на статистике работает
   - Touch targets достаточно большие
   - Анимации плавные
```

#### PWA функции
```
1. Открыть http://localhost:3000
2. DevTools → Application → Service Workers
3. Проверить регистрацию Service Worker
4. Offline → включить
5. Перезагрузить страницу → должна работать
```

## 📱 Основные компоненты

### MobileDashboard
Главный контейнер со всеми разделами

```typescript
<MobileDashboard
  tokenPrice={0.0012}        // Цена токена
  totalRaised={125430}       // Собрано средств
  participants={1247}        // Количество участников
  timeRemaining="5d 12h"     // Оставшееся время
/>
```

### MobileNavigation
Навигация (автоматически включена в MobileDashboard)

```typescript
import { MobileNavigation } from '@/components/dashboard/mobile';

<MobileNavigation />
// Bottom tab bar + hamburger menu
```

### MobileBuyPanel
Панель покупки токенов

```typescript
<MobileBuyPanel
  minInvestment={100}        // Мин. инвестиция
  maxInvestment={50000}      // Макс. инвестиция
  bonusPercentage={25}       // Процент бонуса
  tokenPrice={0.0012}        // Цена токена
/>
```

### SwipeableStatsCards
Карточки со статистикой (свайп)

```typescript
<SwipeableStatsCards />
// Автоматически показывает статистику
```

## 🎨 Кастомизация

### Изменить цвета

В `tailwind.config.js`:
```javascript
theme: {
  extend: {
    colors: {
      primary: { /* ваши цвета */ },
      secondary: { /* ваши цвета */ }
    }
  }
}
```

### Изменить breakpoints

В `hooks/useMediaQuery.ts`:
```typescript
export const breakpoints = {
  mobile: '(max-width: 640px)',    // ← изменить
  tablet: '(min-width: 641px) and (max-width: 1024px)',
  desktop: '(min-width: 1025px)',
};
```

### Изменить минимальный touch target

В `hooks/useMediaQuery.ts`:
```typescript
minTouchTarget: isTouchDevice ? 44 : 32, // ← изменить
```

## 🔧 Настройка PWA

### Изменить название

В `public/manifest.json`:
```json
{
  "name": "Ваше название",
  "short_name": "Короткое",
  "theme_color": "#0ea5e9"
}
```

### Отключить install prompt

В `components/InstallPrompt.tsx`:
```typescript
// Закомментировать рендер
export function InstallPrompt() {
  return null; // Отключено
}
```

### Изменить cache strategy

В `public/sw.js`:
```javascript
// Network first (текущая)
fetch(request).then().catch(() => cache)

// Cache first (альтернатива)
cache.match(request).then(cached => cached || fetch(request))
```

## 🐛 Troubleshooting

### Service Worker не регистрируется

```typescript
// В pages/_app.tsx проверить:
useEffect(() => {
  if (typeof window !== 'undefined') {
    initPWA(); // Должно быть
  }
}, []);
```

### Swipe не работает

```bash
# Проверить установку Framer Motion
npm list framer-motion

# Переустановить если нужно
npm install framer-motion
```

### Bottom nav не виден

```css
/* Проверить z-index в DevTools */
.bottom-nav {
  z-index: 40; /* Должно быть больше контента */
}
```

### Touch targets слишком маленькие

```typescript
// В компоненте добавить
style={{ minWidth: '44px', minHeight: '44px' }}
className="touch-manipulation no-tap-highlight"
```

## 📊 Performance Tips

### 1. Lazy Loading
```typescript
const HeavyComponent = lazy(() => import('./HeavyComponent'));

<Suspense fallback={<Loader />}>
  <HeavyComponent />
</Suspense>
```

### 2. Image Optimization
```typescript
import Image from 'next/image';

<Image
  src="/image.png"
  width={300}
  height={200}
  loading="lazy"
  placeholder="blur"
/>
```

### 3. Reduce Motion
```typescript
const prefersReducedMotion = useMediaQuery(
  '(prefers-reduced-motion: reduce)'
);

<motion.div
  animate={prefersReducedMotion ? {} : { scale: 1.1 }}
/>
```

## 🧪 Testing Script

```bash
#!/bin/bash

# Запустить dev server
npm run dev

# Проверить мобильную версию
open "http://localhost:3000/dashboard/mobile"

# Lighthouse audit (нужен Chrome)
lighthouse http://localhost:3000/dashboard/mobile \
  --output=html \
  --output-path=./lighthouse-report.html \
  --preset=mobile
```

## 📚 Дополнительные ресурсы

- [Framer Motion Docs](https://www.framer.com/motion/)
- [PWA Checklist](https://web.dev/pwa-checklist/)
- [iOS Design Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [Material Design (Android)](https://material.io/design)

---

**Помощь**: Если что-то не работает, проверьте консоль браузера (F12 → Console)
