#!/bin/bash

echo "🤖 Starting HypeAI Sync Agent..."
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed!"
    echo "Please install Node.js from: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js found: $(node --version)"
echo ""

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
fi

# Start the sync agent
echo "🚀 Launching Sync Agent..."
echo ""
echo "The agent will:"
echo "  • Monitor all project files 👀"
echo "  • Auto-update website stats 📊"
echo "  • Sync changes in real-time ⚡"
echo "  • Generate status reports 📝"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🌐 Status page will be available at:"
echo "   http://localhost:8000/status.html"
echo ""
echo "Press Ctrl+C to stop the agent"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Start both the sync agent and local server
if command -v python3 &> /dev/null; then
    # Start sync agent in background
    node sync-agent.js &
    AGENT_PID=$!

    # Wait a bit for agent to start
    sleep 2

    # Start HTTP server
    echo "🌐 Starting HTTP server..."
    cd "$(dirname "$0")"
    python3 -m http.server 8000 &
    SERVER_PID=$!

    # Wait a bit for server to start
    sleep 2

    # Open browser
    if [[ "$OSTYPE" == "darwin"* ]]; then
        open http://localhost:8000/status.html
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        xdg-open http://localhost:8000/status.html
    fi

    echo ""
    echo "✅ Everything is running!"
    echo "🤖 Sync Agent PID: $AGENT_PID"
    echo "🌐 HTTP Server PID: $SERVER_PID"
    echo ""
    echo "Press Ctrl+C to stop all services"

    # Trap Ctrl+C to kill both processes
    trap "echo ''; echo '👋 Stopping services...'; kill $AGENT_PID $SERVER_PID 2>/dev/null; exit" INT

    # Wait for processes
    wait
else
    echo "⚠️  Python not found. Running agent only..."
    node sync-agent.js
fi
