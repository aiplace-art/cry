#!/bin/bash

# Local Development Environment Setup Script
# This script sets up the complete local development environment

set -e  # Exit on error

echo "🚀 Setting up local development environment..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  .env file not found. Creating from .env.example...${NC}"
    if [ -f .env.example ]; then
        cp .env.example .env
        echo -e "${GREEN}✅ .env file created${NC}"
    else
        echo -e "${RED}❌ .env.example not found${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✅ .env file exists${NC}"
fi

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running. Please start Docker and try again.${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Docker is running${NC}"

# Check if Docker Compose is available
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null 2>&1; then
    echo -e "${RED}❌ Docker Compose is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Docker Compose is available${NC}"

# Stop any existing containers
echo -e "${YELLOW}🛑 Stopping existing containers...${NC}"
docker-compose down -v 2>/dev/null || docker compose down -v 2>/dev/null || true

# Start services
echo -e "${YELLOW}🐳 Starting Docker services...${NC}"
if command -v docker-compose &> /dev/null; then
    docker-compose up -d
else
    docker compose up -d
fi

# Wait for services to be healthy
echo -e "${YELLOW}⏳ Waiting for services to be ready...${NC}"
sleep 10

# Check PostgreSQL
echo -e "${YELLOW}🔍 Checking PostgreSQL...${NC}"
until docker exec crypto-postgres pg_isready -U crypto_user > /dev/null 2>&1; do
    echo "Waiting for PostgreSQL..."
    sleep 2
done
echo -e "${GREEN}✅ PostgreSQL is ready${NC}"

# Check MongoDB
echo -e "${YELLOW}🔍 Checking MongoDB...${NC}"
until docker exec crypto-mongodb mongosh --eval "db.adminCommand('ping')" > /dev/null 2>&1; do
    echo "Waiting for MongoDB..."
    sleep 2
done
echo -e "${GREEN}✅ MongoDB is ready${NC}"

# Check Redis
echo -e "${YELLOW}🔍 Checking Redis...${NC}"
until docker exec crypto-redis redis-cli ping > /dev/null 2>&1; do
    echo "Waiting for Redis..."
    sleep 2
done
echo -e "${GREEN}✅ Redis is ready${NC}"

# Install Node dependencies
echo -e "${YELLOW}📦 Installing Node.js dependencies...${NC}"
npm install
echo -e "${GREEN}✅ Dependencies installed${NC}"

# Compile smart contracts
echo -e "${YELLOW}🔨 Compiling smart contracts...${NC}"
npm run compile
echo -e "${GREEN}✅ Contracts compiled${NC}"

# Run tests
echo -e "${YELLOW}🧪 Running tests...${NC}"
npm run test
echo -e "${GREEN}✅ Tests passed${NC}"

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✨ Local development environment is ready!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "📊 Services:"
echo "  - PostgreSQL:      localhost:5432"
echo "  - MongoDB:         localhost:27017"
echo "  - Redis:           localhost:6379"
echo "  - Hardhat Node:    localhost:8545"
echo "  - Ganache:         localhost:7545"
echo "  - IPFS API:        localhost:5001"
echo "  - The Graph:       localhost:8000"
echo ""
echo "🎨 Management UIs:"
echo "  - Adminer (PostgreSQL):  http://localhost:8081"
echo "  - Mongo Express:         http://localhost:8082"
echo "  - Redis Commander:       http://localhost:8083"
echo ""
echo "🚀 Next steps:"
echo "  1. Start local blockchain: npm run node"
echo "  2. Deploy contracts:       npm run deploy:local"
echo "  3. Start backend:          npm run start:backend"
echo "  4. Start frontend:         npm run start:frontend"
echo ""
echo "💡 Useful commands:"
echo "  - View logs:     docker-compose logs -f"
echo "  - Stop services: docker-compose down"
echo "  - Reset data:    docker-compose down -v"
echo ""
