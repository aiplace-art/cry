#!/bin/bash

# Create PostgreSQL user and database for HypeAI

set -e

echo "🔐 Creating PostgreSQL user and database for HypeAI"
echo ""

# Load configuration
if [ -f "$(dirname "$0")/../.env.database" ]; then
    source "$(dirname "$0")/../.env.database"
fi

DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-hypeai}"
DB_USER="${DB_USER:-hypeai_user}"
DB_PASSWORD="${DB_PASSWORD:-hypeai_password}"

echo "Creating user: $DB_USER"
echo "Creating database: $DB_NAME"
echo ""

# Create user
psql -h "$DB_HOST" -p "$DB_PORT" -U postgres -c "
  CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';
" 2>/dev/null || echo "User $DB_USER already exists (OK)"

# Create database
psql -h "$DB_HOST" -p "$DB_PORT" -U postgres -c "
  CREATE DATABASE $DB_NAME OWNER $DB_USER;
" 2>/dev/null || echo "Database $DB_NAME already exists (OK)"

# Grant privileges
psql -h "$DB_HOST" -p "$DB_PORT" -U postgres -c "
  GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;
"

echo ""
echo "✅ User and database created successfully!"
echo ""
echo "You can now run the initialization script:"
echo "   bash scripts/database/init-database.sh"
echo "   or"
echo "   node scripts/database/init-database.js"
echo ""
