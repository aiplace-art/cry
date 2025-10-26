# React SDK - Hooks & Utilities

Production-ready React hooks for HypeAI API integration.

## 📦 Installation

```bash
npm install @hypeai/react-sdk
# or
yarn add @hypeai/react-sdk
```

## 🚀 Quick Start

```tsx
import { HypeAIProvider, useAuth, usePresale } from '@hypeai/react-sdk';

function App() {
  return (
    <HypeAIProvider apiUrl="https://api.hypeai.io/v1">
      <Dashboard />
    </HypeAIProvider>
  );
}

function Dashboard() {
  const { user, login, logout } = useAuth();
  const { presale, loading } = usePresale();

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Welcome {user?.username}</h1>
      <p>Token Price: ${presale?.tokenPrice}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

## 🎣 Available Hooks

### useAuth

Authentication and user management.

```typescript
interface UseAuthReturn {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: Error | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, username: string) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
}

const auth = useAuth();
```

**Example:**

```tsx
function LoginForm() {
  const { login, isLoading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      // Redirect to dashboard
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        disabled={isLoading}
      />
      <input
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        disabled={isLoading}
      />
      {error && <div className="error">{error.message}</div>}
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
}
```

### usePresale

Presale information and real-time updates.

```typescript
interface UsePresaleReturn {
  presale: PresaleInfo | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  purchase: (amount: number, paymentMethod: string) => Promise<PurchaseResponse>;
}

const { presale, purchase } = usePresale();
```

**Example:**

```tsx
function PresaleWidget() {
  const { presale, loading, purchase } = usePresale();
  const [amount, setAmount] = useState(1000);

  const handlePurchase = async () => {
    try {
      const result = await purchase(amount, 'bnb');
      toast.success(`Purchased ${result.tokens} tokens!`);
    } catch (err) {
      toast.error('Purchase failed');
    }
  };

  if (loading) return <Skeleton />;

  return (
    <div className="presale-widget">
      <h2>Token Price: ${presale?.tokenPrice}</h2>
      <p>Sold: {presale?.tokensSold.toLocaleString()}</p>
      <p>Available: {presale?.tokensAvailable.toLocaleString()}</p>

      <input
        type="number"
        value={amount}
        onChange={e => setAmount(Number(e.target.value))}
      />
      <button onClick={handlePurchase}>
        Buy {amount / presale?.tokenPrice} Tokens
      </button>
    </div>
  );
}
```

### useWebSocket

Real-time WebSocket connection.

```typescript
interface UseWebSocketReturn {
  isConnected: boolean;
  lastMessage: WebSocketMessage | null;
  error: Error | null;
  subscribe: (channels: string[]) => void;
  unsubscribe: (channels: string[]) => void;
  send: (message: object) => void;
}

const ws = useWebSocket();
```

**Example:**

```tsx
function LivePresaleCounter() {
  const [tokensSold, setTokensSold] = useState(0);
  const { lastMessage, isConnected, subscribe } = useWebSocket();

  useEffect(() => {
    subscribe(['presale_updates']);
  }, []);

  useEffect(() => {
    if (lastMessage?.type === 'presale_update') {
      setTokensSold(lastMessage.data.tokensSold);
    }
  }, [lastMessage]);

  return (
    <div>
      <span className={isConnected ? 'online' : 'offline'}>
        {isConnected ? '🟢' : '🔴'}
      </span>
      <h3>Tokens Sold: {tokensSold.toLocaleString()}</h3>
    </div>
  );
}
```

### useTransactions

User transaction history with pagination.

```typescript
interface UseTransactionsReturn {
  transactions: Transaction[];
  loading: boolean;
  error: Error | null;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  refetch: () => Promise<void>;
}

const { transactions, loadMore, hasMore } = useTransactions();
```

**Example:**

```tsx
function TransactionHistory() {
  const { transactions, loading, hasMore, loadMore } = useTransactions();

  return (
    <div>
      <h2>Transaction History</h2>
      <div className="transactions">
        {transactions.map(tx => (
          <TransactionCard key={tx.id} transaction={tx} />
        ))}
      </div>

      {hasMore && (
        <button onClick={loadMore} disabled={loading}>
          {loading ? 'Loading...' : 'Load More'}
        </button>
      )}
    </div>
  );
}

function TransactionCard({ transaction }: { transaction: Transaction }) {
  return (
    <div className="transaction-card">
      <div className="tx-header">
        <span className={`status ${transaction.status}`}>
          {transaction.status}
        </span>
        <time>{new Date(transaction.createdAt).toLocaleDateString()}</time>
      </div>
      <div className="tx-details">
        <p>Amount: ${transaction.amount}</p>
        <p>Tokens: {transaction.tokens.toLocaleString()}</p>
        {transaction.txHash && (
          <a
            href={`https://bscscan.com/tx/${transaction.txHash}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            View on BSCScan →
          </a>
        )}
      </div>
    </div>
  );
}
```

### useAnalytics

Dashboard analytics and metrics.

```typescript
interface UseAnalyticsReturn {
  analytics: Analytics | null;
  loading: boolean;
  error: Error | null;
  period: '24h' | '7d' | '30d' | '90d';
  setPeriod: (period: string) => void;
  refetch: () => Promise<void>;
}

const { analytics, period, setPeriod } = useAnalytics();
```

**Example:**

```tsx
function AnalyticsDashboard() {
  const { analytics, loading, period, setPeriod } = useAnalytics();

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="analytics-dashboard">
      <div className="period-selector">
        <button
          onClick={() => setPeriod('24h')}
          className={period === '24h' ? 'active' : ''}
        >
          24H
        </button>
        <button
          onClick={() => setPeriod('7d')}
          className={period === '7d' ? 'active' : ''}
        >
          7D
        </button>
        <button
          onClick={() => setPeriod('30d')}
          className={period === '30d' ? 'active' : ''}
        >
          30D
        </button>
      </div>

      <div className="stats-grid">
        <StatCard
          title="Total Investors"
          value={analytics?.totalInvestors}
        />
        <StatCard
          title="Total Raised"
          value={`$${analytics?.totalRaised.toLocaleString()}`}
        />
        <StatCard
          title="Tokens Sold"
          value={analytics?.tokensSold.toLocaleString()}
        />
        <StatCard
          title="Avg Purchase"
          value={`$${analytics?.averagePurchase.toLocaleString()}`}
        />
      </div>

      <Chart data={analytics?.chartData} />
    </div>
  );
}
```

## 🔧 Utilities

### API Client

Pre-configured Axios instance.

```typescript
import { api } from '@hypeai/react-sdk';

// Already includes auth headers
const response = await api.get('/tokens/presale');
const data = await api.post('/tokens/purchase', {
  amount: 1000,
  paymentMethod: 'bnb'
});
```

### Type Definitions

```typescript
import type {
  User,
  PresaleInfo,
  Transaction,
  Analytics,
  PurchaseResponse,
  WebSocketMessage
} from '@hypeai/react-sdk/types';
```

### Error Boundaries

```tsx
import { ErrorBoundary } from '@hypeai/react-sdk';

function App() {
  return (
    <ErrorBoundary
      fallback={<ErrorPage />}
      onError={(error) => logError(error)}
    >
      <Dashboard />
    </ErrorBoundary>
  );
}
```

### Toast Notifications

```tsx
import { toast } from '@hypeai/react-sdk';

function Component() {
  const handleAction = async () => {
    try {
      await someAsyncAction();
      toast.success('Action completed!');
    } catch (err) {
      toast.error('Action failed');
    }
  };

  return <button onClick={handleAction}>Do Something</button>;
}
```

## 🎨 Components

### ProtectedRoute

```tsx
import { ProtectedRoute } from '@hypeai/react-sdk';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
```

### LoadingSpinner

```tsx
import { LoadingSpinner } from '@hypeai/react-sdk';

function Component() {
  const { loading } = usePresale();

  if (loading) return <LoadingSpinner />;

  return <div>Content</div>;
}
```

## ⚙️ Configuration

### Custom API URL

```tsx
<HypeAIProvider
  apiUrl="https://custom-api.example.com"
  wsUrl="wss://custom-ws.example.com"
>
  <App />
</HypeAIProvider>
```

### Custom Headers

```tsx
import { setDefaultHeaders } from '@hypeai/react-sdk';

setDefaultHeaders({
  'X-Custom-Header': 'value',
  'X-API-Version': '1.0'
});
```

### Token Storage

```tsx
<HypeAIProvider
  tokenStorage="sessionStorage" // or "localStorage" (default)
>
  <App />
</HypeAIProvider>
```

## 🧪 Testing

```tsx
import { renderHook, waitFor } from '@testing-library/react';
import { HypeAIProvider, useAuth } from '@hypeai/react-sdk';

const wrapper = ({ children }) => (
  <HypeAIProvider apiUrl="http://localhost:3000">
    {children}
  </HypeAIProvider>
);

test('useAuth login', async () => {
  const { result } = renderHook(() => useAuth(), { wrapper });

  await waitFor(() => {
    result.current.login('test@example.com', 'password');
  });

  await waitFor(() => {
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toBeTruthy();
  });
});
```

## 📱 React Query Integration

```tsx
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '@hypeai/react-sdk';

function usePresaleQuery() {
  return useQuery({
    queryKey: ['presale'],
    queryFn: async () => {
      const { data } = await api.get('/tokens/presale');
      return data;
    },
    refetchInterval: 5000 // Refetch every 5 seconds
  });
}

function usePurchaseMutation() {
  return useMutation({
    mutationFn: async ({ amount, paymentMethod }) => {
      const { data } = await api.post('/tokens/purchase', {
        amount,
        paymentMethod
      });
      return data;
    },
    onSuccess: () => {
      toast.success('Purchase successful!');
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });
}

// Usage
function Component() {
  const { data: presale, isLoading } = usePresaleQuery();
  const purchase = usePurchaseMutation();

  const handleBuy = () => {
    purchase.mutate({
      amount: 1000,
      paymentMethod: 'bnb'
    });
  };

  return (
    <div>
      <p>Price: ${presale?.tokenPrice}</p>
      <button
        onClick={handleBuy}
        disabled={purchase.isPending}
      >
        {purchase.isPending ? 'Processing...' : 'Buy Now'}
      </button>
    </div>
  );
}
```

## 🔗 Related Documentation

- [API Reference](../spec/openapi.yaml)
- [Authentication Guide](../guides/authentication.md)
- [WebSocket Guide](../guides/websocket.md)
- [Error Handling](../guides/error-handling.md)
