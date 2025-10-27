#!/bin/bash
# Production Cleanup Script
# Automatically removes test files and optimizes images

set -e  # Exit on error

echo "🚀 HypeAI Production Cleanup Script"
echo "===================================="
echo ""

cd public/variant-2

# Step 1: Delete test files
echo "🧹 Step 1: Deleting test files..."
rm -f test-*.html *demo*.html ai-*-demo.html 2>/dev/null || true
rm -rf tests/ 2>/dev/null || true
echo "✅ Test files deleted"
echo ""

# Step 2: Optimize images (if tools available)
echo "🖼️  Step 2: Optimizing images..."
if command -v optipng &> /dev/null; then
    find . -name "*.png" -exec optipng -o7 {} \; 2>/dev/null || true
    echo "✅ PNG optimization complete"
else
    echo "⚠️  optipng not found - skipping PNG optimization"
    echo "   Install: brew install optipng"
fi

if command -v jpegoptim &> /dev/null; then
    find . -name "*.jpg" -exec jpegoptim --strip-all -m85 {} \; 2>/dev/null || true
    echo "✅ JPEG optimization complete"
else
    echo "⚠️  jpegoptim not found - skipping JPEG optimization"
    echo "   Install: brew install jpegoptim"
fi
echo ""

# Step 3: Check folder size
echo "📊 Step 3: Folder size after cleanup:"
du -sh .
echo ""

# Step 4: Git commit
cd ../..
echo "📝 Step 4: Committing changes..."
git add .
git commit -m "🧹 Production cleanup: Remove test files, optimize images" || echo "⚠️  Nothing to commit (already clean)"
echo "✅ Changes committed"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 CLEANUP COMPLETE!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Next steps:"
echo "1. Deploy to staging: vercel --prod"
echo "2. Run Lighthouse audit"
echo "3. Fix critical bugs from test report"
echo "4. 🚀 Production launch in 4 days!"
echo ""
