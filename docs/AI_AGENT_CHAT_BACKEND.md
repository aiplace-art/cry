# AI Agent Chat Backend

Complete backend system for AI chat with real-time agent visualization.

## 🏗️ Architecture

### Core Components

1. **WebSocket Server** (`/src/server/websocket.js`)
   - Socket.io for real-time bidirectional communication
   - Room-based session management
   - Heartbeat monitoring for connection health
   - Event broadcasting for agent updates

2. **Claude API Client** (`/src/server/claude-api.js`)
   - Streaming and non-streaming message support
   - Context management with conversation history
   - Rate limiting (50 requests/minute default)
   - Comprehensive error handling
   - Usage metrics tracking

3. **Agent Orchestrator** (`/src/server/orchestrator.js`)
   - Intelligent agent spawning based on request analysis
   - Dependency graph building
   - Task coordination and execution
   - Result synthesis from multiple agents
   - Real-time status updates via WebSocket

4. **Graph Builder** (`/src/server/graph-builder.js`)
   - Agent dependency graph construction
   - Multiple layout algorithms (force-directed, hierarchical, circular, grid)
   - Position calculation for visualization
   - Connection tracking between agents

5. **API Routes** (`/src/api/routes.js`)
   - RESTful API endpoints
   - Session management
   - Agent and metrics queries
   - Error handling middleware

6. **Express App** (`/src/server/app.js`)
   - Main application orchestration
   - Middleware configuration
   - Component integration
   - Graceful shutdown handling

## 🚀 Quick Start

### Installation

```bash
cd /Users/ai.place/Crypto/src/server
npm install
```

### Configuration

Create `.env` file:

```bash
cp .env.example .env
```

Edit `.env` and add your Anthropic API key:

```env
ANTHROPIC_API_KEY=your_key_here
PORT=3001
CORS_ORIGIN=http://localhost:3000
```

### Start Server

```bash
# Production
npm start

# Development (with auto-reload)
npm run dev
```

## 📡 API Endpoints

### Health Check
```http
GET /api/health
```

### Chat

**Create Session**
```http
POST /api/chat/session
Content-Type: application/json

{
  "userRequest": "Build a REST API with authentication",
  "layoutType": "force",
  "metadata": {}
}
```

**Send Message**
```http
POST /api/chat
Content-Type: application/json

{
  "message": "Build a REST API",
  "sessionId": "uuid",
  "useOrchestration": true
}
```

**Streaming Chat**
```http
POST /api/chat/stream
Content-Type: application/json

{
  "message": "Explain quantum computing",
  "sessionId": "uuid"
}
```

### Agents

**Get All Agents**
```http
GET /api/agents
```

**Get Session Agents**
```http
GET /api/agents/:sessionId
```

**Get Agent Details**
```http
GET /api/agents/:sessionId/:agentId
```

### Metrics

**Global Metrics**
```http
GET /api/metrics
```

**Session Metrics**
```http
GET /api/metrics/:sessionId
```

### Graph

**Get Graph Data**
```http
GET /api/graph/:sessionId
```

**Set Layout**
```http
PUT /api/graph/:sessionId/layout
Content-Type: application/json

{
  "layoutType": "hierarchical"
}
```

### Sessions

**List Sessions**
```http
GET /api/sessions
```

**Get Session Status**
```http
GET /api/sessions/:sessionId
```

**Delete Session**
```http
DELETE /api/chat/session/:sessionId
```

## 🔌 WebSocket Events

### Connection

```javascript
const socket = io('ws://localhost:3001/ws');

// Join session
socket.emit('join_session', sessionId);

// Heartbeat
socket.emit('heartbeat');
```

### Server Events

**Agent Spawned**
```javascript
socket.on('agent_spawned', (data) => {
  // data: { agentId, agentType, name, capabilities, position }
});
```

**Agent Status**
```javascript
socket.on('agent_status', (data) => {
  // data: { agentId, status, metadata }
  // status: initializing|working|waiting|completed|error
});
```

**Task Update**
```javascript
socket.on('task_update', (data) => {
  // data: { taskId, agentId, status, progress, message, result }
});
```

**Message Chunk** (streaming)
```javascript
socket.on('message_chunk', (data) => {
  // data: { messageId, chunk, isComplete, agentId }
});
```

**Agent Connection**
```javascript
socket.on('agent_connection', (data) => {
  // data: { from, to, connectionType }
  // connectionType: dependency|communication|data_flow
});
```

**Metrics Update**
```javascript
socket.on('metrics_update', (data) => {
  // Real-time metrics
});
```

**Notification**
```javascript
socket.on('notification', (data) => {
  // System notifications
});
```

**Error**
```javascript
socket.on('error', (data) => {
  // data: { message, code, details }
});
```

## 🧠 Agent Types

The orchestrator can spawn these specialized agent types:

- **researcher**: Research and analysis tasks
- **coder**: Code implementation and debugging
- **tester**: Test creation and validation
- **reviewer**: Code review and quality assurance
- **architect**: System design and architecture
- **backend-dev**: Backend API development
- **frontend-dev**: UI/UX implementation
- **database**: Database design and queries
- **devops**: Deployment and infrastructure
- **analyst**: Data analysis and insights

## 📊 Graph Layouts

Four layout algorithms for agent visualization:

1. **Force-Directed** (default)
   - Natural clustering
   - Edge length optimization
   - Best for organic structures

2. **Hierarchical**
   - Top-down based on dependencies
   - Clear execution flow
   - Best for sequential workflows

3. **Circular**
   - Agents arranged in circle
   - Equal spacing
   - Best for peer-to-peer architectures

4. **Grid**
   - Regular grid layout
   - Predictable positioning
   - Best for large agent counts

## 🔧 Configuration Options

### Claude API

```javascript
const claudeAPI = new ClaudeAPIClient(apiKey, {
  model: 'claude-3-5-sonnet-20241022',
  maxTokens: 4096,
  temperature: 1.0,
  maxRequestsPerMinute: 50,
  enableRateLimiting: true
});
```

### WebSocket Server

```javascript
const wsServer = new WebSocketServer(app, {
  origin: 'http://localhost:3000',
  pingTimeout: 60000,
  pingInterval: 25000
});
```

### Graph Builder

```javascript
graphBuilder.setLayoutType(sessionId, 'force'); // or 'hierarchical', 'circular', 'grid'
```

## 📈 Metrics

The system tracks:

- Total API requests
- Total tokens used
- Average response time
- Error count
- Active sessions
- Total agents spawned
- Context sizes
- Rate limit usage

Access metrics via:
```javascript
const metrics = claudeAPI.getMetrics();
```

## 🛡️ Error Handling

All errors follow consistent format:

```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE",
    "details": {}
  }
}
```

Common error codes:
- `RATE_LIMIT_EXCEEDED`
- `INVALID_API_KEY`
- `INVALID_REQUEST`
- `SERVER_ERROR`
- `SESSION_NOT_FOUND`
- `AGENT_NOT_FOUND`

## 🔒 Security

- Helmet.js for security headers
- CORS configuration
- Rate limiting
- Request ID tracking
- API key validation
- Input sanitization

## 🧪 Testing

```bash
npm test              # Run tests
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
```

## 📝 Example Usage

### JavaScript Client

```javascript
const axios = require('axios');
const io = require('socket.io-client');

const API_URL = 'http://localhost:3001/api';
const WS_URL = 'ws://localhost:3001/ws';

// Create session
const { data } = await axios.post(`${API_URL}/chat/session`, {
  userRequest: 'Build a REST API with authentication',
  layoutType: 'force'
});

const sessionId = data.data.sessionId;

// Connect WebSocket
const socket = io(WS_URL);
socket.emit('join_session', sessionId);

// Listen to agent events
socket.on('agent_spawned', (agent) => {
  console.log('Agent spawned:', agent.name);
});

socket.on('agent_status', (status) => {
  console.log('Agent status:', status.status);
});

// Send message
const response = await axios.post(`${API_URL}/chat`, {
  message: 'Implement user authentication',
  sessionId,
  useOrchestration: true
});

console.log('Response:', response.data);
```

### React Client

```jsx
import { useEffect, useState } from 'react';
import io from 'socket.io-client';

function AgentChat() {
  const [socket, setSocket] = useState(null);
  const [agents, setAgents] = useState([]);

  useEffect(() => {
    const ws = io('ws://localhost:3001/ws');

    ws.on('connect', () => {
      ws.emit('join_session', sessionId);
    });

    ws.on('agent_spawned', (agent) => {
      setAgents(prev => [...prev, agent]);
    });

    ws.on('agent_status', (status) => {
      setAgents(prev => prev.map(a =>
        a.agentId === status.agentId
          ? { ...a, status: status.status }
          : a
      ));
    });

    setSocket(ws);

    return () => ws.close();
  }, []);

  return (
    <div>
      {agents.map(agent => (
        <AgentCard key={agent.agentId} agent={agent} />
      ))}
    </div>
  );
}
```

## 🚀 Production Deployment

### Environment Variables

```env
NODE_ENV=production
PORT=3001
ANTHROPIC_API_KEY=prod_key
CORS_ORIGIN=https://yourdomain.com
ENABLE_RATE_LIMITING=true
MAX_REQUESTS_PER_MINUTE=50
```

### PM2 Process Manager

```bash
npm install -g pm2

pm2 start src/server/index.js --name ai-agent-chat
pm2 save
pm2 startup
```

### Docker

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY src/server/package*.json ./
RUN npm ci --only=production

COPY src/ ./src/

EXPOSE 3001

CMD ["node", "src/server/index.js"]
```

## 📚 Additional Resources

- [Anthropic API Docs](https://docs.anthropic.com/)
- [Socket.io Docs](https://socket.io/docs/)
- [Express.js Docs](https://expressjs.com/)

## 🐛 Troubleshooting

**Connection Issues**
- Check CORS configuration
- Verify WebSocket port is open
- Check firewall settings

**Rate Limiting**
- Adjust `MAX_REQUESTS_PER_MINUTE`
- Implement request queuing
- Use caching for repeated queries

**Memory Issues**
- Implement session cleanup
- Set context size limits
- Monitor agent count per session

## 📄 License

MIT

---

**Created**: 2025-01-25
**Version**: 1.0.0
**Status**: Production Ready ✅
