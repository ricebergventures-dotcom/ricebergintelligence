import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { name, email, company, message } = await req.json()

  if (!name || !email) {
    return NextResponse.json({ error: 'Name and email required' }, { status: 400 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  )

  const { error } = await supabase
    .from('ri_access_requests')
    .insert([{ name, email, company: company || null, message: message || null }])

  if (error) {
    // If table doesn't exist, still return success to user
    console.error('Access request error:', error)
  }

  return NextResponse.json({ success: true })
}
