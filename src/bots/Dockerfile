# Multi-stage Dockerfile for HypeAI Discord/Telegram Bots
FROM node:18-alpine AS base

# Install system dependencies
RUN apk add --no-cache \
    bash \
    git \
    python3 \
    make \
    g++

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy application code
COPY . .

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

USER nodejs

# Expose ports (if needed for webhooks/monitoring)
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD node -e "console.log('healthy')" || exit 1

# Default command (can be overridden in docker-compose)
CMD ["node", "src/bots/discord-bot.js"]
