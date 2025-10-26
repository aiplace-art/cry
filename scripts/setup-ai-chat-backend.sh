#!/bin/bash

# AI Agent Chat Backend - Automated Setup Script
# This script installs dependencies and sets up the backend server

set -e  # Exit on error

echo "╔════════════════════════════════════════════════════════════╗"
echo "║   AI Agent Chat Backend - Automated Setup                  ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if running from correct directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
SERVER_DIR="$PROJECT_ROOT/src/server"

cd "$PROJECT_ROOT"

echo -e "${BLUE}[1/5]${NC} Checking prerequisites..."

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}✗${NC} Node.js is not installed"
    echo "Please install Node.js 18 or higher from https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}✗${NC} Node.js version is too old ($NODE_VERSION)"
    echo "Please upgrade to Node.js 18 or higher"
    exit 1
fi

echo -e "${GREEN}✓${NC} Node.js $(node -v) detected"

# Check npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}✗${NC} npm is not installed"
    exit 1
fi

echo -e "${GREEN}✓${NC} npm $(npm -v) detected"

# Create server directory if it doesn't exist
if [ ! -d "$SERVER_DIR" ]; then
    echo -e "${YELLOW}!${NC} Server directory not found, creating..."
    mkdir -p "$SERVER_DIR"
fi

cd "$SERVER_DIR"

echo ""
echo -e "${BLUE}[2/5]${NC} Installing dependencies..."

# Install dependencies
npm install

echo -e "${GREEN}✓${NC} Dependencies installed"

echo ""
echo -e "${BLUE}[3/5]${NC} Setting up environment configuration..."

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo -e "${GREEN}✓${NC} Created .env from template"
    else
        echo -e "${YELLOW}!${NC} .env.example not found, creating default .env"
        cat > .env << EOF
# Server Configuration
PORT=3001
NODE_ENV=development

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# Anthropic API (REQUIRED - Add your key here)
ANTHROPIC_API_KEY=

# Rate Limiting
ENABLE_RATE_LIMITING=true
MAX_REQUESTS_PER_MINUTE=50
EOF
    fi

    echo -e "${YELLOW}!${NC} Please add your ANTHROPIC_API_KEY to .env file"
    echo ""
    echo "You can get an API key from: https://console.anthropic.com/"
    echo ""
    read -p "Press Enter to open .env for editing (or Ctrl+C to exit and edit manually)..."

    # Try to open with default editor
    if [ -n "$EDITOR" ]; then
        $EDITOR .env
    elif command -v nano &> /dev/null; then
        nano .env
    elif command -v vim &> /dev/null; then
        vim .env
    else
        echo -e "${YELLOW}!${NC} Please edit .env manually"
    fi
else
    echo -e "${GREEN}✓${NC} .env already exists"
fi

echo ""
echo -e "${BLUE}[4/5]${NC} Validating configuration..."

# Check if API key is set
if grep -q "ANTHROPIC_API_KEY=$" .env || ! grep -q "ANTHROPIC_API_KEY" .env; then
    echo -e "${RED}✗${NC} ANTHROPIC_API_KEY is not set in .env"
    echo ""
    echo "Please edit .env and add your Anthropic API key:"
    echo "  ANTHROPIC_API_KEY=your_key_here"
    echo ""
    exit 1
fi

echo -e "${GREEN}✓${NC} Configuration validated"

echo ""
echo -e "${BLUE}[5/5]${NC} Setup complete!"
echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║   🎉 AI Agent Chat Backend Setup Complete!                ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "📁 Server location: $SERVER_DIR"
echo ""
echo "🚀 To start the server:"
echo "   cd $SERVER_DIR"
echo "   npm start              # Production mode"
echo "   npm run dev            # Development mode (auto-reload)"
echo ""
echo "📡 Server will be available at:"
echo "   HTTP:      http://localhost:3001"
echo "   WebSocket: ws://localhost:3001/ws"
echo "   API Docs:  http://localhost:3001/api/docs"
echo ""
echo "📚 Full documentation: $PROJECT_ROOT/docs/AI_AGENT_CHAT_BACKEND.md"
echo ""

# Ask if user wants to start server now
read -p "Would you like to start the server now? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "Starting server..."
    npm start
fi
