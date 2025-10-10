#!/bin/bash

# 🚀 Presale Page Launch Script
# Automated setup and launch for the crypto presale page

set -e  # Exit on error

echo ""
echo "🚀 ================================"
echo "🚀 PRESALE PAGE LAUNCH SCRIPT"
echo "🚀 ================================"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Navigate to frontend directory
echo -e "${BLUE}📂 Navigating to frontend directory...${NC}"
cd /Users/ai.place/Crypto/src/frontend

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installing dependencies...${NC}"
    npm install
else
    echo -e "${GREEN}✅ Dependencies already installed${NC}"
fi

# Check if presale page exists
if [ ! -f "pages/presale.tsx" ]; then
    echo -e "${RED}❌ Error: presale.tsx not found!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Presale page found${NC}"

# Display file info
echo ""
echo -e "${BLUE}📊 File Statistics:${NC}"
echo -e "   Lines: $(wc -l < pages/presale.tsx)"
echo -e "   Size: $(ls -lh pages/presale.tsx | awk '{print $5}')"

# Check dependencies
echo ""
echo -e "${BLUE}📦 Checking required dependencies...${NC}"

check_dependency() {
    if npm list $1 >/dev/null 2>&1; then
        echo -e "   ${GREEN}✅ $1${NC}"
    else
        echo -e "   ${YELLOW}⚠️  $1 not found${NC}"
    fi
}

check_dependency "react"
check_dependency "next"
check_dependency "framer-motion"
check_dependency "lucide-react"
check_dependency "tailwindcss"

# Display configuration
echo ""
echo -e "${BLUE}⚙️  Configuration:${NC}"
echo "   Presale End: 2025-11-10"
echo "   Token Price: $0.05"
echo "   Target Raise: $5,000,000"
echo "   Founding Members Limit: 1000"

# Ask user if they want to start dev server
echo ""
echo -e "${YELLOW}🎯 Ready to launch!${NC}"
echo ""
echo "Options:"
echo "  1) Start development server (npm run dev)"
echo "  2) Build for production (npm run build)"
echo "  3) Exit"
echo ""
read -p "Choose option (1-3): " choice

case $choice in
    1)
        echo ""
        echo -e "${GREEN}🚀 Starting development server...${NC}"
        echo ""
        echo -e "${BLUE}📍 The presale page will be available at:${NC}"
        echo -e "   ${GREEN}http://localhost:3000/presale${NC}"
        echo ""
        echo -e "${YELLOW}Press Ctrl+C to stop the server${NC}"
        echo ""
        sleep 2
        npm run dev
        ;;
    2)
        echo ""
        echo -e "${GREEN}🏗️  Building for production...${NC}"
        npm run build
        echo ""
        echo -e "${GREEN}✅ Build complete!${NC}"
        echo ""
        echo "To start production server, run:"
        echo -e "  ${BLUE}npm start${NC}"
        ;;
    3)
        echo ""
        echo -e "${BLUE}👋 Goodbye!${NC}"
        echo ""
        echo "To start manually, run:"
        echo -e "  ${BLUE}cd /Users/ai.place/Crypto/src/frontend${NC}"
        echo -e "  ${BLUE}npm run dev${NC}"
        echo ""
        exit 0
        ;;
    *)
        echo ""
        echo -e "${YELLOW}Invalid option${NC}"
        exit 1
        ;;
esac
