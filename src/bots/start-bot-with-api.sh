#!/bin/bash

# Start AI Telegram Bot with Claude API
# This enables smart ChatGPT-like responses

echo "🤖 Starting AI Telegram Bot with Claude API..."

cd "$(dirname "$0")"

# Kill existing bots
pkill -f "ai-telegram-bot" 2>/dev/null
sleep 1

# Set API key from environment if available
if [ -z "$ANTHROPIC_API_KEY" ]; then
  echo "⚠️  ANTHROPIC_API_KEY not set - bot will use simple responses"
  echo "   To enable AI: export ANTHROPIC_API_KEY='your-key'"
else
  echo "✅ Claude API key found - enabling smart AI responses"
fi

# Start bot
nohup node ai-telegram-bot.mjs > /tmp/ai-bot.log 2>&1 &
PID=$!

sleep 3

if ps -p $PID > /dev/null; then
  echo "✅ Bot started successfully (PID: $PID)"
  echo "📝 Logs: tail -f /tmp/ai-bot.log"
  echo ""
  echo "📱 Test bot: @hypeai in Telegram"
else
  echo "❌ Bot failed to start. Check logs:"
  cat /tmp/ai-bot.log
fi
