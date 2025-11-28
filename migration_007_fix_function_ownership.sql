-- Fix: Grant ownership of auth functions to supabase_auth_admin
-- This allows GoTrue to manage and update these functions

-- Change ownership of auth.uid() function
ALTER FUNCTION auth.uid() OWNER TO supabase_auth_admin;

-- Change ownership of auth.role() function  
ALTER FUNCTION auth.role() OWNER TO supabase_auth_admin;

