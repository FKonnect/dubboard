import { createClient } from '@/lib/supabase/client'
import { createServerClient } from '@/lib/supabase'

/**
 * Get the current user on the client side
 */
export async function getCurrentUser() {
  try {
    const supabase = createClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error) throw error
    return user
  } catch (error) {
    return null
  }
}

/**
 * Get the current session on the client side
 */
export async function getCurrentSession() {
  try {
    const supabase = createClient()
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) throw error
    return session
  } catch (error) {
    return null
  }
}

/**
 * Check if user is authenticated (client-side)
 */
export async function isAuthenticated() {
  const user = await getCurrentUser()
  return user !== null
}

