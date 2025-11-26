import { createClient } from '@/lib/supabase/client'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const supabase = createClient()
    await supabase.auth.signOut()
    
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to sign out' },
      { status: 500 }
    )
  }
}



