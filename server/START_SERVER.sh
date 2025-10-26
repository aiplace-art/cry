#!/bin/bash

# HypeAI AI Assistant API - Start Script

echo ""
echo "🚀 Starting HypeAI AI Assistant API..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ ERROR: .env file not found!"
    echo ""
    echo "Please create .env file:"
    echo "  cp .env.example .env"
    echo "  nano .env"
    echo ""
    echo "Add your Anthropic API key to .env"
    exit 1
fi

# Check if ANTHROPIC_API_KEY is set
if ! grep -q "ANTHROPIC_API_KEY=sk-ant-" .env; then
    echo "⚠️  WARNING: ANTHROPIC_API_KEY not configured in .env"
    echo ""
    echo "Please add your API key to .env:"
    echo "  ANTHROPIC_API_KEY=sk-ant-your-key-here"
    echo ""
    echo "Get your key at: https://console.anthropic.com/"
    exit 1
fi

# Check if node_modules exists
if [ ! -d node_modules ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
fi

# Start server
echo "✅ Starting server..."
echo ""
npm start
