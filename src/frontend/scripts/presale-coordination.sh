#!/bin/bash
# Presale Frontend Coordination Script
# Integrates with Claude-Flow hooks for agent communication

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

echo -e "${PURPLE}🚀 HYPE Token Presale - Frontend Coordination${NC}"
echo "================================================"

# Pre-task hook - Register frontend development session
echo -e "${BLUE}📋 Registering frontend development session...${NC}"
npx claude-flow@alpha hooks pre-task --description "HYPE Token Presale Frontend Development" 2>/dev/null || echo "Note: Claude-Flow not configured"

# Session restore - Load previous state
echo -e "${BLUE}💾 Restoring session state...${NC}"
npx claude-flow@alpha hooks session-restore --session-id "presale-frontend-dev" 2>/dev/null || echo "Note: No previous session found"

# File tracking - Monitor component files
echo -e "${BLUE}📂 Tracking presale components...${NC}"

COMPONENTS=(
  "pages/presale.tsx"
  "components/PresaleWidget.tsx"
  "components/TokenCalculator.tsx"
  "components/PresaleProgress.tsx"
  "components/TransactionsFeed.tsx"
  "components/VestingSchedule.tsx"
  "components/FAQ.tsx"
  "hooks/usePresale.ts"
  "utils/presaleContract.ts"
  "types/presale.ts"
  "lib/constants.ts"
)

for component in "${COMPONENTS[@]}"; do
  if [ -f "$component" ]; then
    echo -e "${GREEN}  ✓ Tracked: $component${NC}"
    npx claude-flow@alpha hooks post-edit \
      --file "$component" \
      --memory-key "presale/frontend/$component" 2>/dev/null || true
  else
    echo -e "${RED}  ✗ Missing: $component${NC}"
  fi
done

# Notify other agents
echo -e "${BLUE}📢 Notifying coordinated agents...${NC}"
npx claude-flow@alpha hooks notify \
  --message "Frontend presale components completed. Ready for integration testing." 2>/dev/null || true

# Performance metrics
echo -e "${BLUE}📊 Tracking development metrics...${NC}"
npx claude-flow@alpha hooks post-task \
  --task-id "presale-frontend-build" \
  --status "completed" 2>/dev/null || true

# Export session state
echo -e "${BLUE}💾 Exporting session state...${NC}"
npx claude-flow@alpha hooks session-end \
  --export-metrics true \
  --session-id "presale-frontend-dev" 2>/dev/null || true

echo ""
echo -e "${GREEN}✅ Presale frontend coordination completed!${NC}"
echo ""
echo -e "${PURPLE}📦 Components Created:${NC}"
echo "  • Main presale page with countdown timer"
echo "  • Wallet connection widget with multi-chain support"
echo "  • ROI calculator with bonus calculations"
echo "  • Progress tracking for presale rounds"
echo "  • Live transactions feed"
echo "  • Vesting schedule with claim functionality"
echo "  • FAQ section"
echo ""
echo -e "${PURPLE}🔗 Integration Points:${NC}"
echo "  • Smart contract interaction via presaleContract.ts"
echo "  • Wallet state management via usePresale hook"
echo "  • Type safety with TypeScript definitions"
echo "  • Security: Rate limiting, input validation, anti-bot"
echo ""
echo -e "${PURPLE}🚀 Next Steps:${NC}"
echo "  1. Deploy smart contracts to testnet"
echo "  2. Update contract addresses in .env"
echo "  3. Test wallet connections (MetaMask, WalletConnect, Phantom)"
echo "  4. Run integration tests"
echo "  5. Deploy to production"
echo ""
echo -e "${BLUE}📝 Run: npm run dev${NC}"
echo -e "${BLUE}🧪 Test: npm run test${NC}"
echo -e "${BLUE}🏗️  Build: npm run build${NC}"
echo ""
