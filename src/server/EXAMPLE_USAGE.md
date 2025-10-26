# AI Agent Chat Backend - Usage Examples

## Table of Contents
- [Quick Start](#quick-start)
- [REST API Examples](#rest-api-examples)
- [WebSocket Examples](#websocket-examples)
- [React Integration](#react-integration)
- [Vue Integration](#vue-integration)
- [Advanced Patterns](#advanced-patterns)

---

## Quick Start

### 1. Start the Server

```bash
cd /Users/ai.place/Crypto/src/server
npm install
cp .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY
npm start
```

### 2. Test Health Check

```bash
curl http://localhost:3001/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": 1706198400000,
  "uptime": 123.45,
  "services": {
    "orchestrator": "online",
    "claude_api": "online",
    "graph_builder": "online"
  },
  "metrics": { ... }
}
```

---

## REST API Examples

### Create Session

```bash
curl -X POST http://localhost:3001/api/chat/session \
  -H "Content-Type: application/json" \
  -d '{
    "userRequest": "Build a REST API with authentication",
    "layoutType": "force"
  }'
```

Response:
```json
{
  "success": true,
  "data": {
    "sessionId": "550e8400-e29b-41d4-a716-446655440000",
    "status": "initializing",
    "createdAt": 1706198400000
  }
}
```

### Send Message with Orchestration

```bash
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Implement user authentication with JWT",
    "sessionId": "550e8400-e29b-41d4-a716-446655440000",
    "useOrchestration": true
  }'
```

Response:
```json
{
  "success": true,
  "data": {
    "sessionId": "550e8400-e29b-41d4-a716-446655440000",
    "response": "I've analyzed your request and coordinated multiple specialized agents...",
    "agents": [
      {
        "id": "agent-123",
        "type": "backend-dev",
        "name": "Backend Developer",
        "status": "completed"
      },
      {
        "id": "agent-456",
        "type": "security",
        "name": "Security Auditor",
        "status": "completed"
      }
    ]
  }
}
```

### Get Active Agents

```bash
curl http://localhost:3001/api/agents/550e8400-e29b-41d4-a716-446655440000
```

### Get Graph Visualization Data

```bash
curl http://localhost:3001/api/graph/550e8400-e29b-41d4-a716-446655440000
```

### Change Graph Layout

```bash
curl -X PUT http://localhost:3001/api/graph/550e8400-e29b-41d4-a716-446655440000/layout \
  -H "Content-Type: application/json" \
  -d '{"layoutType": "hierarchical"}'
```

---

## WebSocket Examples

### Node.js Client

```javascript
const io = require('socket.io-client');
const axios = require('axios');

async function main() {
  // 1. Create session via REST
  const { data } = await axios.post('http://localhost:3001/api/chat/session', {
    userRequest: 'Build a calculator app',
    layoutType: 'force'
  });

  const sessionId = data.data.sessionId;
  console.log('Session created:', sessionId);

  // 2. Connect WebSocket
  const socket = io('ws://localhost:3001/ws');

  socket.on('connect', () => {
    console.log('WebSocket connected');
    socket.emit('join_session', sessionId);
  });

  socket.on('session_joined', (data) => {
    console.log('Joined session:', data.sessionId);
  });

  // 3. Listen for agent events
  socket.on('agent_spawned', (event) => {
    console.log('New agent spawned:', {
      id: event.data.agentId,
      type: event.data.agentType,
      name: event.data.name
    });
  });

  socket.on('agent_status', (event) => {
    console.log('Agent status update:', {
      id: event.data.agentId,
      status: event.data.status
    });
  });

  socket.on('message_chunk', (event) => {
    if (!event.data.isComplete) {
      process.stdout.write(event.data.chunk);
    } else {
      console.log('\n\nStreaming complete!');
    }
  });

  socket.on('task_update', (event) => {
    console.log('Task update:', {
      taskId: event.data.taskId,
      status: event.data.status,
      progress: event.data.progress + '%'
    });
  });

  socket.on('agent_connection', (event) => {
    console.log('Agent connection:', {
      from: event.data.from,
      to: event.data.to,
      type: event.data.connectionType
    });
  });

  socket.on('notification', (event) => {
    console.log('Notification:', event.data);
  });

  socket.on('error', (event) => {
    console.error('Error:', event.data);
  });

  // 4. Send message to trigger agents
  await axios.post('http://localhost:3001/api/chat', {
    message: 'Create a calculator with add, subtract, multiply, divide',
    sessionId,
    useOrchestration: true
  });
}

main().catch(console.error);
```

### Browser JavaScript

```html
<!DOCTYPE html>
<html>
<head>
  <title>AI Agent Chat Demo</title>
  <script src="https://cdn.socket.io/4.7.2/socket.io.min.js"></script>
</head>
<body>
  <div id="agents"></div>
  <div id="messages"></div>

  <script>
    const socket = io('ws://localhost:3001/ws');
    const sessionId = 'your-session-id';

    socket.on('connect', () => {
      console.log('Connected');
      socket.emit('join_session', sessionId);
    });

    socket.on('agent_spawned', (event) => {
      const agentDiv = document.createElement('div');
      agentDiv.id = `agent-${event.data.agentId}`;
      agentDiv.innerHTML = `
        <h3>${event.data.name}</h3>
        <p>Type: ${event.data.agentType}</p>
        <p>Status: <span class="status">initializing</span></p>
      `;
      document.getElementById('agents').appendChild(agentDiv);
    });

    socket.on('agent_status', (event) => {
      const agentDiv = document.getElementById(`agent-${event.data.agentId}`);
      if (agentDiv) {
        agentDiv.querySelector('.status').textContent = event.data.status;
      }
    });

    socket.on('message_chunk', (event) => {
      if (!event.data.isComplete) {
        document.getElementById('messages').textContent += event.data.chunk;
      }
    });
  </script>
</body>
</html>
```

---

## React Integration

### Custom Hook

```jsx
// hooks/useAgentOrchestration.js
import { useEffect, useState, useCallback } from 'react';
import io from 'socket.io-client';
import axios from 'axios';

const API_URL = 'http://localhost:3001/api';
const WS_URL = 'ws://localhost:3001/ws';

export function useAgentOrchestration() {
  const [agents, setAgents] = useState([]);
  const [messages, setMessages] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  // Create session
  const createSession = useCallback(async (userRequest) => {
    const { data } = await axios.post(`${API_URL}/chat/session`, {
      userRequest,
      layoutType: 'force'
    });
    setSessionId(data.data.sessionId);
    return data.data.sessionId;
  }, []);

  // Send message
  const sendMessage = useCallback(async (message) => {
    if (!sessionId) throw new Error('No active session');

    const { data } = await axios.post(`${API_URL}/chat`, {
      message,
      sessionId,
      useOrchestration: true
    });

    return data;
  }, [sessionId]);

  // WebSocket connection
  useEffect(() => {
    if (!sessionId) return;

    const ws = io(WS_URL);

    ws.on('connect', () => {
      setIsConnected(true);
      ws.emit('join_session', sessionId);
    });

    ws.on('disconnect', () => {
      setIsConnected(false);
    });

    ws.on('agent_spawned', (event) => {
      setAgents(prev => [...prev, event.data]);
    });

    ws.on('agent_status', (event) => {
      setAgents(prev => prev.map(agent =>
        agent.agentId === event.data.agentId
          ? { ...agent, status: event.data.status }
          : agent
      ));
    });

    ws.on('message_chunk', (event) => {
      if (!event.data.isComplete) {
        setMessages(prev => {
          const lastMessage = prev[prev.length - 1];
          if (lastMessage?.id === event.data.messageId) {
            return [
              ...prev.slice(0, -1),
              { ...lastMessage, content: lastMessage.content + event.data.chunk }
            ];
          } else {
            return [...prev, { id: event.data.messageId, content: event.data.chunk }];
          }
        });
      }
    });

    ws.on('notification', (event) => {
      console.log('Notification:', event.data);
    });

    setSocket(ws);

    return () => {
      ws.close();
    };
  }, [sessionId]);

  return {
    agents,
    messages,
    sessionId,
    isConnected,
    createSession,
    sendMessage
  };
}
```

### Component Usage

```jsx
// components/AgentChat.jsx
import React, { useState } from 'react';
import { useAgentOrchestration } from '../hooks/useAgentOrchestration';

function AgentChat() {
  const [input, setInput] = useState('');
  const {
    agents,
    messages,
    sessionId,
    isConnected,
    createSession,
    sendMessage
  } = useAgentOrchestration();

  const handleStart = async () => {
    await createSession('Build a web application');
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    await sendMessage(input);
    setInput('');
  };

  return (
    <div className="agent-chat">
      {!sessionId ? (
        <button onClick={handleStart}>Start Session</button>
      ) : (
        <>
          <div className="connection-status">
            Status: {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
          </div>

          <div className="agents">
            <h2>Active Agents ({agents.length})</h2>
            {agents.map(agent => (
              <div key={agent.agentId} className={`agent ${agent.status}`}>
                <h3>{agent.name}</h3>
                <p>{agent.agentType}</p>
                <span className="status">{agent.status}</span>
              </div>
            ))}
          </div>

          <div className="messages">
            {messages.map(msg => (
              <div key={msg.id} className="message">
                {msg.content}
              </div>
            ))}
          </div>

          <div className="input">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type your message..."
            />
            <button onClick={handleSend}>Send</button>
          </div>
        </>
      )}
    </div>
  );
}

export default AgentChat;
```

---

## Vue Integration

```vue
<!-- components/AgentChat.vue -->
<template>
  <div class="agent-chat">
    <div v-if="!sessionId">
      <button @click="startSession">Start Session</button>
    </div>

    <div v-else>
      <div class="connection-status">
        Status: {{ isConnected ? '🟢 Connected' : '🔴 Disconnected' }}
      </div>

      <div class="agents">
        <h2>Active Agents ({{ agents.length }})</h2>
        <div
          v-for="agent in agents"
          :key="agent.agentId"
          :class="['agent', agent.status]"
        >
          <h3>{{ agent.name }}</h3>
          <p>{{ agent.agentType }}</p>
          <span class="status">{{ agent.status }}</span>
        </div>
      </div>

      <div class="messages">
        <div v-for="msg in messages" :key="msg.id" class="message">
          {{ msg.content }}
        </div>
      </div>

      <div class="input">
        <input
          v-model="input"
          @keypress.enter="sendMessage"
          placeholder="Type your message..."
        />
        <button @click="sendMessage">Send</button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue';
import io from 'socket.io-client';
import axios from 'axios';

export default {
  name: 'AgentChat',
  setup() {
    const agents = ref([]);
    const messages = ref([]);
    const sessionId = ref(null);
    const socket = ref(null);
    const isConnected = ref(false);
    const input = ref('');

    const API_URL = 'http://localhost:3001/api';
    const WS_URL = 'ws://localhost:3001/ws';

    const startSession = async () => {
      const { data } = await axios.post(`${API_URL}/chat/session`, {
        userRequest: 'Build a web application',
        layoutType: 'force'
      });

      sessionId.value = data.data.sessionId;
      connectWebSocket();
    };

    const connectWebSocket = () => {
      const ws = io(WS_URL);

      ws.on('connect', () => {
        isConnected.value = true;
        ws.emit('join_session', sessionId.value);
      });

      ws.on('disconnect', () => {
        isConnected.value = false;
      });

      ws.on('agent_spawned', (event) => {
        agents.value.push(event.data);
      });

      ws.on('agent_status', (event) => {
        const index = agents.value.findIndex(
          a => a.agentId === event.data.agentId
        );
        if (index !== -1) {
          agents.value[index].status = event.data.status;
        }
      });

      ws.on('message_chunk', (event) => {
        if (!event.data.isComplete) {
          const lastMsg = messages.value[messages.value.length - 1];
          if (lastMsg?.id === event.data.messageId) {
            lastMsg.content += event.data.chunk;
          } else {
            messages.value.push({
              id: event.data.messageId,
              content: event.data.chunk
            });
          }
        }
      });

      socket.value = ws;
    };

    const sendMessage = async () => {
      if (!input.value.trim()) return;

      await axios.post(`${API_URL}/chat`, {
        message: input.value,
        sessionId: sessionId.value,
        useOrchestration: true
      });

      input.value = '';
    };

    onUnmounted(() => {
      if (socket.value) {
        socket.value.close();
      }
    });

    return {
      agents,
      messages,
      sessionId,
      isConnected,
      input,
      startSession,
      sendMessage
    };
  }
};
</script>

<style scoped>
.agent-chat {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.agents {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 15px;
  margin: 20px 0;
}

.agent {
  padding: 15px;
  border-radius: 8px;
  border: 2px solid #ddd;
}

.agent.working {
  border-color: #3b82f6;
  background: #eff6ff;
}

.agent.completed {
  border-color: #10b981;
  background: #f0fdf4;
}
</style>
```

---

## Advanced Patterns

### Graph Visualization with D3.js

```javascript
import * as d3 from 'd3';

class AgentGraphVisualizer {
  constructor(containerId) {
    this.container = d3.select(`#${containerId}`);
    this.width = 1200;
    this.height = 800;

    this.svg = this.container
      .append('svg')
      .attr('width', this.width)
      .attr('height', this.height);

    this.simulation = d3.forceSimulation()
      .force('link', d3.forceLink().id(d => d.id))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(this.width / 2, this.height / 2));
  }

  updateGraph(graphData) {
    // Update links
    const link = this.svg.selectAll('.link')
      .data(graphData.edges)
      .join('line')
      .attr('class', 'link')
      .attr('stroke', '#999')
      .attr('stroke-width', 2);

    // Update nodes
    const node = this.svg.selectAll('.node')
      .data(graphData.nodes)
      .join('g')
      .attr('class', 'node')
      .call(this.drag());

    node.append('circle')
      .attr('r', 30)
      .attr('fill', d => this.getStatusColor(d.status));

    node.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '.35em')
      .text(d => d.type);

    // Update simulation
    this.simulation
      .nodes(graphData.nodes)
      .on('tick', () => {
        link
          .attr('x1', d => d.source.x)
          .attr('y1', d => d.source.y)
          .attr('x2', d => d.target.x)
          .attr('y2', d => d.target.y);

        node
          .attr('transform', d => `translate(${d.x},${d.y})`);
      });

    this.simulation.force('link')
      .links(graphData.edges);

    this.simulation.alpha(1).restart();
  }

  getStatusColor(status) {
    const colors = {
      initializing: '#94a3b8',
      working: '#3b82f6',
      completed: '#10b981',
      error: '#ef4444'
    };
    return colors[status] || '#6b7280';
  }

  drag() {
    return d3.drag()
      .on('start', (event, d) => {
        if (!event.active) this.simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      })
      .on('drag', (event, d) => {
        d.fx = event.x;
        d.fy = event.y;
      })
      .on('end', (event, d) => {
        if (!event.active) this.simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      });
  }
}

// Usage
const visualizer = new AgentGraphVisualizer('graph-container');

// Fetch and update graph
async function updateVisualization(sessionId) {
  const response = await fetch(`http://localhost:3001/api/graph/${sessionId}`);
  const { data } = await response.json();
  visualizer.updateGraph(data.graph);
}
```

---

## Error Handling

```javascript
async function robustChatClient() {
  try {
    // Create session with retry
    let session;
    for (let i = 0; i < 3; i++) {
      try {
        const { data } = await axios.post(
          'http://localhost:3001/api/chat/session',
          { userRequest: 'Build an app' }
        );
        session = data.data;
        break;
      } catch (error) {
        if (i === 2) throw error;
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    }

    // Connect WebSocket with reconnection
    const socket = io('ws://localhost:3001/ws', {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
    });

    socket.on('error', (event) => {
      console.error('Server error:', event.data);
      // Handle error appropriately
    });

    // Handle rate limiting
    socket.on('disconnect', (reason) => {
      if (reason === 'io server disconnect') {
        // Server disconnected - might be rate limited
        console.log('Server disconnected, waiting before reconnect...');
        setTimeout(() => socket.connect(), 5000);
      }
    });

  } catch (error) {
    if (error.response?.status === 429) {
      console.error('Rate limited. Please wait and try again.');
    } else if (error.response?.status === 401) {
      console.error('Authentication error. Check API key.');
    } else {
      console.error('Unexpected error:', error);
    }
  }
}
```

---

**More Examples**: See full documentation at `/docs/AI_AGENT_CHAT_BACKEND.md`
