#!/bin/bash

# HypeAI Database Initialization Script
# This script sets up the unified PostgreSQL database for all AI agents

set -e  # Exit on error

echo "🗄️  HypeAI Database Initialization"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Load environment variables
if [ -f "$(dirname "$0")/../.env.database" ]; then
    source "$(dirname "$0")/../.env.database"
    echo "✅ Loaded database configuration"
else
    echo "⚠️  No .env.database found, using defaults"
    export DB_HOST="${DB_HOST:-localhost}"
    export DB_PORT="${DB_PORT:-5432}"
    export DB_NAME="${DB_NAME:-hypeai}"
    export DB_USER="${DB_USER:-hypeai_user}"
    export DB_PASSWORD="${DB_PASSWORD:-hypeai_password}"
fi

echo ""
echo "📋 Database Configuration:"
echo "   Host: $DB_HOST"
echo "   Port: $DB_PORT"
echo "   Database: $DB_NAME"
echo "   User: $DB_USER"
echo ""

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL client (psql) not found!"
    echo "   Install it: brew install postgresql (macOS)"
    echo "             : sudo apt install postgresql-client (Ubuntu)"
    exit 1
fi

echo "✅ PostgreSQL client found"
echo ""

# Check if PostgreSQL is running
if ! pg_isready -h "$DB_HOST" -p "$DB_PORT" &> /dev/null; then
    echo "⚠️  PostgreSQL server not responding on $DB_HOST:$DB_PORT"
    echo ""
    echo "Starting PostgreSQL server..."

    # Try to start PostgreSQL
    if command -v brew &> /dev/null; then
        brew services start postgresql@14 || brew services start postgresql
        sleep 3
    elif command -v systemctl &> /dev/null; then
        sudo systemctl start postgresql
        sleep 3
    else
        echo "❌ Could not start PostgreSQL automatically"
        echo "   Please start PostgreSQL manually and run this script again"
        exit 1
    fi

    # Check again
    if ! pg_isready -h "$DB_HOST" -p "$DB_PORT" &> /dev/null; then
        echo "❌ PostgreSQL still not responding"
        exit 1
    fi
fi

echo "✅ PostgreSQL server is running"
echo ""

# Create database if it doesn't exist
echo "📦 Creating database '$DB_NAME'..."
createdb -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" "$DB_NAME" 2>/dev/null || echo "   Database already exists (OK)"
echo ""

# Run schema
echo "📝 Applying database schema..."
SCHEMA_FILE="$(dirname "$0")/../../config/database/schema.sql"

if [ ! -f "$SCHEMA_FILE" ]; then
    echo "❌ Schema file not found: $SCHEMA_FILE"
    exit 1
fi

psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$SCHEMA_FILE" -v ON_ERROR_STOP=1

if [ $? -eq 0 ]; then
    echo "✅ Schema applied successfully"
else
    echo "❌ Schema application failed"
    exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Database initialization complete!"
echo ""
echo "📊 Database Statistics:"
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "\dt" -q
echo ""
echo "🚀 You can now start the database coordinator agent:"
echo "   node src/bots/database-coordinator-agent.js"
echo ""
