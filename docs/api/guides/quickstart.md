# HypeAI API Quickstart

Get started with the HypeAI API in 5 minutes. This guide will walk you through authentication, making your first API call, and connecting to WebSocket for real-time updates.

## 📋 Prerequisites

- API credentials (sign up at [hypeai.io](https://hypeai.io))
- Node.js 18+ or Python 3.8+ (for examples)
- Basic understanding of REST APIs

## 🚀 Quick Start

### 1. Get Your API Token

First, register and login to get your JWT token:

```bash
curl -X POST https://api.hypeai.io/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your@email.com",
    "password": "SecurePass123!",
    "username": "yourname"
  }'
```

Response:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_123",
    "email": "your@email.com",
    "username": "yourname"
  }
}
```

### 2. Make Your First API Call

Use your token to get your profile:

```bash
curl https://api.hypeai.io/v1/users/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. Connect to WebSocket

Get real-time presale updates:

```javascript
const ws = new WebSocket('wss://api.hypeai.io/v1/ws');

// Authenticate
ws.onopen = () => {
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

// Receive updates
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Presale update:', data);
};
```

## 💡 Code Examples

### JavaScript/Node.js

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://api.hypeai.io/v1',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Login
async function login(email, password) {
  const response = await api.post('/auth/login', {
    email,
    password
  });

  // Save token
  const { token } = response.data;
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

  return response.data;
}

// Get presale info
async function getPresaleInfo() {
  const response = await api.get('/tokens/presale');
  return response.data;
}

// Purchase tokens
async function purchaseTokens(amount, paymentMethod) {
  const response = await api.post('/tokens/purchase', {
    amount,
    paymentMethod
  });
  return response.data;
}

// Usage
(async () => {
  await login('user@example.com', 'SecurePass123!');
  const presale = await getPresaleInfo();
  console.log('Current price:', presale.tokenPrice);

  const purchase = await purchaseTokens(1000, 'bnb');
  console.log('Purchase ID:', purchase.transactionId);
})();
```

### Python

```python
import requests
from typing import Dict, Any

class HypeAIClient:
    def __init__(self, base_url: str = "https://api.hypeai.io/v1"):
        self.base_url = base_url
        self.session = requests.Session()
        self.session.headers.update({
            'Content-Type': 'application/json'
        })

    def login(self, email: str, password: str) -> Dict[str, Any]:
        response = self.session.post(
            f"{self.base_url}/auth/login",
            json={"email": email, "password": password}
        )
        response.raise_for_status()

        data = response.json()
        # Set token for future requests
        self.session.headers['Authorization'] = f"Bearer {data['token']}"
        return data

    def get_presale_info(self) -> Dict[str, Any]:
        response = self.session.get(f"{self.base_url}/tokens/presale")
        response.raise_for_status()
        return response.json()

    def purchase_tokens(
        self,
        amount: float,
        payment_method: str
    ) -> Dict[str, Any]:
        response = self.session.post(
            f"{self.base_url}/tokens/purchase",
            json={
                "amount": amount,
                "paymentMethod": payment_method
            }
        )
        response.raise_for_status()
        return response.json()

# Usage
client = HypeAIClient()
client.login("user@example.com", "SecurePass123!")

presale = client.get_presale_info()
print(f"Current price: {presale['tokenPrice']}")

purchase = client.purchase_tokens(1000, "bnb")
print(f"Purchase ID: {purchase['transactionId']}")
```

### TypeScript

```typescript
import axios, { AxiosInstance } from 'axios';

interface AuthResponse {
  success: boolean;
  token: string;
  user: {
    id: string;
    email: string;
    username: string;
  };
}

interface PresaleInfo {
  currentRound: number;
  tokenPrice: number;
  tokensAvailable: number;
  tokensSold: number;
}

class HypeAIClient {
  private api: AxiosInstance;

  constructor(baseURL: string = 'https://api.hypeai.io/v1') {
    this.api = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await this.api.post<AuthResponse>('/auth/login', {
      email,
      password
    });

    // Set token for future requests
    this.api.defaults.headers.common['Authorization'] =
      `Bearer ${response.data.token}`;

    return response.data;
  }

  async getPresaleInfo(): Promise<PresaleInfo> {
    const response = await this.api.get<PresaleInfo>('/tokens/presale');
    return response.data;
  }

  async purchaseTokens(
    amount: number,
    paymentMethod: 'bnb' | 'usdt' | 'card'
  ) {
    const response = await this.api.post('/tokens/purchase', {
      amount,
      paymentMethod
    });
    return response.data;
  }
}

// Usage
const client = new HypeAIClient();

async function main() {
  await client.login('user@example.com', 'SecurePass123!');

  const presale = await client.getPresaleInfo();
  console.log('Current price:', presale.tokenPrice);

  const purchase = await client.purchaseTokens(1000, 'bnb');
  console.log('Purchase ID:', purchase.transactionId);
}

main().catch(console.error);
```

## 🔐 Authentication Best Practices

1. **Store tokens securely**
   - Use environment variables
   - Never commit tokens to git
   - Implement token refresh logic

2. **Handle token expiration**
   ```javascript
   api.interceptors.response.use(
     response => response,
     async error => {
       if (error.response?.status === 401) {
         // Refresh token
         const newToken = await refreshToken();
         error.config.headers['Authorization'] = `Bearer ${newToken}`;
         return api.request(error.config);
       }
       throw error;
     }
   );
   ```

3. **Use HTTPS only**
   - Never send tokens over HTTP
   - Verify SSL certificates

## 🌐 Base URLs

| Environment | URL |
|------------|-----|
| Production | `https://api.hypeai.io/v1` |
| Staging | `https://staging-api.hypeai.io/v1` |
| Local | `http://localhost:3000/v1` |

## 📊 Rate Limits

- **Authentication**: 5 requests/minute
- **API Calls**: 100 requests/minute
- **WebSocket**: 1 connection per user

Rate limit headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642694400
```

## ❌ Error Handling

All errors follow this format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message",
    "details": {}
  }
}
```

Common error codes:
- `VALIDATION_ERROR` - Invalid input
- `UNAUTHORIZED` - Invalid/expired token
- `RATE_LIMIT_EXCEEDED` - Too many requests
- `INSUFFICIENT_BALANCE` - Not enough funds

Example error handling:

```javascript
try {
  await purchaseTokens(1000, 'bnb');
} catch (error) {
  if (error.response?.data?.error?.code === 'INSUFFICIENT_BALANCE') {
    console.error('Not enough funds!');
  } else {
    console.error('Purchase failed:', error.message);
  }
}
```

## 🎯 Next Steps

1. [Authentication Guide](./authentication.md) - Deep dive into auth flows
2. [WebSocket Guide](./websocket.md) - Real-time integration
3. [Error Handling](./error-handling.md) - Best practices
4. [SDK Examples](../sdk/README.md) - React hooks and utilities

## 🆘 Support

- 📧 Email: support@hypeai.io
- 💬 Discord: [discord.gg/hypeai](https://discord.gg/hypeai)
- 📚 Docs: [docs.hypeai.io](https://docs.hypeai.io)
- 🐛 Issues: [github.com/hypeai/api](https://github.com/hypeai/api)

## 🔗 Useful Links

- [OpenAPI Specification](../spec/openapi.yaml)
- [Interactive API Docs](https://api.hypeai.io/docs)
- [Status Page](https://status.hypeai.io)
- [Changelog](https://docs.hypeai.io/changelog)
