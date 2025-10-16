#!/bin/bash

# 🎨 Logo Guardian Agent - Stop Script

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$SCRIPT_DIR/.."
PID_FILE="$PROJECT_ROOT/logo-guardian.pid"

echo "🛑 Stopping Logo Guardian Agent..."

if [ ! -f "$PID_FILE" ]; then
    echo "❌ Logo Guardian is not running (no PID file found)"
    exit 1
fi

PID=$(cat "$PID_FILE")

if ps -p $PID > /dev/null 2>&1; then
    kill $PID
    rm "$PID_FILE"
    echo "✅ Logo Guardian stopped successfully (PID: $PID)"
else
    echo "⚠️  Process not found (PID: $PID)"
    rm "$PID_FILE"
    echo "🧹 Removed stale PID file"
fi
