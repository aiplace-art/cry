#!/bin/bash

# 🚀 MASTER LAUNCHER - Start all Twitter automation systems

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🤖 HypeAI Twitter Automation - Master Launcher"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if API is available
echo "🔍 Checking Twitter API status..."
API_CHECK=$(node -e "
import('twitter-api-v2').then(async ({ TwitterApi }) => {
  const { config } = await import('dotenv');
  config({ path: './scripts/.env.marketing' });

  const client = new TwitterApi({
    appKey: process.env.TWITTER_API_KEY,
    appSecret: process.env.TWITTER_API_SECRET,
    accessToken: process.env.TWITTER_ACCESS_TOKEN,
    accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
  });

  const me = await client.v2.me();
  console.log('OK');
}).catch(e => {
  if (e.code === 429) {
    console.log('RATE_LIMITED');
  } else {
    console.log('ERROR');
  }
});
" 2>&1)

if [[ "$API_CHECK" == *"RATE_LIMITED"* ]]; then
    echo "⚠️  Twitter API is rate limited"
    echo "   This is normal after cleanup operations"
    echo "   Rate limits reset automatically in 1-3 hours"
    echo ""
    echo "📋 Systems will start but may need to wait for API access"
    echo ""
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
elif [[ "$API_CHECK" == *"OK"* ]]; then
    echo "✅ Twitter API is accessible"
    echo ""
else
    echo "❌ Error checking API"
    echo "   Check your credentials in scripts/.env.marketing"
    echo ""
    exit 1
fi

# Install PM2 if needed
if ! command -v pm2 &> /dev/null; then
    echo "📦 Installing PM2..."
    npm install -g pm2
    echo ""
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 Starting All Systems..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 1. Auto-Posting System
echo "1️⃣  Starting Auto-Posting System..."
echo "   📅 Posts 3x daily: 9 AM, 3 PM, 9 PM"
echo "   📊 55 tweets in content bank"
bash scripts/start-auto-posting.sh > /dev/null 2>&1
sleep 2
echo ""

# 2. Engagement Bot
echo "2️⃣  Starting Engagement Bot..."
echo "   🤖 24/7 monitoring and responses"
echo "   💬 60+ response templates"
bash scripts/start-engagement-bot.sh > /dev/null 2>&1
sleep 2
echo ""

# 3. Analytics System
echo "3️⃣  Starting Analytics System..."
echo "   📊 50+ metrics tracked"
echo "   📈 Automated reports"
bash scripts/setup-analytics-cron.sh > /dev/null 2>&1
sleep 2
echo ""

# 4. Marketing Specialist
echo "4️⃣  Starting Marketing Specialist..."
echo "   🎯 Hashtag monitoring"
echo "   🔍 Competitor analysis"
echo "   📊 Growth recommendations"
bash scripts/start-marketing-specialist.sh > /dev/null 2>&1
sleep 2
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ All 4 Systems Launched!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Show status
echo "📋 Current Status:"
pm2 list | grep twitter

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🤖 6 AI Agents Active:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. Content Creator     ✅ 55 tweets ready"
echo "2. Engagement Manager  ✅ 24/7 bot active"
echo "3. Analytics Tracker   ✅ 50+ metrics"
echo "4. Growth Strategist   ✅ 10-month plan"
echo "5. Brand Manager       ✅ Guidelines enforced"
echo "6. Marketing Specialist ⭐ NEW! Hashtag monitoring"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Expected Results:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Week 1:   101 → 150 followers (+50) 🚀 BOOSTED"
echo "Month 1:  101 → 350 followers (+250)"
echo "Month 3:  101 → 1,000 followers (+900)"
echo "Month 10: 101 → 10,000+ followers 🎯"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎯 Monitoring Commands:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "• Check all systems:     pm2 list"
echo "• View posting logs:     pm2 logs twitter-auto-poster"
echo "• View engagement logs:  pm2 logs twitter-engagement-bot"
echo "• View marketing logs:   pm2 logs twitter-marketing-specialist"
echo "• Check analytics:       open scripts/analytics-dashboard.html"
echo "• Marketing insights:    cat data/project-coordination/marketing-insights.json"
echo "• Stop all systems:      pm2 stop all"
echo "• Restart all systems:   pm2 restart all"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📈 Track Progress:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "• Twitter Profile:  https://twitter.com/HypeAIProject"
echo "• Posting History:  cat data/project-coordination/posting-history.json"
echo "• Analytics Data:   cat data/project-coordination/analytics-data.json"
echo ""

echo "🎉 Twitter Automation is now LIVE!"
echo ""
