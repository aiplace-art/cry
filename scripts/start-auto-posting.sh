#!/bin/bash

# Start automated Twitter posting system
# Posts 2-3 times per day from content bank

echo "🚀 Starting Auto-Posting System..."
echo ""

# Make the script executable
chmod +x scripts/auto-poster.js

# Install PM2 if not installed
if ! command -v pm2 &> /dev/null; then
    echo "📦 Installing PM2..."
    npm install -g pm2
fi

# Stop any existing auto-poster
pm2 delete twitter-auto-poster 2>/dev/null

# Start auto-poster with cron schedule
# Posts 3 times per day: 9 AM, 3 PM, 9 PM (Moscow time)
pm2 start scripts/auto-poster.js --name twitter-auto-poster --cron "0 6,12,18 * * *" --no-autorestart

echo ""
echo "✅ Auto-Posting System Started!"
echo ""
echo "📅 Posting Schedule (Moscow Time):"
echo "   • 9:00 AM  - Morning post"
echo "   • 3:00 PM  - Afternoon post"
echo "   • 9:00 PM  - Evening post"
echo ""
echo "📊 Content:"
echo "   • 55 tweets in content bank"
echo "   • Auto-rotates through all content"
echo "   • Resets when all tweets posted"
echo ""
echo "📋 Commands:"
echo "   • Check status:  pm2 status twitter-auto-poster"
echo "   • View logs:     pm2 logs twitter-auto-poster"
echo "   • Stop:          pm2 stop twitter-auto-poster"
echo "   • Restart:       pm2 restart twitter-auto-poster"
echo ""
echo "🔥 Manual post now: node scripts/auto-poster.js"
echo ""
