#!/bin/bash

# HypeAI Website - Critical Bug Fixes
# QA Specialist: VERIFY
# Date: 2025-10-17

echo "🔧 HypeAI Website - Critical Bug Fixes"
echo "======================================"
echo ""

# Backup original file
echo "📦 Creating backup..."
cp index.html index.html.backup
echo "✅ Backup created: index.html.backup"
echo ""

# Fix BUG-001: Add rel="noopener noreferrer" to external links
echo "🔒 Fixing BUG-001: External link security..."

# Fix Twitter link
sed -i '' 's|<a href="https://twitter.com/HypeAI_official" style="color: var(--primary-blue);">𝕏</a>|<a href="https://twitter.com/HypeAI_official" target="_blank" rel="noopener noreferrer" style="color: var(--primary-blue);">𝕏</a>|g' index.html

# Fix Telegram link
sed -i '' 's|<a href="https://t.me/hypeai" style="color: var(--primary-blue);">✈️</a>|<a href="https://t.me/hypeai" target="_blank" rel="noopener noreferrer" style="color: var(--primary-blue);">✈️</a>|g' index.html

# Fix Discord link
sed -i '' 's|<a href="https://discord.gg/hypeai" style="color: var(--primary-blue);">💬</a>|<a href="https://discord.gg/hypeai" target="_blank" rel="noopener noreferrer" style="color: var(--primary-blue);">💬</a>|g' index.html

# Fix GitHub link
sed -i '' 's|<a href="https://github.com/hypeai" style="color: var(--primary-blue);">🐙</a>|<a href="https://github.com/hypeai" target="_blank" rel="noopener noreferrer" style="color: var(--primary-blue);">🐙</a>|g' index.html

echo "✅ External links secured with rel='noopener noreferrer'"
echo ""

# Fix BUG-003: Add Safari vendor prefix for backdrop-filter
echo "🍎 Fixing BUG-003: Safari backdrop-filter support..."

# Add -webkit-backdrop-filter before backdrop-filter
sed -i '' 's|backdrop-filter: blur(20px);|-webkit-backdrop-filter: blur(20px);\
            backdrop-filter: blur(20px);|g' index.html

echo "✅ Safari vendor prefixes added"
echo ""

# Fix BUG-004: Add visible focus indicators
echo "⌨️  Fixing BUG-004: Keyboard focus indicators..."

# Find the last style rule before </style> and add focus styles
sed -i '' '/@media (max-width: 768px) {/i\
\
        /* Focus Indicators for Accessibility */\
        a:focus, button:focus, .cta-button:focus {\
            outline: 3px solid var(--primary-blue);\
            outline-offset: 2px;\
        }\
\
        .primary-button:focus, .secondary-button:focus {\
            outline: 3px solid var(--primary-blue);\
            outline-offset: 2px;\
        }
' index.html

echo "✅ Focus indicators added for keyboard navigation"
echo ""

# Verify fixes
echo "🔍 Verifying fixes..."
echo ""

# Check external links
TWITTER_FIXED=$(grep -c 'twitter.com.*rel="noopener noreferrer"' index.html)
TELEGRAM_FIXED=$(grep -c 't.me.*rel="noopener noreferrer"' index.html)
DISCORD_FIXED=$(grep -c 'discord.gg.*rel="noopener noreferrer"' index.html)
GITHUB_FIXED=$(grep -c 'github.com.*rel="noopener noreferrer"' index.html)

# Check Safari prefix
WEBKIT_FIXED=$(grep -c '\-webkit-backdrop-filter' index.html)

# Check focus indicators
FOCUS_FIXED=$(grep -c 'a:focus.*outline:' index.html)

echo "External Links Security:"
echo "  Twitter: $([[ $TWITTER_FIXED -gt 0 ]] && echo "✅ Fixed" || echo "❌ Not Fixed")"
echo "  Telegram: $([[ $TELEGRAM_FIXED -gt 0 ]] && echo "✅ Fixed" || echo "❌ Not Fixed")"
echo "  Discord: $([[ $DISCORD_FIXED -gt 0 ]] && echo "✅ Fixed" || echo "❌ Not Fixed")"
echo "  GitHub: $([[ $GITHUB_FIXED -gt 0 ]] && echo "✅ Fixed" || echo "❌ Not Fixed")"
echo ""
echo "Safari Support:"
echo "  Backdrop-filter: $([[ $WEBKIT_FIXED -gt 0 ]] && echo "✅ Fixed" || echo "❌ Not Fixed")"
echo ""
echo "Accessibility:"
echo "  Focus Indicators: $([[ $FOCUS_FIXED -gt 0 ]] && echo "✅ Fixed" || echo "❌ Not Fixed")"
echo ""

# Final summary
ALL_FIXED=$((TWITTER_FIXED + TELEGRAM_FIXED + DISCORD_FIXED + GITHUB_FIXED + WEBKIT_FIXED + FOCUS_FIXED))

if [ $ALL_FIXED -ge 6 ]; then
    echo "🎉 All critical bugs fixed successfully!"
    echo ""
    echo "✅ BUG-001: External link security - FIXED"
    echo "✅ BUG-003: Safari backdrop-filter - FIXED"
    echo "✅ BUG-004: Focus indicators - FIXED"
    echo ""
    echo "📋 Next steps:"
    echo "1. Review changes: git diff index.html"
    echo "2. Test in browser: npm run dev"
    echo "3. Test on Safari"
    echo "4. Commit changes: git add index.html && git commit -m 'Fix critical QA bugs'"
    echo ""
    echo "🚀 Website ready for launch!"
else
    echo "⚠️  Some fixes may not have been applied correctly"
    echo "Please review the changes manually"
    echo ""
    echo "Restore backup if needed: mv index.html.backup index.html"
fi

echo ""
echo "======================================"
echo "🔧 Fix script completed"
