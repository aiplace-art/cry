#!/bin/bash

# HypeAI Bot Deployment Script
# One-click deployment for all bots

set -e  # Exit on error

echo "=================================="
echo "  HypeAI Bot Deployment Script"
echo "=================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo -e "${RED}Error: .env file not found!${NC}"
    echo "Please create a .env file with your bot tokens:"
    echo "  DISCORD_TOKEN=your_discord_token"
    echo "  DISCORD_CLIENT_ID=your_client_id"
    echo "  TELEGRAM_TOKEN=your_telegram_token"
    echo "  TWITTER_API_KEY=your_api_key"
    echo "  TWITTER_API_SECRET=your_api_secret"
    echo "  TWITTER_ACCESS_TOKEN=your_access_token"
    echo "  TWITTER_ACCESS_SECRET=your_access_secret"
    exit 1
fi

echo -e "${GREEN}✓ Found .env file${NC}"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Error: Docker is not installed!${NC}"
    echo "Please install Docker: https://docs.docker.com/get-docker/"
    exit 1
fi

echo -e "${GREEN}✓ Docker is installed${NC}"

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo -e "${RED}Error: Docker Compose is not installed!${NC}"
    echo "Please install Docker Compose: https://docs.docker.com/compose/install/"
    exit 1
fi

echo -e "${GREEN}✓ Docker Compose is installed${NC}"
echo ""

# Deployment mode selection
echo "Select deployment mode:"
echo "  1) Docker (recommended for production)"
echo "  2) PM2 (for local development)"
echo ""
read -p "Enter choice [1-2]: " deployment_mode

case $deployment_mode in
    1)
        echo ""
        echo -e "${YELLOW}Deploying with Docker...${NC}"

        # Stop existing containers
        echo "Stopping existing containers..."
        cd src/bots
        docker-compose down 2>/dev/null || true

        # Build and start containers
        echo "Building and starting containers..."
        docker-compose up -d --build

        # Wait for containers to be healthy
        echo "Waiting for containers to be healthy..."
        sleep 10

        # Show status
        echo ""
        echo -e "${GREEN}Deployment complete!${NC}"
        echo ""
        docker-compose ps

        echo ""
        echo -e "${GREEN}Monitoring dashboard:${NC} http://localhost:8080"
        echo ""
        echo "Useful commands:"
        echo "  View logs: docker-compose logs -f [service-name]"
        echo "  Restart: docker-compose restart [service-name]"
        echo "  Stop all: docker-compose down"
        ;;

    2)
        echo ""
        echo -e "${YELLOW}Deploying with PM2...${NC}"

        # Check if PM2 is installed
        if ! command -v pm2 &> /dev/null; then
            echo "PM2 not found. Installing PM2..."
            npm install -g pm2
        fi

        # Create logs directory
        mkdir -p logs

        # Stop existing processes
        echo "Stopping existing processes..."
        pm2 delete all 2>/dev/null || true

        # Start processes
        echo "Starting bots with PM2..."
        pm2 start pm2.ecosystem.config.js

        # Save PM2 configuration
        pm2 save

        # Show status
        echo ""
        echo -e "${GREEN}Deployment complete!${NC}"
        echo ""
        pm2 status

        echo ""
        echo "Useful commands:"
        echo "  View logs: pm2 logs [bot-name]"
        echo "  Restart: pm2 restart [bot-name]"
        echo "  Stop all: pm2 stop all"
        echo "  Monitor: pm2 monit"
        ;;

    *)
        echo -e "${RED}Invalid choice. Exiting.${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  All HypeAI bots are now running!${NC}"
echo -e "${GREEN}========================================${NC}"
