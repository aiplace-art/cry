# 🚀 Quick Start Guide - Cryptocurrency Platform Backend

## Prerequisites

- Node.js 16+ installed
- MongoDB installed and running
- Git (optional)

---

## Installation (5 minutes)

### Step 1: Navigate to Backend Directory
```bash
cd /Users/ai.place/Crypto/src/backend
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Configure Environment
```bash
# Copy environment template
cp .env.example .env

# Edit with your preferred editor
nano .env
```

**Minimum Required Configuration:**
```bash
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/crypto-platform
JWT_SECRET=change-this-to-a-random-secret-key
CORS_ORIGIN=http://localhost:3000
```

### Step 4: Start MongoDB

**Option A - Local MongoDB:**
```bash
mongod
```

**Option B - Docker:**
```bash
docker run -d -p 27017:27017 --name crypto-mongodb mongo:latest
```

### Step 5: Verify Setup
```bash
node verify-setup.js
```

You should see:
```
✅ Passed: 49
❌ Failed: 0
⚠️  Warnings: 1 (only .env warning is OK)
```

### Step 6: Start the Server

**Development Mode (with auto-reload):**
```bash
npm run dev
```

**Production Mode:**
```bash
npm start
```

You should see:
```
🚀 Server running on port 5000
📊 Environment: development
✅ MongoDB Connected: localhost:27017
WebSocket server initialized
```

---

## Test the API (2 minutes)

### 1. Health Check
```bash
curl http://localhost:5000/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2025-10-09T...",
  "uptime": 1.234
}
```

### 2. Get Authentication Nonce
```bash
curl http://localhost:5000/api/v1/auth/nonce/0x1234567890123456789012345678901234567890
```

Expected response:
```json
{
  "nonce": "Sign this message to authenticate...",
  "walletAddress": "0x1234567890123456789012345678901234567890"
}
```

### 3. Get Token Prices
```bash
curl "http://localhost:5000/api/v1/tokens/prices?symbols=BTC,ETH"
```

---

## WebSocket Test

Open your browser console and run:

```javascript
const ws = new WebSocket('ws://localhost:5000/ws');

ws.onopen = () => {
  console.log('Connected!');

  // Subscribe to price updates
  ws.send(JSON.stringify({
    type: 'subscribe',
    channels: ['prices']
  }));
};

ws.onmessage = (event) => {
  console.log('Message:', JSON.parse(event.data));
};
```

You should receive price updates every 30 seconds.

---

## Available Endpoints

**Full API documentation:** `/Users/ai.place/Crypto/docs/api-docs.md`

### Authentication (Public)
- `GET /api/v1/auth/nonce/:walletAddress`
- `POST /api/v1/auth/verify`

### Tokens (Public)
- `GET /api/v1/tokens/prices?symbols=BTC,ETH`
- `GET /api/v1/tokens/:symbol`

### Staking (Requires Auth)
- `GET /api/v1/staking/pools`
- `POST /api/v1/staking/stake`

### AI (Requires Auth)
- `POST /api/v1/ai/predict`
- `GET /api/v1/ai/sentiment/:symbol`

---

## Resources

- **API Documentation:** `/Users/ai.place/Crypto/docs/api-docs.md`
- **Setup Guide:** `/Users/ai.place/Crypto/docs/backend-setup.md`
- **Summary:** `/Users/ai.place/Crypto/docs/BACKEND_SUMMARY.md`

---

**Status:** ✅ Backend Complete and Ready
**Time to Start:** ~5 minutes

Happy coding! 🚀
