#!/bin/bash

echo "🚀 Starting HypeAI Website..."
echo ""
echo "Choose how to open the website:"
echo "1) Open in default browser (recommended)"
echo "2) Start local Python server"
echo "3) Start local Node.js server"
echo ""
read -p "Enter choice (1-3): " choice

case $choice in
    1)
        echo "📂 Opening website in browser..."
        if [[ "$OSTYPE" == "darwin"* ]]; then
            open index.html
        elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
            xdg-open index.html
        else
            start index.html
        fi
        echo "✅ Website opened!"
        ;;
    2)
        echo "🐍 Starting Python server on http://localhost:8000"
        python3 -m http.server 8000
        ;;
    3)
        echo "📦 Starting Node.js server on http://localhost:3000"
        npx http-server -p 3000
        ;;
    *)
        echo "❌ Invalid choice"
        exit 1
        ;;
esac
