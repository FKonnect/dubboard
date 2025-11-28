-- Migration 012: Create extensions schema and fix remaining permissions
-- Fixes the "schema extensions does not exist" error

-- Create extensions schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS extensions;

-- Grant usage on extensions schema to storage admin
GRANT USAGE ON SCHEMA extensions TO supabase_storage_admin;
GRANT USAGE ON SCHEMA extensions TO service_role;
GRANT USAGE ON SCHEMA extensions TO authenticated;
GRANT USAGE ON SCHEMA extensions TO anon;

-- Move common extensions to extensions schema (if not already there)
DO $$
BEGIN
    -- uuid-ossp extension
    IF NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'uuid-ossp') THEN
        CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;
    END IF;
    
    -- pgcrypto extension
    IF NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pgcrypto') THEN
        CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;
    END IF;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Extension setup note: %', SQLERRM;
END $$;

-- Ensure supabase_storage_admin has all required permissions
DO $$
BEGIN
    -- Re-grant storage permissions with extensions schema now available
    GRANT USAGE ON SCHEMA storage TO supabase_storage_admin;
    GRANT USAGE ON SCHEMA public TO supabase_storage_admin;
    GRANT USAGE ON SCHEMA extensions TO supabase_storage_admin;
    
    RAISE NOTICE 'Extensions schema setup completed';
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error: %', SQLERRM;
END $$;

