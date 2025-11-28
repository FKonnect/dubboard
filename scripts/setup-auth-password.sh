#!/bin/bash
# Script to set the password for supabase_auth_admin role
# This password must match your POSTGRES_PASSWORD environment variable

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Setting password for supabase_auth_admin role...${NC}"

# Check if POSTGRES_PASSWORD is set
if [ -z "$POSTGRES_PASSWORD" ]; then
    echo -e "${RED}Error: POSTGRES_PASSWORD environment variable is not set${NC}"
    echo "Please set it in your .env file or export it:"
    echo "  export POSTGRES_PASSWORD=your-password"
    exit 1
fi

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}Error: docker-compose is not installed${NC}"
    exit 1
fi

# Check if the database container is running
if ! docker ps | grep -q supabase_db_dubboard; then
    echo -e "${RED}Error: Database container (supabase_db_dubboard) is not running${NC}"
    echo "Please start your Docker containers first:"
    echo "  docker-compose up -d"
    exit 1
fi

# Set the password
echo -e "${YELLOW}Setting password for supabase_auth_admin...${NC}"
docker exec -i supabase_db_dubboard psql -U supabase_admin -d postgres <<EOF
ALTER ROLE supabase_auth_admin WITH PASSWORD '${POSTGRES_PASSWORD}';
\q
EOF

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Password set successfully for supabase_auth_admin${NC}"
    echo -e "${YELLOW}Next steps:${NC}"
    echo "  1. Restart the auth service: docker-compose restart auth"
    echo "  2. Check auth logs: docker-compose logs auth"
    echo "  3. Verify auth.users exists: docker exec -it supabase_db_dubboard psql -U supabase_admin -d postgres -c \"SELECT table_name FROM information_schema.tables WHERE table_schema = 'auth';\""
else
    echo -e "${RED}✗ Failed to set password${NC}"
    exit 1
fi

