#!/bin/bash

##
# 🚀 Start HypeAI Project Management Agents
#
# Starts all project management agents using PM2
# Ensures 24/7 operation with auto-restart
##

set -e

echo "🎯 Starting HypeAI Project Management System..."
echo ""

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    echo "❌ PM2 is not installed"
    echo "📦 Installing PM2..."
    npm install -g pm2
fi

# Ensure logs directory exists
mkdir -p logs
mkdir -p data/project-coordination

# Stop any existing agents
echo "🛑 Stopping existing agents..."
pm2 delete all 2>/dev/null || true

# Start agents using ecosystem config
echo "🚀 Starting all agents..."
pm2 start ecosystem.config.cjs

# Save PM2 process list
echo "💾 Saving PM2 configuration..."
pm2 save

# Setup PM2 startup script (runs on system boot)
echo "⚙️ Setting up auto-start on boot..."
pm2 startup

echo ""
echo "✅ All agents started successfully!"
echo ""
echo "📊 Agent Status:"
pm2 status

echo ""
echo "📝 Useful Commands:"
echo "   pm2 status              - View all agents"
echo "   pm2 logs                - View all logs"
echo "   pm2 logs project-coordinator - View coordinator logs"
echo "   pm2 restart all         - Restart all agents"
echo "   pm2 stop all            - Stop all agents"
echo "   pm2 delete all          - Remove all agents"
echo ""
echo "💬 Telegram Commands:"
echo "   /status   - Project status"
echo "   /agents   - List agents"
echo "   /metrics  - View metrics"
echo "   /launch   - Launch readiness"
echo "   /help     - All commands"
echo ""
echo "🎉 Project management system is now running 24/7!"
