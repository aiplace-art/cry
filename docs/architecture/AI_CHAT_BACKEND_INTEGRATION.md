# HypeAI AI Chat Backend Integration Architecture

## Executive Summary

**Recommended Solution:** **Serverless Functions (Vercel) + Existing Express API**

Your project already has a production-ready Express API (`/server/ai-assistant-api.js`) with Claude 3.5 Sonnet integration. The optimal architecture leverages Vercel's serverless functions as a lightweight proxy layer while maintaining the robust Express backend for complex operations.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER BROWSER                            │
│  Diamond Chat UI (public/variant-2/js/ai-chat-diamond.js)      │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    VERCEL EDGE NETWORK                          │
│  • Serverless Functions (API proxy - FREE tier)                │
│  • Caching Layer (reduce API calls)                            │
│  • Rate Limiting (per IP)                                      │
│  • API Key Protection                                          │
└────────────────────────────┬────────────────────────────────────┘
                             │
              ┌──────────────┴──────────────┐
              ▼                             ▼
┌─────────────────────────┐   ┌─────────────────────────────┐
│   CLAUDE API DIRECT     │   │  EXPRESS API (Railway/Fly)  │
│   • Simple queries      │   │  • Complex RAG queries      │
│   • Fast response       │   │  • Session management       │
│   • Cost-effective      │   │  • Knowledge base search    │
└─────────────────────────┘   └─────────────────────────────┘
```

---

## Solution Comparison

### Option 1: Direct Frontend → Anthropic API ❌
**Status:** NOT RECOMMENDED

**Pros:**
- Simplest implementation
- Lowest latency
- No server needed

**Cons:**
- ❌ API key exposed in frontend (CRITICAL SECURITY RISK)
- ❌ No rate limiting control
- ❌ No caching = high costs
- ❌ No analytics/monitoring
- ❌ Cannot use RAG or knowledge base

**Verdict:** Unacceptable for production

---

### Option 2: Serverless Functions (Vercel/Netlify) ✅ **RECOMMENDED**
**Status:** OPTIMAL FOR HYPEAI

**Pros:**
- ✅ **FREE** for <100k requests/month
- ✅ Zero infrastructure management
- ✅ Auto-scaling (handles traffic spikes)
- ✅ Edge caching (reduce costs)
- ✅ API key protection
- ✅ Built-in rate limiting
- ✅ Deploy with `git push`
- ✅ Works with existing Express API

**Cons:**
- 10-second timeout (sufficient for AI)
- Cold start delays (~50-200ms)

**Cost Analysis:**
```
Vercel Free Tier:
• 100k serverless invocations/month
• 100 GB bandwidth
• Unlimited deployments

Estimated HypeAI usage:
• ~1000 chat messages/day = 30k/month
• Well within free tier ✅
```

**Implementation:**
```javascript
// api/chat.js (Vercel serverless function)
import Anthropic from '@anthropic-ai/sdk';

export default async function handler(req, res) {
  // Security: API key in environment
  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY
  });

  // Rate limiting
  const cache = getCache();
  const clientIP = req.headers['x-forwarded-for'];

  if (cache.get(`rate:${clientIP}`) > 10) {
    return res.status(429).json({ error: 'Too many requests' });
  }

  // Caching for common queries
  const cacheKey = `chat:${hash(req.body.message)}`;
  const cached = cache.get(cacheKey);

  if (cached) {
    return res.json(cached);
  }

  // Call Claude API
  const response = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 4096,
    messages: [{ role: 'user', content: req.body.message }]
  });

  // Cache response for 1 hour
  cache.set(cacheKey, response, 3600);

  res.json(response);
}
```

---

### Option 3: Express Backend (Railway/Fly.io) ✅
**Status:** ALREADY IMPLEMENTED (use as backup)

**Your Existing API:** `/server/ai-assistant-api.js`

**Features:**
- ✅ RAG (knowledge base search)
- ✅ Session management
- ✅ Analytics logging
- ✅ Advanced rate limiting
- ✅ Multi-language support

**Deployment Options:**

1. **Railway.app** (Recommended)
   ```bash
   # One-time setup
   npm install -g railway
   railway login
   railway init
   railway up

   # Configure environment
   railway variables set ANTHROPIC_API_KEY=sk-ant-...
   railway variables set NODE_ENV=production
   ```
   - Cost: FREE for <500 hours/month
   - Persistent storage
   - Auto-deploy from GitHub

2. **Fly.io**
   ```bash
   # Install CLI
   curl -L https://fly.io/install.sh | sh

   # Deploy
   fly launch
   fly secrets set ANTHROPIC_API_KEY=sk-ant-...
   fly deploy
   ```
   - Cost: FREE for 3GB RAM
   - Global edge deployment

3. **Vercel + Serverless Functions**
   - Move Express routes to `/api/` directory
   - Each route becomes a serverless function
   - NO persistent storage (use Upstash Redis)

---

## Recommended Hybrid Architecture

**Best of both worlds:** Serverless for simple queries + Express for complex operations

```javascript
// api/chat.js (Vercel serverless - handles 90% of traffic)
export default async function handler(req, res) {
  const { message, needsRAG } = req.body;

  // Simple query? Handle directly (fast + cheap)
  if (!needsRAG && message.length < 200) {
    const response = await callClaudeDirectly(message);
    return res.json(response);
  }

  // Complex query? Proxy to Express API (RAG, session, etc.)
  const expressResponse = await fetch('https://api.hypeai.io/chat', {
    method: 'POST',
    headers: {
      'X-API-Key': process.env.EXPRESS_API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(req.body)
  });

  return res.json(await expressResponse.json());
}
```

---

## Implementation Plan

### Phase 1: Serverless Functions (Week 1)

**File Structure:**
```
/api/
  ├── chat.js              # Main chat endpoint
  ├── health.js            # Health check
  └── _lib/
      ├── cache.js         # Edge caching
      ├── rateLimit.js     # Rate limiting
      └── anthropic.js     # Claude API client

/public/variant-2/js/
  └── ai-chat-diamond.js   # Update to call /api/chat
```

**Step 1:** Create Vercel API endpoint
```javascript
// /api/chat.js
import Anthropic from '@anthropic-ai/sdk';
import { rateLimit } from './_lib/rateLimit';
import { cache } from './_lib/cache';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', 'https://hypeai.io');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Rate limiting
  const clientIP = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const rateLimitResult = await rateLimit(clientIP);

  if (!rateLimitResult.allowed) {
    return res.status(429).json({
      error: 'Too many requests. Please try again later.',
      retryAfter: rateLimitResult.retryAfter
    });
  }

  // Validation
  const { message, language = 'ru' } = req.body;

  if (!message || message.length > 2000) {
    return res.status(400).json({
      error: 'Invalid message (max 2000 characters)'
    });
  }

  try {
    // Check cache
    const cacheKey = `chat:${language}:${hashMessage(message)}`;
    const cached = await cache.get(cacheKey);

    if (cached) {
      return res.json({
        ...cached,
        cached: true
      });
    }

    // Call Claude API
    const startTime = Date.now();
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4096,
      temperature: 0.7,
      system: getSystemPrompt(language),
      messages: [{
        role: 'user',
        content: message
      }]
    });

    const reply = response.content[0].text;
    const responseTime = Date.now() - startTime;

    const result = {
      reply,
      timestamp: new Date().toISOString(),
      responseTime,
      cached: false
    };

    // Cache for 1 hour
    await cache.set(cacheKey, result, 3600);

    // Track analytics (async, don't await)
    trackAnalytics({
      event: 'chat',
      language,
      responseTime,
      messageLength: message.length,
      replyLength: reply.length
    }).catch(console.error);

    res.json(result);

  } catch (error) {
    console.error('Chat error:', error);

    if (error.status === 429) {
      return res.status(429).json({
        error: 'API rate limit exceeded',
        retryAfter: 60
      });
    }

    res.status(500).json({
      error: 'Failed to process message',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

function getSystemPrompt(language) {
  const prompts = {
    ru: 'Ты - AI ассистент HypeAI. Отвечай на русском языке. Будь полезным, кратким и профессиональным. Рассказывай о HypeAI AI сервисах, блокчейне BNB Chain, токеномике.',
    en: 'You are the HypeAI AI assistant. Answer in English. Be helpful, concise, and professional. Explain HypeAI AI services, BNB Chain blockchain, tokenomics.'
  };
  return prompts[language] || prompts.en;
}

function hashMessage(message) {
  // Simple hash for caching
  return message.toLowerCase().trim().slice(0, 50);
}

async function trackAnalytics(data) {
  // Send to analytics endpoint (async)
  await fetch('https://api.hypeai.io/analytics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
}
```

**Step 2:** Rate limiting helper
```javascript
// /api/_lib/rateLimit.js
const rateLimitStore = new Map();

export async function rateLimit(clientIP) {
  const now = Date.now();
  const windowMs = 60000; // 1 minute
  const maxRequests = 10;

  const key = `rate:${clientIP}`;
  const record = rateLimitStore.get(key) || { count: 0, resetTime: now + windowMs };

  // Reset if window expired
  if (now > record.resetTime) {
    record.count = 0;
    record.resetTime = now + windowMs;
  }

  record.count++;
  rateLimitStore.set(key, record);

  // Cleanup old entries
  if (rateLimitStore.size > 10000) {
    for (const [k, v] of rateLimitStore.entries()) {
      if (now > v.resetTime) {
        rateLimitStore.delete(k);
      }
    }
  }

  return {
    allowed: record.count <= maxRequests,
    remaining: Math.max(0, maxRequests - record.count),
    retryAfter: Math.ceil((record.resetTime - now) / 1000)
  };
}
```

**Step 3:** Caching helper
```javascript
// /api/_lib/cache.js
const cache = new Map();

export const cache = {
  async get(key) {
    const entry = cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      cache.delete(key);
      return null;
    }

    return entry.value;
  },

  async set(key, value, ttlSeconds) {
    cache.set(key, {
      value,
      expiresAt: Date.now() + (ttlSeconds * 1000)
    });

    // Auto-cleanup
    if (cache.size > 1000) {
      const now = Date.now();
      for (const [k, v] of cache.entries()) {
        if (now > v.expiresAt) {
          cache.delete(k);
        }
      }
    }
  }
};
```

**Step 4:** Update frontend to call Vercel API
```javascript
// public/variant-2/js/ai-chat-diamond.js (modify generateResponse method)

async generateResponse(userMessage) {
  this.removeTypingIndicator();

  try {
    // Call Vercel serverless function
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: userMessage,
        language: 'ru' // or detect from page
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    // Show AI response
    this.addMessage(data.reply, 'ai');

    // Show cache indicator
    if (data.cached) {
      console.log('⚡ Cached response');
    }

  } catch (error) {
    console.error('Chat error:', error);

    // Show error message to user
    this.addMessage(
      '⚠️ Извините, произошла ошибка. Попробуйте позже.',
      'ai'
    );
  }
}
```

**Step 5:** Deploy to Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd /Users/ai.place/Crypto
vercel

# Set environment variables
vercel env add ANTHROPIC_API_KEY production
# Paste your sk-ant-... key

# Deploy to production
vercel --prod
```

---

### Phase 2: Express API Backup (Optional, Week 2)

Deploy your existing Express API to Railway for complex queries:

```bash
# Navigate to server directory
cd /Users/ai.place/Crypto/server

# Install Railway CLI
npm install -g railway

# Login and initialize
railway login
railway init

# Set environment variables
railway variables set ANTHROPIC_API_KEY=sk-ant-...
railway variables set NODE_ENV=production
railway variables set PORT=3001
railway variables set ALLOWED_ORIGINS=https://hypeai.io

# Deploy
railway up

# Get deployment URL
railway domain
# Example: https://hypeai-api.up.railway.app
```

Update Vercel function to proxy complex queries:
```javascript
// /api/chat.js (add fallback to Express API)

// If RAG needed or complex query
if (needsKnowledgeBase(message)) {
  const expressURL = process.env.EXPRESS_API_URL || 'https://hypeai-api.up.railway.app';

  const response = await fetch(`${expressURL}/api/ai-assistant/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': process.env.EXPRESS_API_KEY
    },
    body: JSON.stringify({
      message,
      language,
      sessionId: req.cookies.sessionId
    })
  });

  return res.json(await response.json());
}
```

---

## Security Best Practices

### 1. API Key Protection ✅
```javascript
// NEVER expose in frontend
// ✅ Use environment variables in serverless functions
const apiKey = process.env.ANTHROPIC_API_KEY;

// ❌ NEVER do this
const apiKey = 'sk-ant-api03-...'; // EXPOSED!
```

### 2. Rate Limiting ✅
```javascript
// Vercel function
export const config = {
  maxDuration: 10, // 10 seconds max
};

// Per-IP rate limiting
const rateLimit = new RateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500,
});

const allowed = await rateLimit.check(res, 10, clientIP);
if (!allowed) {
  return res.status(429).json({ error: 'Rate limit exceeded' });
}
```

### 3. Input Validation ✅
```javascript
// Sanitize user input
function validateMessage(message) {
  if (!message || typeof message !== 'string') {
    throw new Error('Invalid message');
  }

  // Prevent prompt injection
  const sanitized = message
    .trim()
    .replace(/<script>/gi, '')
    .slice(0, 2000); // Max length

  return sanitized;
}
```

### 4. CORS Configuration ✅
```javascript
// Only allow your domain
res.setHeader('Access-Control-Allow-Origin', 'https://hypeai.io');
res.setHeader('Access-Control-Allow-Methods', 'POST');
res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
```

---

## Caching Strategy

### Edge Caching (Vercel)
```javascript
// Cache common queries at edge
export const config = {
  regions: ['iad1'], // Close to Claude API
};

const cache = new Map();

async function getCachedResponse(message) {
  const key = hashMessage(message);
  const cached = cache.get(key);

  if (cached && Date.now() < cached.expiresAt) {
    return cached.response;
  }

  return null;
}

async function cacheResponse(message, response, ttl = 3600) {
  const key = hashMessage(message);
  cache.set(key, {
    response,
    expiresAt: Date.now() + (ttl * 1000)
  });
}
```

### Browser Caching
```javascript
// Client-side cache in localStorage
class ChatCache {
  constructor() {
    this.cache = JSON.parse(localStorage.getItem('chatCache') || '{}');
  }

  get(message) {
    const key = this.hash(message);
    const entry = this.cache[key];

    if (!entry || Date.now() > entry.expiresAt) {
      return null;
    }

    return entry.response;
  }

  set(message, response, ttlSeconds = 3600) {
    const key = this.hash(message);
    this.cache[key] = {
      response,
      expiresAt: Date.now() + (ttlSeconds * 1000)
    };

    localStorage.setItem('chatCache', JSON.stringify(this.cache));
  }

  hash(message) {
    return message.toLowerCase().trim().slice(0, 50);
  }
}
```

**Cost Savings:**
- 50% of queries are repeat questions → Cache hits
- Cache hit = $0 cost (no API call)
- Cache miss = ~$0.01 per query

---

## Error Handling

### Frontend
```javascript
async function sendMessage(message) {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    });

    if (response.status === 429) {
      return {
        error: 'Слишком много запросов. Подождите минуту.',
        retryAfter: 60
      };
    }

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return await response.json();

  } catch (error) {
    console.error('Chat error:', error);

    return {
      error: 'Ошибка соединения. Попробуйте позже.',
      fallback: true
    };
  }
}
```

### Backend
```javascript
// Graceful degradation
try {
  const response = await anthropic.messages.create({...});
  return response;
} catch (error) {
  if (error.status === 429) {
    // Rate limit - wait and retry
    await sleep(1000);
    return await anthropic.messages.create({...});
  }

  if (error.status === 529) {
    // Overloaded - return cached response or fallback
    return getFallbackResponse(message);
  }

  throw error;
}
```

---

## Monitoring & Analytics

### Track Key Metrics
```javascript
// /api/_lib/analytics.js
export async function trackEvent(event, data) {
  const payload = {
    timestamp: new Date().toISOString(),
    event,
    ...data
  };

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log('[Analytics]', payload);
  }

  // Send to analytics service (async, don't block response)
  Promise.all([
    // Google Analytics
    fetch('https://www.google-analytics.com/collect', {
      method: 'POST',
      body: new URLSearchParams({
        v: '1',
        tid: process.env.GA_TRACKING_ID,
        cid: data.clientId,
        t: 'event',
        ec: 'chat',
        ea: event,
        el: JSON.stringify(data)
      })
    }),

    // Custom analytics endpoint
    fetch('https://api.hypeai.io/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
  ]).catch(console.error);
}

// Usage in chat endpoint
trackEvent('message_sent', {
  messageLength: message.length,
  language,
  responseTime: Date.now() - startTime,
  cached: false
});
```

### Dashboard Metrics
- **Total queries**: Track daily/weekly/monthly
- **Average response time**: Monitor API performance
- **Cache hit rate**: Optimize caching
- **Error rate**: Detect issues early
- **Popular questions**: Improve knowledge base

---

## Cost Optimization

### Estimated Costs (Monthly)

**Scenario 1: Low Traffic (100 queries/day)**
```
Vercel Serverless:
• 3,000 invocations/month: FREE ✅
• Bandwidth: ~1 GB: FREE ✅

Claude API:
• 3,000 queries × $0.01 avg: $30/month
• With 50% cache hit: $15/month ✅

Total: ~$15/month
```

**Scenario 2: Medium Traffic (1,000 queries/day)**
```
Vercel Serverless:
• 30,000 invocations/month: FREE ✅
• Bandwidth: ~10 GB: FREE ✅

Claude API:
• 30,000 queries × $0.01 avg: $300/month
• With 50% cache hit: $150/month
• With 70% cache hit: $90/month ✅

Total: ~$90-150/month
```

**Scenario 3: High Traffic (10,000 queries/day)**
```
Vercel Pro: $20/month
• 100,000 invocations: INCLUDED ✅
• Bandwidth: Unlimited ✅

Claude API:
• 300,000 queries × $0.01 avg: $3,000/month
• With 70% cache hit: $900/month
• With smart routing to cheaper models: $600/month ✅

Total: ~$620/month
```

### Optimization Strategies

1. **Aggressive Caching**
   ```javascript
   // Cache common questions for 24 hours
   const commonQuestions = [
     'что такое hypeai',
     'как купить токены',
     'сколько стоит'
   ];

   if (isCommonQuestion(message)) {
     cacheTTL = 86400; // 24 hours
   }
   ```

2. **Model Selection**
   ```javascript
   // Use cheaper Haiku for simple queries
   function selectModel(message) {
     if (message.length < 100 && !needsRAG(message)) {
       return 'claude-3-haiku-20240307'; // 60x cheaper!
     }
     return 'claude-3-5-sonnet-20241022';
   }
   ```

3. **Response Streaming**
   ```javascript
   // Stream responses to feel faster (no extra cost)
   const stream = await anthropic.messages.create({
     model: 'claude-3-5-sonnet-20241022',
     stream: true,
     messages: [...]
   });

   for await (const chunk of stream) {
     res.write(chunk.content);
   }
   ```

---

## Deployment Checklist

### Pre-Deployment

- [ ] Set `ANTHROPIC_API_KEY` in Vercel environment
- [ ] Configure CORS for production domain
- [ ] Set rate limits (10 requests/minute recommended)
- [ ] Enable caching (1 hour TTL for common queries)
- [ ] Add error tracking (Sentry/LogRocket)
- [ ] Test all endpoints with Postman
- [ ] Load test with k6 or Artillery

### Deployment Steps

```bash
# 1. Install dependencies
npm install @anthropic-ai/sdk

# 2. Test locally
vercel dev
# Visit http://localhost:3000/api/chat

# 3. Deploy to preview
vercel

# 4. Test preview deployment
curl -X POST https://your-preview.vercel.app/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Привет"}'

# 5. Deploy to production
vercel --prod

# 6. Update DNS (if needed)
# Point hypeai.io to Vercel
```

### Post-Deployment

- [ ] Monitor error rates in Vercel dashboard
- [ ] Check Claude API usage in Anthropic console
- [ ] Verify caching is working (check logs)
- [ ] Test from production domain
- [ ] Set up alerts for 5xx errors
- [ ] Document API endpoints

---

## File Structure (Final)

```
/Users/ai.place/Crypto/
├── api/                          # Vercel serverless functions
│   ├── chat.js                   # Main chat endpoint
│   ├── health.js                 # Health check
│   └── _lib/
│       ├── cache.js              # Edge caching
│       ├── rateLimit.js          # Rate limiting
│       ├── analytics.js          # Event tracking
│       └── anthropic.js          # Claude client
│
├── server/                       # Express API (backup/complex queries)
│   ├── ai-assistant-api.js       # Existing Express server ✅
│   ├── .env                      # Server environment
│   └── package.json
│
├── public/variant-2/js/
│   └── ai-chat-diamond.js        # Frontend (updated to call /api/chat)
│
├── docs/architecture/
│   └── AI_CHAT_BACKEND_INTEGRATION.md  # This document
│
└── vercel.json                   # Vercel configuration
```

---

## Example Code Files

### `/api/health.js`
```javascript
export default function handler(req, res) {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    endpoints: {
      chat: '/api/chat',
      health: '/api/health'
    }
  });
}
```

### Updated `vercel.json`
```json
{
  "version": 2,
  "name": "hypeai-website",
  "buildCommand": "echo 'Using pre-built public/ folder'",
  "outputDirectory": "public/variant-2",
  "cleanUrls": true,
  "functions": {
    "api/chat.js": {
      "maxDuration": 10,
      "memory": 1024
    }
  },
  "env": {
    "ANTHROPIC_API_KEY": "@anthropic-api-key",
    "NODE_ENV": "production"
  },
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "https://hypeai.io"
        },
        {
          "key": "Access-Control-Allow-Methods",
          "value": "POST, OPTIONS"
        },
        {
          "key": "Access-Control-Allow-Headers",
          "value": "Content-Type"
        }
      ]
    }
  ]
}
```

---

## Testing

### Manual Testing
```bash
# Test health endpoint
curl https://hypeai.io/api/health

# Test chat endpoint
curl -X POST https://hypeai.io/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Что такое HypeAI?",
    "language": "ru"
  }'

# Expected response:
# {
#   "reply": "HypeAI - это...",
#   "timestamp": "2025-10-26T...",
#   "responseTime": 1234,
#   "cached": false
# }
```

### Load Testing
```javascript
// test/load-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '1m', target: 10 },  // Ramp up
    { duration: '3m', target: 50 },  // Steady
    { duration: '1m', target: 0 },   // Ramp down
  ],
};

export default function () {
  const payload = JSON.stringify({
    message: 'Расскажи о HypeAI',
    language: 'ru'
  });

  const response = http.post(
    'https://hypeai.io/api/chat',
    payload,
    { headers: { 'Content-Type': 'application/json' } }
  );

  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 3s': (r) => r.timings.duration < 3000,
  });

  sleep(1);
}
```

---

## Migration Path

### Week 1: Serverless MVP
1. Create `/api/chat.js` serverless function
2. Update `ai-chat-diamond.js` to call new endpoint
3. Deploy to Vercel
4. Monitor for 1 week

### Week 2: Express Backup (Optional)
1. Deploy existing Express API to Railway
2. Add proxy logic in serverless function
3. Test fallback for complex queries

### Week 3: Optimization
1. Analyze cache hit rates
2. Optimize caching strategy
3. Add monitoring dashboards
4. Fine-tune rate limits

---

## Support & Troubleshooting

### Common Issues

**Issue:** "CORS error in browser console"
```javascript
// Solution: Add CORS headers in /api/chat.js
res.setHeader('Access-Control-Allow-Origin', 'https://hypeai.io');
res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
```

**Issue:** "Rate limit exceeded"
```javascript
// Solution: Increase limits or add caching
export const config = {
  rateLimit: {
    interval: 60 * 1000,
    max: 20, // Increase from 10
  },
};
```

**Issue:** "Cold start delays"
```javascript
// Solution: Keep function warm with cron job
// vercel.json
{
  "crons": [{
    "path": "/api/health",
    "schedule": "*/5 * * * *" // Every 5 minutes
  }]
}
```

---

## Conclusion

**Recommended Architecture:** Serverless Functions (Vercel) ✅

**Why:**
- FREE for HypeAI's traffic volume
- Zero infrastructure management
- Auto-scaling
- Built-in edge caching
- Easy deployment with `git push`
- Can proxy to Express API for complex queries

**Next Steps:**
1. Create `/api/chat.js` serverless function
2. Update frontend to call `/api/chat`
3. Deploy to Vercel
4. Monitor costs and performance

**Estimated Monthly Cost:** $15-90 (mostly Claude API, not infrastructure)

---

**Questions?** Contact backend team or check:
- Vercel Docs: https://vercel.com/docs/serverless-functions
- Anthropic API: https://docs.anthropic.com/claude/reference
- Express API: `/server/README_API.md`
