-- Migration 010: Fix duplicate index on public.schema_migrations
-- The table has both a primary key (schema_migrations_pkey) and a unique index 
-- (schema_migrations_version_idx) on the same column. This is redundant.
-- Drop the duplicate index, keeping the primary key.

DROP INDEX IF EXISTS public.schema_migrations_version_idx;

