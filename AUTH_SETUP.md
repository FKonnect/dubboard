# Auth Setup Guide

This guide will help you set up authentication for your Dubboard application.

## Problem

If you're seeing the error: `Error: relation "auth.users" does not exist`, it means the Supabase auth schema hasn't been initialized properly.

## Solution

### Step 1: Run the Auth Schema Migration

First, you need to run the migration that sets up the auth schema and roles.

**Option A: Using Docker (Recommended)**

```bash
# Run the migration directly via Docker
docker exec -i supabase_db_dubboard psql -U supabase_admin -d postgres < migration_007_setup_auth_schema.sql
```

**Option B: Interactive SQL Session**

```bash
# Connect to your database
docker exec -it supabase_db_dubboard psql -U supabase_admin -d postgres

# Then copy and paste the contents of migration_007_setup_auth_schema.sql
# Or use \i if the file is accessible from within the container
```

**Option C: Direct Connection (if not using Docker)**

```bash
psql -h localhost -p 54322 -U supabase_admin -d postgres -f migration_007_setup_auth_schema.sql
```

### Step 2: Set Password for supabase_auth_admin

The `supabase_auth_admin` user needs a password to connect. Set it to match your `POSTGRES_PASSWORD`.

**Option A: Using the Helper Script (Easiest)**

**For Linux/Mac:**
```bash
# Make sure POSTGRES_PASSWORD is set in your environment
export POSTGRES_PASSWORD=your-password-here
chmod +x scripts/setup-auth-password.sh
./scripts/setup-auth-password.sh
```

**For Windows (PowerShell):**
```powershell
# Set the password in your environment
$env:POSTGRES_PASSWORD = "your-password-here"
.\scripts\setup-auth-password.ps1
```

**Option B: Manual SQL Command**

```bash
# Replace 'your-postgres-password' with your actual POSTGRES_PASSWORD
docker exec -i supabase_db_dubboard psql -U supabase_admin -d postgres -c "ALTER ROLE supabase_auth_admin WITH PASSWORD 'your-postgres-password';"
```

You can find your `POSTGRES_PASSWORD` in your `.env` file or docker-compose environment variables.

### Step 3: Grant Necessary Permissions

Ensure the user has all necessary permissions:

```sql
-- Grant all privileges on auth schema
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA auth TO supabase_auth_admin;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA auth TO supabase_auth_admin;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA auth TO supabase_auth_admin;

-- Set default privileges for future objects
ALTER DEFAULT PRIVILEGES IN SCHEMA auth GRANT ALL ON TABLES TO supabase_auth_admin;
ALTER DEFAULT PRIVILEGES IN SCHEMA auth GRANT ALL ON SEQUENCES TO supabase_auth_admin;
ALTER DEFAULT PRIVILEGES IN SCHEMA auth GRANT ALL ON FUNCTIONS TO supabase_auth_admin;
```

### Step 4: Restart GoTrue Service

After running the migration, restart the GoTrue (auth) service so it can initialize the auth tables:

```bash
docker-compose restart auth
```

### Step 5: Check GoTrue Logs

Verify that GoTrue started successfully and created the auth tables:

```bash
docker-compose logs auth
```

Look for any errors. If you see connection errors, verify the password is set correctly.

### Step 6: Verify Auth Tables Exist

Check if the `auth.users` table was created:

```sql
-- Connect to database again
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'auth';
```

You should see tables like:
- `users`
- `instances`
- `audit_log_entries`
- `refresh_tokens`
- etc.

### Step 7: Test Authentication

Try signing up a new user through your application:

1. Navigate to `/auth/signup`
2. Create a test account
3. Check if the user was created:

```sql
SELECT id, email, created_at FROM auth.users;
```

## Troubleshooting

### GoTrue can't connect to database

**Error**: `dial tcp: lookup db on 127.0.0.1:53: no such host`

**Solution**: Make sure the database service is running and the network is configured correctly in docker-compose.yml.

### Permission denied errors

**Error**: `permission denied for schema auth`

**Solution**: Make sure you ran the migration as the `supabase_admin` user and granted all necessary permissions to `supabase_auth_admin`.

### Password authentication failed

**Error**: `password authentication failed for user "supabase_auth_admin"`

**Solution**: 
1. Verify the password matches your `POSTGRES_PASSWORD` environment variable
2. Reset the password: `ALTER ROLE supabase_auth_admin WITH PASSWORD 'your-password';`
3. Restart the auth service

### Auth tables still don't exist after restart

**Solution**:
1. Check GoTrue logs for specific errors: `docker-compose logs auth`
2. Verify the database connection string in docker-compose.yml is correct
3. Ensure the `supabase_auth_admin` user has CREATEDB and CREATEROLE privileges
4. Try manually creating a test table in the auth schema to verify permissions

### 400 Bad Request error when signing in after signup

**Error**: `POST /auth/v1/token?grant_type=password 400 (Bad Request)`

**Problem**: Users are created but cannot sign in because email confirmation is required, but no SMTP server is configured.

**Solution**: Enable auto-confirmation for users:

1. Add `MAILER_AUTOCONFIRM=true` to your `.env` file (or wherever you store your Docker environment variables)

2. Restart the auth service:
   ```bash
   docker-compose restart auth
   ```

3. For existing unconfirmed users, you can manually confirm them via SQL:
   ```bash
   # Confirm all unconfirmed users
   docker exec -it supabase_db_dubboard psql -U supabase_admin -d postgres -c "UPDATE auth.users SET email_confirmed_at = NOW() WHERE email_confirmed_at IS NULL;"
   
   # Or confirm a specific user by email
   docker exec -it supabase_db_dubboard psql -U supabase_admin -d postgres -c "UPDATE auth.users SET email_confirmed_at = NOW() WHERE email = 'user@example.com';"
   ```
   
   **Note**: `confirmed_at` is a generated column, so we only update `email_confirmed_at`.

**Alternative**: If you want to require email confirmation, configure SMTP settings in your `.env` file:
```env
GOTRUE_SMTP_HOST=smtp.gmail.com
GOTRUE_SMTP_PORT=587
GOTRUE_SMTP_USER=your-email@gmail.com
GOTRUE_SMTP_PASS=your-app-password
GOTRUE_SMTP_ADMIN_EMAIL=your-email@gmail.com
GOTRUE_SMTP_SENDER_NAME=Dubboard
MAILER_AUTOCONFIRM=false
```

## Manual Auth Schema Creation (Last Resort)

If GoTrue still doesn't create the tables automatically, you can manually create the basic `auth.users` table structure. However, this is not recommended as GoTrue manages its own schema. It's better to fix the underlying permission/connection issues.

If you must create it manually, you'll need to research the exact GoTrue schema for your version. The schema changes between GoTrue versions, so this should only be used as a last resort.

## Next Steps

Once authentication is working:

1. Test user signup and login
2. Verify RLS policies are working correctly
3. Test that users can only access their own data
4. Set up email confirmation if needed (configure SMTP settings)

## Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [GoTrue GitHub Repository](https://github.com/supabase/gotrue)
- [Self-Hosted Supabase Guide](https://supabase.com/docs/guides/self-hosting)

