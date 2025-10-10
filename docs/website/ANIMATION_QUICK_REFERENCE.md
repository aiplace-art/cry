# Animation Quick Reference - HypeAI

**Fast lookup guide for developers implementing animations**

---

## Library Installation

```bash
# Primary libraries
npm install framer-motion
npm install react-countup
npm install react-loading-skeleton
npm install lightweight-charts

# Optional/Secondary
npm install gsap
npm install @react-spring/web
npm install lottie-react
npm install canvas-confetti
```

---

## Common Patterns

### 1. Button with Hover Effect

```tsx
import { motion } from 'framer-motion';

<motion.button
  whileHover={{ scale: 1.02, y: -2 }}
  whileTap={{ scale: 0.98 }}
  transition={{ duration: 0.2 }}
>
  Trade Now
</motion.button>
```

### 2. Price Ticker

```tsx
import { useCountUp } from 'react-countup';

const { update } = useCountUp({
  ref: 'price',
  start: 0,
  end: 100,
  duration: 0.3,
  decimals: 2,
  prefix: '$'
});

// Update on new price
useEffect(() => {
  update(newPrice);
}, [newPrice]);
```

### 3. Skeleton Loading

```tsx
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

<Skeleton
  baseColor="#1e293b"
  highlightColor="#334155"
  duration={1.5}
  count={5}
/>
```

### 4. Success Checkmark

```tsx
import { motion } from 'framer-motion';

<motion.svg
  initial={{ scale: 0 }}
  animate={{ scale: 1 }}
  transition={{ type: "spring", stiffness: 200 }}
>
  <motion.path
    d="M14 27l7 7 16-16"
    initial={{ pathLength: 0 }}
    animate={{ pathLength: 1 }}
    transition={{ duration: 0.5 }}
  />
</motion.svg>
```

### 5. Loading Spinner

```tsx
<motion.div
  animate={{ rotate: 360 }}
  transition={{
    duration: 1,
    repeat: Infinity,
    ease: "linear"
  }}
  className="spinner"
/>
```

---

## CSS Snippets

### GPU-Accelerated Hover

```css
.button {
  transition: transform 200ms cubic-bezier(0.4, 0, 0.2, 1);
  will-change: transform;
}

.button:hover {
  transform: translateY(-2px) translateZ(0);
}
```

### Price Flash Animation

```css
@keyframes priceFlash {
  0% { background-color: transparent; }
  50% { background-color: rgba(34, 197, 94, 0.2); }
  100% { background-color: transparent; }
}

.price-up {
  animation: priceFlash 400ms ease-out;
}
```

### Shimmer Effect

```css
@keyframes shimmer {
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
}

.skeleton {
  background: linear-gradient(
    90deg,
    #1e293b 0px,
    #334155 50%,
    #1e293b 100%
  );
  background-size: 1000px 100%;
  animation: shimmer 1.5s infinite;
}
```

---

## Timing Reference

```javascript
// Import these constants
export const ANIMATION_TIMING = {
  instant: 150,      // Button press, toggle
  quick: 250,        // Tooltip, dropdown
  standard: 400,     // Modal, page transition
  deliberate: 600,   // Success animation
  slow: 1000         // Background effects
};

export const EASINGS = {
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
  easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
  sharp: 'cubic-bezier(0.4, 0, 0.6, 1)'
};
```

---

## Performance Rules

### ✅ DO
- Use `transform` and `opacity`
- Add `will-change` before animation
- Remove `will-change` after animation
- Throttle WebSocket updates
- Use `requestAnimationFrame`

### ❌ DON'T
- Animate `width`, `height`, `margin`
- Use `will-change` permanently
- Update UI at >30fps
- Ignore `prefers-reduced-motion`

---

## Chart Setup

```tsx
import { createChart } from 'lightweight-charts';

const chart = createChart(container, {
  width: 800,
  height: 400,
  timeScale: {
    timeVisible: true,
    secondsVisible: false
  }
});

const lineSeries = chart.addLineSeries({
  color: '#667eea',
  lineWidth: 2
});

lineSeries.setData(data);
```

---

## Reduced Motion Support

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

```tsx
// React/Framer Motion
import { useReducedMotion } from 'framer-motion';

const shouldReduceMotion = useReducedMotion();

<motion.div
  animate={{ x: shouldReduceMotion ? 0 : 100 }}
  transition={{ duration: shouldReduceMotion ? 0 : 0.3 }}
/>
```

---

## Color Flash Helper

```tsx
const useColorFlash = (value: number, prevValue: number) => {
  const [flashColor, setFlashColor] = useState('transparent');

  useEffect(() => {
    if (value > prevValue) {
      setFlashColor('rgba(34, 197, 94, 0.2)'); // green
    } else if (value < prevValue) {
      setFlashColor('rgba(239, 68, 68, 0.2)'); // red
    }

    const timer = setTimeout(() => {
      setFlashColor('transparent');
    }, 400);

    return () => clearTimeout(timer);
  }, [value, prevValue]);

  return flashColor;
};
```

---

## WebSocket Throttling

```tsx
const useThrottledWebSocket = (url: string, throttleMs = 100) => {
  const [data, setData] = useState(null);

  useEffect(() => {
    const ws = new WebSocket(url);
    let lastUpdate = 0;

    ws.onmessage = (event) => {
      const now = Date.now();
      if (now - lastUpdate > throttleMs) {
        setData(JSON.parse(event.data));
        lastUpdate = now;
      }
    };

    return () => ws.close();
  }, [url, throttleMs]);

  return data;
};
```

---

## Page Transition Setup

```tsx
import { AnimatePresence, motion } from 'framer-motion';

function App() {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
```

---

## Stagger Animation

```tsx
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

<motion.ul variants={container} initial="hidden" animate="show">
  {items.map(item => (
    <motion.li key={item} variants={item}>
      {item}
    </motion.li>
  ))}
</motion.ul>
```

---

## Modal Animation

```tsx
const modalVariants = {
  hidden: {
    opacity: 0,
    scale: 0.9
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.2
    }
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    transition: {
      duration: 0.15
    }
  }
};

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 }
};

<AnimatePresence>
  {isOpen && (
    <>
      <motion.div
        className="backdrop"
        variants={backdropVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        onClick={onClose}
      />
      <motion.div
        className="modal"
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        {children}
      </motion.div>
    </>
  )}
</AnimatePresence>
```

---

## Confetti on Success

```tsx
import confetti from 'canvas-confetti';

const celebrate = () => {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#22c55e', '#16a34a', '#15803d']
  });
};

<button onClick={celebrate}>
  Execute Trade
</button>
```

---

## Scroll Animation

```tsx
import { useScroll, useTransform, motion } from 'framer-motion';

const { scrollYProgress } = useScroll();
const scale = useTransform(scrollYProgress, [0, 1], [1, 1.5]);
const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [1, 0.5, 0]);

<motion.div style={{ scale, opacity }}>
  Parallax Content
</motion.div>
```

---

## Lazy Load Animations

```tsx
import { lazy, Suspense } from 'react';
import Skeleton from 'react-loading-skeleton';

const HeavyAnimation = lazy(() => import('./HeavyAnimation'));

<Suspense fallback={<Skeleton height={400} />}>
  <HeavyAnimation />
</Suspense>
```

---

## Testing Animations

```tsx
// Check for reduced motion
const prefersReducedMotion = window.matchMedia(
  '(prefers-reduced-motion: reduce)'
);

if (prefersReducedMotion.matches) {
  // Disable or simplify animations
}

// Performance monitoring
const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    console.log('Animation duration:', entry.duration);
  }
});

observer.observe({ entryTypes: ['measure'] });
```

---

## Troubleshooting

### Animation Not Smooth
- Check if using GPU-accelerated properties
- Verify `will-change` is applied
- Look for layout thrashing in DevTools
- Reduce animation complexity

### High CPU Usage
- Throttle WebSocket updates
- Use virtual scrolling for long lists
- Implement lazy loading
- Check for infinite animation loops

### Flash of Unstyled Content
- Add Suspense delay (300ms)
- Preload critical animations
- Use skeleton screens
- Implement progressive loading

---

**Quick Links:**
- [Full Specification](/Users/ai.place/Crypto/docs/website/ANIMATION_SPECIFICATION.md)
- [Research Summary](/Users/ai.place/Crypto/docs/website/MOTION_RESEARCH_SUMMARY.md)
- [Framer Motion Docs](https://www.framer.com/motion/)
- [TradingView Charts](https://www.tradingview.com/lightweight-charts/)

---

*Last Updated: 2025-10-10*
