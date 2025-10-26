#!/bin/bash
# 🚀 Quick Client Onboarding Script for Railway.app

CLIENT_NAME=$1

if [ -z "$CLIENT_NAME" ]; then
    echo "Usage: ./onboard-client-railway.sh CLIENT_NAME"
    echo "Example: ./onboard-client-railway.sh tesla-energy"
    exit 1
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 Onboarding new client: $CLIENT_NAME"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Create client directory
CLIENTS_DIR="clients/$CLIENT_NAME"
mkdir -p $CLIENTS_DIR

# Copy template files
echo "📋 Step 1: Creating client configuration..."
cp data/project-coordination/marketing-insights.json $CLIENTS_DIR/marketing-insights.json
cp data/project-coordination/posting-history.json $CLIENTS_DIR/posting-history.json

# Request Twitter credentials
echo ""
echo "🔑 Step 2: Twitter API Credentials"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Option 1: Get from client's Twitter Developer Portal"
echo "Option 2: Use Playwright automation (no API needed)"
echo ""
read -p "Use Twitter API? (y/n): " USE_API

if [ "$USE_API" = "y" ]; then
    read -p "Twitter API Key: " API_KEY
    read -p "Twitter API Secret: " API_SECRET
    read -p "Access Token: " ACCESS_TOKEN
    read -p "Access Token Secret: " ACCESS_SECRET

    # Create .env file
    cat > $CLIENTS_DIR/.env.marketing << EOF
TWITTER_API_KEY=$API_KEY
TWITTER_API_SECRET=$API_SECRET
TWITTER_ACCESS_TOKEN=$ACCESS_TOKEN
TWITTER_ACCESS_TOKEN_SECRET=$ACCESS_SECRET
CLIENT_NAME=$CLIENT_NAME
AUTOMATION_TYPE=api
EOF
else
    # Playwright setup
    cat > $CLIENTS_DIR/.env.marketing << EOF
CLIENT_NAME=$CLIENT_NAME
AUTOMATION_TYPE=playwright
TWITTER_USERNAME=
TWITTER_PASSWORD=
EOF

    echo ""
    echo "ℹ️  Playwright mode selected"
    echo "   Client will need to provide Twitter username/password later"
    echo "   Update $CLIENTS_DIR/.env.marketing before deployment"
fi

echo ""
echo "✅ Step 3: Client configuration created!"
echo ""
echo "📝 Next steps:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1️⃣  Edit content for client:"
echo "    nano $CLIENTS_DIR/marketing-insights.json"
echo ""
echo "2️⃣  Create Railway project:"
echo "    - Go to https://railway.app"
echo "    - New Project → Deploy from GitHub"
echo "    - Select repo 'Crypto' → branch 'variant-2-website'"
echo ""
echo "3️⃣  Add Variables in Railway (from $CLIENTS_DIR/.env.marketing):"
echo "    - TWITTER_API_KEY"
echo "    - TWITTER_API_SECRET"
echo "    - TWITTER_ACCESS_TOKEN"
echo "    - TWITTER_ACCESS_TOKEN_SECRET"
echo "    - NODE_ENV=production"
echo "    - TZ=Europe/Moscow"
echo "    - CLIENT_NAME=$CLIENT_NAME"
echo ""
echo "4️⃣  Configure Cron in Railway:"
echo "    Schedule: 0 8-22 * * *"
echo "    Command: node scripts/twitter-scheduler.js"
echo ""
echo "5️⃣  Test deployment:"
echo "    - Check Railway Logs for successful start"
echo "    - Wait for next scheduled hour"
echo "    - Verify post on Twitter"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Client $CLIENT_NAME ready for deployment!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "💰 Pricing recommendation:"
echo "   Setup fee: $500-800"
echo "   Monthly: $10-20"
echo "   Railway cost: €0-5/month"
echo "   Your profit: $10-15/month per client"
echo ""
