# WebSocket Integration Guide

Real-time updates with HypeAI WebSocket API.

## 🌐 Overview

The HypeAI WebSocket API provides real-time updates for:
- 📊 Presale statistics
- 💰 Token price changes
- ✅ Transaction confirmations
- 👥 User activity
- 🎯 Custom events

**WebSocket URL:**
```
wss://api.hypeai.io/v1/ws
```

## 🚀 Quick Start

### Basic Connection

```javascript
const ws = new WebSocket('wss://api.hypeai.io/v1/ws');

ws.onopen = () => {
  console.log('Connected to HypeAI WebSocket');

  // Authenticate
  ws.send(JSON.stringify({
    type: 'auth',
    token: 'YOUR_JWT_TOKEN'
  }));
};

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  console.log('Received:', message);
};

ws.onerror = (error) => {
  console.error('WebSocket error:', error);
};

ws.onclose = () => {
  console.log('Disconnected from WebSocket');
};
```

## 📋 Message Types

### Client → Server

#### 1. Authentication

```json
{
  "type": "auth",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**
```json
{
  "type": "auth_success",
  "userId": "user_123"
}
```

#### 2. Subscribe to Channels

```json
{
  "type": "subscribe",
  "channels": [
    "presale_updates",
    "price_updates",
    "transactions",
    "user_activity"
  ]
}
```

**Response:**
```json
{
  "type": "subscribed",
  "channels": ["presale_updates", "price_updates"]
}
```

#### 3. Unsubscribe from Channels

```json
{
  "type": "unsubscribe",
  "channels": ["user_activity"]
}
```

#### 4. Ping (Heartbeat)

```json
{
  "type": "ping"
}
```

**Response:**
```json
{
  "type": "pong",
  "timestamp": "2025-01-15T10:30:00Z"
}
```

### Server → Client

#### 1. Presale Updates

```json
{
  "type": "presale_update",
  "data": {
    "currentRound": 1,
    "tokenPrice": 0.0001,
    "tokensAvailable": 4750000,
    "tokensSold": 2750000,
    "raisedAmount": 275000,
    "lastUpdate": "2025-01-15T10:30:00Z"
  },
  "timestamp": "2025-01-15T10:30:00Z"
}
```

#### 2. Price Updates

```json
{
  "type": "price_update",
  "data": {
    "tokenPrice": 0.00012,
    "priceChange24h": 20,
    "volume24h": 50000
  },
  "timestamp": "2025-01-15T10:30:00Z"
}
```

#### 3. Transaction Complete

```json
{
  "type": "transaction_complete",
  "data": {
    "transactionId": "tx_123",
    "userId": "user_123",
    "amount": 1000,
    "tokens": 10000000,
    "status": "completed",
    "txHash": "0x1234..."
  },
  "timestamp": "2025-01-15T10:30:00Z"
}
```

#### 4. User Activity

```json
{
  "type": "user_activity",
  "data": {
    "action": "purchase",
    "username": "anonymous_user",
    "amount": 500,
    "tokens": 5000000
  },
  "timestamp": "2025-01-15T10:30:00Z"
}
```

## 💻 Implementation Examples

### React Hook

```typescript
import { useEffect, useRef, useState } from 'react';

interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: string;
}

interface UseWebSocketOptions {
  url: string;
  token: string | null;
  channels?: string[];
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

export function useWebSocket({
  url,
  token,
  channels = [],
  reconnectInterval = 5000,
  maxReconnectAttempts = 5
}: UseWebSocketOptions) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const ws = useRef<WebSocket | null>(null);
  const reconnectAttempts = useRef(0);
  const reconnectTimeout = useRef<NodeJS.Timeout>();

  const connect = () => {
    if (!token) return;

    try {
      ws.current = new WebSocket(url);

      ws.current.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        setError(null);
        reconnectAttempts.current = 0;

        // Authenticate
        ws.current?.send(JSON.stringify({
          type: 'auth',
          token
        }));

        // Subscribe to channels
        if (channels.length > 0) {
          ws.current?.send(JSON.stringify({
            type: 'subscribe',
            channels
          }));
        }
      };

      ws.current.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          setLastMessage(message);
        } catch (err) {
          console.error('Failed to parse message:', err);
        }
      };

      ws.current.onerror = (event) => {
        console.error('WebSocket error:', event);
        setError(new Error('WebSocket connection error'));
      };

      ws.current.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);

        // Attempt reconnection
        if (reconnectAttempts.current < maxReconnectAttempts) {
          reconnectAttempts.current++;
          console.log(`Reconnecting... Attempt ${reconnectAttempts.current}`);

          reconnectTimeout.current = setTimeout(() => {
            connect();
          }, reconnectInterval);
        } else {
          setError(new Error('Max reconnection attempts reached'));
        }
      };
    } catch (err) {
      setError(err as Error);
    }
  };

  const disconnect = () => {
    if (reconnectTimeout.current) {
      clearTimeout(reconnectTimeout.current);
    }
    ws.current?.close();
    ws.current = null;
  };

  const sendMessage = (message: object) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
    } else {
      console.error('WebSocket is not connected');
    }
  };

  useEffect(() => {
    connect();

    // Heartbeat to keep connection alive
    const heartbeat = setInterval(() => {
      if (ws.current?.readyState === WebSocket.OPEN) {
        ws.current.send(JSON.stringify({ type: 'ping' }));
      }
    }, 30000); // Every 30 seconds

    return () => {
      clearInterval(heartbeat);
      disconnect();
    };
  }, [token, url]);

  return {
    isConnected,
    lastMessage,
    error,
    sendMessage,
    disconnect
  };
}

// Usage in component
function PresaleDashboard() {
  const { user, token } = useAuth();
  const { isConnected, lastMessage } = useWebSocket({
    url: 'wss://api.hypeai.io/v1/ws',
    token,
    channels: ['presale_updates', 'transactions']
  });

  const [presaleData, setPresaleData] = useState(null);

  useEffect(() => {
    if (lastMessage?.type === 'presale_update') {
      setPresaleData(lastMessage.data);
    }
  }, [lastMessage]);

  return (
    <div>
      <div>Status: {isConnected ? '🟢 Connected' : '🔴 Disconnected'}</div>
      {presaleData && (
        <div>
          <p>Tokens Sold: {presaleData.tokensSold}</p>
          <p>Raised: ${presaleData.raisedAmount}</p>
        </div>
      )}
    </div>
  );
}
```

### TypeScript Class

```typescript
class HypeAIWebSocket {
  private ws: WebSocket | null = null;
  private token: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 5000;
  private heartbeatInterval: NodeJS.Timeout | null = null;

  private listeners: Map<string, Set<Function>> = new Map();

  constructor(
    private url: string,
    token: string
  ) {
    this.token = token;
    this.connect();
  }

  private connect() {
    this.ws = new WebSocket(this.url);

    this.ws.onopen = () => {
      console.log('Connected to HypeAI WebSocket');
      this.reconnectAttempts = 0;

      // Authenticate
      this.send({ type: 'auth', token: this.token });

      // Start heartbeat
      this.startHeartbeat();

      this.emit('connect');
    };

    this.ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      this.emit(message.type, message.data);
      this.emit('message', message);
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.emit('error', error);
    };

    this.ws.onclose = () => {
      console.log('WebSocket disconnected');
      this.stopHeartbeat();
      this.emit('disconnect');

      // Attempt reconnection
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++;
        setTimeout(() => this.connect(), this.reconnectInterval);
      }
    };
  }

  private startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.send({ type: 'ping' });
      }
    }, 30000);
  }

  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  send(message: object) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.error('WebSocket is not open');
    }
  }

  subscribe(channels: string[]) {
    this.send({ type: 'subscribe', channels });
  }

  unsubscribe(channels: string[]) {
    this.send({ type: 'unsubscribe', channels });
  }

  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  off(event: string, callback: Function) {
    this.listeners.get(event)?.delete(callback);
  }

  private emit(event: string, data?: any) {
    this.listeners.get(event)?.forEach(callback => callback(data));
  }

  disconnect() {
    this.stopHeartbeat();
    this.ws?.close();
    this.ws = null;
  }
}

// Usage
const ws = new HypeAIWebSocket(
  'wss://api.hypeai.io/v1/ws',
  'YOUR_JWT_TOKEN'
);

ws.on('connect', () => {
  console.log('Connected!');
  ws.subscribe(['presale_updates', 'transactions']);
});

ws.on('presale_update', (data) => {
  console.log('Presale update:', data);
  updateUI(data);
});

ws.on('transaction_complete', (data) => {
  console.log('Transaction completed:', data);
  showNotification('Transaction successful!');
});

ws.on('error', (error) => {
  console.error('Error:', error);
});
```

### Python

```python
import asyncio
import json
import websockets
from typing import Callable, Dict, Set

class HypeAIWebSocket:
    def __init__(self, url: str, token: str):
        self.url = url
        self.token = token
        self.ws = None
        self.listeners: Dict[str, Set[Callable]] = {}
        self.running = False

    async def connect(self):
        self.running = True

        while self.running:
            try:
                async with websockets.connect(self.url) as websocket:
                    self.ws = websocket
                    print("Connected to HypeAI WebSocket")

                    # Authenticate
                    await self.send({
                        "type": "auth",
                        "token": self.token
                    })

                    # Start message handler
                    await self._handle_messages()

            except Exception as e:
                print(f"Connection error: {e}")
                if self.running:
                    print("Reconnecting in 5 seconds...")
                    await asyncio.sleep(5)

    async def _handle_messages(self):
        try:
            async for message in self.ws:
                data = json.loads(message)
                await self._emit(data["type"], data.get("data"))
                await self._emit("message", data)
        except websockets.exceptions.ConnectionClosed:
            print("Connection closed")

    async def send(self, message: dict):
        if self.ws:
            await self.ws.send(json.dumps(message))

    async def subscribe(self, channels: list):
        await self.send({
            "type": "subscribe",
            "channels": channels
        })

    def on(self, event: str, callback: Callable):
        if event not in self.listeners:
            self.listeners[event] = set()
        self.listeners[event].add(callback)

    async def _emit(self, event: str, data=None):
        if event in self.listeners:
            for callback in self.listeners[event]:
                if asyncio.iscoroutinefunction(callback):
                    await callback(data)
                else:
                    callback(data)

    def disconnect(self):
        self.running = False

# Usage
async def main():
    ws = HypeAIWebSocket(
        "wss://api.hypeai.io/v1/ws",
        "YOUR_JWT_TOKEN"
    )

    def on_presale_update(data):
        print(f"Presale update: {data}")

    async def on_transaction(data):
        print(f"Transaction: {data}")
        # Do async work

    ws.on("presale_update", on_presale_update)
    ws.on("transaction_complete", on_transaction)

    await ws.connect()

asyncio.run(main())
```

## 🔒 Security

### Authentication

Always authenticate immediately after connection:

```javascript
ws.onopen = () => {
  // MUST authenticate first
  ws.send(JSON.stringify({
    type: 'auth',
    token: getToken()
  }));
};
```

### Auto-Reconnection with Backoff

```javascript
class ReconnectingWebSocket {
  constructor(url, token) {
    this.url = url;
    this.token = token;
    this.reconnectAttempts = 0;
    this.maxDelay = 30000; // 30 seconds max
    this.connect();
  }

  connect() {
    this.ws = new WebSocket(this.url);

    this.ws.onopen = () => {
      this.reconnectAttempts = 0;
      this.authenticate();
    };

    this.ws.onclose = () => {
      // Exponential backoff
      const delay = Math.min(
        1000 * Math.pow(2, this.reconnectAttempts),
        this.maxDelay
      );

      this.reconnectAttempts++;

      setTimeout(() => this.connect(), delay);
    };
  }

  authenticate() {
    this.ws.send(JSON.stringify({
      type: 'auth',
      token: this.token
    }));
  }
}
```

## 📊 Best Practices

### 1. Heartbeat/Ping

Keep connection alive:

```javascript
setInterval(() => {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type: 'ping' }));
  }
}, 30000); // Every 30 seconds
```

### 2. Message Queue

Queue messages when disconnected:

```javascript
class QueuedWebSocket {
  constructor(url) {
    this.url = url;
    this.queue = [];
    this.connect();
  }

  send(message) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      this.queue.push(message);
    }
  }

  onOpen() {
    // Send queued messages
    while (this.queue.length > 0) {
      const message = this.queue.shift();
      this.send(message);
    }
  }
}
```

### 3. Error Handling

```javascript
ws.onerror = (error) => {
  console.error('WebSocket error:', error);

  // Show user notification
  showNotification('Connection error. Retrying...');

  // Log to monitoring service
  logError('websocket_error', error);
};
```

## 🧪 Testing

```typescript
import { WebSocket, Server } from 'mock-socket';

describe('WebSocket Connection', () => {
  let mockServer: Server;

  beforeEach(() => {
    mockServer = new Server('ws://localhost:8080');
  });

  afterEach(() => {
    mockServer.close();
  });

  it('should authenticate on connection', (done) => {
    const ws = new WebSocket('ws://localhost:8080');

    mockServer.on('connection', socket => {
      socket.on('message', data => {
        const message = JSON.parse(data);
        expect(message.type).toBe('auth');
        expect(message.token).toBeTruthy();
        done();
      });
    });

    ws.onopen = () => {
      ws.send(JSON.stringify({
        type: 'auth',
        token: 'test_token'
      }));
    };
  });

  it('should receive presale updates', (done) => {
    const ws = new WebSocket('ws://localhost:8080');

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      expect(message.type).toBe('presale_update');
      expect(message.data).toHaveProperty('tokensSold');
      done();
    };

    mockServer.emit('message', JSON.stringify({
      type: 'presale_update',
      data: { tokensSold: 1000000 }
    }));
  });
});
```

## 🔗 Related Guides

- [Quickstart](./quickstart.md)
- [Authentication](./authentication.md)
- [Error Handling](./error-handling.md)
- [React SDK](../sdk/react-hooks.md)
