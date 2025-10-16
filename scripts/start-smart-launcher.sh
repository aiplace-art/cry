#!/bin/bash

# Smart Launcher - Auto-start when API is ready
# Checks every 15 minutes, launches all systems when unblocked

echo "🤖 Starting Smart Launcher..."
echo ""

# Make executable
chmod +x scripts/smart-launcher.js

# Install PM2 if needed
if ! command -v pm2 &> /dev/null; then
    echo "📦 Installing PM2..."
    npm install -g pm2
fi

# Stop any existing smart launcher
pm2 delete twitter-smart-launcher 2>/dev/null

# Start smart launcher
pm2 start scripts/smart-launcher.js \
    --name twitter-smart-launcher \
    --no-autorestart

echo ""
echo "✅ Smart Launcher Started!"
echo ""
echo "📋 What it does:"
echo "   • Checks API status every 15 minutes"
echo "   • Auto-launches all systems when ready"
echo "   • Monitors for up to 25 hours"
echo ""
echo "📊 Monitor progress:"
echo "   • Check status:  pm2 status twitter-smart-launcher"
echo "   • View logs:     pm2 logs twitter-smart-launcher"
echo "   • Stop:          pm2 stop twitter-smart-launcher"
echo ""
echo "🎯 Expected:"
echo "   API will unblock tomorrow at 13:40 Moscow time"
echo "   Smart Launcher will auto-start all systems then"
echo ""
echo "💤 You can close terminal - it runs in background!"
echo ""
