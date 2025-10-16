#!/bin/bash

################################################################################
# pump.fun Listing Script
#
# This script provides instructions and automation for listing tokens on pump.fun
#
# Usage: ./05-list-on-pumpfun.sh --token <MINT_ADDRESS> [OPTIONS]
################################################################################

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --token)
            TOKEN_MINT="$2"
            shift 2
            ;;
        --auto)
            AUTO_MODE=true
            shift
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            echo "Usage: $0 --token <MINT_ADDRESS>"
            exit 1
            ;;
    esac
done

# Validate required arguments
if [ -z "$TOKEN_MINT" ]; then
    echo -e "${RED}Error: Token mint address is required${NC}"
    echo "Usage: $0 --token <MINT_ADDRESS>"
    exit 1
fi

echo -e "${GREEN}=== pump.fun Listing Guide ===${NC}"
echo ""
echo "Token Mint: $TOKEN_MINT"
echo ""

# Check if wallet is connected
WALLET_ADDRESS=$(solana address 2>/dev/null || echo "")
if [ -z "$WALLET_ADDRESS" ]; then
    echo -e "${RED}Error: No Solana wallet configured${NC}"
    echo "Create a wallet first with: ./02-create-wallet.sh"
    exit 1
fi

echo "Wallet Address: $WALLET_ADDRESS"

# Check balance
BALANCE=$(solana balance | awk '{print $1}')
echo "Current Balance: $BALANCE SOL"
echo ""

if (( $(echo "$BALANCE < 0.03" | bc -l) )); then
    echo -e "${YELLOW}Warning: Low balance. Recommended minimum: 0.03 SOL${NC}"
    echo ""
fi

# Display listing options
echo -e "${BLUE}=== Listing Options ===${NC}"
echo ""
echo "pump.fun offers two main ways to list your token:"
echo ""
echo "Option 1: Create New Token (Recommended)"
echo "  - Easiest method"
echo "  - pump.fun creates the token for you"
echo "  - Automatic bonding curve setup"
echo "  - Cost: 0.02 SOL"
echo ""
echo "Option 2: Import Existing Token"
echo "  - For tokens already created via CLI"
echo "  - Requires manual configuration"
echo "  - Your token: $TOKEN_MINT"
echo ""

read -p "Choose option (1 or 2): " OPTION
echo ""

case $OPTION in
    1)
        echo -e "${GREEN}=== Option 1: Create Token via pump.fun ===${NC}"
        echo ""
        echo "Steps to follow:"
        echo ""
        echo "1. Visit https://pump.fun"
        echo ""
        echo "2. Click 'Connect Wallet' (top right)"
        echo "   - Select your wallet (Phantom, Solflare, etc.)"
        echo "   - Approve connection"
        echo ""
        echo "3. Click 'Create Token' or 'Start a New Coin'"
        echo ""
        echo "4. Fill in token details:"
        echo "   - Name: Your token's full name"
        echo "   - Ticker: 3-5 character symbol"
        echo "   - Description: Compelling project description"
        echo "   - Image: Upload logo (512x512px PNG recommended)"
        echo ""
        echo "5. Review and Create:"
        echo "   - Cost: 0.02 SOL"
        echo "   - Click 'Create Coin'"
        echo "   - Approve transaction in wallet"
        echo ""
        echo "6. After Creation:"
        echo "   - Token is immediately live and tradable"
        echo "   - Bonding curve automatically configured"
        echo "   - Graduates to Raydium at \$60k market cap"
        echo "   - You earn 0.05% of all trading fees"
        echo ""
        echo -e "${BLUE}Opening pump.fun in your browser...${NC}"

        # Try to open browser
        if command -v open &> /dev/null; then
            open "https://pump.fun"
        elif command -v xdg-open &> /dev/null; then
            xdg-open "https://pump.fun"
        else
            echo "Please visit: https://pump.fun"
        fi
        ;;

    2)
        echo -e "${GREEN}=== Option 2: Import Existing Token ===${NC}"
        echo ""
        echo "NOTE: pump.fun primarily supports tokens created through their platform."
        echo "Importing existing tokens has limitations and may not be supported."
        echo ""
        echo "Your token mint: $TOKEN_MINT"
        echo ""
        echo "Recommended approach:"
        echo ""
        echo "1. Contact pump.fun Support"
        echo "   - Discord: https://discord.gg/pumpfun"
        echo "   - Twitter: @pumpdotfun"
        echo "   - Explain you have an existing token to list"
        echo ""
        echo "2. Alternative: Use API Integration"
        echo "   - Requires PumpFun API access"
        echo "   - See documentation: https://docs.pumpfunapi.org"
        echo ""
        echo "3. Transfer to pump.fun Bonding Curve"
        echo "   - This may require custom smart contract work"
        echo "   - Not recommended without technical expertise"
        echo ""
        echo -e "${YELLOW}Recommended: Create a new token via pump.fun's interface instead${NC}"
        ;;

    *)
        echo -e "${RED}Invalid option${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${BLUE}=== Best Practices ===${NC}"
echo ""
echo "1. Token Design:"
echo "   - Create compelling artwork (512x512px)"
echo "   - Write engaging description"
echo "   - Have clear tokenomics"
echo ""
echo "2. Initial Launch:"
echo "   - Be online during launch"
echo "   - Engage with early traders"
echo "   - Provide liquidity if needed"
echo ""
echo "3. Marketing:"
echo "   - Create Twitter/X account"
echo "   - Join relevant communities"
echo "   - Consider influencer partnerships"
echo "   - Build Telegram/Discord community"
echo ""
echo "4. Post-Launch:"
echo "   - Monitor trading activity"
echo "   - Respond to community questions"
echo "   - Track progress toward \$60k (Raydium graduation)"
echo "   - Consider adding utilities/features"
echo ""

echo -e "${GREEN}=== Important Reminders ===${NC}"
echo ""
echo "- Trading Fee: 1% per transaction on pump.fun"
echo "- Creator Earnings: 0.05% of all trades"
echo "- Graduation: Automatic at \$60k market cap"
echo "- Bonding Curve: 800M tokens available for trading"
echo "- Remaining 200M: Sent to Raydium at graduation"
echo ""

# Create checklist file
CHECKLIST_FILE="$HOME/solana-tokens/pumpfun-checklist-${TOKEN_MINT}.md"
cat > "$CHECKLIST_FILE" << EOF
# pump.fun Launch Checklist

Token Mint: $TOKEN_MINT
Wallet: $WALLET_ADDRESS
Date: $(date)

## Pre-Launch
- [ ] Token logo created (512x512px PNG)
- [ ] Token name and symbol decided
- [ ] Description written
- [ ] Tokenomics planned
- [ ] Wallet funded (minimum 0.03 SOL)
- [ ] Social media accounts created
- [ ] Community channels set up (Discord/Telegram)

## Launch Day
- [ ] Visit pump.fun
- [ ] Connect wallet
- [ ] Create/import token
- [ ] Verify details are correct
- [ ] Approve transaction
- [ ] Confirm token is live
- [ ] Make initial purchase (optional)
- [ ] Share on social media

## Post-Launch (First Hour)
- [ ] Monitor trading activity
- [ ] Engage with early traders
- [ ] Answer community questions
- [ ] Share updates on social media
- [ ] Track price and market cap

## First 24 Hours
- [ ] Continue community engagement
- [ ] Monitor for issues
- [ ] Share milestones
- [ ] Plan next steps
- [ ] Consider marketing campaigns

## Growth Phase
- [ ] Build holder base
- [ ] Create utilities/features
- [ ] Partner with other projects
- [ ] List on additional platforms
- [ ] Prepare for Raydium graduation (\$60k)

## Resources
- pump.fun: https://pump.fun
- Token Explorer: https://solscan.io/token/$TOKEN_MINT
- Community: Discord, Telegram
- Analytics: Dextools, Birdeye

## Notes
(Add your notes here)
EOF

echo "Launch checklist saved to: $CHECKLIST_FILE"
echo ""

# Display useful links
echo -e "${BLUE}=== Useful Links ===${NC}"
echo ""
echo "pump.fun: https://pump.fun"
echo "Token Explorer: https://solscan.io/token/$TOKEN_MINT"
echo "Dextools: https://dexscreener.com/solana/$TOKEN_MINT"
echo "Birdeye: https://birdeye.so/token/$TOKEN_MINT?chain=solana"
echo ""

# Export for convenience
export SOLANA_TOKEN_MINT="$TOKEN_MINT"

echo -e "${GREEN}=== Ready to Launch! ===${NC}"
echo ""
echo "Good luck with your token launch on pump.fun!"
echo ""
