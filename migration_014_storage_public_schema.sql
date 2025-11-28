-- Migration 014: Create Storage Tables in Public Schema
-- The storage service is looking for tables without schema prefix in public schema

-- Create the buckets table in public schema
CREATE TABLE IF NOT EXISTS public.buckets (
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

-- Create the objects table in public schema
CREATE TABLE IF NOT EXISTS public.objects (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    bucket_id text REFERENCES public.buckets(id),
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

-- Create multipart upload tables
CREATE TABLE IF NOT EXISTS public.s3_multipart_uploads (
    id text NOT NULL PRIMARY KEY,
    in_progress_size bigint NOT NULL DEFAULT 0,
    upload_signature text NOT NULL,
    bucket_id text NOT NULL REFERENCES public.buckets(id),
    key text NOT NULL,
    version text NOT NULL,
    owner_id text,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.s3_multipart_uploads_parts (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    upload_id text NOT NULL REFERENCES public.s3_multipart_uploads(id) ON DELETE CASCADE,
    size bigint NOT NULL DEFAULT 0,
    part_number integer NOT NULL,
    bucket_id text NOT NULL REFERENCES public.buckets(id),
    key text NOT NULL,
    etag text NOT NULL,
    owner_id text,
    version text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS bkt_obj_bucket_id ON public.objects(bucket_id);
CREATE INDEX IF NOT EXISTS bkt_obj_name ON public.objects(name);
CREATE UNIQUE INDEX IF NOT EXISTS bkt_obj_bucket_id_name ON public.objects(bucket_id, name);

-- Grant all permissions to supabase_storage_admin
GRANT ALL ON public.buckets TO supabase_storage_admin;
GRANT ALL ON public.objects TO supabase_storage_admin;
GRANT ALL ON public.s3_multipart_uploads TO supabase_storage_admin;
GRANT ALL ON public.s3_multipart_uploads_parts TO supabase_storage_admin;

-- Grant select to other roles for RLS policies
GRANT SELECT, INSERT, UPDATE, DELETE ON public.buckets TO postgres, anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.objects TO postgres, anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.s3_multipart_uploads TO postgres, anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.s3_multipart_uploads_parts TO postgres, anon, authenticated, service_role;

DO $$
BEGIN
    RAISE NOTICE 'Storage tables created in public schema';
END $$;

