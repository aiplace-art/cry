#!/bin/bash

# ============================================
# HYPEAI TWITTER ENGAGEMENT BOT LAUNCHER
# ============================================

echo "🤖 Starting HypeAI Twitter Engagement Bot..."
echo "=============================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if required dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install twitter-api-v2 dotenv
fi

# Check if .env.marketing exists
if [ ! -f ".env.marketing" ]; then
    echo "❌ .env.marketing not found. Please configure your Twitter API credentials."
    exit 1
fi

# Create necessary directories
mkdir -p .twitter/logs
mkdir -p .twitter/analytics
mkdir -p .twitter/backups

# Check if bot is already running
if [ -f ".twitter/engagement-bot.pid" ]; then
    OLD_PID=$(cat .twitter/engagement-bot.pid)
    if ps -p $OLD_PID > /dev/null 2>&1; then
        echo "⚠️  Bot is already running with PID $OLD_PID"
        echo "   Stop it first with: npm run engagement:stop"
        exit 1
    else
        rm .twitter/engagement-bot.pid
    fi
fi

# Start the bot
echo "🚀 Launching engagement bot..."
echo ""

# Run in background and save PID
nohup node twitter-engagement-bot.js > .twitter/logs/engagement-bot.log 2>&1 &
BOT_PID=$!

echo $BOT_PID > .twitter/engagement-bot.pid

echo "✅ Engagement bot started successfully!"
echo "   PID: $BOT_PID"
echo "   Log: .twitter/logs/engagement-bot.log"
echo ""
echo "Commands:"
echo "  View logs:  tail -f .twitter/logs/engagement-bot.log"
echo "  Stop bot:   npm run engagement:stop"
echo "  Check status: npm run engagement:status"
echo ""
echo "🎯 Bot is now monitoring and engaging with your community!"
echo "=============================================="
