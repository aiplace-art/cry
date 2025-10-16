#!/bin/bash

# Start the smart unfollow system in background

echo "🚀 Starting Smart Unfollow System..."
echo ""

# Make the script executable
chmod +x scripts/smart-unfollow.js

# Run in background and save PID
node scripts/smart-unfollow.js > /tmp/twitter-unfollow.log 2>&1 &

PID=$!

echo "✅ Unfollow system started!"
echo "   Process ID: $PID"
echo "   Log file: /tmp/twitter-unfollow.log"
echo ""
echo "📊 Monitor progress:"
echo "   tail -f /tmp/twitter-unfollow.log"
echo ""
echo "🛑 Stop process:"
echo "   kill $PID"
echo ""
