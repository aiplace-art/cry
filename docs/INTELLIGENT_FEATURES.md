# HYPEAI Intelligent Features

## Overview

This document describes the intelligent features added to the HYPEAI presale platform, including smart calculations, analytics tracking, personalized recommendations, and real-time updates.

## Features

### 1. Smart Price Calculator (`/src/frontend/lib/calculator.ts`)

Real-time investment calculator with BNB price integration.

**Features:**
- Real-time BNB price from CoinGecko API
- USD to HYPEAI token conversion
- BNB to HYPEAI token conversion
- Automatic VIP tier detection
- Bonus calculation (10-25% based on tier)
- ROI projections (Week 1, Month 1, Month 6)
- Price caching (1-minute TTL)

**VIP Tiers:**
- Diamond VIP: $50,000+ (25% bonus)
- Platinum VIP: $25,000-$49,999 (20% bonus)
- Gold VIP: $10,000-$24,999 (15% bonus)
- Silver VIP: $5,000-$9,999 (12% bonus)
- Base: Below $5,000 (10% bonus)

**Usage:**
```typescript
import { priceCalculator } from './lib/calculator';

// Calculate from USD
const result = await priceCalculator.calculateFromUSD(1000);
console.log(result.totalTokens); // Total tokens including bonus

// Calculate from BNB
const result = await priceCalculator.calculateFromBNB(5);
console.log(result.vipTier); // VIP tier info

// Get price data
const prices = await priceCalculator.getPriceData();
console.log(prices.bnbPriceUSD);
```

**React Hook:**
```typescript
import { useCalculator } from './hooks';

function Calculator() {
  const { calculateFromUSD, result, loading, priceData } = useCalculator();

  const handleCalculate = async () => {
    await calculateFromUSD(1000);
  };

  return (
    <div>
      <p>BNB Price: ${priceData?.bnbPriceUSD}</p>
      {result && (
        <p>You'll receive {result.totalTokens} HYPEAI tokens</p>
      )}
    </div>
  );
}
```

### 2. Analytics Integration (`/src/frontend/lib/analytics.ts`)

Comprehensive analytics tracking for user behavior and conversions.

**Features:**
- Session management (30-minute timeout)
- Unique visitor tracking
- Conversion funnel tracking
- Event batching and persistence
- Page view tracking
- Wallet connection tracking
- Purchase tracking
- Calculator usage tracking
- Error tracking

**Funnel Stages:**
1. Page View
2. Calculator Used
3. Wallet Connected
4. Purchase Initiated
5. Purchase Completed

**Usage:**
```typescript
import { analytics } from './lib/analytics';

// Track page view
analytics.trackPageView('/presale');

// Track wallet connection
analytics.trackWalletConnection('0x123...', 'MetaMask');

// Track purchase
analytics.trackPurchaseSuccess('0xabc...', 1000, 5000000);

// Get funnel data
const funnel = analytics.getFunnelData();

// Get visitor stats
const stats = analytics.getVisitorStats();
```

**React Hook:**
```typescript
import { useAnalytics } from './hooks';

function Analytics() {
  const { funnelData, visitorStats, trackWalletConnection } = useAnalytics();

  return (
    <div>
      <p>Online: {visitorStats?.online}</p>
      <p>Purchases 24h: {visitorStats?.purchases24h}</p>
    </div>
  );
}
```

### 3. Smart Recommendations (`/src/frontend/lib/recommendations.ts`)

AI-powered recommendations based on user behavior and market conditions.

**Features:**
- Investment amount recommendations
- VIP tier upgrade suggestions
- Payment method recommendations (BNB vs USDT)
- Timing recommendations (network conditions)
- FOMO triggers (urgency-based)
- Quick-select suggested amounts

**Recommendation Types:**
- Investment: Optimal starting amounts
- Tier: VIP upgrade opportunities
- Payment: Best payment method
- Timing: Optimal purchase timing

**Usage:**
```typescript
import { recommendationEngine } from './lib/recommendations';

// Generate recommendations
const recs = await recommendationEngine.generateRecommendations({
  currentInvestment: 1000,
  walletConnected: true,
  previousVisits: 2,
  timeOnPage: 60,
  calculatorUsage: 3
});

// Get FOMO trigger
const fomo = recommendationEngine.getFOMOTrigger();
if (fomo) {
  console.log(fomo.message); // "Only 50 spots remaining!"
  console.log(fomo.urgency); // "high"
}

// Get suggested amounts
const amounts = recommendationEngine.getSuggestedAmounts();
```

**React Hook:**
```typescript
import { useRecommendations } from './hooks';

function Recommendations() {
  const { recommendations, fomo, loading } = useRecommendations({
    currentInvestment: 0,
    walletConnected: false,
    previousVisits: 1,
    timeOnPage: 30,
    calculatorUsage: 0
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
          <span>Confidence: {rec.confidence * 100}%</span>
        </div>
      ))}
    </div>
  );
}
```

### 4. Live Updates System (`/src/frontend/lib/liveUpdates.ts`)

Real-time presale statistics and notifications via WebSocket.

**Features:**
- WebSocket connection with auto-reconnect
- Simulated mode for development
- Real-time purchase notifications
- Progress updates (every 5 seconds)
- Visitor statistics
- Community activity feed
- Multiple subscriber support

**Update Types:**
- Purchase: New purchase notifications
- Milestone: Achievement updates
- Visitor: Community activity
- Progress: Presale progress updates

**Usage:**
```typescript
import { liveUpdates } from './lib/liveUpdates';

// Connect (simulated mode by default)
liveUpdates.connect();

// Or connect to WebSocket server
liveUpdates.connect('wss://api.hypeai.com/live');

// Subscribe to updates
const unsubscribe = liveUpdates.onUpdate((update) => {
  if (update.type === 'purchase') {
    console.log(`New purchase: ${update.data.amount} USD`);
  }
});

// Subscribe to progress
liveUpdates.onProgress((progress) => {
  console.log(`Progress: ${progress.percentage}%`);
});

// Subscribe to stats
liveUpdates.onStats((stats) => {
  console.log(`Online: ${stats.online} users`);
});

// Cleanup
liveUpdates.disconnect();
```

**React Hook:**
```typescript
import { useLiveUpdates } from './hooks';

function LiveFeed() {
  const { updates, progress, stats, connected } = useLiveUpdates();

  return (
    <div>
      <div>Status: {connected ? 'Connected' : 'Disconnected'}</div>

      {progress && (
        <div>
          <p>Progress: {progress.percentage.toFixed(2)}%</p>
          <progress value={progress.current} max={progress.target} />
        </div>
      )}

      {stats && (
        <div>
          <p>Online: {stats.online}</p>
          <p>Purchases 24h: {stats.purchases24h}</p>
          <p>Avg Investment: ${stats.avgInvestment}</p>
        </div>
      )}

      <div>
        {updates.map((update, i) => (
          <div key={i}>
            {update.type === 'purchase' && (
              <p>💰 New purchase: ${update.data.amount}</p>
            )}
            {update.type === 'visitor' && (
              <p>👥 {update.data.action}: {update.data.count}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
```

## Integration Example

Complete example integrating all features:

```typescript
import {
  useCalculator,
  useAnalytics,
  useRecommendations,
  useLiveUpdates
} from './hooks';

function PresalePage() {
  const [amount, setAmount] = useState(1000);

  // Smart calculator
  const { calculateFromUSD, result, priceData } = useCalculator();

  // Analytics
  const { trackWalletConnection, visitorStats } = useAnalytics();

  // Recommendations
  const { recommendations, fomo } = useRecommendations({
    currentInvestment: 0,
    walletConnected: false,
    previousVisits: 1,
    timeOnPage: 60,
    calculatorUsage: 1
  });

  // Live updates
  const { updates, progress, stats } = useLiveUpdates();

  useEffect(() => {
    calculateFromUSD(amount);
  }, [amount]);

  return (
    <div>
      {/* Live Stats */}
      <div className="stats">
        <div>Online: {stats?.online || 0}</div>
        <div>24h Purchases: {stats?.purchases24h || 0}</div>
      </div>

      {/* FOMO Trigger */}
      {fomo && (
        <div className={`alert-${fomo.urgency}`}>
          ⚡ {fomo.message}
        </div>
      )}

      {/* Calculator */}
      <div className="calculator">
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
        />

        {result && (
          <div>
            <p>You'll receive: {result.totalTokens.toLocaleString()} HYPEAI</p>
            <p>Bonus: {result.bonusTokens.toLocaleString()} tokens</p>
            {result.vipTier && (
              <p>VIP Tier: {result.vipTier.name}</p>
            )}
            <p>Week 1 ROI: {result.roi.week1.toFixed(2)}%</p>
          </div>
        )}
      </div>

      {/* Recommendations */}
      <div className="recommendations">
        {recommendations.map(rec => (
          <div key={rec.type}>
            <h3>{rec.title}</h3>
            <p>{rec.description}</p>
          </div>
        ))}
      </div>

      {/* Live Feed */}
      <div className="live-feed">
        <h3>Recent Activity</h3>
        {updates.slice(0, 5).map((update, i) => (
          <div key={i}>
            {update.type === 'purchase' && (
              <p>💰 ${update.data.amount} from {update.data.country}</p>
            )}
          </div>
        ))}
      </div>

      {/* Progress */}
      {progress && (
        <div className="progress">
          <progress value={progress.current} max={progress.target} />
          <p>{progress.percentage.toFixed(2)}% Complete</p>
        </div>
      )}
    </div>
  );
}
```

## Testing

Run the comprehensive test suite:

```bash
npm test tests/frontend/
```

**Test Coverage:**
- Calculator: BNB price fetching, calculations, VIP tiers, ROI
- Analytics: Session management, event tracking, funnel, persistence
- Recommendations: Investment, tier, payment, timing, FOMO
- Live Updates: Connection, handlers, simulated data

## Performance

**Optimizations:**
- Price caching (1-minute TTL)
- Event batching (30-second intervals)
- LocalStorage persistence
- WebSocket auto-reconnect
- Simulated mode fallback

**Metrics:**
- Price fetch: < 500ms
- Calculation: < 50ms
- Analytics flush: < 100ms
- Update delivery: < 100ms

## Security

**Best Practices:**
- No sensitive data in localStorage
- Wallet addresses truncated in analytics
- API rate limiting respected
- HTTPS/WSS only in production
- Input validation on all calculations

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**Required APIs:**
- Fetch API
- WebSocket API
- LocalStorage API
- SessionStorage API

## Future Enhancements

1. Machine learning for personalized recommendations
2. A/B testing framework
3. Advanced analytics dashboards
4. Real-time collaboration features
5. Push notifications
6. Multi-language support
7. Mobile app integration

## Support

For questions or issues:
- GitHub: https://github.com/hypeai/presale
- Email: support@hypeai.com
- Discord: https://discord.gg/hypeai
