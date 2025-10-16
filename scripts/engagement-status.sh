#!/bin/bash

# ============================================
# CHECK HYPEAI TWITTER ENGAGEMENT BOT STATUS
# ============================================

echo "📊 HypeAI Twitter Engagement Bot Status"
echo "=============================================="

# Check if PID file exists
if [ ! -f ".twitter/engagement-bot.pid" ]; then
    echo "Status: ❌ Not Running"
    echo "Start with: npm run engagement:start"
    exit 0
fi

PID=$(cat .twitter/engagement-bot.pid)

# Check if process is running
if ps -p $PID > /dev/null 2>&1; then
    echo "Status: ✅ Running"
    echo "PID: $PID"

    # Show process info
    echo ""
    echo "Process Info:"
    ps -p $PID -o pid,ppid,user,%cpu,%mem,etime,command

    # Show recent log entries
    if [ -f ".twitter/logs/engagement-bot.log" ]; then
        echo ""
        echo "Recent Activity (last 10 lines):"
        echo "-----------------------------------"
        tail -n 10 .twitter/logs/engagement-bot.log
    fi

    # Show engagement stats if available
    if [ -f ".twitter/engagement-state.json" ]; then
        echo ""
        echo "Engagement Stats:"
        echo "-----------------------------------"
        node -e "
        const state = require('./.twitter/engagement-state.json');
        console.log('Rate Limits:');
        console.log('  Likes:', state.rateLimits.likes.count || 0);
        console.log('  Retweets:', state.rateLimits.retweets.count || 0);
        console.log('  Replies:', state.rateLimits.replies.count || 0);
        console.log('Recent Engagements:', state.engagementLog ? state.engagementLog.length : 0);
        " 2>/dev/null || echo "  Stats not available yet"
    fi

else
    echo "Status: ❌ Not Running (stale PID file)"
    rm .twitter/engagement-bot.pid
    echo "Start with: npm run engagement:start"
fi

echo "=============================================="
