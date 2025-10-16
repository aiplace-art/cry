#!/bin/bash

# Check the status of the unfollow process

echo "📊 UNFOLLOW SYSTEM STATUS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if process is running
if ps aux | grep "smart-unfollow.js" | grep -v grep > /dev/null; then
    echo "✅ Status: RUNNING"
    echo "   Process: $(ps aux | grep "smart-unfollow.js" | grep -v grep | awk '{print $2}')"
else
    echo "⏸️  Status: NOT RUNNING"
fi

echo ""
echo "📋 Latest log entries:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ -f /tmp/twitter-unfollow.log ]; then
    tail -30 /tmp/twitter-unfollow.log
else
    echo "No log file found yet."
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
