#!/bin/bash

# Stop all HypeAI bots

echo "Stopping all HypeAI bots..."

# Stop Docker containers
if docker ps | grep -q hypeai; then
    echo "Stopping Docker containers..."
    cd src/bots
    docker-compose stop
    echo "✓ Docker containers stopped"
fi

# Stop PM2 processes
if pm2 list | grep -q hypeai; then
    echo "Stopping PM2 processes..."
    pm2 stop all
    echo "✓ PM2 processes stopped"
fi

echo "All bots stopped successfully!"
