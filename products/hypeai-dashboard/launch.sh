#!/bin/bash

# HypeAI Dashboard Launch Script
# Starts a local development server and opens the dashboard in the browser

echo "🚀 Launching HypeAI Dashboard..."
echo ""

# Navigate to dashboard directory
cd "$(dirname "$0")"

# Check if Python 3 is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3 to run the dashboard."
    exit 1
fi

# Kill any existing server on port 8001
if lsof -Pi :8001 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "🔄 Stopping existing server on port 8001..."
    kill $(lsof -t -i:8001) 2>/dev/null
    sleep 1
fi

# Start HTTP server
echo "🌐 Starting HTTP server on port 8001..."
python3 -m http.server 8001 > /dev/null 2>&1 &
SERVER_PID=$!

# Save PID for later cleanup
echo $SERVER_PID > .server.pid

# Wait for server to start
sleep 2

# Check if server started successfully
if ! kill -0 $SERVER_PID 2>/dev/null; then
    echo "❌ Failed to start server"
    exit 1
fi

echo "✅ Server started successfully (PID: $SERVER_PID)"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "   HypeAI Dashboard is running!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "   🌐 URL: http://localhost:8001"
echo "   📁 Directory: $(pwd)"
echo ""
echo "   Press Ctrl+C to stop the server"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Open in default browser
if command -v open &> /dev/null; then
    # macOS
    open http://localhost:8001
elif command -v xdg-open &> /dev/null; then
    # Linux
    xdg-open http://localhost:8001
elif command -v start &> /dev/null; then
    # Windows
    start http://localhost:8001
else
    echo "💡 Open http://localhost:8001 in your browser"
fi

# Wait for Ctrl+C
trap "echo ''; echo '🛑 Stopping server...'; kill $SERVER_PID 2>/dev/null; rm -f .server.pid; echo '✅ Server stopped'; exit 0" INT TERM

# Keep script running
wait $SERVER_PID
