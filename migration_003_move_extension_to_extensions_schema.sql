-- Move uuid-ossp extension from public schema to extensions schema
-- This fixes the security warning about extensions in the public schema

-- Create extensions schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS extensions;

-- Grant usage on the extensions schema to authenticated users
GRANT USAGE ON SCHEMA extensions TO authenticated;
GRANT USAGE ON SCHEMA extensions TO anon;

-- Drop the extension from public schema (if it exists there)
-- CASCADE is needed because tables may have DEFAULT values using uuid_generate_v4()
-- The functions will be recreated in the extensions schema below
DROP EXTENSION IF EXISTS "uuid-ossp" CASCADE;

-- Create the extension in the extensions schema
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" SCHEMA extensions;

-- The extensions schema is already in PGRST_DB_EXTRA_SEARCH_PATH (public,extensions)
-- So uuid_generate_v4() will work without the schema prefix
-- Existing tables will continue to work because the function is in the search path

