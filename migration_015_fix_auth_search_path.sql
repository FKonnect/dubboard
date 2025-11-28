-- Migration 015: Fix Auth Search Path
-- This migration sets the search_path for supabase_auth_admin so GoTrue can find its tables
-- Without this, GoTrue queries tables like "identities" without the "auth." prefix
-- and fails with "relation does not exist" errors

-- Set search_path for supabase_auth_admin to include auth schema first
ALTER ROLE supabase_auth_admin SET search_path TO auth, public, extensions;

-- Verify the change (run manually to check)
-- SELECT rolname, rolconfig FROM pg_roles WHERE rolname = 'supabase_auth_admin';
-- Should show: {search_path=auth," public"," extensions"}

