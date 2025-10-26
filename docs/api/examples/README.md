# Code Examples

Production-ready code examples for HypeAI API integration.

## 📚 Available Examples

### Complete Integration Examples

- **[TypeScript Complete Example](./typescript-example.ts)** - Full-featured TypeScript client with error handling, WebSocket, and all features
- **[React Integration](./react-example.tsx)** - Complete React application with hooks and components
- **[Python Client](./python-example.py)** - Production-ready Python SDK with async support
- **[Next.js App](./nextjs-example/)** - Full Next.js application with SSR

### Quick Start Examples

#### 1. Simple Token Purchase (JavaScript)

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://api.hypeai.io/v1'
});

// Login
const { data: auth } = await api.post('/auth/login', {
  email: 'user@example.com',
  password: 'password'
});

// Set token
api.defaults.headers.common['Authorization'] = `Bearer ${auth.token}`;

// Get presale info
const { data: presale } = await api.get('/tokens/presale');
console.log('Price:', presale.tokenPrice);

// Purchase tokens
const { data: purchase } = await api.post('/tokens/purchase', {
  amount: 1000,
  paymentMethod: 'bnb'
});

console.log('Success! Transaction:', purchase.transactionId);
```

#### 2. WebSocket Real-time Updates

```javascript
const ws = new WebSocket('wss://api.hypeai.io/v1/ws');

ws.onopen = () => {
  // Authenticate
  ws.send(JSON.stringify({
    type: 'auth',
    token: 'YOUR_TOKEN'
  }));

  // Subscribe to presale updates
  ws.send(JSON.stringify({
    type: 'subscribe',
    channels: ['presale_updates']
  }));
};

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);

  if (message.type === 'presale_update') {
    console.log('New presale data:', message.data);
    updateUI(message.data);
  }
};
```

#### 3. Error Handling

```javascript
async function purchaseWithRetry(amount, paymentMethod) {
  const maxRetries = 3;
  let lastError;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await api.post('/tokens/purchase', {
        amount,
        paymentMethod
      });
    } catch (error) {
      lastError = error;

      if (error.response?.status === 429) {
        // Rate limit - wait and retry
        await new Promise(resolve => setTimeout(resolve, 5000));
        continue;
      }

      if (error.response?.data?.error?.code === 'INSUFFICIENT_BALANCE') {
        throw new Error('Not enough funds');
      }

      // Other errors - don't retry
      throw error;
    }
  }

  throw lastError;
}
```

## 🎨 React Examples

### Using Official SDK

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
  const { user, logout } = useAuth();
  const { presale, purchase, loading } = usePresale();

  const handleBuy = async () => {
    try {
      const result = await purchase(1000, 'bnb');
      alert(`Success! Got ${result.tokens} tokens`);
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Welcome {user?.username}</h1>
      <p>Token Price: ${presale?.tokenPrice}</p>
      <p>Available: {presale?.tokensAvailable.toLocaleString()}</p>
      <button onClick={handleBuy}>Buy Tokens</button>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

## 🐍 Python Examples

### Basic Client

```python
import requests

class HypeAI:
    def __init__(self, base_url='https://api.hypeai.io/v1'):
        self.base_url = base_url
        self.session = requests.Session()

    def login(self, email, password):
        response = self.session.post(
            f'{self.base_url}/auth/login',
            json={'email': email, 'password': password}
        )
        response.raise_for_status()
        
        data = response.json()
        self.session.headers['Authorization'] = f"Bearer {data['token']}"
        return data['user']

    def get_presale(self):
        response = self.session.get(f'{self.base_url}/tokens/presale')
        response.raise_for_status()
        return response.json()

    def purchase_tokens(self, amount, payment_method):
        response = self.session.post(
            f'{self.base_url}/tokens/purchase',
            json={'amount': amount, 'paymentMethod': payment_method}
        )
        response.raise_for_status()
        return response.json()

# Usage
client = HypeAI()
user = client.login('user@example.com', 'password')
presale = client.get_presale()
purchase = client.purchase_tokens(1000, 'bnb')
print(f"Bought {purchase['tokens']} tokens!")
```

## 🔗 Additional Resources

- [OpenAPI Specification](../spec/openapi.yaml)
- [Interactive API Docs](../spec/swagger-ui.html)
- [Quickstart Guide](../guides/quickstart.md)
- [Authentication Guide](../guides/authentication.md)
- [WebSocket Guide](../guides/websocket.md)

## 📦 Download Examples

Clone the repository to get all examples:

```bash
git clone https://github.com/hypeai/api-examples.git
cd api-examples
npm install
npm run example:typescript
```

## 🆘 Need Help?

- 📧 Email: support@hypeai.io
- 💬 Discord: [discord.gg/hypeai](https://discord.gg/hypeai)
- 📚 Documentation: [docs.hypeai.io](https://docs.hypeai.io)
