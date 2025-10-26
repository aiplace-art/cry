# HypeAI AI Chat - Architecture Diagram

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                            USER BROWSER                                 │
│  ┌────────────────────────────────────────────────────────────────┐    │
│  │  Diamond AI Chat UI (ai-chat-diamond.js)                       │    │
│  │  • Beautiful animations                                         │    │
│  │  • Message history                                              │    │
│  │  • Typing indicators                                            │    │
│  └────────────────┬───────────────────────────────────────────────┘    │
└────────────────────┼────────────────────────────────────────────────────┘
                     │
                     │ POST /api/chat
                     │ { message, language }
                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      VERCEL EDGE NETWORK (FREE)                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  API Gateway & Security Layer                                   │   │
│  │  • CORS validation (https://hypeai.io only)                     │   │
│  │  • Request validation (max 2000 chars)                          │   │
│  │  • Security headers (XSS, CSRF protection)                      │   │
│  └────────────────┬────────────────────────────────────────────────┘   │
│                   │                                                     │
│                   ▼                                                     │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  /api/chat.js (Serverless Function)                             │   │
│  │                                                                  │   │
│  │  ┌──────────────────────────────────────────────────────────┐  │   │
│  │  │ 1. Rate Limiting (_lib/rateLimit.js)                     │  │   │
│  │  │    • Check: clientIP allowed? (10 req/min)               │  │   │
│  │  │    • ✅ Yes → Continue                                    │  │   │
│  │  │    • ❌ No → Return 429 (Too Many Requests)              │  │   │
│  │  └──────────────────────────────────────────────────────────┘  │   │
│  │                          │                                      │   │
│  │                          ▼                                      │   │
│  │  ┌──────────────────────────────────────────────────────────┐  │   │
│  │  │ 2. Cache Check (_lib/cache.js)                           │  │   │
│  │  │    • Generate key: chat:{lang}:{hash(message)}           │  │   │
│  │  │    • Check cache:                                         │  │   │
│  │  │      ✅ HIT → Return cached response (0ms, $0 cost)      │  │   │
│  │  │      ❌ MISS → Continue to Claude API                    │  │   │
│  │  └──────────────────────────────────────────────────────────┘  │   │
│  │                          │                                      │   │
│  │                          ▼                                      │   │
│  │  ┌──────────────────────────────────────────────────────────┐  │   │
│  │  │ 3. Claude API Call                                        │  │   │
│  │  │    • Model: claude-3-5-sonnet-20241022                   │  │   │
│  │  │    • System prompt: getSystemPrompt(language)            │  │   │
│  │  │    • Max tokens: 4096                                     │  │   │
│  │  │    • Temperature: 0.7                                     │  │   │
│  │  └──────────────────────────────────────────────────────────┘  │   │
│  │                          │                                      │   │
│  │                          ▼                                      │   │
│  │  ┌──────────────────────────────────────────────────────────┐  │   │
│  │  │ 4. Response Processing                                    │  │   │
│  │  │    • Extract reply from Claude response                  │  │   │
│  │  │    • Cache response (1 hour common / 5 min unique)       │  │   │
│  │  │    • Track analytics (async)                             │  │   │
│  │  │    • Return JSON to frontend                              │  │   │
│  │  └──────────────────────────────────────────────────────────┘  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
                     │
                     │ Analytics (async, fire & forget)
                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      ANALYTICS SERVICES                                 │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────────────┐   │
│  │ Google         │  │ Express API    │  │ Custom Webhook         │   │
│  │ Analytics 4    │  │ Analytics      │  │ (Optional)             │   │
│  └────────────────┘  └────────────────┘  └────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
                     │
                     │ Backup/RAG (optional)
                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│              EXPRESS API (Railway/Fly.io - Optional)                    │
│  • Complex RAG queries                                                  │
│  • Knowledge base search                                                │
│  • Session management                                                   │
│  • Advanced analytics                                                   │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Request Flow Diagram

```
┌──────┐
│ User │
└──┬───┘
   │
   │ 1. Click send message
   ▼
┌─────────────────────┐
│ Diamond Chat UI     │
│ ai-chat-diamond.js  │
└──┬──────────────────┘
   │
   │ 2. POST /api/chat
   │    { message: "Что такое HypeAI?", language: "ru" }
   ▼
┌─────────────────────────────────────────────────────────┐
│ Vercel Edge Network                                     │
│                                                          │
│  3. CORS Check                                          │
│     ✅ Origin: https://hypeai.io → Allowed              │
│     ❌ Other origin → 403 Forbidden                     │
└──┬──────────────────────────────────────────────────────┘
   │
   │ 4. Route to /api/chat.js
   ▼
┌─────────────────────────────────────────────────────────┐
│ /api/chat.js (Serverless Function)                      │
│                                                          │
│  5. Validate Input                                      │
│     • Message not empty?                                │
│     • Message < 2000 chars?                             │
│     • Language valid?                                   │
│     ✅ Valid → Continue                                 │
│     ❌ Invalid → 400 Bad Request                        │
└──┬──────────────────────────────────────────────────────┘
   │
   │ 6. Rate Limit Check
   ▼
┌─────────────────────────────────────────────────────────┐
│ _lib/rateLimit.js                                       │
│                                                          │
│  Get client IP: 192.168.1.1                             │
│  Check rate limit store:                                │
│    • Requests in last 60s: 9                            │
│    • Max allowed: 10                                    │
│    ✅ 9 < 10 → Allowed (remaining: 1)                   │
│    ❌ 10+ → 429 Rate Limit Exceeded                     │
└──┬──────────────────────────────────────────────────────┘
   │
   │ 7. Cache Check
   ▼
┌─────────────────────────────────────────────────────────┐
│ _lib/cache.js                                           │
│                                                          │
│  Generate cache key:                                    │
│    chat:ru:что такое hypeai                             │
│                                                          │
│  Check cache:                                           │
│    ✅ HIT (found, not expired)                          │
│       → Return cached response                          │
│       → Response time: < 100ms                          │
│       → Cost: $0                                        │
│                                                          │
│    ❌ MISS (not found or expired)                       │
│       → Continue to Claude API                          │
└──┬──────────────────────────────────────────────────────┘
   │
   │ 8. Call Claude API (on cache miss)
   ▼
┌─────────────────────────────────────────────────────────┐
│ Anthropic Claude API                                    │
│                                                          │
│  Request:                                               │
│    model: claude-3-5-sonnet-20241022                   │
│    system: "Ты - AI ассистент HypeAI..."               │
│    messages: [                                          │
│      { role: "user", content: "Что такое HypeAI?" }    │
│    ]                                                    │
│    max_tokens: 4096                                     │
│    temperature: 0.7                                     │
│                                                          │
│  Response: (~1-2 seconds)                               │
│    content: "HypeAI - это платформа..."                │
│    usage: { input_tokens: 50, output_tokens: 100 }     │
└──┬──────────────────────────────────────────────────────┘
   │
   │ 9. Process Response
   ▼
┌─────────────────────────────────────────────────────────┐
│ /api/chat.js (Response Processing)                      │
│                                                          │
│  • Extract reply text                                   │
│  • Calculate response time                              │
│  • Cache response (TTL: 1 hour for common queries)     │
│  • Track analytics (async)                              │
│  • Build response JSON                                  │
└──┬──────────────────────────────────────────────────────┘
   │
   │ 10. Return to Frontend
   ▼
┌─────────────────────────────────────────────────────────┐
│ JSON Response                                           │
│                                                          │
│  {                                                      │
│    "reply": "HypeAI - это платформа...",               │
│    "timestamp": "2025-10-26T13:45:00.000Z",            │
│    "responseTime": 1234,                                │
│    "cached": false,                                     │
│    "remaining": 9                                       │
│  }                                                      │
└──┬──────────────────────────────────────────────────────┘
   │
   │ 11. Display in UI
   ▼
┌─────────────────────┐
│ Diamond Chat UI     │
│ • Show AI message   │
│ • Typing animation  │
│ • Scroll to bottom  │
└─────────────────────┘
```

---

## Cost Flow Diagram

```
┌──────────────┐
│ User Message │
└──────┬───────┘
       │
       ▼
┌─────────────────────────────────────────────────────┐
│ Rate Limiting (10 req/min)                          │
│ Cost: $0 (prevents abuse)                           │
└──────┬──────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────┐
│ Cache Check                                         │
│ • 50-70% hit rate                                   │
│ • Cache HIT:  Cost $0, Time < 100ms  ✅            │
│ • Cache MISS: Continue to API        →             │
└──────┬──────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────┐
│ Claude API Call                                     │
│ • Input tokens:  ~50   × $0.003/1K = $0.0001       │
│ • Output tokens: ~100  × $0.015/1K = $0.0015       │
│ • Total per message: ~$0.002-0.01 avg              │
└──────┬──────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────┐
│ Vercel Infrastructure                               │
│ • Serverless function: FREE (100k/month)           │
│ • Bandwidth: FREE (100 GB/month)                    │
│ • Edge caching: FREE                                │
└──────┬──────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────┐
│ Monthly Cost Breakdown (1000 queries/day)           │
│                                                      │
│ Infrastructure (Vercel): $0  ✅                     │
│                                                      │
│ AI API (Claude):                                    │
│   Without cache: $300/month                         │
│   With 50% cache: $150/month                        │
│   With 70% cache: $90/month  ✅                     │
│                                                      │
│ Total: ~$90/month                                   │
└─────────────────────────────────────────────────────┘
```

---

## Security Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│ Multi-Layer Security                                            │
│                                                                  │
│  Layer 1: Frontend Validation                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │ • Client-side input validation                          │    │
│  │ • XSS prevention in message display                     │    │
│  │ • HTTPS only communication                              │    │
│  └────────────────────────────────────────────────────────┘    │
│                          │                                      │
│  Layer 2: CORS Protection                                      │
│  ┌────────────────────────────────────────────────────────┐    │
│  │ • Origin: https://hypeai.io only                        │    │
│  │ • Methods: POST, OPTIONS only                           │    │
│  │ • Headers: Content-Type only                            │    │
│  │ • No cookies, no credentials                            │    │
│  └────────────────────────────────────────────────────────┘    │
│                          │                                      │
│  Layer 3: Input Validation                                     │
│  ┌────────────────────────────────────────────────────────┐    │
│  │ • Type checking (string, max 2000 chars)               │    │
│  │ • Content sanitization                                  │    │
│  │ • Language whitelist (ru, en)                           │    │
│  │ • SQL injection prevention                              │    │
│  └────────────────────────────────────────────────────────┘    │
│                          │                                      │
│  Layer 4: Rate Limiting                                        │
│  ┌────────────────────────────────────────────────────────┐    │
│  │ • 10 requests/minute per IP                             │    │
│  │ • Auto-reset every 60 seconds                           │    │
│  │ • 429 status code enforcement                           │    │
│  │ • DDoS protection                                       │    │
│  └────────────────────────────────────────────────────────┘    │
│                          │                                      │
│  Layer 5: API Key Protection                                   │
│  ┌────────────────────────────────────────────────────────┐    │
│  │ • Environment variable (never in code)                  │    │
│  │ • Vercel secret management                              │    │
│  │ • Never logged or exposed                               │    │
│  │ • Rotated regularly                                     │    │
│  └────────────────────────────────────────────────────────┘    │
│                          │                                      │
│  Layer 6: Error Handling                                       │
│  ┌────────────────────────────────────────────────────────┐    │
│  │ • Generic error messages (no stack traces in prod)     │    │
│  │ • Graceful degradation                                  │    │
│  │ • Logged internally, hidden from user                   │    │
│  │ • Retry logic for transient failures                    │    │
│  └────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

---

## File Structure Diagram

```
/Users/ai.place/Crypto/
│
├── api/                               # Vercel serverless functions
│   ├── chat.js                        # Main chat endpoint ⭐
│   ├── health.js                      # Health check endpoint
│   ├── package.json                   # Dependencies
│   ├── .env.example                   # Environment template
│   ├── README.md                      # API documentation
│   └── _lib/                          # Helper libraries
│       ├── rateLimit.js               # IP-based rate limiting
│       ├── cache.js                   # LRU caching with TTL
│       └── analytics.js               # Event tracking
│
├── public/variant-2/js/
│   └── ai-chat-diamond.js             # Frontend chat UI ⭐
│
├── server/                            # Express API (backup/optional)
│   ├── ai-assistant-api.js            # Full-featured API
│   ├── .env.example                   # Server environment
│   └── package.json                   # Server dependencies
│
├── docs/
│   ├── architecture/
│   │   ├── AI_CHAT_BACKEND_INTEGRATION.md    # Full architecture (11k words)
│   │   └── ARCHITECTURE_DIAGRAM.md           # This file
│   ├── API_INTEGRATION_QUICKSTART.md         # 5-minute deploy guide
│   └── AI_CHAT_INTEGRATION_SUMMARY.md        # Executive summary
│
├── scripts/
│   └── deploy-ai-chat.sh              # One-command deployment script
│
├── vercel.json                        # Vercel configuration ⭐
│
└── README.md                          # Project README
```

**⭐ = Critical files for deployment**

---

## Deployment Flow

```
┌─────────────────┐
│ Developer       │
└────────┬────────┘
         │
         │ Run: ./scripts/deploy-ai-chat.sh
         ▼
┌──────────────────────────────────────────────────┐
│ Deployment Script                                │
│                                                   │
│ 1. Check Vercel CLI installed                   │
│ 2. Login to Vercel                               │
│ 3. Install API dependencies (api/package.json)  │
│ 4. Set environment variables:                    │
│    • ANTHROPIC_API_KEY                           │
│    • ALLOWED_ORIGIN                              │
│    • Optional: GA, webhooks, etc.                │
│ 5. Deploy to Vercel                              │
└────────┬─────────────────────────────────────────┘
         │
         │ vercel --prod
         ▼
┌──────────────────────────────────────────────────┐
│ Vercel Platform                                  │
│                                                   │
│ 1. Build Phase:                                  │
│    • Read vercel.json config                     │
│    • Install API dependencies                    │
│    • Bundle serverless functions                 │
│                                                   │
│ 2. Deploy Phase:                                 │
│    • Upload to edge network                      │
│    • Configure routes                            │
│    • Set CORS headers                            │
│    • Activate functions                          │
│                                                   │
│ 3. DNS Update:                                   │
│    • Point domain to Vercel                      │
│    • Enable SSL (auto)                           │
│    • Enable CDN (auto)                           │
└────────┬─────────────────────────────────────────┘
         │
         │ Deployment URL
         ▼
┌──────────────────────────────────────────────────┐
│ Live API                                         │
│                                                   │
│ ✅ https://hypeai-website.vercel.app/api/chat   │
│ ✅ https://hypeai-website.vercel.app/api/health │
│                                                   │
│ Status: Healthy                                  │
│ Uptime: 99.9%                                    │
│ Response: < 2s average                           │
└──────────────────────────────────────────────────┘
```

---

**Next:** Deploy with `./scripts/deploy-ai-chat.sh`
