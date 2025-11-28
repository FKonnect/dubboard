#!/bin/bash
# Quick fix script for container restart loops
# This script fixes common issues that cause Supabase containers to restart

set -e

echo "🔧 Fixing Supabase container restart loops..."

# Check if we're in the right directory
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ Error: docker-compose.yml not found. Please run this script from the project root."
    exit 1
fi

# Check if POSTGRES_PASSWORD is set
if [ -z "$POSTGRES_PASSWORD" ]; then
    echo "⚠️  Warning: POSTGRES_PASSWORD not set. Loading from .env file..."
    if [ -f ".env" ]; then
        export $(grep -v '^#' .env | xargs)
    else
        echo "❌ Error: .env file not found. Please set POSTGRES_PASSWORD environment variable."
        exit 1
    fi
fi

if [ -z "$POSTGRES_PASSWORD" ]; then
    echo "❌ Error: POSTGRES_PASSWORD is still not set."
    exit 1
fi

echo "📦 Running database migration to fix missing roles..."
docker exec -i supabase_db_dubboard psql -U supabase_admin -d postgres < migration_009_fix_missing_roles.sql

echo "🔑 Setting passwords for database users..."
docker exec -i supabase_db_dubboard psql -U supabase_admin -d postgres <<EOF
ALTER ROLE authenticator WITH PASSWORD '${POSTGRES_PASSWORD}';
ALTER ROLE supabase_storage_admin WITH PASSWORD '${POSTGRES_PASSWORD}';
\q
EOF

echo "🔄 Restarting services in order..."
docker-compose restart db
sleep 5

docker-compose restart meta kong
sleep 5

docker-compose restart auth rest
sleep 5

docker-compose restart storage realtime studio

echo "⏳ Waiting for services to stabilize..."
sleep 10

echo "📊 Checking service status..."
docker-compose ps

echo "✅ Done! Check the status above. If services are still restarting, check logs with:"
echo "   docker-compose logs <service-name> --tail 50"

