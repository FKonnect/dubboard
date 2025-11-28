-- Migration 009: Create missing database roles for Supabase services
-- This fixes restart loops in rest, storage, and realtime services

-- authenticator role: Required by PostgREST (rest service)
-- This role acts as a proxy between anon/authenticated roles and the database
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'authenticator') THEN
    CREATE ROLE authenticator NOINHERIT LOGIN;
  ELSE
    -- Ensure it can login
    ALTER ROLE authenticator LOGIN;
  END IF;
END
$$;

-- Grant necessary permissions to authenticator
-- authenticator needs to be able to switch to anon and authenticated roles
GRANT anon TO authenticator;
GRANT authenticated TO authenticator;

-- Ensure supabase_storage_admin exists and has proper permissions
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'supabase_storage_admin') THEN
    CREATE ROLE supabase_storage_admin LOGIN NOINHERIT;
  ELSE
    ALTER ROLE supabase_storage_admin LOGIN;
  END IF;
END
$$;

-- Set password for authenticator (must match POSTGRES_PASSWORD)
-- IMPORTANT: Run this separately with your actual password:
-- ALTER ROLE authenticator WITH PASSWORD 'your-postgres-password';

-- Set password for supabase_storage_admin (must match POSTGRES_PASSWORD)
-- IMPORTANT: Run this separately with your actual password:
-- ALTER ROLE supabase_storage_admin WITH PASSWORD 'your-postgres-password';

-- Create storage schema if it doesn't exist (required by storage service)
-- Must be created BEFORE granting permissions
CREATE SCHEMA IF NOT EXISTS storage;

-- Grant necessary schema permissions
GRANT USAGE ON SCHEMA public TO authenticator;
GRANT USAGE ON SCHEMA storage TO authenticator, supabase_storage_admin;
GRANT USAGE ON SCHEMA auth TO authenticator;

-- Grant ownership of storage schema to supabase_storage_admin
ALTER SCHEMA storage OWNER TO supabase_storage_admin;
GRANT ALL ON SCHEMA storage TO supabase_storage_admin;

-- Create _realtime schema if it doesn't exist (required by realtime service)
CREATE SCHEMA IF NOT EXISTS _realtime;

-- Grant permissions on _realtime schema
GRANT USAGE ON SCHEMA _realtime TO supabase_admin, anon, authenticated;

