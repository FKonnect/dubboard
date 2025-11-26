-- Secure the schema_migrations table
-- This table is used internally by Supabase and should not be accessible via the API

-- Enable RLS on schema_migrations (with no policies = blocks all access)
ALTER TABLE IF EXISTS public.schema_migrations ENABLE ROW LEVEL SECURITY;

-- Revoke all permissions from anon and authenticated on schema_migrations
REVOKE ALL ON public.schema_migrations FROM anon;
REVOKE ALL ON public.schema_migrations FROM authenticated;

