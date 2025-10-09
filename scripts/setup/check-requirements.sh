#!/bin/bash

# Check system requirements for development

set -e

echo "🔍 Checking system requirements..."
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

REQUIREMENTS_MET=true

# Check Node.js
echo -n "Checking Node.js... "
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo -e "${GREEN}✅ $NODE_VERSION${NC}"

    # Check if version is >= 16
    NODE_MAJOR=$(node -v | cut -d'.' -f1 | sed 's/v//')
    if [ "$NODE_MAJOR" -lt 16 ]; then
        echo -e "${RED}   ⚠️  Node.js 16+ required, you have $NODE_VERSION${NC}"
        REQUIREMENTS_MET=false
    fi
else
    echo -e "${RED}❌ Not installed${NC}"
    REQUIREMENTS_MET=false
fi

# Check npm
echo -n "Checking npm... "
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm -v)
    echo -e "${GREEN}✅ v$NPM_VERSION${NC}"
else
    echo -e "${RED}❌ Not installed${NC}"
    REQUIREMENTS_MET=false
fi

# Check Docker
echo -n "Checking Docker... "
if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker -v | cut -d' ' -f3 | sed 's/,//')
    echo -e "${GREEN}✅ $DOCKER_VERSION${NC}"

    # Check if Docker daemon is running
    if docker info &> /dev/null; then
        echo -e "   ${GREEN}Docker daemon is running${NC}"
    else
        echo -e "   ${RED}Docker daemon is not running${NC}"
        REQUIREMENTS_MET=false
    fi
else
    echo -e "${RED}❌ Not installed${NC}"
    REQUIREMENTS_MET=false
fi

# Check Docker Compose
echo -n "Checking Docker Compose... "
if command -v docker-compose &> /dev/null; then
    COMPOSE_VERSION=$(docker-compose -v | cut -d' ' -f4 | sed 's/,//')
    echo -e "${GREEN}✅ $COMPOSE_VERSION${NC}"
elif docker compose version &> /dev/null 2>&1; then
    COMPOSE_VERSION=$(docker compose version --short)
    echo -e "${GREEN}✅ $COMPOSE_VERSION (plugin)${NC}"
else
    echo -e "${RED}❌ Not installed${NC}"
    REQUIREMENTS_MET=false
fi

# Check Git
echo -n "Checking Git... "
if command -v git &> /dev/null; then
    GIT_VERSION=$(git --version | cut -d' ' -f3)
    echo -e "${GREEN}✅ $GIT_VERSION${NC}"
else
    echo -e "${RED}❌ Not installed${NC}"
    REQUIREMENTS_MET=false
fi

# Check Python (for Slither)
echo -n "Checking Python... "
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version | cut -d' ' -f2)
    echo -e "${GREEN}✅ $PYTHON_VERSION${NC}"
else
    echo -e "${YELLOW}⚠️  Not installed (optional, needed for Slither)${NC}"
fi

# Check available disk space
echo -n "Checking disk space... "
if command -v df &> /dev/null; then
    AVAILABLE_SPACE=$(df -h . | awk 'NR==2 {print $4}')
    echo -e "${GREEN}✅ $AVAILABLE_SPACE available${NC}"
fi

# Check available memory
echo -n "Checking available memory... "
if command -v free &> /dev/null; then
    AVAILABLE_MEM=$(free -h | awk 'NR==2 {print $7}')
    echo -e "${GREEN}✅ $AVAILABLE_MEM available${NC}"
elif command -v vm_stat &> /dev/null; then
    # macOS
    FREE_BLOCKS=$(vm_stat | grep free | awk '{ print $3 }' | sed 's/\.//')
    INACTIVE_BLOCKS=$(vm_stat | grep inactive | awk '{ print $3 }' | sed 's/\.//')
    SPECULATIVE_BLOCKS=$(vm_stat | grep speculative | awk '{ print $3 }' | sed 's/\.//')

    FREE=$((($FREE_BLOCKS+$SPECULATIVE_BLOCKS)*4096/1048576))
    INACTIVE=$(($INACTIVE_BLOCKS*4096/1048576))
    TOTAL_FREE=$(($FREE+$INACTIVE))

    echo -e "${GREEN}✅ ~${TOTAL_FREE}MB available${NC}"
fi

echo ""

# Summary
if [ "$REQUIREMENTS_MET" = true ]; then
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}✅ All requirements met!${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo "You can proceed with setup:"
    echo "  ./scripts/setup/setup-local-env.sh"
    exit 0
else
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${RED}❌ Some requirements are missing${NC}"
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo "Installation instructions:"
    echo ""
    echo "Node.js: https://nodejs.org/"
    echo "Docker: https://docs.docker.com/get-docker/"
    echo "Docker Compose: https://docs.docker.com/compose/install/"
    echo "Git: https://git-scm.com/downloads"
    exit 1
fi
