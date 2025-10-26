#!/bin/bash

##############################################################################
# HypeAI AI Chat Backend - Deployment Script
# Deploys serverless functions to Vercel with one command
##############################################################################

set -e  # Exit on error

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 HypeAI AI Chat Backend Deployment"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
    echo "✅ Vercel CLI installed"
fi

# Check if API dependencies are installed
if [ ! -d "api/node_modules" ]; then
    echo "📦 Installing API dependencies..."
    cd api && npm install && cd ..
    echo "✅ Dependencies installed"
fi

# Login to Vercel (if not already logged in)
echo ""
echo "🔐 Checking Vercel authentication..."
if ! vercel whoami &> /dev/null; then
    echo "Please login to Vercel:"
    vercel login
else
    VERCEL_USER=$(vercel whoami)
    echo "✅ Logged in as: $VERCEL_USER"
fi

# Check environment variables
echo ""
echo "🔧 Checking environment variables..."
echo ""

# Function to set environment variable
set_env_var() {
    local var_name=$1
    local var_description=$2
    local is_required=$3

    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "$var_description"

    if [ "$is_required" = "true" ]; then
        echo "(REQUIRED)"
    else
        echo "(Optional - press Enter to skip)"
    fi

    read -p "Enter value: " var_value

    if [ -n "$var_value" ]; then
        echo "$var_value" | vercel env add $var_name production 2>/dev/null || \
        echo "$var_value" | vercel env rm $var_name production -y && \
        echo "$var_value" | vercel env add $var_name production
        echo "✅ $var_name set"
    elif [ "$is_required" = "true" ]; then
        echo "❌ $var_name is required!"
        exit 1
    else
        echo "⏭️  Skipped $var_name"
    fi
    echo ""
}

# Required variables
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "REQUIRED ENVIRONMENT VARIABLES"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if we should set environment variables
read -p "Do you want to set environment variables? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    set_env_var "ANTHROPIC_API_KEY" "Your Anthropic API key (starts with sk-ant-...)" "true"
    set_env_var "ALLOWED_ORIGIN" "Your website domain (e.g., https://hypeai.io)" "true"

    # Optional variables
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "OPTIONAL ENVIRONMENT VARIABLES"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""

    set_env_var "GA_MEASUREMENT_ID" "Google Analytics Measurement ID (G-XXXXXXXXXX)" "false"
    set_env_var "EXPRESS_API_URL" "Backup Express API URL (optional)" "false"
fi

# Deploy to Vercel
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📤 Deploying to Vercel..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Deploy to production
vercel --prod --yes

# Get deployment URL
DEPLOYMENT_URL=$(vercel ls --prod | head -n 1 | awk '{print $2}')

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ DEPLOYMENT SUCCESSFUL!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🌐 Your API is live at:"
echo "   https://$DEPLOYMENT_URL"
echo ""
echo "📍 Endpoints:"
echo "   Health: https://$DEPLOYMENT_URL/api/health"
echo "   Chat:   https://$DEPLOYMENT_URL/api/chat (POST)"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🧪 Testing your deployment..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Test health endpoint
echo "Testing health endpoint..."
HEALTH_RESPONSE=$(curl -s "https://$DEPLOYMENT_URL/api/health")

if echo "$HEALTH_RESPONSE" | grep -q "healthy"; then
    echo "✅ Health check passed!"
    echo ""
    echo "Response:"
    echo "$HEALTH_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$HEALTH_RESPONSE"
else
    echo "⚠️  Health check returned unexpected response"
    echo "$HEALTH_RESPONSE"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Next Steps"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. Test chat endpoint:"
echo "   curl -X POST https://$DEPLOYMENT_URL/api/chat \\"
echo "     -H \"Content-Type: application/json\" \\"
echo "     -d '{\"message\":\"Привет\",\"language\":\"ru\"}'"
echo ""
echo "2. Update frontend (public/variant-2/js/ai-chat-diamond.js):"
echo "   Replace fetch() URL with: /api/chat"
echo ""
echo "3. Monitor usage:"
echo "   Vercel Dashboard: https://vercel.com/dashboard"
echo "   Anthropic Console: https://console.anthropic.com"
echo ""
echo "4. View logs:"
echo "   vercel logs"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📚 Documentation"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Full docs:    docs/architecture/AI_CHAT_BACKEND_INTEGRATION.md"
echo "Quick start:  docs/API_INTEGRATION_QUICKSTART.md"
echo "Summary:      docs/AI_CHAT_INTEGRATION_SUMMARY.md"
echo ""
echo "🎉 Your AI Chat backend is now live!"
echo ""
