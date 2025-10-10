#!/bin/bash

# Health check script for HypeAI bots

echo "HypeAI Bot Health Check"
echo "======================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check Docker containers
echo "Docker Containers:"
echo "------------------"
if docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Health}}" | grep hypeai &> /dev/null; then
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Health}}" | grep -E "NAMES|hypeai"

    # Check if all are healthy
    unhealthy=$(docker ps --filter "name=hypeai" --filter "health=unhealthy" -q | wc -l)
    if [ "$unhealthy" -gt 0 ]; then
        echo -e "${RED}⚠ Warning: $unhealthy container(s) unhealthy${NC}"
    else
        echo -e "${GREEN}✓ All containers healthy${NC}"
    fi
else
    echo -e "${YELLOW}No Docker containers running${NC}"
fi

echo ""

# Check PM2 processes
echo "PM2 Processes:"
echo "--------------"
if command -v pm2 &> /dev/null && pm2 list | grep -q hypeai; then
    pm2 list | grep -E "App name|hypeai"

    # Check if all are online
    offline=$(pm2 jlist | grep -o '"status":"stopped"' | wc -l)
    if [ "$offline" -gt 0 ]; then
        echo -e "${RED}⚠ Warning: $offline process(es) offline${NC}"
    else
        echo -e "${GREEN}✓ All processes online${NC}"
    fi
else
    echo -e "${YELLOW}No PM2 processes running${NC}"
fi

echo ""

# Check monitoring dashboard
echo "Monitoring Dashboard:"
echo "---------------------"
if curl -s http://localhost:8080 &> /dev/null; then
    echo -e "${GREEN}✓ Dashboard accessible at http://localhost:8080${NC}"
else
    echo -e "${YELLOW}Dashboard not accessible${NC}"
fi

echo ""

# Resource usage
echo "Resource Usage:"
echo "---------------"
if docker ps -q --filter "name=hypeai" | wc -l &> /dev/null; then
    docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}" | grep -E "NAME|hypeai"
fi

echo ""
echo "======================="
echo "Health check complete!"
