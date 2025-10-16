#!/bin/bash

# ============================================
# STOP HYPEAI TWITTER ENGAGEMENT BOT
# ============================================

echo "⏹️  Stopping HypeAI Twitter Engagement Bot..."

if [ ! -f ".twitter/engagement-bot.pid" ]; then
    echo "❌ No PID file found. Bot might not be running."
    exit 1
fi

PID=$(cat .twitter/engagement-bot.pid)

if ps -p $PID > /dev/null 2>&1; then
    echo "   Stopping process $PID..."
    kill $PID
    sleep 2

    # Force kill if still running
    if ps -p $PID > /dev/null 2>&1; then
        echo "   Force stopping..."
        kill -9 $PID
    fi

    rm .twitter/engagement-bot.pid
    echo "✅ Engagement bot stopped successfully!"
else
    echo "⚠️  Process $PID not found. Cleaning up PID file."
    rm .twitter/engagement-bot.pid
fi
