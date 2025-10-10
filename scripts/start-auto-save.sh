#!/bin/bash

# HypeAI Auto-Save System - Startup Script
# Starts the auto-save system as a background process

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SCRIPT_PATH="$PROJECT_ROOT/scripts/auto-save-system.js"
PID_FILE="$PROJECT_ROOT/.auto-save/auto-save.pid"
LOG_FILE="$PROJECT_ROOT/.auto-save/auto-save.log"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if already running
if [ -f "$PID_FILE" ]; then
    PID=$(cat "$PID_FILE")
    if ps -p $PID > /dev/null 2>&1; then
        echo -e "${YELLOW}⚠️  Auto-Save System is already running (PID: $PID)${NC}"
        echo -e "   To stop: ./scripts/stop-auto-save.sh"
        exit 1
    else
        # Stale PID file
        rm "$PID_FILE"
    fi
fi

echo -e "${GREEN}🚀 Starting HypeAI Auto-Save System...${NC}"
echo ""

# Create .auto-save directory
mkdir -p "$(dirname "$PID_FILE")"

# Start auto-save in background
cd "$PROJECT_ROOT"
nohup node "$SCRIPT_PATH" start >> "$LOG_FILE" 2>&1 &
PID=$!

# Save PID
echo $PID > "$PID_FILE"

sleep 2

# Check if process started successfully
if ps -p $PID > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Auto-Save System started successfully!${NC}"
    echo -e "   PID: $PID"
    echo -e "   Log: $LOG_FILE"
    echo ""
    echo -e "Commands:"
    echo -e "  ${GREEN}Status:${NC}  ./scripts/check-auto-save.sh"
    echo -e "  ${RED}Stop:${NC}    ./scripts/stop-auto-save.sh"
    echo ""

    # Show initial stats
    tail -n 5 "$LOG_FILE"
else
    echo -e "${RED}❌ Failed to start Auto-Save System${NC}"
    rm "$PID_FILE"
    exit 1
fi
