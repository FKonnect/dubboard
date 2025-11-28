-- Migration 008: Add is_anonymous column to auth.users
-- This column is expected by newer versions of Supabase Studio
-- The is_anonymous column indicates if a user is an anonymous user

-- Add is_anonymous column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'auth' 
    AND table_name = 'users' 
    AND column_name = 'is_anonymous'
  ) THEN
    ALTER TABLE auth.users ADD COLUMN is_anonymous BOOLEAN DEFAULT FALSE;
    
    -- Add comment
    COMMENT ON COLUMN auth.users.is_anonymous IS 'Auth: Indicates if the user is anonymous.';
  END IF;
END
$$;

