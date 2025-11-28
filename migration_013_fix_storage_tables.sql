-- Migration 013: Fix Storage Tables
-- The storage service expects tables without schema prefix, using search_path

-- Drop the incorrectly created tables in storage schema (if they exist)
DROP TABLE IF EXISTS storage.objects CASCADE;
DROP TABLE IF EXISTS storage.buckets CASCADE;

-- The storage service will create its own tables, but we need to ensure
-- the search_path and permissions are correct for supabase_storage_admin

-- Set the search_path so unqualified table names resolve to storage schema
ALTER ROLE supabase_storage_admin SET search_path TO storage, public, extensions;

-- Create the storage schema tables that the storage-api expects
-- These match the exact schema the storage service uses

CREATE TABLE IF NOT EXISTS storage.buckets (
    id text NOT NULL PRIMARY KEY,
    name text NOT NULL UNIQUE,
    owner uuid,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    public boolean DEFAULT false,
    avif_autodetection boolean DEFAULT false,
    file_size_limit bigint,
    allowed_mime_types text[],
    owner_id text
);

CREATE TABLE IF NOT EXISTS storage.objects (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    bucket_id text REFERENCES storage.buckets(id),
    name text,
    owner uuid,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    last_accessed_at timestamptz DEFAULT now(),
    metadata jsonb,
    path_tokens text[] GENERATED ALWAYS AS (string_to_array(name, '/')) STORED,
    version text,
    owner_id text
);

CREATE TABLE IF NOT EXISTS storage.s3_multipart_uploads (
    id text NOT NULL PRIMARY KEY,
    in_progress_size bigint NOT NULL DEFAULT 0,
    upload_signature text NOT NULL,
    bucket_id text NOT NULL REFERENCES storage.buckets(id),
    key text NOT NULL,
    version text NOT NULL,
    owner_id text,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS storage.s3_multipart_uploads_parts (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    upload_id text NOT NULL REFERENCES storage.s3_multipart_uploads(id) ON DELETE CASCADE,
    size bigint NOT NULL DEFAULT 0,
    part_number integer NOT NULL,
    bucket_id text NOT NULL REFERENCES storage.buckets(id),
    key text NOT NULL,
    etag text NOT NULL,
    owner_id text,
    version text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_objects_bucket_id ON storage.objects(bucket_id);
CREATE INDEX IF NOT EXISTS idx_objects_name ON storage.objects(name);
CREATE UNIQUE INDEX IF NOT EXISTS idx_objects_bucket_id_name ON storage.objects(bucket_id, name);

-- Grant all permissions on storage tables
GRANT ALL ON storage.buckets TO supabase_storage_admin;
GRANT ALL ON storage.objects TO supabase_storage_admin;
GRANT ALL ON storage.s3_multipart_uploads TO supabase_storage_admin;
GRANT ALL ON storage.s3_multipart_uploads_parts TO supabase_storage_admin;

-- Grant select to other roles
GRANT SELECT ON storage.buckets TO postgres, anon, authenticated, service_role;
GRANT SELECT ON storage.objects TO postgres, anon, authenticated, service_role;

-- Set schema ownership
ALTER SCHEMA storage OWNER TO supabase_storage_admin;

-- Ensure the storage admin can access all tables via search_path
-- This is critical - the storage API queries without schema prefix
DO $$
BEGIN
    -- Set search path at session level
    PERFORM set_config('search_path', 'storage, public, extensions', false);
    RAISE NOTICE 'Storage tables created and permissions granted';
END $$;

