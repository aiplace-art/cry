# HYPEAI Enterprise Chat Backend - Quick Start

Get your enterprise AI chat backend running in **5 minutes**!

## 🚀 Quick Start (Docker)

### 1. Clone & Configure

```bash
cd src/server/premium
cp .env.example .env
```

Edit `.env`:
```bash
ANTHROPIC_API_KEY=sk-ant-your-key-here
JWT_SECRET=your-random-32-char-secret
ENCRYPTION_KEY=your-random-32-char-key
```

### 2. Start Services

```bash
docker-compose up -d
```

That's it! Backend running on **http://localhost:8080** 🎉

## 📡 Test the API

### Health Check

```bash
curl http://localhost:8080/health
```

### Create Session (requires auth)

```bash
curl -X POST http://localhost:8080/api/chat/session \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"title": "My First Chat"}'
```

### Send Message

```bash
curl -X POST http://localhost:8080/api/chat/send \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "sessionId": "SESSION_ID",
    "content": "Hello, AI!"
  }'
```

## 🔌 WebSocket Connection

```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:8080', {
  auth: { token: 'YOUR_JWT_TOKEN' }
});

socket.on('connected', (data) => {
  console.log('Connected:', data);
});

socket.emit('join-session', sessionId);

socket.on('message', (message) => {
  console.log('AI:', message.content);
});

socket.emit('chat-message', {
  sessionId: sessionId,
  content: 'Hello!'
});
```

## 📊 Monitoring Dashboards

- **Metrics**: http://localhost:9090/metrics
- **Grafana**: http://localhost:3001 (admin/admin)
- **Prometheus**: http://localhost:9091

## 🛠️ Development Mode

```bash
# Install dependencies
npm install

# Setup database
createdb hypeai_chat
psql hypeai_chat < src/database/schema.sql

# Start Redis
redis-server

# Run dev server
npm run dev
```

## 📚 Documentation

- [Full Deployment Guide](./DEPLOYMENT.md)
- [API Reference](./README.md#api-endpoints)
- [WebSocket Protocol](./README.md#websocket-events)

## 🆘 Common Issues

**Database connection failed?**
```bash
# Check PostgreSQL is running
docker-compose ps db
docker-compose logs db
```

**Redis connection failed?**
```bash
# Check Redis is running
redis-cli ping
docker-compose logs redis
```

**Port already in use?**
```bash
# Change port in .env
PORT=8081
```

## 🎯 Next Steps

1. ✅ Implement authentication
2. ✅ Connect frontend
3. ✅ Configure agents
4. ✅ Setup monitoring
5. ✅ Deploy to production

---

**Ready to deploy?** Check out [DEPLOYMENT.md](./DEPLOYMENT.md) for production setup!
