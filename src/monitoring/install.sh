#!/bin/bash

echo "🏥 HypeAI Monitoring System - Installation"
echo "==========================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Node.js
echo -e "${BLUE}Checking Node.js installation...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}⚠️  Node.js not found. Please install Node.js 16+ first.${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Node.js $(node --version) found${NC}"
echo ""

# Install dependencies
echo -e "${BLUE}📦 Installing dependencies...${NC}"
npm install express axios node-cron nodemailer twilio ethers
echo -e "${GREEN}✅ Dependencies installed${NC}"
echo ""

# Create data directories
echo -e "${BLUE}📁 Creating data directories...${NC}"
mkdir -p ../../data/metrics/minute
mkdir -p ../../data/metrics/hourly
mkdir -p ../../data/metrics/daily
echo -e "${GREEN}✅ Data directories created${NC}"
echo ""

# Copy .env.example
echo -e "${BLUE}⚙️  Setting up environment...${NC}"
if [ ! -f .env ]; then
    cp .env.example .env
    echo -e "${YELLOW}📝 Created .env file. Please configure it with your settings.${NC}"
else
    echo -e "${YELLOW}⚠️  .env already exists. Skipping...${NC}"
fi
echo ""

# Create systemd service (optional)
echo -e "${BLUE}Would you like to install as a systemd service? (y/N)${NC}"
read -r install_service

if [[ "$install_service" =~ ^[Yy]$ ]]; then
    SERVICE_FILE="/etc/systemd/system/hypeai-monitoring.service"

    echo -e "${BLUE}Creating systemd service...${NC}"

    cat > /tmp/hypeai-monitoring.service << EOF
[Unit]
Description=HypeAI Monitoring System
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$(pwd)
ExecStart=$(which node) $(pwd)/server.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOF

    sudo mv /tmp/hypeai-monitoring.service $SERVICE_FILE
    sudo systemctl daemon-reload
    sudo systemctl enable hypeai-monitoring

    echo -e "${GREEN}✅ Systemd service installed${NC}"
    echo -e "${BLUE}Start with: sudo systemctl start hypeai-monitoring${NC}"
    echo -e "${BLUE}Check status: sudo systemctl status hypeai-monitoring${NC}"
fi
echo ""

# Installation complete
echo -e "${GREEN}🎉 Installation Complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Edit .env file with your configuration"
echo "2. Start the server: node server.js"
echo "3. Access dashboard at http://localhost:3005"
echo "4. Access status page at http://localhost:3005/status"
echo ""
echo "Documentation: README.md"
echo ""
