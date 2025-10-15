#!/bin/bash

# HypeAI Influencer Outreach Script
# Generates personalized outreach emails for crypto influencers

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}🎯 HypeAI Influencer Outreach Generator${NC}\n"

# Influencer database
declare -A INFLUENCERS

# Tier 1: Mega Influencers
INFLUENCERS["bitboy"]="BitBoy Crypto|bitboy@example.com|YouTube|1M|15000"
INFLUENCERS["coinbureau"]="Coin Bureau|guy@coinbureau.com|YouTube|2M|20000"
INFLUENCERS["altcoindaily"]="Altcoin Daily|team@altcoindaily.com|YouTube|1.5M|18000"

# Tier 2: Macro Influencers
INFLUENCERS["cryptorus"]="Crypto Rover|rover@example.com|YouTube|500K|8000"
INFLUENCERS["mmcrypto"]="MMCrypto|mm@example.com|YouTube|400K|7000"
INFLUENCERS["cryptobanter"]="Crypto Banter|banter@example.com|YouTube|600K|10000"

# Tier 3: Micro Influencers
INFLUENCERS["cryptolark"]="Crypto Lark|lark@example.com|YouTube|100K|3000"
INFLUENCERS["cryptozombie"]="Crypto Zombie|zombie@example.com|YouTube|80K|2500"

# Email template generator
generate_email() {
  local name=$1
  local email=$2
  local platform=$3
  local followers=$4
  local price=$5

  cat <<EOF
================================================================================
TO: $email
SUBJECT: Partnership Opportunity - HypeAI ($HYPE) 🚀

Hi $name,

I hope this email finds you well! I'm reaching out from HypeAI, an innovative
blockchain project that's combining artificial intelligence with DeFi.

WHO WE ARE:
HypeAI is not just another token - we're building real AI-powered infrastructure
for predictive trading, automated signals, and decentralized governance.

Our tech stack includes:
- Machine Learning models (LSTM, Transformer, FinBERT)
- Smart contracts with staking (17-62% APY)
- DAO governance system
- AI Oracle for on-chain predictions

WHY PARTNER WITH US:
✅ Real product (not vaporware)
✅ Audited smart contracts
✅ Experienced team
✅ Strong tokenomics
✅ Growing community (20K+ members)
✅ Target: \$100M market cap

WHAT WE'RE OFFERING:
💰 Compensation: \$$price + 50,000 HYPE tokens
📱 Platform: $platform
📊 Followers: $followers
🎯 Content: Custom based on your style

PROPOSED CONTENT:
- 1x Dedicated video/post (10-15 min)
- 3x Social media posts
- 1x Twitter Space / AMA
- Exclusive early access for your community

TIMELINE:
- Contract signing: Within 7 days
- Content creation: Flexible with your schedule
- Launch coordination: We'll support you fully

BONUS:
Your audience gets:
- 10% presale discount code
- Exclusive airdrop allocation
- Early access to AI features

Would you be interested in discussing this further? I'd love to hop on a quick
call to share more details and answer any questions.

Looking forward to hearing from you!

Best regards,
HypeAI Team

🌐 Website: https://hypeai.io
📱 Telegram: https://t.me/hypeai
🐦 Twitter: @hypeai
📧 Email: partnerships@hypeai.io

P.S. We're launching in 2 weeks, so this is a time-sensitive opportunity for
early supporters to get in at the best terms!
================================================================================

EOF
}

# Generate all emails
echo -e "${YELLOW}Generating personalized outreach emails...${NC}\n"

mkdir -p "$PROJECT_ROOT/.marketing/outreach"

for key in "${!INFLUENCERS[@]}"; do
  IFS='|' read -r name email platform followers price <<< "${INFLUENCERS[$key]}"

  output_file="$PROJECT_ROOT/.marketing/outreach/${key}_email.txt"
  generate_email "$name" "$email" "$platform" "$followers" "$price" > "$output_file"

  echo -e "${GREEN}✅ Generated: $output_file${NC}"
done

echo -e "\n${BLUE}📧 All outreach emails generated!${NC}"
echo -e "${YELLOW}Location: $PROJECT_ROOT/.marketing/outreach/${NC}\n"

# Generate tracking spreadsheet
cat > "$PROJECT_ROOT/.marketing/outreach/tracking.csv" <<EOF
Name,Email,Platform,Followers,Price,Status,Date Contacted,Response,Notes
BitBoy Crypto,bitboy@example.com,YouTube,1M,15000,Not Contacted,,,
Coin Bureau,guy@coinbureau.com,YouTube,2M,20000,Not Contacted,,,
Altcoin Daily,team@altcoindaily.com,YouTube,1.5M,18000,Not Contacted,,,
Crypto Rover,rover@example.com,YouTube,500K,8000,Not Contacted,,,
MMCrypto,mm@example.com,YouTube,400K,7000,Not Contacted,,,
Crypto Banter,banter@example.com,YouTube,600K,10000,Not Contacted,,,
Crypto Lark,lark@example.com,YouTube,100K,3000,Not Contacted,,,
Crypto Zombie,zombie@example.com,YouTube,80K,2500,Not Contacted,,,
EOF

echo -e "${GREEN}✅ Tracking spreadsheet created: tracking.csv${NC}\n"

# Summary
echo -e "${BLUE}📊 Summary:${NC}"
echo -e "  Total influencers: ${#INFLUENCERS[@]}"
echo -e "  Tier 1 (Mega): 3"
echo -e "  Tier 2 (Macro): 3"
echo -e "  Tier 3 (Micro): 2"
echo -e "  Estimated total reach: 5M+"
echo -e "  Total budget: \$80,000-\$100,000"
echo ""

echo -e "${YELLOW}Next Steps:${NC}"
echo "1. Review generated emails"
echo "2. Customize for each influencer"
echo "3. Send emails manually or via automation"
echo "4. Track responses in tracking.csv"
echo "5. Follow up after 3-5 days"
echo ""

echo -e "${GREEN}🚀 Ready to launch influencer campaign!${NC}"
