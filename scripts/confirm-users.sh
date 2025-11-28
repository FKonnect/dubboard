#!/bin/bash
# Bash script to confirm all unconfirmed users in Supabase auth
# This allows users to sign in without email confirmation

CONTAINER_NAME="${CONTAINER_NAME:-supabase_db_dubboard}"
DB_USER="${DB_USER:-supabase_admin}"
DB_NAME="${DB_NAME:-postgres}"
EMAIL="${EMAIL:-}"

echo "Confirming unconfirmed users..."

if [ -n "$EMAIL" ]; then
    echo "Confirming user: $EMAIL"
    SQL="UPDATE auth.users SET email_confirmed_at = NOW() WHERE email = '$EMAIL' AND email_confirmed_at IS NULL;"
else
    echo "Confirming ALL unconfirmed users..."
    SQL="UPDATE auth.users SET email_confirmed_at = NOW() WHERE email_confirmed_at IS NULL;"
fi

# Execute the SQL command
docker exec -i "$CONTAINER_NAME" psql -U "$DB_USER" -d "$DB_NAME" -c "$SQL"

if [ $? -eq 0 ]; then
    echo ""
    echo "Users confirmed successfully!"
    echo "Users can now sign in without email confirmation."
else
    echo ""
    echo "Error confirming users. Please check:"
    echo "1. Docker container '$CONTAINER_NAME' is running"
    echo "2. Database credentials are correct"
    exit 1
fi

