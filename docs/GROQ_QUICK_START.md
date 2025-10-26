# Groq API Quick Start - 5 Minutes to AI Assistant

## ⚡ Get Started in 5 Minutes

### Step 1: Get API Key (2 minutes)

1. Go to https://console.groq.com
2. Sign up with GitHub or Google
3. Click "API Keys" → "Create API Key"
4. **Copy the key immediately** (shown only once!)

### Step 2: Add to Your Project (1 minute)

```bash
# In your HypeAI project root
echo "GROQ_API_KEY=gsk_your_key_here" >> .env.local
echo ".env.local" >> .gitignore
```

### Step 3: Test Connection (1 minute)

```bash
# Quick test with curl
curl -X POST https://api.groq.com/openai/v1/chat/completions \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "llama-3.3-70b-versatile",
    "messages": [{"role": "user", "content": "Привет!"}]
  }'
```

**Expected:** You should see a JSON response with Russian greeting.

### Step 4: Use in Code (1 minute)

```javascript
// Quick example
const GROQ_API_KEY = process.env.GROQ_API_KEY;

async function askAI(question) {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: question }]
    })
  });

  const data = await response.json();
  return data.choices[0].message.content;
}

// Use it
const answer = await askAI('Что такое DeFi?');
console.log(answer);
```

---

## 🎯 Quick Reference

### Free Tier Limits
- ✅ **30 requests/minute**
- ✅ **7,000 tokens/minute**
- ✅ **~200,000 tokens/day**
- ✅ **$0/month cost**

### Best Model for Russian
```javascript
model: "llama-3.3-70b-versatile"
```

### Typical Response Time
- **0.8-2 seconds** for normal questions
- **~1000 tokens/second** speed

---

## 🚨 Common Issues

### Issue 1: "Invalid API Key"
**Fix:**
```bash
# Check key in .env.local
cat .env.local

# Should see: GROQ_API_KEY=gsk_...
# If missing, add it
```

### Issue 2: Rate Limit Error (429)
**Fix:**
- Wait 60 seconds
- Reduce requests to <30/minute
- Implement rate limiting (see full docs)

### Issue 3: No Russian Response
**Fix:**
```javascript
// Make sure using correct model
model: "llama-3.3-70b-versatile"  // ✅ Good for Russian
// NOT: "llama-3.2-..." (worse Russian support)
```

---

## 📊 Quick Cost Calculator

**Your Usage:**
- Users/day: `[YOUR_NUMBER]`
- Messages/user: `5` (average)
- Tokens/message: `150` (average)

**Daily Tokens:** `users × 5 × 150`

**Free Tier:** `200,000 tokens/day`

**Example:**
- 100 users = 75,000 tokens = ✅ FREE
- 500 users = 375,000 tokens = ⚠️ Need paid tier
- 1000 users = 750,000 tokens = ⚠️ Need paid tier

---

## 🔒 Quick Security Checklist

- [ ] API key in `.env.local`
- [ ] `.env.local` in `.gitignore`
- [ ] Never commit API key to git
- [ ] Use environment variables in code
- [ ] Rotate key monthly

---

## 🚀 Next Steps

1. ✅ Completed quick start
2. 📖 Read full setup guide: [GROQ_API_SETUP.md](./GROQ_API_SETUP.md)
3. 🔧 Implement rate limiting
4. 📊 Monitor usage at https://console.groq.com
5. 🚀 Deploy to production

---

## 📚 Additional Resources

- **Full Setup Guide:** [GROQ_API_SETUP.md](./GROQ_API_SETUP.md)
- **Troubleshooting:** [GROQ_TROUBLESHOOTING.md](./GROQ_TROUBLESHOOTING.md)
- **Groq Docs:** https://console.groq.com/docs
- **HypeAI Docs:** `/docs/AI_ASSISTANT_INTEGRATION.md`

---

**Questions?** Check the [full documentation](./GROQ_API_SETUP.md) or [troubleshooting guide](./GROQ_TROUBLESHOOTING.md).
