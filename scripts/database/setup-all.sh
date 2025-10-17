#!/bin/bash

# HypeAI Complete Database Setup
# This script sets up everything needed for the unified database

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 HypeAI Complete Database Setup"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

cd "$PROJECT_ROOT"

# Step 1: Check PostgreSQL
echo "📋 Step 1/5: Checking PostgreSQL installation..."
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL not found!"
    echo ""
    echo "Please install PostgreSQL first:"
    echo "  macOS:   brew install postgresql@14"
    echo "  Ubuntu:  sudo apt install postgresql"
    echo "  Windows: Download from postgresql.org"
    echo ""
    exit 1
fi
echo "✅ PostgreSQL found"
echo ""

# Step 2: Start PostgreSQL
echo "📋 Step 2/5: Starting PostgreSQL service..."
if command -v brew &> /dev/null; then
    brew services start postgresql@14 2>/dev/null || brew services start postgresql 2>/dev/null || true
elif command -v systemctl &> /dev/null; then
    sudo systemctl start postgresql 2>/dev/null || true
fi

sleep 2

if pg_isready -h localhost -p 5432 &> /dev/null; then
    echo "✅ PostgreSQL is running"
else
    echo "⚠️  PostgreSQL may not be running"
    echo "   Try starting it manually"
fi
echo ""

# Step 3: Create user and database
echo "📋 Step 3/5: Creating database user and database..."
if [ -f "$SCRIPT_DIR/create-user.sh" ]; then
    bash "$SCRIPT_DIR/create-user.sh" || echo "⚠️  User creation had issues (may already exist)"
else
    echo "⚠️  create-user.sh not found, skipping"
fi
echo ""

# Step 4: Initialize database schema
echo "📋 Step 4/5: Initializing database schema..."
if [ -f "$SCRIPT_DIR/init-database.js" ]; then
    node "$SCRIPT_DIR/init-database.js"
else
    echo "❌ init-database.js not found!"
    exit 1
fi
echo ""

# Step 5: Install dependencies
echo "📋 Step 5/5: Installing Node.js dependencies..."
cd "$PROJECT_ROOT"

if [ ! -d "node_modules/pg" ]; then
    echo "Installing pg (PostgreSQL driver)..."
    npm install pg dotenv
else
    echo "✅ Dependencies already installed"
fi
echo ""

# Success!
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Database setup complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 Next steps:"
echo ""
echo "1. Start the Database Coordinator Agent:"
echo "   node src/bots/database-coordinator-agent.js"
echo ""
echo "2. Update your existing agents to use the database:"
echo "   See: docs/DATABASE_GUIDE.md"
echo ""
echo "3. Verify database connection:"
echo "   psql -U hypeai_user -d hypeai -c '\\dt'"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
