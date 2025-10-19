#!/bin/bash

# Start Twitter Marketing Specialist
# Runs analysis every 6 hours to monitor trends, hashtags, competitors

echo "🎯 Starting Twitter Marketing Specialist..."
echo ""

# Make executable
chmod +x scripts/twitter-marketing-specialist.js

# Install PM2 if needed
if ! command -v pm2 &> /dev/null; then
    echo "📦 Installing PM2..."
    npm install -g pm2
fi

# Stop any existing instance
pm2 delete twitter-marketing-specialist 2>/dev/null

# Start with cron schedule (every 6 hours)
pm2 start scripts/twitter-marketing-specialist.js \
    --name twitter-marketing-specialist \
    --cron "0 */6 * * *" \
    --no-autorestart

echo ""
echo "✅ Marketing Specialist Started!"
echo ""
echo "📊 What it does:"
echo "   • Monitors trending hashtags (#BNB, #BNBChain, #DeFi, etc.)"
echo "   • Analyzes 20+ competitors"
echo "   • Identifies key influencers to target"
echo "   • Generates growth recommendations"
echo "   • Provides actionable marketing tactics"
echo ""
echo "⏰ Schedule:"
echo "   Runs every 6 hours (4x per day)"
echo ""
echo "📋 Commands:"
echo "   • Check status:   pm2 status twitter-marketing-specialist"
echo "   • View logs:      pm2 logs twitter-marketing-specialist"
echo "   • Run now:        node scripts/twitter-marketing-specialist.js"
echo "   • Stop:           pm2 stop twitter-marketing-specialist"
echo ""
echo "📊 View insights:  cat data/project-coordination/marketing-insights.json"
echo ""
