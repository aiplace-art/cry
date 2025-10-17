#!/bin/bash

# HypeAI AI Telegram Bot Starter
# Runs the AI-powered bot that chats like ChatGPT

echo "🤖 Starting HypeAI AI Telegram Bot..."

cd "$(dirname "$0")"

# Kill any existing bots
pkill -f "ai-telegram-bot" 2>/dev/null

# Start bot in background
nohup node ai-telegram-bot.mjs > /tmp/ai-bot.log 2>&1 &

PID=$!
echo "✅ Bot started with PID: $PID"
echo "📝 Logs: /tmp/ai-bot.log"
echo ""
echo "📱 Test your bot by messaging @hypeai_bot in Telegram"
echo ""
echo "To stop: kill $PID"
