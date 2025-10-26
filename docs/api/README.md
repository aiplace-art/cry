# HypeAI API Documentation

<div align="center">

![HypeAI Logo](../../website/logo-official-BRIGHT.svg)

**Premium API for Infinite Intelligence Platform**

[![API Status](https://img.shields.io/badge/status-active-success)](https://status.hypeai.io)
[![Version](https://img.shields.io/badge/version-1.0.0-blue)](https://api.hypeai.io)
[![OpenAPI](https://img.shields.io/badge/OpenAPI-3.0-green)](./spec/openapi.yaml)
[![License](https://img.shields.io/badge/license-MIT-orange)](https://opensource.org/licenses/MIT)

[Quickstart](#-quickstart) • [API Reference](#-api-reference) • [SDK](#-sdk) • [Examples](#-examples) • [Support](#-support)

</div>

---

## 📚 Table of Contents

- [Overview](#-overview)
- [Quickstart](#-quickstart)
- [API Reference](#-api-reference)
- [Guides](#-guides)
- [SDK & Tools](#-sdk--tools)
- [Architecture](#-architecture)
- [Examples](#-examples)
- [Support](#-support)

## 🌟 Overview

The HypeAI API provides programmatic access to the Infinite Intelligence Platform, enabling developers to:

- ✅ Authenticate and manage users
- 💰 Process token purchases and payments
- 📊 Access real-time analytics and metrics
- 🔔 Receive WebSocket updates
- 🎯 Integrate referral systems
- 📈 Track transaction history

### Key Features

| Feature | Description |
|---------|-------------|
| **RESTful API** | Clean, predictable REST endpoints |
| **Real-time Updates** | WebSocket for live data |
| **Type-Safe** | Full TypeScript support |
| **Rate Limiting** | Smart throttling to prevent abuse |
| **Comprehensive Docs** | OpenAPI 3.0 specification |
| **Multi-Language SDKs** | JavaScript, Python, Go support |

## 🚀 Quickstart

Get started in 5 minutes:

### 1. Get Your API Token

```bash
curl -X POST https://api.hypeai.io/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your@email.com",
    "password": "SecurePass123!",
    "username": "yourname"
  }'
```

### 2. Make Your First Request

```javascript
const response = await fetch('https://api.hypeai.io/v1/tokens/presale', {
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN'
  }
});

const presale = await response.json();
console.log('Token Price:', presale.tokenPrice);
```

### 3. Connect to WebSocket

```javascript
const ws = new WebSocket('wss://api.hypeai.io/v1/ws');

ws.onopen = () => {
  ws.send(JSON.stringify({
    type: 'auth',
    token: 'YOUR_TOKEN'
  }));
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Update:', data);
};
```

👉 **[Full Quickstart Guide](./guides/quickstart.md)**

## 📖 API Reference

### Interactive Documentation

- **Swagger UI**: [api.hypeai.io/docs](https://api.hypeai.io/docs)
- **OpenAPI Spec**: [openapi.yaml](./spec/openapi.yaml)
- **Postman Collection**: [Download](https://api.hypeai.io/postman)

### Base URLs

| Environment | URL |
|------------|-----|
| Production | `https://api.hypeai.io/v1` |
| Staging | `https://staging-api.hypeai.io/v1` |
| WebSocket | `wss://api.hypeai.io/v1/ws` |

### Core Endpoints

#### Authentication

```http
POST /auth/register      # Register new user
POST /auth/login         # Login user
POST /auth/refresh       # Refresh token
POST /auth/logout        # Logout user
```

#### Users

```http
GET    /users/me         # Get current user
PATCH  /users/me         # Update profile
DELETE /users/me         # Delete account
```

#### Tokens

```http
GET  /tokens/presale     # Get presale info
POST /tokens/purchase    # Purchase tokens
GET  /tokens/balance     # Get token balance
```

#### Analytics

```http
GET /analytics/dashboard    # Dashboard metrics
GET /analytics/transactions # Transaction history
GET /analytics/referrals    # Referral stats
```

#### Payments

```http
POST /payments/stripe/checkout  # Create Stripe session
POST /payments/webhook          # Stripe webhook
GET  /payments/status/:id       # Payment status
```

### Rate Limits

| Endpoint Type | Limit |
|--------------|-------|
| Authentication | 5/min per IP |
| Standard API | 100/min per user |
| WebSocket | 1 connection/user |

## 📚 Guides

Comprehensive guides for common use cases:

### Getting Started

- **[Quickstart Guide](./guides/quickstart.md)** - Get up and running in 5 minutes
- **[Authentication](./guides/authentication.md)** - Complete auth flow with examples
- **[Error Handling](./guides/error-handling.md)** - Best practices for error handling

### Integration Guides

- **[WebSocket Integration](./guides/websocket.md)** - Real-time updates
- **[Payment Integration](./guides/payments.md)** - Stripe & crypto payments
- **[Referral System](./guides/referrals.md)** - Implement referral tracking

### Advanced Topics

- **[Rate Limiting](./guides/rate-limiting.md)** - Understanding limits
- **[Security Best Practices](./guides/security.md)** - Keep your integration secure
- **[Performance Optimization](./guides/performance.md)** - Speed up your app

## 🛠️ SDK & Tools

### Official SDKs

#### JavaScript/TypeScript

```bash
npm install @hypeai/sdk
```

```typescript
import { HypeAI } from '@hypeai/sdk';

const client = new HypeAI('YOUR_API_KEY');
const presale = await client.presale.get();
```

#### React

```bash
npm install @hypeai/react-sdk
```

```tsx
import { HypeAIProvider, usePresale } from '@hypeai/react-sdk';

function App() {
  return (
    <HypeAIProvider apiKey="YOUR_KEY">
      <Dashboard />
    </HypeAIProvider>
  );
}

function Dashboard() {
  const { presale, loading } = usePresale();
  return <div>Price: ${presale?.tokenPrice}</div>;
}
```

👉 **[Full React SDK Docs](./sdk/react-hooks.md)**

#### Python

```bash
pip install hypeai
```

```python
from hypeai import HypeAI

client = HypeAI(api_key='YOUR_API_KEY')
presale = client.presale.get()
print(f"Price: ${presale.token_price}")
```

#### Go

```bash
go get github.com/hypeai/go-sdk
```

```go
import "github.com/hypeai/go-sdk"

client := hypeai.New("YOUR_API_KEY")
presale, err := client.Presale.Get()
fmt.Printf("Price: $%f\n", presale.TokenPrice)
```

### CLI Tool

```bash
npm install -g @hypeai/cli

# Login
hypeai login

# Get presale info
hypeai presale info

# Purchase tokens
hypeai tokens buy --amount 1000 --method bnb
```

## 🏗️ Architecture

### System Overview

```
┌─────────────┐
│   Client    │
│  (Web/App)  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ API Gateway │  ← Rate Limiting
│   (NGINX)   │  ← Load Balancing
└──────┬──────┘
       │
       ├──────────┬──────────┐
       ▼          ▼          ▼
  ┌────────┐ ┌────────┐ ┌────────┐
  │API v1  │ │WebSocket│ │Auth   │
  │Server  │ │Server   │ │Service│
  └────┬───┘ └────┬────┘ └───┬───┘
       │          │           │
       └──────────┴───────────┘
                  │
       ┌──────────┴──────────┐
       ▼                     ▼
  ┌──────────┐        ┌──────────┐
  │PostgreSQL│        │  Redis   │
  │ Database │        │  Cache   │
  └──────────┘        └──────────┘
```

👉 **[Full Architecture Diagrams](./diagrams/architecture.md)**

### Technology Stack

- **API Framework**: Node.js + Express
- **Database**: PostgreSQL (primary), MongoDB (analytics)
- **Cache**: Redis
- **WebSocket**: Socket.io
- **Blockchain**: BNB Smart Chain
- **Payments**: Stripe + Crypto
- **Monitoring**: Datadog, Sentry

## 💡 Examples

### Complete Examples

#### Token Purchase Flow

```typescript
import { HypeAI } from '@hypeai/sdk';

const client = new HypeAI();

// 1. Login
await client.auth.login('user@example.com', 'password');

// 2. Get presale info
const presale = await client.presale.get();
console.log(`Price: $${presale.tokenPrice}`);

// 3. Purchase tokens
const purchase = await client.tokens.purchase({
  amount: 1000,
  paymentMethod: 'bnb'
});

console.log(`Transaction: ${purchase.transactionId}`);
console.log(`Tokens: ${purchase.tokens}`);

// 4. Monitor transaction
const status = await client.transactions.get(purchase.transactionId);
console.log(`Status: ${status.status}`);
```

#### Real-time Dashboard

```tsx
import { useWebSocket, usePresale } from '@hypeai/react-sdk';

function LiveDashboard() {
  const { presale } = usePresale();
  const { lastMessage } = useWebSocket({
    channels: ['presale_updates', 'transactions']
  });

  useEffect(() => {
    if (lastMessage?.type === 'presale_update') {
      // Update UI with real-time data
      updatePresaleStats(lastMessage.data);
    }
  }, [lastMessage]);

  return (
    <div>
      <h1>Live Presale</h1>
      <p>Tokens Sold: {presale?.tokensSold}</p>
      <p>Raised: ${presale?.raisedAmount}</p>
    </div>
  );
}
```

### More Examples

- [Authentication Flow](./examples/authentication.md)
- [Payment Processing](./examples/payments.md)
- [WebSocket Real-time](./examples/websocket.md)
- [Error Handling](./examples/error-handling.md)
- [Rate Limiting](./examples/rate-limiting.md)

## 🆘 Support

### Resources

- 📧 **Email**: support@hypeai.io
- 💬 **Discord**: [discord.gg/hypeai](https://discord.gg/hypeai)
- 📚 **Documentation**: [docs.hypeai.io](https://docs.hypeai.io)
- 🐛 **Issues**: [github.com/hypeai/api/issues](https://github.com/hypeai/api/issues)

### Status & Monitoring

- 🟢 **Status Page**: [status.hypeai.io](https://status.hypeai.io)
- 📊 **API Metrics**: [metrics.hypeai.io](https://metrics.hypeai.io)

### Community

- **Twitter**: [@HypeAI_io](https://twitter.com/HypeAI_io)
- **GitHub**: [github.com/hypeai](https://github.com/hypeai)
- **Blog**: [blog.hypeai.io](https://blog.hypeai.io)

### Changelog

- **Latest**: [docs.hypeai.io/changelog](https://docs.hypeai.io/changelog)
- **Migration Guides**: [docs.hypeai.io/migrations](https://docs.hypeai.io/migrations)

## 📄 License

MIT License - see [LICENSE](../../LICENSE) for details.

---

<div align="center">

**Built with ❤️ by the HypeAI Team**

[Website](https://hypeai.io) • [API](https://api.hypeai.io) • [Documentation](https://docs.hypeai.io)

</div>
