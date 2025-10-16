#!/bin/bash

# HypeAI Twitter Dashboard Launch Script
# Built by AI Agents for HypeAI
#
# This script launches the Twitter Automation Dashboard
# and opens it in your default browser

echo "🚀 HypeAI Twitter Dashboard Launcher"
echo "====================================="
echo ""
echo "🤖 Built by HypeAI AI Agents"
echo "📱 First Product Launch"
echo ""

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Navigate to dashboard directory
cd "$SCRIPT_DIR"

# Check if index.html exists
if [ ! -f "index.html" ]; then
    echo "❌ Error: index.html not found!"
    echo "📂 Current directory: $PWD"
    exit 1
fi

echo "✅ Dashboard files found"
echo ""

# Check for Python 3
if command -v python3 &> /dev/null; then
    echo "🐍 Starting Python web server..."
    echo "📡 Server will run on: http://localhost:8000"
    echo ""
    echo "📋 Dashboard Features:"
    echo "   • Real-time countdown timer"
    echo "   • 6 AI Agents monitoring"
    echo "   • 4 System status panels"
    echo "   • Interactive charts"
    echo "   • Live activity feed"
    echo ""
    echo "🌐 Opening browser..."
    echo ""

    # Open browser after 2 seconds
    (sleep 2 && open "http://localhost:8000") &

    # Start server
    echo "⚡ Server starting..."
    echo "💡 Press Ctrl+C to stop"
    echo ""
    python3 -m http.server 8000

elif command -v python &> /dev/null; then
    echo "🐍 Starting Python 2 web server..."
    echo "📡 Server will run on: http://localhost:8000"
    echo ""
    echo "🌐 Opening browser..."

    # Open browser after 2 seconds
    (sleep 2 && open "http://localhost:8000") &

    # Start server
    python -m SimpleHTTPServer 8000

else
    echo "⚠️  Python not found. Opening file directly..."
    echo ""

    # Try to open directly
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        open "index.html"
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        xdg-open "index.html"
    elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]]; then
        # Windows
        start "index.html"
    else
        echo "❌ Cannot automatically open browser"
        echo "📂 Please open: $SCRIPT_DIR/index.html"
    fi
fi

echo ""
echo "✅ Launch complete!"
echo ""
echo "📊 What you should see:"
echo "   • Animated gradient background"
echo "   • Live countdown timer"
echo "   • Real-time metrics updating"
echo "   • Agent status indicators"
echo "   • System health monitors"
echo "   • Interactive charts"
echo ""
echo "💬 Need help? Check LAUNCH.md"
echo ""
