-- Quick fix: Grant public schema permissions to supabase_auth_admin
-- This fixes the "permission denied for schema public" error
-- Run this after migration_007_setup_auth_schema.sql

-- Grant permissions on public schema for GoTrue's schema_migrations table
GRANT USAGE ON SCHEMA public TO supabase_auth_admin;
GRANT CREATE ON SCHEMA public TO supabase_auth_admin;

