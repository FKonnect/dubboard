-- Migration 007: Setup Auth Schema and Roles
-- This migration creates the necessary database roles and auth schema structure
-- that GoTrue (Supabase Auth) requires to function properly

-- Create the necessary database roles if they don't exist
-- These roles are required for Supabase's authentication system

-- anon role: for unauthenticated users
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'anon') THEN
    CREATE ROLE anon NOLOGIN NOINHERIT;
  END IF;
END
$$;

-- authenticated role: for authenticated users
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'authenticated') THEN
    CREATE ROLE authenticated NOLOGIN NOINHERIT;
  END IF;
END
$$;

-- service_role: for service-level operations (bypasses RLS)
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'service_role') THEN
    CREATE ROLE service_role NOLOGIN NOINHERIT BYPASSRLS;
  END IF;
END
$$;

-- supabase_auth_admin: for GoTrue to manage auth
-- This role needs LOGIN permission to connect to the database
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'supabase_auth_admin') THEN
    CREATE ROLE supabase_auth_admin LOGIN NOINHERIT;
  ELSE
    -- If role exists but can't login, grant login permission
    ALTER ROLE supabase_auth_admin LOGIN;
  END IF;
END
$$;

-- supabase_storage_admin: for storage operations
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'supabase_storage_admin') THEN
    CREATE ROLE supabase_storage_admin LOGIN NOINHERIT;
  ELSE
    ALTER ROLE supabase_storage_admin LOGIN;
  END IF;
END
$$;

-- Create the auth schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS auth;

-- Grant necessary permissions on auth schema
-- supabase_auth_admin needs full control to create and manage auth tables
GRANT ALL ON SCHEMA auth TO supabase_auth_admin;
GRANT CREATE ON SCHEMA auth TO supabase_auth_admin;
ALTER SCHEMA auth OWNER TO supabase_auth_admin;

-- Grant usage to other roles
-- Use supabase_admin instead of postgres (Supabase Docker uses supabase_admin as superuser)
DO $$
BEGIN
  -- Grant to supabase_admin if it exists
  IF EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'supabase_admin') THEN
    GRANT USAGE ON SCHEMA auth TO supabase_admin;
  END IF;
  -- Always grant to these roles
  GRANT USAGE ON SCHEMA auth TO anon, authenticated, service_role;
END
$$;

-- Grant authenticated role to anon (so anon can become authenticated)
GRANT authenticated TO anon;

-- Grant service_role to supabase_admin (for admin operations)
-- Use supabase_admin instead of postgres (Supabase Docker uses supabase_admin as superuser)
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'supabase_admin') THEN
    GRANT service_role TO supabase_admin;
  END IF;
END
$$;

-- Create auth.uid() function that GoTrue and RLS policies use
-- This function returns the current user's UUID from the JWT token
CREATE OR REPLACE FUNCTION auth.uid()
RETURNS uuid
LANGUAGE sql
STABLE
AS $$
  SELECT 
    COALESCE(
      nullif(current_setting('request.jwt.claim.sub', true), ''),
      (nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'sub')
    )::uuid
$$;

-- Create auth.role() function that returns the current user's role
CREATE OR REPLACE FUNCTION auth.role()
RETURNS text
LANGUAGE sql
STABLE
AS $$
  SELECT 
    COALESCE(
      nullif(current_setting('request.jwt.claim.role', true), ''),
      (nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'role')
    )::text
$$;

-- Grant execute permissions on auth functions
GRANT EXECUTE ON FUNCTION auth.uid() TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION auth.role() TO anon, authenticated, service_role;

-- Grant necessary database privileges to supabase_auth_admin
-- This allows GoTrue to create tables, functions, and manage the auth schema
ALTER ROLE supabase_auth_admin CREATEDB;
ALTER ROLE supabase_auth_admin CREATEROLE;

-- Grant permissions on public schema for GoTrue's schema_migrations table
-- GoTrue needs to create a schema_migrations table in the public schema
GRANT USAGE ON SCHEMA public TO supabase_auth_admin;
GRANT CREATE ON SCHEMA public TO supabase_auth_admin;

-- IMPORTANT: Set the password for supabase_auth_admin
-- This password must match your POSTGRES_PASSWORD environment variable
-- Run this command separately with your actual password:
-- ALTER ROLE supabase_auth_admin WITH PASSWORD 'your-postgres-password';
--
-- You can also set it via environment variable when connecting:
-- PGPASSWORD=your-password psql -h localhost -p 54322 -U supabase_admin -d postgres -c "ALTER ROLE supabase_auth_admin WITH PASSWORD 'your-postgres-password';"

-- Note: GoTrue will create the auth.users table and other auth tables automatically
-- when it starts up. This migration ensures the schema, roles, and permissions exist.
-- 
-- After running this migration:
-- 1. Restart the GoTrue service: docker-compose restart auth
-- 2. Check GoTrue logs: docker-compose logs auth
-- 3. Verify auth.users exists: SELECT * FROM auth.users LIMIT 1;
--
-- If auth.users still doesn't exist after restarting GoTrue, check the GoTrue logs
-- for any permission errors or connection issues.

