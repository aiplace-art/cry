# HypeAI Chat - Groq API Integration Guide

## 🚀 Quick Start

This guide will help you integrate the HypeAI Diamond Chat with Groq's Llama 3.3 70B model and deploy to Vercel.

---

## 📋 Prerequisites

- Node.js 18+ installed
- Vercel account (free tier works)
- Groq account (free tier: 300 tokens/sec)

---

## 🔑 Step 1: Get Groq API Key

1. Visit [https://console.groq.com](https://console.groq.com)
2. Sign up or log in
3. Go to **API Keys** section
4. Click **Create API Key**
5. Name it (e.g., "HypeAI Chat")
6. Copy the key (starts with `gsk_...`)

**Important:** Save this key securely - you won't see it again!

---

## 📦 Step 2: Install Dependencies

```bash
cd /Users/ai.place/Crypto

# Install required packages
npm install --save-dev vercel

# Optional: Install for local testing
npm install node-fetch
```

---

## ⚙️ Step 3: Configure Environment Variables

### For Local Development:

1. Copy the example file:
```bash
cp .env.local.example .env.local
```

2. Edit `.env.local`:
```bash
GROQ_API_KEY=gsk_your_actual_key_here
NODE_ENV=development
```

3. Add to `.gitignore`:
```bash
echo ".env.local" >> .gitignore
```

### For Vercel Production:

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Add environment variable:
```bash
vercel env add GROQ_API_KEY
# Paste your Groq API key when prompted
# Select: Production, Preview, Development (all)
```

---

## 🧪 Step 4: Test Locally

### Option A: Using Vercel Dev Server (Recommended)

```bash
# Start Vercel dev server
vercel dev

# Chat API will be available at:
# http://localhost:3000/api/chat
```

### Option B: Using Node.js directly

Create `test/test-chat-api.js`:

```javascript
const { GroqClient } = require('../api/_lib/groq-client');

async function test() {
  const apiKey = process.env.GROQ_API_KEY;
  const groq = new GroqClient(apiKey);

  const response = await groq.chat([
    { role: 'user', content: 'Привет! Что такое HypeAI?' }
  ]);

  console.log('Response:', response);
}

test().catch(console.error);
```

Run test:
```bash
node -r dotenv/config test/test-chat-api.js
```

---

## 🌐 Step 5: Deploy to Vercel

### First Time Deployment:

```bash
# Login (if not already)
vercel login

# Deploy
vercel --prod
```

### Subsequent Deployments:

```bash
# Just run
vercel --prod
```

**Your API will be live at:**
```
https://your-project.vercel.app/api/chat
```

---

## 🔗 Step 6: Update Frontend

Edit `/public/variant-2/js/ai-chat-diamond.js`:

**Find this section (around line 269):**

```javascript
generateResponse(userMessage) {
  const lowerMessage = userMessage.toLowerCase();
  let response = '';

  // ... existing code ...
}
```

**Replace with API call:**

```javascript
async generateResponse(userMessage) {
  try {
    // Call Groq API
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: userMessage,
        conversationHistory: this.messages.slice(-5).map(m => ({
          role: m.sender === 'user' ? 'user' : 'assistant',
          content: m.text
        }))
      })
    });

    if (!response.ok) {
      throw new Error('API request failed');
    }

    const data = await response.json();

    if (data.success && data.response) {
      this.addMessage(data.response, 'ai');
    } else {
      throw new Error('Invalid API response');
    }

  } catch (error) {
    console.error('Chat API Error:', error);

    // Fallback to local knowledge base
    this.generateLocalResponse(userMessage);
  }
}

// Rename existing generateResponse to generateLocalResponse
generateLocalResponse(userMessage) {
  // ... existing local response code ...
}
```

---

## 🧪 Step 7: Test Production

### Test with cURL:

```bash
curl -X POST https://your-project.vercel.app/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Что такое HypeAI?",
    "conversationHistory": []
  }'
```

### Expected Response:

```json
{
  "success": true,
  "response": "HypeAI - это AI-платформа для криптовалют с 15 умными агентами! 🤖...",
  "model": "llama-3.3-70b-versatile",
  "timestamp": "2025-01-26T12:00:00.000Z",
  "rateLimit": {
    "remaining": 9,
    "resetIn": 60
  }
}
```

---

## 🛡️ Security Best Practices

### 1. Never Commit API Keys
```bash
# Ensure .env.local is in .gitignore
echo ".env.local" >> .gitignore
git add .gitignore
git commit -m "Add .env.local to gitignore"
```

### 2. Use Environment Variables Only
```javascript
// ✅ GOOD
const apiKey = process.env.GROQ_API_KEY;

// ❌ BAD
const apiKey = 'gsk_hardcoded_key';
```

### 3. Validate All Inputs
- Message length limits (1000 chars)
- Conversation history limits (5 messages)
- Rate limiting (10 req/min per IP)

### 4. Handle Errors Gracefully
- Don't expose API keys in errors
- Log errors server-side only
- Return generic error messages to clients

---

## 📊 Monitoring & Debugging

### Check Vercel Logs:

```bash
# Real-time logs
vercel logs --follow

# Recent logs
vercel logs
```

### Check Function Invocations:

1. Visit [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Functions** tab
4. Click on `/api/chat.js`
5. View invocations, errors, and performance

### Common Issues:

**1. "Invalid API key"**
- Solution: Check `GROQ_API_KEY` in Vercel environment variables
- Verify key starts with `gsk_`

**2. "Rate limit exceeded"**
- Client side: 10 req/min per IP
- Groq side: 300 tokens/sec (free tier)
- Solution: Wait 1 minute or upgrade Groq plan

**3. "Request timeout"**
- Solution: Increase timeout in `vercel.json` (max 30s)
- Check Groq API status

**4. CORS errors**
- Solution: Verify `vercel.json` headers configuration
- Check origin is allowed

---

## 💰 Cost Analysis

### Groq Free Tier:
- ✅ 300 tokens/second
- ✅ Unlimited requests
- ✅ No credit card required
- ⚠️ Rate limits apply

### Vercel Free Tier:
- ✅ 100GB bandwidth/month
- ✅ 100 serverless function invocations/day
- ✅ Custom domain support
- ⚠️ After limits: $0.60/million requests

**Estimated costs for 10,000 chat messages/month:**
- Groq: **$0.00** (free tier)
- Vercel: **$0.00** (within free tier)

**Total: FREE! 🎉**

---

## 🚀 Performance Optimization

### 1. Token Optimization
```javascript
// Limit conversation history
const limitedHistory = conversationHistory.slice(-5);

// Use compact system prompt for simple queries
const isSimpleQuery = message.length < 50;
const prompt = isSimpleQuery ?
  generateCompactPrompt() :
  generateSystemPrompt();
```

### 2. Caching (Future Enhancement)
```javascript
// Cache common responses
const CACHE = new Map();
const cacheKey = message.toLowerCase().trim();

if (CACHE.has(cacheKey)) {
  return CACHE.get(cacheKey);
}
```

### 3. Response Streaming (Advanced)
```javascript
// Enable streaming for faster perceived response
const stream = await groq.chat(messages, { stream: true });
```

---

## 📈 Scaling Considerations

### When to Upgrade:

**Groq:**
- Need more than 300 tokens/sec
- Want priority support
- Upgrade to **Pro** ($10/month)

**Vercel:**
- Exceed 100 serverless invocations/day
- Need more bandwidth
- Upgrade to **Pro** ($20/month)

### Load Testing:

```bash
# Install Apache Bench
brew install ab  # macOS

# Test with 100 requests, 10 concurrent
ab -n 100 -c 10 -p test-payload.json \
   -T application/json \
   https://your-project.vercel.app/api/chat
```

---

## 🔧 Troubleshooting

### Debug Mode:

Edit `/api/chat.js`:

```javascript
// Enable detailed logging
const DEBUG = process.env.DEBUG === 'true';

if (DEBUG) {
  console.log('[DEBUG] Request:', req.body);
  console.log('[DEBUG] Messages:', messages);
  console.log('[DEBUG] Response:', response);
}
```

Set in Vercel:
```bash
vercel env add DEBUG
# Enter: true
```

### Health Check Endpoint:

Create `/api/health.js`:

```javascript
module.exports = async (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    groqConfigured: !!process.env.GROQ_API_KEY
  });
};
```

Test:
```bash
curl https://your-project.vercel.app/api/health
```

---

## 📚 Additional Resources

- [Groq Documentation](https://console.groq.com/docs)
- [Groq API Reference](https://console.groq.com/docs/api-reference)
- [Vercel Serverless Functions](https://vercel.com/docs/functions)
- [Llama 3.3 70B Model Info](https://www.llama.com/)

---

## ✅ Deployment Checklist

- [ ] Groq API key obtained
- [ ] `.env.local` created and configured
- [ ] `.env.local` added to `.gitignore`
- [ ] Dependencies installed
- [ ] Local testing successful
- [ ] Vercel account created
- [ ] Environment variables configured in Vercel
- [ ] Deployed to Vercel production
- [ ] Production API tested with cURL
- [ ] Frontend updated to use API
- [ ] End-to-end testing completed
- [ ] Error handling verified
- [ ] Rate limiting tested
- [ ] Monitoring set up

---

## 🎉 Success!

Your HypeAI Chat is now powered by Groq's Llama 3.3 70B model!

**Next Steps:**
1. Monitor usage in Vercel dashboard
2. Collect user feedback
3. Fine-tune system prompts
4. Add analytics tracking
5. Consider implementing caching

**Need Help?**
- Check Vercel logs: `vercel logs --follow`
- Review Groq status: [status.groq.com](https://status.groq.com)
- Contact support: info@hypeai.io

---

**Built with ❤️ for HypeAI**
