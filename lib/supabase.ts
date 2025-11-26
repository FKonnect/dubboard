import { createClient } from '@supabase/supabase-js'

// These are the environment variables we'll need
// They should be set in your .env.local file for development
// and in your Docker environment for production
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:8004'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Create a Supabase client for use in the browser
// This client is safe to use in client-side components
// If keys are missing, we'll create a dummy client that will fail at runtime
// This prevents build-time errors
export const supabase = createClient(
  supabaseUrl || 'http://localhost:8004',
  supabaseAnonKey || 'dummy-key-for-build'
)

// For server-side operations that need elevated permissions,
// you would create a separate client with the service role key
// (but only use this on the server, never expose it to the client!)
export const createServerClient = () => {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!serviceRoleKey) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY for server operations')
  }
  
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

