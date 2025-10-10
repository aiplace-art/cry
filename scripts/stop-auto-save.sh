#!/bin/bash

# HypeAI Auto-Save System - Stop Script

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PID_FILE="$PROJECT_ROOT/.auto-save/auto-save.pid"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

if [ ! -f "$PID_FILE" ]; then
    echo -e "${YELLOW}⚠️  Auto-Save System is not running${NC}"
    exit 0
fi

PID=$(cat "$PID_FILE")

if ! ps -p $PID > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Auto-Save System is not running (stale PID file)${NC}"
    rm "$PID_FILE"
    exit 0
fi

echo -e "${YELLOW}🛑 Stopping Auto-Save System (PID: $PID)...${NC}"

# Send SIGINT for graceful shutdown
kill -INT $PID

# Wait for process to stop (max 10 seconds)
for i in {1..10}; do
    if ! ps -p $PID > /dev/null 2>&1; then
        break
    fi
    sleep 1
done

# Force kill if still running
if ps -p $PID > /dev/null 2>&1; then
    echo -e "${RED}Process didn't stop gracefully, force killing...${NC}"
    kill -9 $PID
fi

rm "$PID_FILE"

echo -e "${GREEN}✅ Auto-Save System stopped${NC}"
