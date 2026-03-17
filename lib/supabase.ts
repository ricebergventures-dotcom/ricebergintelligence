import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Public client (safe for browser/server)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Admin client factory — call this inside server actions/route handlers, not at module level
export function getSupabaseAdmin() {
  const serviceKey = process.env.SUPABASE_SERVICE_KEY!
  return createClient(supabaseUrl, serviceKey)
}
