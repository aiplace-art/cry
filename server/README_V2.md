# HypeAI AI Assistant v2.0

**Production-Ready AI Chat with WebSocket Streaming, Redis Sessions, and TypeScript**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4.6-green)](https://socket.io/)
[![Redis](https://img.shields.io/badge/Redis-6+-red)](https://redis.io/)
[![Tests](https://img.shields.io/badge/Tests-80%25-brightgreen)](./tests)

---

## 🚀 Features

✅ **Real-time WebSocket Streaming** - Live AI responses chunk-by-chunk
✅ **Redis Session Persistence** - Sessions survive server restarts
✅ **TypeScript Strict Mode** - 100% type-safe codebase
✅ **Input Validation** - DOMPurify + Zod schemas for security
✅ **Error Boundaries** - React error handling + Sentry integration
✅ **Performance Optimized** - React.memo, useMemo, useCallback
✅ **Comprehensive Tests** - 80%+ coverage with Vitest
✅ **Mobile-First Design** - Responsive and accessible

---

## 📦 Installation

```bash
# 1. Install dependencies
npm install

# 2. Install Redis
brew install redis          # macOS
brew services start redis

# 3. Configure environment
cp .env.example .env
nano .env  # Add ANTHROPIC_API_KEY

# 4. Start server
npm run dev
```

**Done!** Server running at http://localhost:3001

---

## 🎯 Quick Start

### Backend (TypeScript)

```typescript
import express from 'express';
import { Server as SocketIOServer } from 'socket.io';
import Redis from 'ioredis';

// Initialize
const app = express();
const io = new SocketIOServer(server);
const redis = new Redis();

// Real-time streaming
io.on('connection', (socket) => {
  socket.on('chat:start', async ({ message }) => {
    const stream = await anthropic.messages.stream({ messages });

    for await (const chunk of stream) {
      socket.emit('chat:chunk', { chunk });
    }

    socket.emit('chat:complete', { responseTime });
  });
});
```

### Frontend (React + TypeScript)

```tsx
import React, { useState } from 'react';
import { io } from 'socket.io-client';

const socket = io('http://localhost:3001');

function ChatWidget() {
  const [messages, setMessages] = useState([]);

  socket.on('chat:chunk', ({ chunk }) => {
    // Append streaming chunks
    setMessages(prev => updateLastMessage(prev, chunk));
  });

  return <ChatInterface messages={messages} />;
}
```

---

## 🧪 Testing

```bash
# Run all tests
npm run test

# With coverage
npm run test:coverage

# Watch mode
npm run test -- --watch
```

**25 tests** covering:
- REST API endpoints
- WebSocket streaming
- Session management
- Input validation
- XSS/SQL protection
- Error handling
- Performance

---

## 📊 Architecture

```
┌─────────────┐
│   Client    │
│  (React)    │
└──────┬──────┘
       │
       │ WebSocket / REST
       ▼
┌─────────────┐
│  Socket.IO  │
│   Server    │
└──────┬──────┘
       │
       ├──────► Redis (Sessions)
       │
       ├──────► Claude API (AI)
       │
       └──────► Analytics (Logs)
```

---

## 🔧 Configuration

### Required Environment Variables

```env
ANTHROPIC_API_KEY=sk-ant-xxx
REDIS_HOST=localhost
REDIS_PORT=6379
```

### Optional Configuration

```env
# Server
PORT=3001
NODE_ENV=production

# Session
SESSION_TIMEOUT_MS=3600000      # 1 hour
MAX_CONTEXT_MESSAGES=20         # Keep last 20 messages

# Rate Limiting
RATE_LIMIT_MAX=20               # 20 requests/minute
RATE_LIMIT_WINDOW_MS=60000

# Error Tracking
SENTRY_DSN=                     # Optional
```

---

## 🚀 Deployment

### Production Build

```bash
npm run build
NODE_ENV=production npm start
```

### With PM2

```bash
pm2 start dist/ai-assistant-api-v2.js --name hypeai-assistant
pm2 startup
pm2 save
```

### Docker (Optional)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
RUN npm run build
EXPOSE 3001
CMD ["npm", "start"]
```

---

## 📈 Performance

| Metric | v1.0 | v2.0 |
|--------|------|------|
| Streaming | ❌ Simulated | ✅ Real-time |
| Response Time | ~2s | <50ms chunks |
| Session Persistence | ❌ In-memory | ✅ Redis |
| Type Safety | ❌ JS | ✅ TS Strict |
| Test Coverage | 0% | 80%+ |

---

## 🔒 Security

✅ **XSS Protection** - DOMPurify sanitization
✅ **SQL Injection** - Parameterized queries
✅ **Rate Limiting** - 20 requests/minute
✅ **Input Validation** - Zod schemas
✅ **Session Security** - 1-hour TTL
✅ **CORS** - Whitelist origins

---

## 📚 Documentation

- [Quick Start Guide](../docs/AI_ASSISTANT_V2_QUICKSTART.md)
- [Full Documentation](../docs/AI_ASSISTANT_V2_FIXES.md)
- [API Reference](../docs/AI_ASSISTANT_API_REFERENCE.md)
- [Architecture](../docs/architecture/AI_ASSISTANT_ARCHITECTURE.md)

---

## 🐛 Troubleshooting

### Redis Connection Failed
```bash
redis-cli ping  # Should return PONG
brew services restart redis
```

### WebSocket Not Connecting
```bash
# Check CORS settings in .env
ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com
```

### TypeScript Errors
```bash
npm install -D @types/node @types/express
npx tsc --noEmit  # Check for errors
```

---

## 🎯 Next Steps

1. ✅ Customize system prompt: `docs/AI_ASSISTANT_SYSTEM_PROMPT.txt`
2. ✅ Update knowledge base: `docs/PROJECT_KNOWLEDGE_BASE.md`
3. ✅ Configure analytics: Set SENTRY_DSN
4. ✅ Customize UI: `public/variant-2/css/ai-assistant-v2.css`
5. ✅ Add more tests: `tests/ai-assistant-v2.test.ts`

---

## 📞 Support

- **Issues:** [GitHub Issues](https://github.com/hypeai/ai-assistant/issues)
- **Docs:** [Full Documentation](../docs/AI_ASSISTANT_V2_FIXES.md)
- **Email:** support@hypeai.com

---

## 📄 License

MIT License - See LICENSE file

---

**Version:** 2.0.0
**Status:** ✅ Production Ready
**Last Updated:** 2025-10-25

Made with ❤️ by HypeAI Team
