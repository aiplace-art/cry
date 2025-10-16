#!/bin/bash

# HypeAI Project Master Coordinator Startup Script

cd "$(dirname "$0")/.."

echo "🎯 Starting HypeAI Project Master Coordinator..."
echo ""

# Check if coordinator is already running
EXISTING_PID=$(pgrep -f "project-master-coordinator.js")
if [ -n "$EXISTING_PID" ]; then
    echo "⚠️  Coordinator already running (PID: $EXISTING_PID)"
    echo "   Stop it first with: kill $EXISTING_PID"
    exit 1
fi

# Ensure log directory exists
mkdir -p logs

# Start coordinator in background
nohup node src/bots/project-master-coordinator.js > logs/coordinator.log 2>&1 &
COORD_PID=$!

echo "✅ Coordinator started with PID: $COORD_PID"
echo ""
echo "📝 Logs: tail -f logs/coordinator.log"
echo "🛑 Stop: kill $COORD_PID"
echo "📊 Status: Check Telegram bot /status"
echo ""

# Wait a bit and check if it's still running
sleep 3

if ps -p $COORD_PID > /dev/null; then
    echo "✅ Coordinator is running successfully!"
    echo ""
    echo "Telegram Bot Commands:"
    echo "  /status  - Full project status"
    echo "  /agents  - List all agents"
    echo "  /metrics - Current metrics"
    echo "  /alerts  - Active alerts"
    echo "  /launch  - Launch readiness"
    echo "  /help    - Help menu"
else
    echo "❌ Coordinator failed to start. Check logs:"
    tail -20 logs/coordinator.log
    exit 1
fi
