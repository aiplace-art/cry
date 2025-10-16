#!/bin/bash

# Mention Monitor Bot Startup Script
# Ensures logs directory exists and starts the bot

set -e

echo "🚀 Starting Mention Monitor Bot..."

# Check if config exists
if [ ! -f "config/mention-monitor-config.json" ]; then
    echo "❌ Error: config/mention-monitor-config.json not found"
    echo "💡 Copy config/mention-monitor-config.example.json and configure it first"
    exit 1
fi

# Ensure logs directory exists
mkdir -p logs
touch logs/mentions.jsonl
touch logs/interactions.jsonl

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install node-telegram-bot-api
fi

# Start the bot
echo "✅ Configuration found"
echo "📊 Logs directory ready"
echo "🤖 Starting bot..."
echo ""

node src/bots/mention-monitor-bot.js
