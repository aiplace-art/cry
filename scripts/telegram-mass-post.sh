#!/bin/bash

# 📱 TELEGRAM MASS POSTING AUTOMATION
# Helps you post in multiple crypto groups efficiently

cd "$(dirname "$0")/.."

echo "════════════════════════════════════════════"
echo "📱 TELEGRAM MASS POSTING TOOL"
echo "════════════════════════════════════════════"
echo ""

# Load prepared messages
MESSAGES_FILE="marketing/TELEGRAM_POSTS.md"

if [ ! -f "$MESSAGES_FILE" ]; then
    echo "❌ Messages file not found: $MESSAGES_FILE"
    exit 1
fi

echo "📋 Available Message Templates:"
echo ""
echo "1. 🚀 Intro Post (Short)"
echo "2. 📝 Intro Post (Detailed)"
echo "3. ❓ Engagement Post"
echo "4. 🎁 Airdrop Announcement"
echo "5. 🏆 Contest Announcement"
echo "6. 💬 AMA Invitation"
echo ""

read -p "Select template (1-6): " template

# Extract message based on selection
case $template in
    1)
        MESSAGE="🚀 HypeAI - AI встречает DeFi!

🤖 87% точность предсказаний
💰 62% APY стакинг
🗳️ DAO управление

📅 Запуск: 15 ноября
🔗 t.me/hypeai

#HypeAI #DeFi #Solana"
        ;;
    2)
        MESSAGE="🔥 Встречайте HypeAI - революция в DeFi!

🤖 AI-Powered Trading (87% точность)
💰 До 62% APY стакинг
🗳️ True DAO управление
🎁 1,000,000 HYPE airdrop

📅 Запуск: 15 ноября 2025
🌐 https://hypeai.io
📱 t.me/hypeai

Присоединяйся к революции! 🚀"
        ;;
    3)
        MESSAGE="❓ Устал от 5% APY в DeFi?

HypeAI предлагает:
💎 До 62% APY
🤖 AI торговые сигналы
🗳️ DAO управление

⏰ Запуск через 30 дней

Кто со мной? 🚀👇

t.me/hypeai"
        ;;
    4)
        MESSAGE="🎁 MASSIVE AIRDROP! 🎁

1,000,000 HYPE раздаем!

✅ Join t.me/hypeai
✅ Follow Twitter
✅ RT & Tag friends

⏰ 48 hours only!

https://hypeai.io/airdrop

LFG! 🚀"
        ;;
    5)
        MESSAGE="🏆 REFERRAL COMPETITION!

Приглашай друзей = зарабатывай!

🥇 50,000 HYPE
🥈 30,000 HYPE
🥉 20,000 HYPE

+ 100 HYPE за каждого реферала

Твоя ссылка: /referral 🚀"
        ;;
    6)
        MESSAGE="💬 HypeAI AMA Session!

📅 Дата: [Укажи]
⏰ Время: [Укажи]
🎁 Призы: 10,000 HYPE

Задавай вопросы о:
• AI технологии
• Стакинге
• Запуске

See you there! 🚀"
        ;;
    *)
        echo "❌ Invalid selection"
        exit 1
        ;;
esac

echo ""
echo "════════════════════════════════════════════"
echo "📝 SELECTED MESSAGE:"
echo "════════════════════════════════════════════"
echo "$MESSAGE"
echo "════════════════════════════════════════════"
echo ""

# Copy to clipboard (macOS)
echo "$MESSAGE" | pbcopy 2>/dev/null && echo "✅ Message copied to clipboard!" || echo "📋 Copy manually from above"

echo ""
echo "🎯 TARGET GROUPS (Top 20 for today):"
echo ""
echo "1. Crypto Signals (1.2M members)"
echo "2. Binance English (980K members)"
echo "3. Bitcoin Global (850K members)"
echo "4. Altcoin Daily (720K members)"
echo "5. CryptoMoonShots (650K members)"
echo "6. Trading View Crypto (580K members)"
echo "7. DeFi Pulse (450K members)"
echo "8. Uniswap Community (420K members)"
echo "9. CoinMarketCap Chat (390K members)"
echo "10. CoinGecko Community (350K members)"
echo "11. Solana Official (320K members)"
echo "12. Polygon Community (290K members)"
echo "13. Ethereum Traders (270K members)"
echo "14. Crypto News Live (250K members)"
echo "15. NFT & DeFi Hub (230K members)"
echo "16. Yield Farming (210K members)"
echo "17. Staking Rewards (190K members)"
echo "18. DAO Makers (170K members)"
echo "19. Crypto Whales (150K members)"
echo "20. DeFi Degen (140K members)"
echo ""

echo "💡 POSTING TIPS:"
echo ""
echo "✅ DO:"
echo "   • Read group rules first"
echo "   • Add value to conversation"
echo "   • Respond to questions"
echo "   • Be genuine and helpful"
echo "   • Space posts 10-15 min apart"
echo ""
echo "❌ DON'T:"
echo "   • Spam multiple times"
echo "   • Ignore group rules"
echo "   • Be overly promotional"
echo "   • Post in wrong channels"
echo ""

echo "📊 TRACKING:"
echo ""
echo "After posting, track:"
echo "   • Clicks on link"
echo "   • New Telegram joins"
echo "   • Questions/Replies"
echo "   • Group response"
echo ""

echo "🎯 Target: 5-10 groups/hour"
echo "📈 Expected: 10-20 joins/day"
echo ""
echo "Good luck! 🚀"
echo ""

# Ask if user wants posting schedule
read -p "Generate today's posting schedule? (y/n): " schedule

if [ "$schedule" = "y" ]; then
    echo ""
    echo "📅 TODAY'S POSTING SCHEDULE:"
    echo ""
    echo "10:00 - Group 1-3"
    echo "11:00 - Group 4-6"
    echo "12:00 - Group 7-9"
    echo "14:00 - Group 10-12"
    echo "15:00 - Group 13-15"
    echo "16:00 - Group 16-18"
    echo "17:00 - Group 19-20"
    echo ""
    echo "💡 Use timer to stay on schedule!"
fi

echo ""
echo "════════════════════════════════════════════"
echo "✅ Ready to post! Message is in clipboard"
echo "════════════════════════════════════════════"
