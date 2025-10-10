# HYPEAI Intelligent Features - Integration Guide

## Quick Start

### 1. Installation

All intelligent features are included in the presale platform. No additional installation needed.

```bash
# Install dependencies
npm install

# Run tests
npm test

# Build
npm run build
```

### 2. Basic Usage

Import and use the features in your React components:

```typescript
import {
  useCalculator,
  useAnalytics,
  useRecommendations,
  useLiveUpdates
} from '@/frontend/hooks';

function MyPresaleComponent() {
  const { calculateFromUSD, result } = useCalculator();
  const { track } = useAnalytics();
  const { recommendations } = useRecommendations({...});
  const { updates, progress } = useLiveUpdates();

  // Your component logic
}
```

## Feature Integration

### Smart Calculator

**Purpose:** Calculate investment returns with real-time BNB pricing

**When to use:**
- Investment calculator forms
- Quick quote displays
- ROI projections
- VIP tier previews

**Example:**
```typescript
import { useCalculator } from '@/frontend/hooks';

function Calculator() {
  const { calculateFromUSD, result, priceData, loading } = useCalculator();
  const [amount, setAmount] = useState(1000);

  useEffect(() => {
    calculateFromUSD(amount);
  }, [amount]);

  return (
    <div>
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(Number(e.target.value))}
      />

      {loading && <p>Calculating...</p>}

      {result && (
        <div>
          <p>Tokens: {result.totalTokens.toLocaleString()}</p>
          <p>Bonus: {result.bonusTokens.toLocaleString()}</p>
          {result.vipTier && <p>Tier: {result.vipTier.name}</p>}
        </div>
      )}
    </div>
  );
}
```

### Analytics Tracking

**Purpose:** Track user behavior and conversion metrics

**When to use:**
- Page views
- User actions
- Conversion events
- Error tracking

**Example:**
```typescript
import { useAnalytics } from '@/frontend/hooks';

function Presale() {
  const { track, trackWalletConnection, visitorStats } = useAnalytics();

  const handleConnect = async (address: string) => {
    trackWalletConnection(address, 'MetaMask');
  };

  const handleBuy = () => {
    track('buy_clicked', { amount: 1000 });
  };

  return (
    <div>
      <p>Online: {visitorStats?.online}</p>
      <button onClick={handleConnect}>Connect Wallet</button>
      <button onClick={handleBuy}>Buy Now</button>
    </div>
  );
}
```

### Smart Recommendations

**Purpose:** Provide personalized investment suggestions

**When to use:**
- First-time visitors
- Users exploring options
- Tier upgrade prompts
- FOMO notifications

**Example:**
```typescript
import { useRecommendations } from '@/frontend/hooks';

function Recommendations() {
  const { recommendations, fomo } = useRecommendations({
    currentInvestment: 0,
    walletConnected: false,
    previousVisits: 1,
    timeOnPage: 60,
    calculatorUsage: 2
  });

  return (
    <div>
      {fomo && (
        <div className={`alert-${fomo.urgency}`}>
          {fomo.message}
        </div>
      )}

      {recommendations.map(rec => (
        <div key={rec.type}>
          <h3>{rec.title}</h3>
          <p>{rec.description}</p>
          <span>{rec.value}</span>
        </div>
      ))}
    </div>
  );
}
```

### Live Updates

**Purpose:** Real-time presale statistics and activity feed

**When to use:**
- Live activity feeds
- Progress tracking
- Community engagement
- Social proof

**Example:**
```typescript
import { useLiveUpdates } from '@/frontend/hooks';

function LiveFeed() {
  const { updates, progress, stats, connected } = useLiveUpdates();

  return (
    <div>
      <div>Status: {connected ? '🟢 Live' : '🔴 Offline'}</div>

      {progress && (
        <progress value={progress.current} max={progress.target} />
      )}

      <div>
        <h3>Recent Activity</h3>
        {updates.slice(0, 5).map((update, i) => (
          <div key={i}>
            {update.type === 'purchase' && (
              <p>💰 ${update.data.amount} from {update.data.country}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
```

## Advanced Integration

### Complete Presale Page

See `/src/frontend/components/IntelligentPresale.tsx` for a complete example integrating all features.

Key sections:
1. Header with live stats
2. FOMO triggers
3. Smart calculator
4. VIP tier display
5. Recommendations panel
6. Live activity feed
7. Progress tracking
8. Conversion funnel

### Custom Hooks Composition

Create custom hooks that combine multiple features:

```typescript
import { useCalculator, useRecommendations } from '@/frontend/hooks';

function useSmartInvestment(initialAmount: number) {
  const { calculateFromUSD, result } = useCalculator();
  const { recommendations } = useRecommendations({
    currentInvestment: initialAmount,
    walletConnected: true,
    previousVisits: 3,
    timeOnPage: 120,
    calculatorUsage: 5
  });

  useEffect(() => {
    calculateFromUSD(initialAmount);
  }, [initialAmount]);

  const nextTierRec = recommendations.find(r => r.type === 'tier');

  return {
    result,
    recommendations,
    suggestedUpgrade: nextTierRec
  };
}
```

## Configuration

### Environment Variables

```env
# CoinGecko API (optional - has default)
REACT_APP_COINGECKO_API=https://api.coingecko.com/api/v3

# WebSocket URL (optional - defaults to simulated mode)
REACT_APP_WS_URL=wss://api.hypeai.com/live

# Analytics (optional)
REACT_APP_ANALYTICS_ENABLED=true
```

### Feature Flags

```typescript
// src/config/features.ts
export const FEATURES = {
  calculator: {
    enabled: true,
    cacheDuration: 60000, // 1 minute
    fallbackBNBPrice: 300
  },
  analytics: {
    enabled: true,
    batchInterval: 30000, // 30 seconds
    maxEvents: 1000
  },
  recommendations: {
    enabled: true,
    minConfidence: 0.5
  },
  liveUpdates: {
    enabled: true,
    simulatedMode: true,
    updateInterval: 5000 // 5 seconds
  }
};
```

## Styling

### CSS Classes

The components use standard CSS classes for styling:

```css
/* Calculator */
.calculator-section { }
.amount-input { }
.results { }
.vip-badge { }

/* Recommendations */
.recommendations-section { }
.recommendation { }
.fomo-banner { }

/* Live Updates */
.live-feed-section { }
.feed-item { }
.progress-section { }

/* Stats */
.stats-bar { }
.stat { }
```

### Tailwind Integration

```typescript
// Example with Tailwind classes
<div className="bg-white rounded-lg shadow-lg p-6">
  <h2 className="text-2xl font-bold mb-4">Calculator</h2>
  <input className="w-full px-4 py-2 border rounded" />
</div>
```

## Error Handling

### Calculator Errors

```typescript
const { calculateFromUSD, error } = useCalculator();

if (error) {
  console.error('Calculator error:', error);
  // Show fallback UI
}
```

### Analytics Errors

Analytics errors are automatically logged but don't interrupt user experience.

```typescript
// Errors are caught internally
analytics.track('event'); // Never throws
```

### WebSocket Errors

Live updates automatically fall back to simulated mode on WebSocket errors.

```typescript
const { connected } = useLiveUpdates();

if (!connected) {
  // Show offline indicator
}
```

## Performance Optimization

### Caching

All features implement intelligent caching:

- **Calculator:** 1-minute BNB price cache
- **Analytics:** 30-second event batching
- **Recommendations:** Session-level caching
- **Live Updates:** In-memory update buffer

### Lazy Loading

Load features only when needed:

```typescript
import { lazy, Suspense } from 'react';

const IntelligentPresale = lazy(
  () => import('./components/IntelligentPresale')
);

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <IntelligentPresale />
    </Suspense>
  );
}
```

### Debouncing

Debounce expensive operations:

```typescript
import { useMemo, useCallback } from 'react';
import { debounce } from 'lodash';

const debouncedCalculate = useMemo(
  () => debounce(calculateFromUSD, 300),
  [calculateFromUSD]
);
```

## Testing

### Unit Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test calculator.test.ts

# Watch mode
npm test -- --watch

# Coverage report
npm test -- --coverage
```

### Integration Tests

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import { IntelligentPresale } from './components/IntelligentPresale';

test('displays calculator results', async () => {
  render(<IntelligentPresale />);

  const input = screen.getByPlaceholderText(/enter.*amount/i);
  fireEvent.change(input, { target: { value: '1000' } });

  await waitFor(() => {
    expect(screen.getByText(/you'll receive/i)).toBeInTheDocument();
  });
});
```

## Troubleshooting

### Common Issues

**1. BNB Price Not Loading**
- Check CoinGecko API availability
- Verify network connectivity
- Check cache (1-minute TTL)

**2. Analytics Not Tracking**
- Check localStorage/sessionStorage availability
- Verify event names are correct
- Check browser console for errors

**3. Live Updates Not Working**
- Verify WebSocket URL (or use simulated mode)
- Check network tab for WebSocket connection
- Ensure hooks are called inside React components

**4. Recommendations Not Showing**
- Verify user context is provided
- Check confidence threshold
- Ensure calculator has been used

## Support

**Documentation:**
- [Intelligent Features](/docs/INTELLIGENT_FEATURES.md)
- [API Reference](/docs/API_REFERENCE.md)
- [Examples](/examples)

**Community:**
- Discord: https://discord.gg/hypeai
- GitHub: https://github.com/hypeai/presale
- Email: support@hypeai.com

## License

MIT License - see LICENSE file for details
