# AI Assistant v2.0 - Production Deployment Checklist

**Version:** 2.0.0
**Date:** 2025-10-25
**Status:** Ready for Production

---

## ✅ Pre-Deployment Checklist

### Infrastructure
- [ ] **Redis installed and running**
  ```bash
  redis-cli ping  # Should return: PONG
  ```

- [ ] **Node.js 18+ installed**
  ```bash
  node --version  # Should be >= v18.0.0
  ```

- [ ] **Dependencies installed**
  ```bash
  cd server && npm install
  ```

### Configuration
- [ ] **.env file configured**
  - [ ] ANTHROPIC_API_KEY set
  - [ ] REDIS_HOST set (default: localhost)
  - [ ] REDIS_PORT set (default: 6379)
  - [ ] REDIS_PASSWORD set (if applicable)
  - [ ] ALLOWED_ORIGINS configured
  - [ ] NODE_ENV=production
  - [ ] SENTRY_DSN set (optional)

- [ ] **Redis secured**
  - [ ] Password configured
  - [ ] Bind to localhost (not 0.0.0.0)
  - [ ] maxmemory policy set

### Testing
- [ ] **All tests pass**
  ```bash
  npm run test
  # Expected: 25/25 tests pass
  ```

- [ ] **TypeScript compiles without errors**
  ```bash
  npx tsc --noEmit
  ```

- [ ] **WebSocket connection works**
  - [ ] Can connect to ws://localhost:3001
  - [ ] Streaming works
  - [ ] Reconnection works

- [ ] **Manual testing complete**
  - [ ] Send message via REST API
  - [ ] Send message via WebSocket
  - [ ] Test rate limiting
  - [ ] Test XSS protection
  - [ ] Test offline mode
  - [ ] Test mobile responsive

### Security
- [ ] **Input validation enabled**
  - [ ] DOMPurify sanitization working
  - [ ] Zod schema validation working
  - [ ] Message length limits enforced

- [ ] **Rate limiting configured**
  - [ ] RATE_LIMIT_MAX=20 (or appropriate)
  - [ ] RATE_LIMIT_WINDOW_MS=60000

- [ ] **CORS properly configured**
  - [ ] ALLOWED_ORIGINS set (no wildcards)
  - [ ] Only trusted domains listed

- [ ] **SSL/HTTPS enabled**
  - [ ] Certificate installed
  - [ ] Force HTTPS redirect

### Performance
- [ ] **Redis optimization**
  - [ ] maxmemory set (e.g., 256mb)
  - [ ] maxmemory-policy allkeys-lru
  - [ ] Persistence disabled (optional)

- [ ] **Node.js optimization**
  - [ ] NODE_ENV=production
  - [ ] PM2 clustering (optional)
  - [ ] ulimit -n 10000

### Monitoring
- [ ] **Logging configured**
  - [ ] LOG_QUERIES=false (production)
  - [ ] Log rotation enabled
  - [ ] Error logs monitored

- [ ] **Error tracking**
  - [ ] Sentry configured (optional)
  - [ ] Alerts set up

- [ ] **Health checks**
  - [ ] /api/ai-assistant/health returns 200
  - [ ] Redis health checked
  - [ ] Uptime monitoring

---

## 🚀 Deployment Steps

### 1. Build Production Bundle
```bash
cd server
npm run build
```

### 2. Start with PM2 (Recommended)
```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start dist/ai-assistant-api-v2.js --name hypeai-assistant

# Configure startup
pm2 startup
pm2 save

# Monitor
pm2 monit
pm2 logs hypeai-assistant
```

### 3. Configure Nginx (Optional)
```nginx
server {
    listen 80;
    server_name api.hypeai.io;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /socket.io/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

### 4. Enable SSL
```bash
sudo certbot --nginx -d api.hypeai.io
```

### 5. Verify Deployment
```bash
# Check health
curl https://api.hypeai.io/api/ai-assistant/health

# Expected response:
# {"status":"healthy","timestamp":"...","knowledgeBase":true,"redis":true}
```

---

## 📊 Post-Deployment Monitoring

### First 24 Hours
- [ ] Monitor Redis memory usage
- [ ] Check error logs
- [ ] Verify WebSocket connections
- [ ] Test from different locations
- [ ] Monitor response times

### Ongoing Monitoring
- [ ] **Daily:** Check error logs
- [ ] **Weekly:** Review analytics
- [ ] **Monthly:** Performance review
- [ ] **Quarterly:** Security audit

---

## 🐛 Rollback Plan

If issues occur:

```bash
# 1. Stop current version
pm2 stop hypeai-assistant

# 2. Restore previous version
git checkout v1.0
npm install
npm run build
pm2 restart hypeai-assistant

# 3. Clear Redis (if needed)
redis-cli FLUSHDB
```

---

## 📈 Success Metrics

After deployment, verify:

- [ ] Response time <2s (p95)
- [ ] Uptime >99.9%
- [ ] Error rate <1%
- [ ] WebSocket connections stable
- [ ] Redis memory usage <256MB
- [ ] CPU usage <80%

---

## 🎯 Final Verification

Before going live:

```bash
# 1. Health check
curl https://api.hypeai.io/api/ai-assistant/health

# 2. Send test message
curl -X POST https://api.hypeai.io/api/ai-assistant/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello","language":"en"}'

# 3. Check logs
pm2 logs hypeai-assistant --lines 50

# 4. Monitor Redis
redis-cli MONITOR
```

---

## ✅ Ready to Deploy

If all checkboxes are checked:

**🚀 You are ready to deploy AI Assistant v2.0!**

---

**Deployed By:** _________________
**Date:** _________________
**Time:** _________________
**Status:** ✅ Production Ready

---

## 📞 Emergency Contacts

**Technical Lead:** [contact]
**DevOps:** [contact]
**On-Call:** [contact]

**Documentation:** `/docs/AI_ASSISTANT_V2_QUICKSTART.md`
