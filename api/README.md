# HypeAI API - Groq Integration

Production-ready serverless API for HypeAI Diamond Chat powered by Groq's Llama 3.3 70B model.

---

## 📂 Structure

```
api/
├── chat-groq.js              # Main API endpoint (Groq)
├── chat.js                   # Legacy endpoint (Anthropic)
├── test-groq.js              # Test suite for Groq integration
├── _lib/
│   ├── groq-client.js        # Groq API wrapper
│   ├── rate-limiter.js       # Rate limiting logic
│   └── system-prompt.js      # HypeAI knowledge base
└── README.md                 # This file
```

---

## 🚀 Quick Start

### 1. Get Groq API Key
Visit https://console.groq.com and create a free API key

### 2. Configure Environment
```bash
cp .env.local.example .env.local
# Add your Groq API key to .env.local
```

### 3. Test Locally
```bash
vercel dev
node api/test-groq.js
```

### 4. Deploy
```bash
vercel --prod
```

Full guide: `/docs/QUICK_DEPLOY_GUIDE.md`

---

## 📋 API Reference

**Endpoint:** `POST /api/chat-groq`

**Request:**
```json
{
  "message": "Что такое HypeAI?",
  "conversationHistory": []
}
```

**Response:**
```json
{
  "success": true,
  "response": "HypeAI - это AI-платформа...",
  "model": "llama-3.3-70b-versatile",
  "rateLimit": { "remaining": 9, "resetIn": 60 }
}
```

---

## 📚 Documentation

- Setup: `/docs/GROQ_INTEGRATION_GUIDE.md`
- Frontend: `/docs/API_INTEGRATION_FRONTEND.md`
- Quick Deploy: `/docs/QUICK_DEPLOY_GUIDE.md`
- Summary: `/docs/GROQ_API_SUMMARY.md`

---

**Built with ❤️ for HypeAI**
