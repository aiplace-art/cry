# 🚀 HypeAI Groq Chat - Quick Deploy Guide

## ⚡ 5-Minute Deployment

### 1️⃣ Get Groq API Key (2 min)
```
1. Visit: https://console.groq.com
2. Sign up (free)
3. Go to API Keys
4. Create new key
5. Copy key (starts with gsk_)
```

### 2️⃣ Install Vercel CLI (30 sec)
```bash
npm install -g vercel
```

### 3️⃣ Deploy (2 min)
```bash
# Login to Vercel
vercel login

# Add API key
vercel env add GROQ_API_KEY
# Paste your Groq key when prompted
# Select: Production, Preview, Development (all)

# Deploy to production
vercel --prod
```

### 4️⃣ Test (30 sec)
```bash
# Replace YOUR_URL with your Vercel URL
curl -X POST https://YOUR_URL.vercel.app/api/chat-groq \
  -H "Content-Type: application/json" \
  -d '{"message": "Что такое HypeAI?"}'
```

## ✅ Files Created

- `/api/chat-groq.js` - Main API endpoint
- `/api/_lib/groq-client.js` - Groq API wrapper
- `/api/_lib/rate-limiter.js` - Rate limiting (10 req/min)
- `/api/_lib/system-prompt.js` - HypeAI knowledge base
- `/api/test-groq.js` - Testing utility
- `/docs/GROQ_INTEGRATION_GUIDE.md` - Full documentation
- `/docs/API_INTEGRATION_FRONTEND.md` - Frontend integration
- `.env.local.example` - Environment template

## 📋 API Endpoint

**URL:** `https://your-project.vercel.app/api/chat-groq`

**Method:** POST

**Body:**
```json
{
  "message": "Что такое HypeAI?",
  "conversationHistory": [
    { "role": "user", "content": "Привет" },
    { "role": "assistant", "content": "Здравствуйте!" }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "response": "HypeAI - это AI-платформа...",
  "model": "llama-3.3-70b-versatile",
  "timestamp": "2025-01-26T12:00:00.000Z",
  "rateLimit": {
    "remaining": 9,
    "resetIn": 60
  }
}
```

## 🧪 Local Testing

```bash
# Start dev server
vercel dev

# Test API
curl -X POST http://localhost:3000/api/chat-groq \
  -H "Content-Type: application/json" \
  -d '{"message": "Привет!"}'

# Run test suite
node api/test-groq.js
```

## 🔧 Environment Variables

Required in Vercel:
- `GROQ_API_KEY` - Your Groq API key

Optional:
- `NODE_ENV` - production/development
- `RATE_LIMIT_MAX_REQUESTS` - Default: 10
- `RATE_LIMIT_WINDOW_MS` - Default: 60000

## 📊 Rate Limits

**Client Side:**
- 10 requests per minute per IP
- Configurable in `rate-limiter.js`

**Groq Free Tier:**
- 300 tokens/second
- Unlimited requests
- No credit card required

## 🎯 Next Steps

1. Update frontend to use API (see `/docs/API_INTEGRATION_FRONTEND.md`)
2. Monitor usage in Vercel dashboard
3. Customize system prompt in `/api/_lib/system-prompt.js`
4. Add caching for common queries
5. Implement streaming responses

## 💰 Cost

**Groq:** FREE (300 tokens/sec)
**Vercel:** FREE (within limits)

**Total: $0/month** 🎉

## 📚 Full Documentation

- Setup: `/docs/GROQ_INTEGRATION_GUIDE.md`
- Frontend: `/docs/API_INTEGRATION_FRONTEND.md`
- Groq Docs: https://console.groq.com/docs

## 🆘 Support

Issues? Check troubleshooting in full guide or contact support.

**Built with ❤️ for HypeAI**
