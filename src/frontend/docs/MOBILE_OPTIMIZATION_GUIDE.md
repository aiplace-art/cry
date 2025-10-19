# Mobile Optimization Guide - HypeAI Referral Dashboard

## Overview

Полностью адаптивный мобильный дашборд с PWA функциональностью, оптимизированный для экранов 375px-768px.

## Ключевые Компоненты

### 1. MobileNav.tsx
Bottom navigation для мобильных устройств с анимациями и touch-friendly интерфейсом.

**Особенности:**
- Минимальный размер кнопок: 44x44px (Apple guidelines)
- Smooth animations с Framer Motion
- Active tab indicator
- Safe area insets для iPhone X+

**Использование:**
```tsx
import { MobileNav } from '@/components/referral/MobileNav';

<MobileNav
  activeTab={activeTab}
  onTabChange={setActiveTab}
/>
```

### 2. MobileReferralDashboard.tsx
Главный дашборд с pull-to-refresh и swipe gestures.

**Функции:**
- Pull-to-refresh (свайп вниз для обновления)
- Horizontal scroll для статистики
- QR code modal с анимациями
- Share API integration
- Floating action button

**Жесты:**
- Свайп вниз: Pull-to-refresh
- Tap: Открыть детали
- Long press: Контекстное меню

### 3. MobileReferralList.tsx
Список рефералов с virtual scrolling и infinite scroll.

**Оптимизации:**
- Infinite scroll (автозагрузка при прокрутке)
- Card-based layout для мобильных
- Swipeable cards
- Filter modal вместо sidebar
- Detail modal для просмотра информации

### 4. PWA Компоненты

#### PWAInstallPrompt.tsx
Smart prompt для установки PWA с определением iOS.

**iOS Detection:**
- Автоматическое определение iOS
- Инструкции для "Add to Home Screen"
- Visual guide с иконками

**Android/Desktop:**
- Native install prompt
- Benefits showcase
- One-tap installation

#### Service Worker (sw.js)
Полный offline support с background sync.

**Стратегии кэширования:**
- **API requests**: Network-first с cache fallback
- **Static assets**: Cache-first с network fallback
- **Navigation**: Offline page при отсутствии сети

**Background Sync:**
- Автосинхронизация claims
- Автосинхронизация referrals
- Periodic sync для stats (каждые 24 часа)

**Push Notifications:**
- Новые рефералы
- Claim успешно обработан
- Milestone достигнут

## Performance Optimization

### 1. Lazy Loading
Все компоненты загружаются динамически:

```tsx
const MobileReferralDashboard = lazy(() =>
  import('./MobileReferralDashboard').then(m => ({
    default: m.MobileReferralDashboard
  }))
);
```

### 2. Code Splitting
Автоматическое разделение кода по route:

```tsx
<Suspense fallback={<LoadingScreen />}>
  {activeTab === 'dashboard' && <MobileReferralDashboard />}
  {activeTab === 'referrals' && <MobileReferralList />}
</Suspense>
```

### 3. Virtual Scrolling
Для больших списков (1000+ элементов):

```tsx
import { useVirtualScroll } from '@/hooks/useVirtualScroll';

const { virtualItems, scrollRef, totalHeight } = useVirtualScroll(
  items,
  { itemHeight: 80, containerHeight: 600 }
);
```

### 4. Image Optimization
- Lazy loading для изображений
- Responsive images с srcset
- WebP с fallback на PNG

## Mobile-First CSS

### Tailwind Utilities

```css
/* Hide scrollbar */
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

/* Touch optimization */
.touch-manipulation {
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}

/* Safe area insets (iPhone X+) */
.safe-area-inset-bottom {
  padding-bottom: env(safe-area-inset-bottom);
}
```

### Responsive Breakpoints

```js
screens: {
  'xs': '375px',     // iPhone SE
  'sm': '640px',     // Large phones
  'md': '768px',     // Tablets
  'lg': '1024px',    // Desktop
  'xl': '1280px',    // Large desktop
  'hover-hover': { raw: '(hover: hover)' },  // Devices with hover
  'touch': { raw: '(pointer: coarse)' },      // Touch devices
}
```

## Gestures & Interactions

### Pull-to-Refresh

```tsx
import { usePullToRefresh } from '@/hooks/useVirtualScroll';

const { pullDistance, isRefreshing, handlers } = usePullToRefresh({
  onRefresh: async () => {
    await refetchData();
  },
  threshold: 60,
  maxPullDistance: 100,
});

<div {...handlers}>
  {content}
</div>
```

### Swipe Gestures

```tsx
import { useSwipe } from '@/hooks/useVirtualScroll';

const swipeHandlers = useSwipe({
  onSwipeLeft: () => goToNextTab(),
  onSwipeRight: () => goToPrevTab(),
  threshold: 50,
});

<div {...swipeHandlers}>
  {content}
</div>
```

### Infinite Scroll

```tsx
import { useInfiniteScroll } from '@/hooks/useVirtualScroll';

const loadMoreRef = useInfiniteScroll({
  onLoadMore: () => loadNextPage(),
  hasMore: hasNextPage,
  loading: isLoading,
  threshold: 200,
});

<div ref={loadMoreRef}>Load more...</div>
```

## PWA Features

### Installation

```tsx
import { registerServiceWorker } from '@/utils/pwa';

// Register service worker on app load
useEffect(() => {
  registerServiceWorker().then(registration => {
    console.log('SW registered:', registration);
  });
}, []);
```

### Offline Support

```tsx
import { isOnline, addOfflineListener } from '@/utils/pwa';

const [online, setOnline] = useState(isOnline());

useEffect(() => {
  const handleOffline = () => setOnline(false);
  addOfflineListener(handleOffline);
}, []);
```

### Push Notifications

```tsx
import {
  requestNotificationPermission,
  subscribeToPushNotifications
} from '@/utils/pwa';

const setupNotifications = async () => {
  const permission = await requestNotificationPermission();
  if (permission === 'granted') {
    const registration = await navigator.serviceWorker.ready;
    await subscribeToPushNotifications(registration);
  }
};
```

### Background Sync

```tsx
import { registerBackgroundSync } from '@/utils/pwa';

// Sync claims when online
const claimRewards = async () => {
  try {
    await api.claimRewards();
  } catch (error) {
    // Register background sync to retry when online
    const registration = await navigator.serviceWorker.ready;
    await registerBackgroundSync(registration, 'sync-claims');
  }
};
```

## Testing Guide

### Mobile Breakpoints

Тестируйте на следующих размерах:
- **320px**: iPhone SE (legacy)
- **375px**: iPhone SE, iPhone 12 mini
- **390px**: iPhone 12, 13, 14
- **414px**: iPhone Plus models
- **428px**: iPhone 14 Pro Max
- **768px**: iPad
- **1024px**: iPad Pro

### Touch Events

```tsx
// Минимальный размер touch target: 44x44px
style={{ minHeight: '44px', minWidth: '44px' }}

// Active state для feedback
className="active:scale-95 active:bg-gray-100"
```

### Performance Metrics

- **First Contentful Paint (FCP)**: < 1.8s
- **Largest Contentful Paint (LCP)**: < 2.5s
- **Time to Interactive (TTI)**: < 3.8s
- **Cumulative Layout Shift (CLS)**: < 0.1

## Deployment Checklist

### PWA Manifest
- [x] manifest.json в /public
- [x] Icons (72, 96, 128, 144, 152, 192, 384, 512)
- [x] Screenshots (mobile + desktop)
- [x] Shortcuts (dashboard, share, claim)

### Service Worker
- [x] sw.js в /public
- [x] Offline page (offline.html)
- [x] Cache strategies настроены
- [x] Background sync enabled
- [x] Push notifications setup

### Meta Tags
```html
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes">
<meta name="theme-color" content="#9333ea">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<link rel="manifest" href="/manifest.json">
<link rel="apple-touch-icon" href="/icons/icon-192x192.png">
```

### HTTPS Required
PWA работает только на HTTPS (или localhost для разработки).

## Browser Support

### Полная поддержка:
- Chrome/Edge 90+
- Safari 15+
- Firefox 90+

### Частичная поддержка:
- Safari < 15 (нет push notifications)
- Firefox (нет background sync)

### Fallbacks:
- iOS < 15: Manual refresh вместо pull-to-refresh
- Старые браузеры: Graceful degradation без PWA features

## Troubleshooting

### Service Worker не регистрируется
```js
// Check HTTPS
console.log(window.location.protocol); // должно быть 'https:'

// Check service worker support
console.log('serviceWorker' in navigator);
```

### Pull-to-refresh не работает
```js
// Disable browser default pull-to-refresh
html, body {
  overscroll-behavior-y: contain;
}
```

### Infinite scroll не загружает
```js
// Check intersection observer support
console.log('IntersectionObserver' in window);
```

## Best Practices

1. **Touch Targets**: Минимум 44x44px
2. **Loading States**: Всегда показывайте skeleton/spinner
3. **Error Handling**: Graceful degradation при ошибках
4. **Offline First**: Кэшируйте критичные данные
5. **Performance**: Lazy load все тяжелое
6. **Animations**: 60fps, используйте transform/opacity
7. **Accessibility**: Поддержка screen readers
8. **Safe Areas**: iOS notch/home indicator

## Resources

- [PWA Builder](https://www.pwabuilder.com/)
- [Workbox (Google)](https://developers.google.com/web/tools/workbox)
- [Web.dev PWA Guide](https://web.dev/progressive-web-apps/)
- [Apple PWA Documentation](https://developer.apple.com/library/archive/documentation/AppleApplications/Reference/SafariWebContent/ConfiguringWebApplications/ConfiguringWebApplications.html)
