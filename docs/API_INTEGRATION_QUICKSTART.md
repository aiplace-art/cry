# AI Chat Backend Integration - Quick Start Guide

## 🚀 Deploy in 5 Minutes

### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

### Step 2: Login to Vercel
```bash
vercel login
```

### Step 3: Set Environment Variables
```bash
# From project root
cd /Users/ai.place/Crypto

# Add Anthropic API key
vercel env add ANTHROPIC_API_KEY production
# Paste your sk-ant-api03-... key when prompted

# Add allowed origin
vercel env add ALLOWED_ORIGIN production
# Enter: https://hypeai.io

# (Optional) Add analytics
vercel env add GA_MEASUREMENT_ID production
# Enter your Google Analytics ID
```

### Step 4: Deploy
```bash
# Deploy to production
vercel --prod

# Your API will be live at:
# https://hypeai-website.vercel.app/api/chat
```

### Step 5: Update Frontend

Add this to your `public/variant-2/js/ai-chat-diamond.js`:

```javascript
// Replace the generateResponse method (lines 269-292)
async generateResponse(userMessage) {
  this.removeTypingIndicator();

  try {
    // Call Vercel serverless API
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: userMessage,
        language: 'ru', // or 'en'
        sessionId: this.sessionId // if you want session tracking
      })
    });

    if (response.status === 429) {
      // Rate limited
      this.addMessage(
        '⏳ Слишком много запросов. Попробуйте через минуту.',
        'ai'
      );
      return;
    }

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    // Show AI response
    this.addMessage(data.reply, 'ai');

    // Optional: Show cache indicator
    if (data.cached && process.env.NODE_ENV === 'development') {
      console.log('⚡ Cached response', data.responseTime + 'ms');
    }

  } catch (error) {
    console.error('Chat error:', error);

    // Show error to user
    this.addMessage(
      '⚠️ Извините, произошла ошибка. Попробуйте позже.',
      'ai'
    );
  }
}
```

### Step 6: Add Session ID (Optional)

For better conversation tracking, add session management:

```javascript
// In DiamondChatController constructor
constructor() {
  this.isOpen = false;
  this.messages = [];
  this.sessionId = this.getOrCreateSessionId(); // Add this
  // ... rest of constructor
}

getOrCreateSessionId() {
  let sessionId = localStorage.getItem('hypeai_chat_session');

  if (!sessionId) {
    sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('hypeai_chat_session', sessionId);
  }

  return sessionId;
}
```

---

## 🧪 Testing

### Test Health Endpoint
```bash
curl https://hypeai-website.vercel.app/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2025-10-26T...",
  "version": "1.0.0",
  "service": "HypeAI AI Chat API",
  "configuration": {
    "apiKeyConfigured": true,
    "model": "claude-3-5-sonnet-20241022"
  }
}
```

### Test Chat Endpoint
```bash
curl -X POST https://hypeai-website.vercel.app/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Что такое HypeAI?",
    "language": "ru"
  }'
```

Expected response:
```json
{
  "reply": "HypeAI - это...",
  "timestamp": "2025-10-26T...",
  "responseTime": 1234,
  "cached": false,
  "remaining": 9
}
```

### Test Rate Limiting
```bash
# Send 11 requests quickly (should get rate limited on 11th)
for i in {1..11}; do
  curl -X POST https://hypeai-website.vercel.app/api/chat \
    -H "Content-Type: application/json" \
    -d '{"message":"Test"}' &
done
```

Expected 11th response:
```json
{
  "error": "Слишком много запросов. Попробуйте через минуту.",
  "retryAfter": 60,
  "remaining": 0
}
```

---

## 📊 Monitor Usage

### Vercel Dashboard
```
https://vercel.com/dashboard

- Functions → View invocations
- Analytics → Monitor traffic
- Logs → Debug errors
```

### Anthropic Console
```
https://console.anthropic.com

- Usage → Track API costs
- Models → View token consumption
```

---

## 🔧 Configuration

### Environment Variables (Vercel Dashboard)

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `ANTHROPIC_API_KEY` | ✅ Yes | Your Claude API key | `sk-ant-api03-...` |
| `ALLOWED_ORIGIN` | ✅ Yes | Your website domain | `https://hypeai.io` |
| `ANTHROPIC_MODEL` | No | Claude model to use | `claude-3-5-sonnet-20241022` |
| `MAX_TOKENS` | No | Max response tokens | `4096` |
| `TEMPERATURE` | No | Response creativity | `0.7` |
| `GA_MEASUREMENT_ID` | No | Google Analytics ID | `G-XXXXXXXXXX` |
| `EXPRESS_API_URL` | No | Backup API URL | `https://api.hypeai.io` |

### Update Environment Variables
```bash
# Update existing variable
vercel env rm ANTHROPIC_API_KEY production
vercel env add ANTHROPIC_API_KEY production

# Or use Vercel dashboard:
# Settings → Environment Variables → Edit
```

---

## 🚨 Troubleshooting

### Error: "CORS error"
**Solution:** Update `ALLOWED_ORIGIN` environment variable
```bash
vercel env add ALLOWED_ORIGIN production
# Enter: https://hypeai.io
```

### Error: "Missing ANTHROPIC_API_KEY"
**Solution:** Add API key to Vercel
```bash
vercel env add ANTHROPIC_API_KEY production
# Paste your sk-ant-... key
```

### Error: "Rate limit exceeded"
**Solution:** This is expected behavior. Wait 60 seconds or increase limits in `/api/_lib/rateLimit.js`

### Error: "Timeout"
**Solution:** Reduce `MAX_TOKENS` or optimize system prompt
```bash
vercel env add MAX_TOKENS production
# Enter: 2048 (instead of 4096)
```

---

## 💰 Cost Estimate

### Free Tier Limits (Vercel)
- ✅ 100,000 serverless invocations/month
- ✅ 100 GB bandwidth
- ✅ Unlimited deployments

### HypeAI Usage Estimate
- 1,000 chat messages/day = 30,000/month
- **Cost:** $0 (well within free tier)

### Claude API Costs
- ~$0.01 per chat message average
- 1,000 messages/day = $10/day = $300/month
- **With 50% cache hit:** $150/month
- **With 70% cache hit:** $90/month

### Total Monthly Cost
- **Infrastructure:** $0 (Vercel free tier)
- **AI API:** $90-150 (Claude)
- **TOTAL:** ~$100/month

---

## 🎯 Next Steps

### Phase 1: Basic Setup (Done ✅)
- [x] Create serverless functions
- [x] Deploy to Vercel
- [x] Connect frontend

### Phase 2: Optimization (Week 2)
- [ ] Implement advanced caching
- [ ] Add conversation memory
- [ ] Optimize system prompts
- [ ] A/B test response quality

### Phase 3: Advanced Features (Week 3)
- [ ] Multi-language support
- [ ] Voice input/output
- [ ] File uploads
- [ ] Custom AI agents

---

## 📚 Resources

- **Full Documentation:** `/docs/architecture/AI_CHAT_BACKEND_INTEGRATION.md`
- **Vercel Docs:** https://vercel.com/docs/serverless-functions
- **Claude API:** https://docs.anthropic.com/claude
- **Support:** Check `/server/README_API.md`

---

**Questions?** Your backend is now live! 🚀

Test it at: `https://your-deployment.vercel.app/api/chat`
