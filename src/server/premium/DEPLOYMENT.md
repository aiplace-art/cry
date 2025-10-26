# HYPEAI Enterprise Chat Backend - Deployment Guide

## Prerequisites

- Node.js 20+
- PostgreSQL 16+
- Redis 7+
- Docker & Docker Compose (for containerized deployment)

## Local Development

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your configuration
```

### 3. Setup Database

```bash
# Create PostgreSQL database
createdb hypeai_chat

# Run schema migration
psql hypeai_chat < src/database/schema.sql
```

### 4. Start Redis

```bash
redis-server
```

### 5. Run Development Server

```bash
npm run dev
```

Server will start on `http://localhost:8080`

## Docker Deployment

### Single Container

```bash
# Build image
docker build -t hypeai-chat-backend .

# Run container
docker run -d \
  --name hypeai-backend \
  -p 8080:8080 \
  -e DATABASE_URL=postgresql://user:pass@host:5432/db \
  -e REDIS_URL=redis://host:6379 \
  -e ANTHROPIC_API_KEY=your-key \
  hypeai-chat-backend
```

### Docker Compose (Recommended)

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop services
docker-compose down

# Rebuild after changes
docker-compose up -d --build
```

Services:
- **app**: Chat backend (port 8080)
- **db**: PostgreSQL database (port 5432)
- **redis**: Redis cache (port 6379)
- **prometheus**: Metrics (port 9091)
- **grafana**: Dashboard (port 3001)

## Production Deployment

### Environment Variables

```bash
# Required
ANTHROPIC_API_KEY=sk-ant-...
JWT_SECRET=min-32-character-secret
ENCRYPTION_KEY=min-32-character-key

# Database
DATABASE_URL=postgresql://user:pass@host:5432/hypeai_chat
REDIS_URL=redis://host:6379

# Optional
SENTRY_DSN=https://...@sentry.io/...
NODE_ENV=production
LOG_LEVEL=info
```

### Build for Production

```bash
npm run build
npm start
```

### Process Manager (PM2)

```bash
# Install PM2
npm install -g pm2

# Start with PM2
pm2 start dist/index.js --name hypeai-backend

# Save PM2 config
pm2 save

# Setup auto-restart on reboot
pm2 startup
```

### Nginx Reverse Proxy

```nginx
upstream hypeai_backend {
    server 127.0.0.1:8080;
}

server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://hypeai_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # WebSocket support
    location /socket.io/ {
        proxy_pass http://hypeai_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

### SSL/TLS (Let's Encrypt)

```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d api.yourdomain.com

# Auto-renewal
sudo certbot renew --dry-run
```

## Cloud Deployment

### AWS ECS

1. Build and push Docker image to ECR
2. Create ECS task definition
3. Configure RDS (PostgreSQL) and ElastiCache (Redis)
4. Deploy ECS service with load balancer

### Google Cloud Run

```bash
# Build and deploy
gcloud builds submit --tag gcr.io/PROJECT_ID/hypeai-backend
gcloud run deploy hypeai-backend \
  --image gcr.io/PROJECT_ID/hypeai-backend \
  --platform managed \
  --region us-central1 \
  --set-env-vars DATABASE_URL=...,REDIS_URL=...
```

### Kubernetes

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: hypeai-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: hypeai-backend
  template:
    metadata:
      labels:
        app: hypeai-backend
    spec:
      containers:
      - name: backend
        image: hypeai-chat-backend:latest
        ports:
        - containerPort: 8080
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: db-credentials
              key: url
        - name: REDIS_URL
          valueFrom:
            secretKeyRef:
              name: redis-credentials
              key: url
```

## Monitoring & Observability

### Prometheus Metrics

Access metrics at: `http://localhost:9090/metrics`

Available metrics:
- `http_requests_total`
- `http_request_duration_ms`
- `websocket_connections_active`
- `agent_executions_total`
- `database_query_duration_ms`

### Grafana Dashboard

1. Access Grafana: `http://localhost:3001`
2. Login: admin/admin
3. Add Prometheus data source: `http://prometheus:9090`
4. Import dashboard from `grafana-dashboard.json`

### Sentry Error Tracking

1. Create Sentry project
2. Add DSN to environment variables
3. Errors automatically tracked and reported

### Logs

```bash
# Docker logs
docker-compose logs -f app

# PM2 logs
pm2 logs hypeai-backend

# Log files (if configured)
tail -f /var/log/hypeai/backend.log
```

## Database Migrations

### Backup

```bash
# PostgreSQL backup
pg_dump hypeai_chat > backup.sql

# Restore
psql hypeai_chat < backup.sql
```

### Schema Updates

```bash
# Apply new migrations
psql hypeai_chat < src/database/migrations/001_add_new_table.sql
```

## Performance Optimization

### Database Indexing

```sql
-- Create indexes for frequently queried fields
CREATE INDEX idx_messages_session_user ON messages(session_id, user_id);
CREATE INDEX idx_sessions_user_active ON sessions(user_id, is_active);
```

### Redis Caching

```typescript
// Cache frequently accessed data
await redis.set(`cache:user:${userId}`, JSON.stringify(userData), 300000);
```

### Connection Pooling

Adjust pool sizes in `.env`:
```bash
DB_POOL_MIN=5
DB_POOL_MAX=20
```

## Security Hardening

### Firewall Rules

```bash
# Allow only necessary ports
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 22/tcp
sudo ufw enable
```

### Secrets Management

Use environment-specific secret managers:
- AWS Secrets Manager
- Google Secret Manager
- HashiCorp Vault
- Azure Key Vault

### Rate Limiting

Configure in `.env`:
```bash
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## Troubleshooting

### Database Connection Issues

```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Test connection
psql -h localhost -U postgres -d hypeai_chat
```

### Redis Connection Issues

```bash
# Check Redis status
redis-cli ping

# Monitor Redis
redis-cli monitor
```

### High Memory Usage

```bash
# Check Node.js memory
node --max-old-space-size=4096 dist/index.js

# Monitor with PM2
pm2 monit
```

## Scaling

### Horizontal Scaling

1. Deploy multiple backend instances
2. Use Redis for session sharing
3. Configure load balancer
4. Enable sticky sessions for WebSocket

### Vertical Scaling

1. Increase server resources (CPU, RAM)
2. Adjust Node.js heap size
3. Increase database connection pool

## Backup & Disaster Recovery

### Automated Backups

```bash
# Cron job for daily backups
0 2 * * * pg_dump hypeai_chat | gzip > /backups/hypeai_$(date +\%Y\%m\%d).sql.gz
```

### Recovery Plan

1. Restore database from latest backup
2. Verify Redis data integrity
3. Restart services in order: DB → Redis → Backend
4. Run health checks
5. Monitor error rates

## Support

- Documentation: `/docs`
- Issues: GitHub Issues
- Email: support@hypeai.com

---

**Last Updated**: 2025-10-26
