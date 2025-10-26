#!/bin/bash

# ============================================
# HypeAI Chat Minification Script
# Minifies JS and CSS for production
# ============================================

set -e  # Exit on error

echo "🚀 Starting HypeAI Chat Minification..."
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Directories
SOURCE_DIR="/Users/ai.place/Crypto/public/variant-2"
JS_DIR="$SOURCE_DIR/js"
CSS_DIR="$SOURCE_DIR/css"

# Check if terser is installed
if ! command -v terser &> /dev/null; then
    echo -e "${YELLOW}⚠️  terser not found. Installing...${NC}"
    npm install -g terser
fi

# Check if csso is installed
if ! command -v csso &> /dev/null; then
    echo -e "${YELLOW}⚠️  csso not found. Installing...${NC}"
    npm install -g csso-cli
fi

echo ""
echo -e "${BLUE}📦 Minifying JavaScript files...${NC}"

# Minify ai-chat-premium.js
echo "  → ai-chat-premium.js"
terser "$JS_DIR/ai-chat-premium.js" \
    -o "$JS_DIR/ai-chat-premium.min.js" \
    -c -m \
    --source-map "url='ai-chat-premium.min.js.map'" \
    2>/dev/null

if [ $? -eq 0 ]; then
    ORIGINAL_SIZE=$(wc -c < "$JS_DIR/ai-chat-premium.js" | tr -d ' ')
    MINIFIED_SIZE=$(wc -c < "$JS_DIR/ai-chat-premium.min.js" | tr -d ' ')
    REDUCTION=$(echo "scale=1; 100 - ($MINIFIED_SIZE * 100 / $ORIGINAL_SIZE)" | bc)
    echo -e "    ${GREEN}✓${NC} Minified: $(($ORIGINAL_SIZE / 1024))KB → $(($MINIFIED_SIZE / 1024))KB (${REDUCTION}% reduction)"
else
    echo -e "    ${YELLOW}⚠️  Skipped (errors)${NC}"
fi

# Minify chat-features.js
echo "  → chat-features.js"
terser "$JS_DIR/chat-features.js" \
    -o "$JS_DIR/chat-features.min.js" \
    -c -m \
    --source-map "url='chat-features.min.js.map'" \
    2>/dev/null

if [ $? -eq 0 ]; then
    ORIGINAL_SIZE=$(wc -c < "$JS_DIR/chat-features.js" | tr -d ' ')
    MINIFIED_SIZE=$(wc -c < "$JS_DIR/chat-features.min.js" | tr -d ' ')
    REDUCTION=$(echo "scale=1; 100 - ($MINIFIED_SIZE * 100 / $ORIGINAL_SIZE)" | bc)
    echo -e "    ${GREEN}✓${NC} Minified: $(($ORIGINAL_SIZE / 1024))KB → $(($MINIFIED_SIZE / 1024))KB (${REDUCTION}% reduction)"
else
    echo -e "    ${YELLOW}⚠️  Skipped (errors)${NC}"
fi

echo ""
echo -e "${BLUE}🎨 Minifying CSS files...${NC}"

# Minify ai-chat-premium.css
echo "  → ai-chat-premium.css"
csso "$CSS_DIR/ai-chat-premium.css" \
    --output "$CSS_DIR/ai-chat-premium.min.css" \
    --source-map file \
    2>/dev/null

if [ $? -eq 0 ]; then
    ORIGINAL_SIZE=$(wc -c < "$CSS_DIR/ai-chat-premium.css" | tr -d ' ')
    MINIFIED_SIZE=$(wc -c < "$CSS_DIR/ai-chat-premium.min.css" | tr -d ' ')
    REDUCTION=$(echo "scale=1; 100 - ($MINIFIED_SIZE * 100 / $ORIGINAL_SIZE)" | bc)
    echo -e "    ${GREEN}✓${NC} Minified: $(($ORIGINAL_SIZE / 1024))KB → $(($MINIFIED_SIZE / 1024))KB (${REDUCTION}% reduction)"
else
    echo -e "    ${YELLOW}⚠️  Skipped (errors)${NC}"
fi

echo ""
echo -e "${BLUE}📊 Creating gzip compressed versions...${NC}"

# Gzip JavaScript
gzip -9 -c "$JS_DIR/ai-chat-premium.min.js" > "$JS_DIR/ai-chat-premium.min.js.gz"
echo -e "  ${GREEN}✓${NC} ai-chat-premium.min.js.gz ($(wc -c < "$JS_DIR/ai-chat-premium.min.js.gz" | tr -d ' ' | xargs -I {} echo "scale=1; {} / 1024" | bc)KB)"

gzip -9 -c "$JS_DIR/chat-features.min.js" > "$JS_DIR/chat-features.min.js.gz"
echo -e "  ${GREEN}✓${NC} chat-features.min.js.gz ($(wc -c < "$JS_DIR/chat-features.min.js.gz" | tr -d ' ' | xargs -I {} echo "scale=1; {} / 1024" | bc)KB)"

# Gzip CSS
gzip -9 -c "$CSS_DIR/ai-chat-premium.min.css" > "$CSS_DIR/ai-chat-premium.min.css.gz"
echo -e "  ${GREEN}✓${NC} ai-chat-premium.min.css.gz ($(wc -c < "$CSS_DIR/ai-chat-premium.min.css.gz" | tr -d ' ' | xargs -I {} echo "scale=1; {} / 1024" | bc)KB)"

echo ""
echo -e "${GREEN}✅ Minification complete!${NC}"
echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  📦 BUNDLE SIZE SUMMARY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

TOTAL_ORIGINAL=0
TOTAL_MINIFIED=0
TOTAL_GZIPPED=0

# JavaScript
JS_ORIGINAL=$(wc -c < "$JS_DIR/ai-chat-premium.js" | tr -d ' ')
JS_MINIFIED=$(wc -c < "$JS_DIR/ai-chat-premium.min.js" | tr -d ' ')
JS_GZIPPED=$(wc -c < "$JS_DIR/ai-chat-premium.min.js.gz" | tr -d ' ')
TOTAL_ORIGINAL=$((TOTAL_ORIGINAL + JS_ORIGINAL))
TOTAL_MINIFIED=$((TOTAL_MINIFIED + JS_MINIFIED))
TOTAL_GZIPPED=$((TOTAL_GZIPPED + JS_GZIPPED))

JS_FEATURES_ORIGINAL=$(wc -c < "$JS_DIR/chat-features.js" | tr -d ' ')
JS_FEATURES_MINIFIED=$(wc -c < "$JS_DIR/chat-features.min.js" | tr -d ' ')
JS_FEATURES_GZIPPED=$(wc -c < "$JS_DIR/chat-features.min.js.gz" | tr -d ' ')
TOTAL_ORIGINAL=$((TOTAL_ORIGINAL + JS_FEATURES_ORIGINAL))
TOTAL_MINIFIED=$((TOTAL_MINIFIED + JS_FEATURES_MINIFIED))
TOTAL_GZIPPED=$((TOTAL_GZIPPED + JS_FEATURES_GZIPPED))

# CSS
CSS_ORIGINAL=$(wc -c < "$CSS_DIR/ai-chat-premium.css" | tr -d ' ')
CSS_MINIFIED=$(wc -c < "$CSS_DIR/ai-chat-premium.min.css" | tr -d ' ')
CSS_GZIPPED=$(wc -c < "$CSS_DIR/ai-chat-premium.min.css.gz" | tr -d ' ')
TOTAL_ORIGINAL=$((TOTAL_ORIGINAL + CSS_ORIGINAL))
TOTAL_MINIFIED=$((TOTAL_MINIFIED + CSS_MINIFIED))
TOTAL_GZIPPED=$((TOTAL_GZIPPED + CSS_GZIPPED))

echo "JavaScript:"
echo "  ai-chat-premium.js:  $(($JS_ORIGINAL / 1024))KB → $(($JS_MINIFIED / 1024))KB → $(($JS_GZIPPED / 1024))KB"
echo "  chat-features.js:    $(($JS_FEATURES_ORIGINAL / 1024))KB → $(($JS_FEATURES_MINIFIED / 1024))KB → $(($JS_FEATURES_GZIPPED / 1024))KB"
echo ""
echo "CSS:"
echo "  ai-chat-premium.css: $(($CSS_ORIGINAL / 1024))KB → $(($CSS_MINIFIED / 1024))KB → $(($CSS_GZIPPED / 1024))KB"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  TOTAL: $(($TOTAL_ORIGINAL / 1024))KB → $(($TOTAL_MINIFIED / 1024))KB → $(($TOTAL_GZIPPED / 1024))KB"

REDUCTION=$(echo "scale=1; 100 - ($TOTAL_MINIFIED * 100 / $TOTAL_ORIGINAL)" | bc)
GZIP_REDUCTION=$(echo "scale=1; 100 - ($TOTAL_GZIPPED * 100 / $TOTAL_ORIGINAL)" | bc)

echo "  Minified: -${REDUCTION}% | Gzipped: -${GZIP_REDUCTION}%"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo -e "${BLUE}💡 Next steps:${NC}"
echo "  1. Test minified files: Open ai-chat.html in browser"
echo "  2. Update HTML to use .min.js and .min.css files"
echo "  3. Configure server to serve .gz files (optional)"
echo ""
echo -e "${GREEN}✨ Done!${NC}"
