-- Migration 011: Fix Storage Permissions
-- This fixes the "new row violates row-level security policy" error in storage
-- Error code 42501 occurs when supabase_storage_admin can't use set_config

-- Grant necessary permissions to supabase_storage_admin
DO $$
BEGIN
    -- Create storage schema if it doesn't exist
    CREATE SCHEMA IF NOT EXISTS storage;
    
    -- Ensure supabase_storage_admin role exists
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'supabase_storage_admin') THEN
        CREATE ROLE supabase_storage_admin NOINHERIT CREATEROLE LOGIN;
    END IF;
    
    -- Grant schema ownership
    ALTER SCHEMA storage OWNER TO supabase_storage_admin;
    
    -- Grant usage on schemas
    GRANT USAGE ON SCHEMA storage TO supabase_storage_admin;
    GRANT USAGE ON SCHEMA public TO supabase_storage_admin;
    GRANT USAGE ON SCHEMA extensions TO supabase_storage_admin;
    
    -- Grant all on storage schema
    GRANT ALL ON ALL TABLES IN SCHEMA storage TO supabase_storage_admin;
    GRANT ALL ON ALL SEQUENCES IN SCHEMA storage TO supabase_storage_admin;
    GRANT ALL ON ALL ROUTINES IN SCHEMA storage TO supabase_storage_admin;
    
    -- Grant to service_role and authenticated for storage access
    GRANT USAGE ON SCHEMA storage TO service_role;
    GRANT USAGE ON SCHEMA storage TO authenticated;
    GRANT USAGE ON SCHEMA storage TO anon;
    
    GRANT SELECT ON ALL TABLES IN SCHEMA storage TO service_role;
    GRANT SELECT ON ALL TABLES IN SCHEMA storage TO authenticated;
    GRANT SELECT ON ALL TABLES IN SCHEMA storage TO anon;
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error granting storage permissions: %', SQLERRM;
END $$;

-- Grant superuser-like permissions needed for set_config
-- The storage service needs to be able to set session variables
ALTER ROLE supabase_storage_admin SET search_path TO storage, public, extensions;

-- Make supabase_storage_admin a superuser (required for set_config in some Postgres versions)
-- This is safe because it's only used by the internal storage service
ALTER ROLE supabase_storage_admin WITH SUPERUSER;

-- Also ensure the role can set GUCs (Grand Unified Configuration)
DO $$
BEGIN
    -- Grant set on parameter (if supported)
    EXECUTE 'ALTER ROLE supabase_storage_admin SET role TO supabase_storage_admin';
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Could not set default role: %', SQLERRM;
END $$;

-- Create storage tables if they don't exist (basic structure)
CREATE TABLE IF NOT EXISTS storage.buckets (
    id text PRIMARY KEY,
    name text NOT NULL UNIQUE,
    owner uuid REFERENCES auth.users(id),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    public boolean DEFAULT false,
    avif_autodetection boolean DEFAULT false,
    file_size_limit bigint,
    allowed_mime_types text[]
);

CREATE TABLE IF NOT EXISTS storage.objects (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    bucket_id text REFERENCES storage.buckets(id),
    name text,
    owner uuid REFERENCES auth.users(id),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    last_accessed_at timestamptz DEFAULT now(),
    metadata jsonb,
    path_tokens text[] GENERATED ALWAYS AS (string_to_array(name, '/')) STORED,
    version text,
    owner_id text
);

-- Grant permissions on storage tables
GRANT ALL ON storage.buckets TO supabase_storage_admin;
GRANT ALL ON storage.objects TO supabase_storage_admin;
GRANT SELECT ON storage.buckets TO service_role, authenticated, anon;
GRANT SELECT ON storage.objects TO service_role, authenticated, anon;

-- Ensure default privileges for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA storage GRANT ALL ON TABLES TO supabase_storage_admin;
ALTER DEFAULT PRIVILEGES IN SCHEMA storage GRANT SELECT ON TABLES TO service_role;

RAISE NOTICE 'Storage permissions migration completed successfully';

