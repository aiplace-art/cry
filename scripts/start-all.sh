#!/bin/bash

# Start all HypeAI bots

set -e

echo "Starting all HypeAI bots..."

# Check if Docker containers exist
if docker ps -a | grep -q hypeai; then
    echo "Starting Docker containers..."
    cd src/bots
    docker-compose start
    echo "✓ Docker containers started"
    docker-compose ps
    exit 0
fi

# Check if PM2 processes exist
if pm2 list | grep -q hypeai; then
    echo "Starting PM2 processes..."
    pm2 start all
    echo "✓ PM2 processes started"
    pm2 status
    exit 0
fi

echo "No existing bot processes found. Please run deploy-bots.sh first."
exit 1
