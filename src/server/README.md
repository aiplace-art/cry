# AI Agent Chat Backend - Quick Start

## 🚀 Installation

```bash
# Navigate to server directory
cd /Users/ai.place/Crypto/src/server

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env and add your Anthropic API key
nano .env  # or use your preferred editor
```

## ⚙️ Configuration

Required in `.env`:
```env
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

Optional configuration:
```env
PORT=3001
CORS_ORIGIN=http://localhost:3000
MAX_REQUESTS_PER_MINUTE=50
```

## ▶️ Start Server

```bash
# Production mode
npm start

# Development mode (auto-reload)
npm run dev
```

## 🧪 Test API

```bash
# Health check
curl http://localhost:3001/api/health

# Create session and send message
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Build a REST API with authentication",
    "useOrchestration": true
  }'
```

## 📡 WebSocket Connection

```javascript
const socket = io('ws://localhost:3001/ws');
socket.emit('join_session', 'your-session-id');

socket.on('agent_spawned', (agent) => {
  console.log('New agent:', agent);
});
```

## 📚 Full Documentation

See `/docs/AI_AGENT_CHAT_BACKEND.md` for complete API reference, examples, and advanced usage.

## 🎯 Features

✅ Real-time agent visualization via WebSocket
✅ Claude API integration with streaming
✅ Intelligent agent orchestration
✅ Dependency graph building
✅ Multiple layout algorithms
✅ Rate limiting and error handling
✅ Session management
✅ Comprehensive metrics

## 🛠️ Tech Stack

- **Framework**: Express.js
- **WebSocket**: Socket.io
- **AI**: Anthropic Claude API
- **Language**: Node.js 18+

## 📦 Project Structure

```
src/server/
├── app.js              # Main Express application
├── index.js            # Server entry point
├── websocket.js        # WebSocket server
├── claude-api.js       # Claude API client
├── orchestrator.js     # Agent orchestration
├── graph-builder.js    # Dependency graphs
├── package.json        # Dependencies
└── .env.example        # Environment template

src/api/
└── routes.js          # API endpoints
```

## 🚨 Troubleshooting

**Port already in use**
```bash
# Change PORT in .env
PORT=3002
```

**API key error**
```bash
# Verify ANTHROPIC_API_KEY is set correctly
echo $ANTHROPIC_API_KEY
```

**CORS issues**
```bash
# Update CORS_ORIGIN in .env
CORS_ORIGIN=http://localhost:3000
```

## 📞 Support

- Documentation: `/docs/AI_AGENT_CHAT_BACKEND.md`
- API Docs: `http://localhost:3001/api/docs`
- Issues: Create GitHub issue
