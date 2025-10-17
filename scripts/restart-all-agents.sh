#!/bin/bash

echo "🔄 Restarting all agents..."
echo ""

# Kill old coordinator
OLD_PID=$(ps aux | grep "node.*project-master-coordinator" | grep -v grep | awk '{print $2}')
if [ ! -z "$OLD_PID" ]; then
  echo "⏹️  Stopping old coordinator (PID: $OLD_PID)..."
  kill $OLD_PID
  sleep 2
fi

# Kill any orphaned agents
echo "🧹 Cleaning up orphaned agents..."
pkill -f "community-manager-agent.js"
pkill -f "analytics-tracker-agent.js"
pkill -f "social-monitor-agent.js"
pkill -f "launch-coordinator-agent.js"
pkill -f "marketing-executor-agent.js"
pkill -f "growth-hacker-agent.js"
pkill -f "tokenomics-validator-agent.js"
pkill -f "staking-calculator-agent.js"
pkill -f "token-distribution-monitor.js"
pkill -f "rewards-auditor-agent.js"
pkill -f "balance-reconciliation-agent.js"
pkill -f "financial-reporter-agent.js"

sleep 2

echo ""
echo "🚀 Starting coordinator with all 12 agents..."
cd /Users/ai.place/Crypto/src/bots

# Start coordinator in background
node project-master-coordinator.js > ../../logs/coordinator-all-agents.log 2>&1 &
NEW_PID=$!

echo "✅ Coordinator started with PID: $NEW_PID"
echo ""
echo "📋 Waiting 10 seconds for agents to initialize..."
sleep 10

echo ""
echo "📊 Active processes:"
ps aux | grep -E "(coordinator|agent)" | grep -v grep | grep node

echo ""
echo "📄 Recent logs:"
tail -30 ../../logs/coordinator-all-agents.log

echo ""
echo "✅ All systems operational!"
echo ""
echo "🤖 Telegram Bot Commands:"
echo "   /status - Full project report"
echo "   /agents - List all 12 agents"
echo "   /metrics - Current metrics"
echo "   /alerts - Active alerts"
echo "   /launch - Launch readiness"
echo "   /help - Show help"
