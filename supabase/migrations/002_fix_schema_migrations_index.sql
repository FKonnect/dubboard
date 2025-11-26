-- Fix duplicate indexes on schema_migrations table
-- The primary key constraint already creates an index, so we drop the redundant one

-- Drop the duplicate index if it exists
-- Keep the primary key index (schema_migrations_pkey) as it's part of the constraint
DROP INDEX IF EXISTS public.schema_migrations_version_idx;

