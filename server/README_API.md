# HypeAI AI Assistant API

Production-ready Express.js API backend for the HypeAI AI Assistant, powered by Claude 3.5 Sonnet with RAG (Retrieval Augmented Generation).

## Features

- **Claude 3.5 Sonnet Integration** - State-of-the-art AI responses
- **RAG System** - Knowledge base-grounded answers
- **Session Management** - Conversation context tracking
- **Rate Limiting** - 10 requests/minute per IP (configurable)
- **CORS Protection** - Secure cross-origin requests
- **Security Headers** - Helmet.js protection
- **Request Logging** - Morgan HTTP logger
- **Analytics Tracking** - Usage statistics and popular queries
- **Multi-language Support** - English and Russian
- **Error Handling** - Comprehensive error management
- **Health Monitoring** - System status endpoint

## Quick Start

### 1. Installation

```bash
cd server
npm install
```

### 2. Environment Configuration

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
nano .env
```

**Required settings:**

```env
ANTHROPIC_API_KEY=sk-ant-api03-your-actual-key-here
PORT=3001
CORS_ORIGIN=http://localhost:3000,https://hypeai.io
```

### 3. Get Anthropic API Key

1. Go to https://console.anthropic.com/
2. Sign up or log in
3. Navigate to "API Keys"
4. Create a new key
5. Copy and paste into `.env`

### 4. Start Server

**Development mode (auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

Server will start on `http://localhost:3001`

## API Endpoints

### Health Check

```bash
GET /api/ai-assistant/health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-10-25T19:00:00.000Z",
  "knowledgeBase": true,
  "sessions": 5,
  "uptime": 3600.5
}
```

### Chat (Main Endpoint)

```bash
POST /api/ai-assistant/chat
Content-Type: application/json

{
  "message": "What is HypeAI?",
  "sessionId": "optional-session-id",
  "language": "en"
}
```

**Response:**
```json
{
  "reply": "HypeAI is a cryptocurrency platform built on BNB Chain...",
  "sessionId": "uuid-v4-session-id",
  "timestamp": "2025-10-25T19:00:00.000Z",
  "responseTime": 1234
}
```

**Parameters:**
- `message` (required): User question (max 2000 chars)
- `sessionId` (optional): For conversation continuity
- `language` (optional): `en` or `ru` (default: `en`)

### Feedback

```bash
POST /api/ai-assistant/feedback
Content-Type: application/json

{
  "sessionId": "uuid-v4-session-id",
  "messageId": "optional-message-id",
  "helpful": true,
  "comment": "Great answer!"
}
```

### Clear Session

```bash
POST /api/ai-assistant/session/clear
Content-Type: application/json

{
  "sessionId": "uuid-v4-session-id"
}
```

### Analytics

```bash
GET /api/ai-assistant/analytics/popular
```

## Frontend Integration

### JavaScript/HTML Example

```html
<!DOCTYPE html>
<html>
<head>
    <title>HypeAI Assistant Test</title>
</head>
<body>
    <h1>HypeAI AI Assistant</h1>
    <input type="text" id="message" placeholder="Ask a question...">
    <button onclick="askQuestion()">Ask</button>
    <div id="response"></div>

    <script>
        let sessionId = null;

        async function askQuestion() {
            const message = document.getElementById('message').value;
            const responseDiv = document.getElementById('response');

            try {
                const response = await fetch('http://localhost:3001/api/ai-assistant/chat', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        message,
                        sessionId,
                        language: 'en'
                    })
                });

                const data = await response.json();

                // Save session ID for conversation continuity
                sessionId = data.sessionId;

                // Display response
                responseDiv.innerHTML = `<p><strong>AI:</strong> ${data.reply}</p>`;

            } catch (error) {
                console.error('Error:', error);
                responseDiv.innerHTML = `<p style="color: red;">Error: ${error.message}</p>`;
            }
        }
    </script>
</body>
</html>
```

### React Example

```jsx
import { useState } from 'react';

function AIChatWidget() {
  const [message, setMessage] = useState('');
  const [sessionId, setSessionId] = useState(null);
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const askQuestion = async () => {
    if (!message.trim()) return;

    setLoading(true);
    try {
      const res = await fetch('http://localhost:3001/api/ai-assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          sessionId,
          language: 'en'
        })
      });

      const data = await res.json();

      setSessionId(data.sessionId);
      setResponse(data.reply);
      setMessage('');

    } catch (error) {
      console.error('Error:', error);
      setResponse('Error: Could not connect to AI assistant');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Ask a question..."
        disabled={loading}
      />
      <button onClick={askQuestion} disabled={loading}>
        {loading ? 'Thinking...' : 'Ask'}
      </button>
      {response && <div className="response">{response}</div>}
    </div>
  );
}
```

## Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `ANTHROPIC_API_KEY` | (required) | Your Anthropic API key |
| `ANTHROPIC_MODEL` | `claude-3-5-sonnet-20241022` | Claude model version |
| `PORT` | `3001` | Server port |
| `NODE_ENV` | `development` | Environment mode |
| `CORS_ORIGIN` | (required) | Allowed frontend origins |
| `RATE_LIMIT_MAX` | `10` | Max requests per window |
| `RATE_LIMIT_WINDOW_MS` | `60000` | Rate limit window (ms) |
| `MAX_CONTEXT_MESSAGES` | `20` | Max messages in session |
| `SESSION_TIMEOUT_MS` | `3600000` | Session timeout (1 hour) |
| `LOG_QUERIES` | `true` | Log queries to console |
| `TRACK_ANALYTICS` | `true` | Enable analytics tracking |

### Rate Limiting

Default: **10 requests per minute per IP**

To adjust:
```env
RATE_LIMIT_MAX=20
RATE_LIMIT_WINDOW_MS=60000
```

To whitelist IPs:
```env
TRUSTED_IPS=192.168.1.1,10.0.0.1
```

### CORS Configuration

Allow multiple origins:
```env
CORS_ORIGIN=http://localhost:3000,https://hypeai.io,https://www.hypeai.io
ALLOWED_ORIGINS=http://localhost:3000,https://hypeai.io,https://www.hypeai.io
```

## Knowledge Base

The API uses RAG (Retrieval Augmented Generation) to ground responses in HypeAI's official knowledge base.

**Location:** `/Users/ai.place/Crypto/docs/PROJECT_KNOWLEDGE_BASE.md`

### How RAG Works

1. User sends a question
2. API extracts keywords from question
3. Searches knowledge base for relevant context
4. Sends context + question to Claude
5. Claude generates grounded response

### Updating Knowledge Base

Simply edit `PROJECT_KNOWLEDGE_BASE.md` - changes take effect on next API restart.

**Future enhancement:** Hot reload without restart.

## Analytics

Analytics are automatically tracked to `/server/analytics/usage.json`

**Tracked metrics:**
- Total queries
- Response times
- Token usage
- Session counts
- User feedback (thumbs up/down)
- Popular questions

**Access analytics:**
```bash
curl http://localhost:3001/api/ai-assistant/analytics/popular
```

**View logs:**
```bash
cat analytics/usage.json | jq
```

## Security Best Practices

### Production Deployment Checklist

- [ ] Set strong `ANTHROPIC_API_KEY`
- [ ] Configure `CORS_ORIGIN` to only allowed domains
- [ ] Set `NODE_ENV=production`
- [ ] Enable rate limiting (default is good)
- [ ] Use HTTPS (not HTTP)
- [ ] Monitor API usage and costs
- [ ] Set up log rotation
- [ ] Configure firewall rules
- [ ] Use environment secrets manager (not .env in production)
- [ ] Enable request logging to external service
- [ ] Set up health check monitoring

### API Key Protection

**Never expose your Anthropic API key!**

```bash
# ✅ Good - Environment variable
ANTHROPIC_API_KEY=sk-ant-...

# ❌ Bad - Hardcoded in code
const apiKey = 'sk-ant-...';
```

### Cost Management

Claude API costs:
- Input: ~$3 per million tokens
- Output: ~$15 per million tokens

**Monitor usage:**
```bash
npm run analytics
```

**Set spending alerts** in Anthropic Console.

## Deployment

### Docker Deployment

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3001

CMD ["node", "ai-assistant-api.js"]
```

Build and run:
```bash
docker build -t hypeai-ai-api .
docker run -p 3001:3001 --env-file .env hypeai-ai-api
```

### PM2 Deployment

```bash
# Install PM2
npm install -g pm2

# Start with PM2
pm2 start ai-assistant-api.js --name hypeai-ai-api

# Save PM2 config
pm2 save

# Setup auto-restart on reboot
pm2 startup
```

### Nginx Reverse Proxy

```nginx
server {
    listen 80;
    server_name api.hypeai.io;

    location /api/ai-assistant/ {
        proxy_pass http://localhost:3001/api/ai-assistant/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

## Troubleshooting

### API Key Error

```
Error: Invalid API key
```

**Solution:** Check your `.env` file has correct `ANTHROPIC_API_KEY`

### CORS Error

```
Access to fetch blocked by CORS policy
```

**Solution:** Add your frontend domain to `CORS_ORIGIN` in `.env`

### Rate Limit Hit

```
Error: Too many requests
```

**Solution:** Wait 60 seconds or increase `RATE_LIMIT_MAX` in `.env`

### Knowledge Base Not Loading

```
❌ Error loading knowledge base
```

**Solution:** Check path in `KNOWLEDGE_BASE_PATH` is correct

### Port Already in Use

```
Error: listen EADDRINUSE :::3001
```

**Solution:** Change `PORT` in `.env` or kill process on port 3001:
```bash
lsof -ti:3001 | xargs kill -9
```

## Performance Optimization

### Caching Strategies

**Future enhancement:**
- Cache frequently asked questions
- Use Redis for session storage
- Implement response caching with TTL

### Load Balancing

For high traffic:
- Deploy multiple API instances
- Use Nginx/HAProxy load balancer
- Implement sticky sessions for session continuity

### Database Storage

**Current:** In-memory session storage

**Production recommendation:**
- Redis for session storage
- PostgreSQL for analytics
- Vector database (Pinecone/Supabase) for semantic search

## Testing

### Manual Testing

```bash
# Health check
curl http://localhost:3001/api/ai-assistant/health

# Chat request
curl -X POST http://localhost:3001/api/ai-assistant/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What is HypeAI?", "language": "en"}'
```

### Load Testing

```bash
# Install Apache Bench
brew install httpd  # macOS

# Test 100 requests, 10 concurrent
ab -n 100 -c 10 -p test-payload.json -T application/json \
   http://localhost:3001/api/ai-assistant/chat
```

## Future Enhancements

### Phase 2 Features
- [ ] Vector embeddings for semantic search
- [ ] Streaming responses (SSE)
- [ ] Multi-turn conversation improvements
- [ ] Fine-tuned prompt engineering
- [ ] A/B testing different prompts
- [ ] Voice input/output support
- [ ] Integration with Telegram/Discord bots

### Phase 3 Features
- [ ] User authentication
- [ ] Usage quotas per user
- [ ] Admin dashboard
- [ ] Custom knowledge base per user
- [ ] Multi-model support (GPT-4, etc.)
- [ ] Real-time training feedback loop

## Support

**Issues:** Report to HypeAI development team

**Documentation:** See `/docs/PROJECT_KNOWLEDGE_BASE.md`

**API Costs:** Monitor at https://console.anthropic.com/

---

## Quick Reference

```bash
# Install
npm install

# Configure
cp .env.example .env
nano .env  # Add ANTHROPIC_API_KEY

# Run
npm start

# Test
curl http://localhost:3001/api/ai-assistant/health
```

**API Base URL:** `http://localhost:3001/api/ai-assistant`

**Key Endpoints:**
- `GET /health` - Server status
- `POST /chat` - Ask AI assistant
- `POST /feedback` - User feedback
- `GET /analytics/popular` - Usage stats

---

**Built with:**
- Node.js 18+
- Express.js 4.18
- Anthropic Claude 3.5 Sonnet
- Helmet, CORS, Rate Limiting

**License:** MIT

**Version:** 1.0.0
