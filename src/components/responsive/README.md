# Responsive AI Chat Layout System

Complete adaptive layout system for AI chat with agent visualization across desktop, tablet, and mobile devices.

## Features

### 📱 Mobile (<768px)
- **Bottom Drawer**: Swipe-up agent visualization
- **Fixed Input**: Always accessible chat input
- **Simplified UI**: List-based agent view
- **Touch Gestures**: Swipe to dismiss, pull to refresh
- **Keyboard Handling**: Automatic adjustment for keyboard

### 📱 Tablet (768px-1024px)
- **Portrait Mode**: Tabbed interface (Chat / Agents / Metrics)
- **Landscape Mode**: Split view (Chat + Agents)
- **Collapsible Panels**: Quick metrics drawer
- **Touch Optimized**: Larger tap targets, gesture support

### 🖥️ Desktop (>1024px)
- **Split View**: Chat (60%) + Agent Graph (40%)
- **Sidebar**: Detailed metrics panel
- **Full Graph**: Complete agent visualization with zoom/pan
- **Multi-column**: Optimal use of screen space

## Components

### ResponsiveLayout
Main responsive container that automatically selects appropriate layout:

```jsx
import { ResponsiveLayout } from './components/responsive';

<ResponsiveLayout
  messages={messages}
  agents={agents}
  metrics={metrics}
  onSendMessage={handleSend}
  onAgentSelect={handleSelect}
/>
```

### MobileAgentDrawer
Bottom drawer with swipe gestures:

```jsx
import { MobileAgentDrawer } from './components/responsive';

<MobileAgentDrawer
  agents={agents}
  metrics={metrics}
  isOpen={drawerOpen}
  onClose={() => setDrawerOpen(false)}
  onAgentSelect={handleSelect}
/>
```

### TabletTabs
Tabbed navigation for tablet:

```jsx
import { TabletTabs } from './components/responsive';

<TabletTabs
  tabs={[
    { id: 'chat', label: 'Chat', icon: '💬' },
    { id: 'agents', label: 'Agents', icon: '🤖' }
  ]}
  activeTab={activeTab}
  onTabChange={setActiveTab}
/>
```

## Touch Gestures

### useTouchGestures
Comprehensive gesture handling:

```jsx
import { useTouchGestures } from './components/responsive';

const {
  panResponder,
  transform,
  resetTransform
} = useTouchGestures({
  onPinch: (scale) => console.log('Pinch', scale),
  onPan: (dx, dy) => console.log('Pan', dx, dy),
  onSwipe: (direction) => console.log('Swipe', direction),
  onDoubleTap: () => console.log('Double tap'),
  minScale: 0.5,
  maxScale: 3
});

<Animated.View
  {...panResponder.panHandlers}
  style={{ transform: [
    { scale: transform.scale },
    { translateX: transform.translateX },
    { translateY: transform.translateY }
  ]}}
>
  {/* Your content */}
</Animated.View>
```

### useSwipeToDismiss
Swipe to dismiss modals/drawers:

```jsx
import { useSwipeToDismiss } from './components/responsive';

const { panResponder, translateY } = useSwipeToDismiss({
  threshold: 100,
  onDismiss: handleClose
});

<Animated.View
  {...panResponder.panHandlers}
  style={{ transform: [{ translateY }] }}
>
  {/* Drawer content */}
</Animated.View>
```

### useTabSwipe
Swipe between tabs:

```jsx
import { useTabSwipe } from './components/responsive';

const { panResponder, translateX } = useTabSwipe({
  tabs: ['chat', 'agents', 'metrics'],
  activeIndex: 0,
  onSwipeLeft: () => goToNextTab(),
  onSwipeRight: () => goToPrevTab()
});
```

## Breakpoints

```javascript
const BREAKPOINTS = {
  mobile: 768,    // < 768px
  tablet: 1024,   // 768px - 1024px
  desktop: Infinity // > 1024px
};
```

## Performance Optimizations

### Mobile
- **Lazy Loading**: Load graph data on drawer open
- **Virtualization**: FlatList for agent lists
- **Reduced Animations**: Simpler transitions
- **Image Optimization**: Lower quality for mobile

### Tablet
- **Conditional Rendering**: Only render active tab
- **Debounced Updates**: Throttle graph updates
- **Smart Caching**: Cache tab content

### Desktop
- **Full Features**: All visualizations enabled
- **Real-time Updates**: Live agent status
- **Advanced Graphics**: Full D3.js visualizations

## Usage Example

```jsx
import React, { useState } from 'react';
import { ResponsiveLayout } from './components/responsive';

function App() {
  const [messages, setMessages] = useState([]);
  const [agents] = useState([
    {
      id: '1',
      name: 'Agent Alpha',
      type: 'researcher',
      status: 'active',
      performance: 95,
      tasksCompleted: 42,
      currentTask: 'Analyzing data patterns...'
    },
    // ... more agents
  ]);

  const handleSend = (message) => {
    setMessages([...messages, {
      id: Date.now(),
      text: message,
      sender: 'user',
      timestamp: new Date()
    }]);
  };

  const handleAgentSelect = (agent) => {
    console.log('Selected agent:', agent);
  };

  return (
    <ResponsiveLayout
      messages={messages}
      agents={agents}
      metrics={{
        avgPerformance: 92,
        totalTasks: 156,
        activeAgents: 3
      }}
      onSendMessage={handleSend}
      onAgentSelect={handleAgentSelect}
    />
  );
}
```

## Testing

Test on different screen sizes:

```bash
# Mobile (iPhone 14 Pro)
# 393 × 852

# Tablet (iPad Pro)
# 1024 × 1366

# Desktop
# 1920 × 1080
```

## Browser Support

- iOS Safari 14+
- Chrome Android 90+
- Chrome Desktop 90+
- Firefox 88+
- Safari 14+

## Accessibility

- ✅ Touch targets: Minimum 44×44 pt
- ✅ Contrast: WCAG AA compliant
- ✅ Screen readers: Full ARIA support
- ✅ Keyboard navigation: Desktop support
- ✅ Focus indicators: Visible focus states

## Future Enhancements

1. **Split-screen multitasking** (iPad)
2. **Foldable device support**
3. **Haptic feedback** (iOS/Android)
4. **Voice commands** (mobile)
5. **Gesture customization**
6. **Offline mode** (PWA)
