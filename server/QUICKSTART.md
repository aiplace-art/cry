# HypeAI AI Assistant API - Quick Start

Get the API running in 5 minutes!

## Prerequisites

- Node.js 18+ installed
- Anthropic API key (get at https://console.anthropic.com/)

## Setup Steps

### 1. Navigate to server directory

```bash
cd /Users/ai.place/Crypto/server
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment

```bash
cp .env.example .env
nano .env
```

**Add your Anthropic API key:**
```env
ANTHROPIC_API_KEY=sk-ant-api03-YOUR-ACTUAL-KEY-HERE
```

### 4. Start the server

```bash
npm start
```

You should see:
```
🚀 HypeAI AI Assistant API
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Server running on port 3001
📍 Health: http://localhost:3001/api/ai-assistant/health
🤖 Chat:   POST http://localhost:3001/api/ai-assistant/chat
```

### 5. Test the API

**Option A: Using curl**

```bash
# Health check
curl http://localhost:3001/api/ai-assistant/health

# Ask a question
curl -X POST http://localhost:3001/api/ai-assistant/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What is HypeAI?"}'
```

**Option B: Run test suite**

```bash
npm test
```

## Next Steps

1. **Frontend Integration** - See README_API.md for React/HTML examples
2. **Customize System Prompt** - Edit `system-prompt.txt`
3. **Configure Rate Limits** - Adjust `.env` settings
4. **Deploy to Production** - See README_API.md deployment section

## Common Issues

**Port already in use:**
```bash
lsof -ti:3001 | xargs kill -9
```

**API key error:**
- Check `.env` has correct `ANTHROPIC_API_KEY`
- Verify key is active at https://console.anthropic.com/

**CORS error:**
- Add your frontend URL to `CORS_ORIGIN` in `.env`

## File Structure

```
server/
├── ai-assistant-api.js    # Main API server
├── package.json           # Dependencies
├── .env                   # Configuration (create from .env.example)
├── .env.example           # Example configuration
├── system-prompt.txt      # AI system prompt
├── README_API.md          # Full documentation
├── QUICKSTART.md          # This file
├── test-api.js            # Test suite
├── analytics/             # Usage logs (auto-created)
└── logs/                  # Server logs (auto-created)
```

## API Endpoints

- `GET  /api/ai-assistant/health` - Server status
- `POST /api/ai-assistant/chat` - Ask AI assistant
- `POST /api/ai-assistant/feedback` - User feedback
- `GET  /api/ai-assistant/analytics/popular` - Usage stats

## Configuration Basics

### Essential Settings (.env)

```env
# Required
ANTHROPIC_API_KEY=sk-ant-...
PORT=3001

# Security
CORS_ORIGIN=http://localhost:3000,https://hypeai.io

# Rate Limiting
RATE_LIMIT_MAX=10          # Requests per minute per IP
RATE_LIMIT_WINDOW_MS=60000 # 1 minute window
```

## Testing Examples

### JavaScript (Browser)

```javascript
const response = await fetch('http://localhost:3001/api/ai-assistant/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: 'What is HypeAI?',
    language: 'en'
  })
});

const data = await response.json();
console.log(data.reply);
```

### Python

```python
import requests

response = requests.post('http://localhost:3001/api/ai-assistant/chat',
  json={
    'message': 'What is HypeAI?',
    'language': 'en'
  }
)

print(response.json()['reply'])
```

## Getting Anthropic API Key

1. Go to https://console.anthropic.com/
2. Sign up or log in
3. Click "API Keys" in sidebar
4. Click "Create Key"
5. Copy the key (starts with `sk-ant-...`)
6. Paste into `.env` file

**Important:** Keep your API key secret! Never commit `.env` to git.

## Support

For detailed documentation, see **README_API.md**

For project knowledge base, see `/docs/PROJECT_KNOWLEDGE_BASE.md`

---

**Ready in 5 minutes!** 🚀
