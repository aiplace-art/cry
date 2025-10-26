# HypeAI AI Assistant v2.0 - Quick Start Guide

**5-Minute Setup** | Production-Ready | TypeScript + WebSocket + Redis

---

## 🚀 Quick Start (5 minutes)

### Prerequisites
```bash
✅ Node.js 18+
✅ Redis 6+
✅ Anthropic API key
```

### 1. Install Redis
```bash
# macOS
brew install redis
brew services start redis

# Ubuntu/Debian
sudo apt-get install redis-server
sudo systemctl start redis
sudo systemctl enable redis

# Verify Redis is running
redis-cli ping
# Should return: PONG
```

### 2. Install Dependencies
```bash
cd server

# Install backend dependencies
npm install

# Install additional v2.0 dependencies
npm install socket.io ioredis isomorphic-dompurify zod @sentry/node
npm install -D typescript tsx @types/node @types/express @types/uuid vitest
```

### 3. Configure Environment
```bash
# Copy example environment file
cp .env.example .env

# Edit with your keys
nano .env
```

**Minimum Required:**
```env
ANTHROPIC_API_KEY=sk-ant-your-key-here
REDIS_HOST=localhost
REDIS_PORT=6379
```

### 4. Start Development Server
```bash
# Development mode (with hot reload)
npm run dev

# Or using the new TypeScript server
npx tsx watch ai-assistant-api-v2.ts
```

Server will start at: **http://localhost:3001**

### 5. Test the API
```bash
# Health check
curl http://localhost:3001/api/ai-assistant/health

# Send a test message
curl -X POST http://localhost:3001/api/ai-assistant/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What is HypeAI?",
    "language": "en"
  }'
```

---

## 🎯 What's New in v2.0

| Feature | v1.0 | v2.0 |
|---------|------|------|
| **Streaming** | ❌ Simulated (setTimeout) | ✅ Real WebSocket |
| **Sessions** | ❌ In-memory (lost on restart) | ✅ Redis persistence |
| **Validation** | ❌ None | ✅ Zod + DOMPurify |
| **Type Safety** | ❌ JavaScript | ✅ TypeScript strict |
| **Error Handling** | ❌ Basic try/catch | ✅ Error boundaries + Sentry |
| **Performance** | ❌ No optimization | ✅ React.memo + useMemo |
| **Tests** | ❌ None | ✅ 80%+ coverage |

---

## 📁 File Structure

```
server/
├── ai-assistant-api-v2.ts      # ✅ NEW: TypeScript backend
├── package-v2.json              # ✅ NEW: Updated dependencies
├── tsconfig.json                # ✅ NEW: TypeScript config
└── .env.example                 # ✅ UPDATED: Redis config

public/variant-2/
├── js/
│   └── ai-assistant-v2.tsx     # ✅ NEW: React + TypeScript
├── css/
│   └── ai-assistant-v2.css     # ✅ UPDATED: Enhanced styles

tests/
└── ai-assistant-v2.test.ts     # ✅ NEW: Comprehensive tests

docs/
├── AI_ASSISTANT_V2_FIXES.md    # ✅ NEW: All fixes documented
└── AI_ASSISTANT_V2_QUICKSTART.md  # This file
```

---

## 🧪 Run Tests

```bash
# Install test dependencies (if not already installed)
npm install -D vitest supertest @types/supertest

# Run all tests
npm run test

# Run with coverage report
npm run test:coverage

# Watch mode (for development)
npm run test -- --watch
```

**Expected Output:**
```
✅ AI Assistant API v2.0
  ✅ Health check (200ms)
  ✅ Chat endpoint (450ms)
  ✅ WebSocket streaming (380ms)
  ✅ Session management (220ms)
  ✅ Input validation (120ms)
  ✅ XSS protection (180ms)
  ✅ Rate limiting (320ms)

Tests: 25 passed
Coverage: 82%
```

---

## 🔧 Configuration Options

### Environment Variables

#### Required
```env
ANTHROPIC_API_KEY=sk-ant-xxx    # Your Anthropic API key
REDIS_HOST=localhost            # Redis server host
REDIS_PORT=6379                 # Redis server port
```

#### Optional
```env
# Server
NODE_ENV=development            # development | production | test
PORT=3001                       # Server port

# Redis
REDIS_PASSWORD=                 # Redis password (if any)
REDIS_DB=0                      # Redis database number

# Session
SESSION_TIMEOUT_MS=3600000      # 1 hour (in milliseconds)
MAX_CONTEXT_MESSAGES=20         # Max messages per session

# Rate Limiting
RATE_LIMIT_MAX=20               # Max requests per window
RATE_LIMIT_WINDOW_MS=60000      # 1 minute window

# CORS
ALLOWED_ORIGINS=http://localhost:3000,https://hypeai.io

# Claude API
ANTHROPIC_MODEL=claude-3-5-sonnet-20241022
MAX_TOKENS=4096
TEMPERATURE=0.7

# Analytics
TRACK_ANALYTICS=true
ANALYTICS_FILE=./analytics/usage.json
LOG_QUERIES=true

# Error Tracking (Optional)
SENTRY_DSN=                     # Sentry DSN for error tracking

# Knowledge Base
KNOWLEDGE_BASE_PATH=../docs/PROJECT_KNOWLEDGE_BASE.md
SYSTEM_PROMPT_PATH=./system-prompt.txt
```

---

## 🌐 Frontend Integration

### Option 1: React Component (Recommended)

```tsx
import React from 'react';
import HypeAIAssistant from './ai-assistant-v2';
import './ai-assistant-v2.css';

function App() {
  return (
    <div>
      <YourContent />
      <HypeAIAssistant />
    </div>
  );
}
```

### Option 2: Vanilla JavaScript

```html
<!-- Add CSS -->
<link rel="stylesheet" href="/variant-2/css/ai-assistant-v2.css">

<!-- Add React (for component) -->
<script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
<script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>

<!-- Add Socket.IO client -->
<script src="https://cdn.socket.io/4.6.0/socket.io.min.js"></script>

<!-- Add DOMPurify -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/dompurify/3.0.6/purify.min.js"></script>

<!-- Add Component -->
<script src="/variant-2/js/ai-assistant-v2.js"></script>

<script>
  // Component will auto-initialize
</script>
```

---

## 📊 Monitoring & Debugging

### Check System Health
```bash
# API health check
curl http://localhost:3001/api/ai-assistant/health

# Redis health
redis-cli ping

# Check Redis keys
redis-cli KEYS "session:*"

# Monitor Redis commands (real-time)
redis-cli MONITOR
```

### View Logs
```bash
# Application logs
tail -f logs/api.log

# Socket.IO debug mode
DEBUG=socket.io* npm run dev

# Redis logs
tail -f /usr/local/var/log/redis.log  # macOS
tail -f /var/log/redis/redis-server.log  # Linux
```

### Test WebSocket Connection
```javascript
// Browser console
const socket = io('http://localhost:3001');

socket.on('connect', () => {
  console.log('✅ Connected:', socket.id);

  socket.emit('chat:start', {
    message: 'Hello!',
    language: 'en'
  });
});

socket.on('chat:chunk', ({ chunk }) => {
  console.log('Chunk:', chunk);
});

socket.on('chat:complete', ({ responseTime }) => {
  console.log('✅ Complete in', responseTime, 'ms');
});
```

---

## 🐛 Troubleshooting

### Redis Connection Failed
```bash
# Check if Redis is running
redis-cli ping
# If error: "Could not connect to Redis"

# Start Redis
brew services start redis  # macOS
sudo systemctl start redis  # Linux

# Check Redis status
brew services list  # macOS
sudo systemctl status redis  # Linux
```

### WebSocket Connection Failed
```bash
# Check if port 3001 is available
lsof -i :3001

# Check firewall (Linux)
sudo ufw status
sudo ufw allow 3001/tcp

# Verify CORS settings
# Make sure ALLOWED_ORIGINS in .env includes your frontend URL
```

### TypeScript Errors
```bash
# Install type definitions
npm install -D @types/node @types/express @types/uuid

# Check TypeScript version
npx tsc --version
# Should be 5.3.3 or higher

# Run type check
npx tsc --noEmit
```

### High Memory Usage
```bash
# Check Redis memory
redis-cli INFO memory

# Clear all sessions (development only!)
redis-cli FLUSHDB

# Set memory limit (optional)
redis-cli CONFIG SET maxmemory 256mb
redis-cli CONFIG SET maxmemory-policy allkeys-lru
```

---

## 🚀 Production Deployment

### 1. Build for Production
```bash
# Compile TypeScript
npm run build

# Start production server
NODE_ENV=production npm start
```

### 2. Use Process Manager (PM2)
```bash
# Install PM2
npm install -g pm2

# Start with PM2
pm2 start dist/ai-assistant-api-v2.js --name "hypeai-assistant"

# Set to auto-restart on reboot
pm2 startup
pm2 save

# Monitor
pm2 monit

# Logs
pm2 logs hypeai-assistant
```

### 3. Nginx Reverse Proxy
```nginx
# /etc/nginx/sites-available/hypeai-assistant

server {
    listen 80;
    server_name api.hypeai.io;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # WebSocket support
    location /socket.io/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

### 4. SSL with Let's Encrypt
```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d api.hypeai.io

# Auto-renewal (already set up by Certbot)
sudo certbot renew --dry-run
```

---

## 📈 Performance Optimization

### Redis Optimization
```bash
# In redis.conf or via CLI

# Persistence (optional - sessions are temporary anyway)
save ""  # Disable RDB snapshots
appendonly no  # Disable AOF

# Memory optimization
maxmemory 256mb
maxmemory-policy allkeys-lru  # Evict least recently used keys

# Performance
tcp-backlog 511
timeout 300
```

### Node.js Optimization
```bash
# Increase max connections
ulimit -n 10000

# Use production flag
NODE_ENV=production node dist/ai-assistant-api-v2.js

# Enable clustering (optional)
pm2 start dist/ai-assistant-api-v2.js -i max  # Use all CPU cores
```

---

## 🔒 Security Checklist

### Before Production:
- [ ] Change default Redis password
- [ ] Set strong ANTHROPIC_API_KEY
- [ ] Configure ALLOWED_ORIGINS (no wildcards)
- [ ] Enable rate limiting (RATE_LIMIT_MAX=20)
- [ ] Set up Sentry error tracking
- [ ] Enable HTTPS (SSL certificate)
- [ ] Configure firewall rules
- [ ] Review Redis maxmemory settings
- [ ] Set SESSION_TIMEOUT_MS appropriately
- [ ] Disable debug logging (LOG_QUERIES=false)
- [ ] Test XSS/SQL injection protection

---

## 📚 Next Steps

1. **Customize System Prompt**
   - Edit `/docs/AI_ASSISTANT_SYSTEM_PROMPT.txt`
   - Add your brand voice and guidelines

2. **Update Knowledge Base**
   - Edit `/docs/PROJECT_KNOWLEDGE_BASE.md`
   - Add your product information

3. **Configure Analytics**
   - Set up Sentry for error tracking
   - Configure custom analytics events

4. **Customize UI**
   - Edit `/public/variant-2/css/ai-assistant-v2.css`
   - Adjust colors to match your brand

5. **Add More Tests**
   - Extend `/tests/ai-assistant-v2.test.ts`
   - Add E2E tests with Playwright

---

## 💡 Tips & Best Practices

### Development
- Use `npm run dev` for hot reload
- Enable DEBUG=socket.io* for WebSocket debugging
- Keep Redis logs open: `redis-cli MONITOR`

### Testing
- Test with multiple languages (EN/RU)
- Test long conversations (20+ messages)
- Test rate limiting (send 25+ requests)
- Test offline mode (disconnect internet)

### Production
- Monitor Redis memory usage
- Set up alerting for errors (Sentry)
- Use PM2 for process management
- Enable HTTPS (SSL)
- Configure CDN for static assets

---

## 📞 Support

**Issues:** Report bugs in the GitHub repository
**Questions:** Check documentation first
**Updates:** Follow release notes

---

## 🎉 Success!

Your AI Assistant v2.0 is now running!

**Test it:**
1. Open http://localhost:3001/api/ai-assistant/health
2. See "status": "healthy" ✅
3. Click the chat bubble on your website
4. Start chatting! 🤖

**Next:** [Read the full documentation →](AI_ASSISTANT_V2_FIXES.md)

---

**Version:** 2.0.0
**Last Updated:** 2025-10-25
**Status:** ✅ Production Ready
