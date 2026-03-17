import { auth } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { randomBytes } from 'crypto'

function getAdmin() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!)
}

// GET all access requests
export async function GET() {
  const session = await auth()
  if (!session || (session.user as any)?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const supabase = getAdmin()
  const { data, error } = await supabase.from('ri_access_requests').select('*').order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// POST approve/reject a request
export async function POST(req: Request) {
  const session = await auth()
  if (!session || (session.user as any)?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id, action } = await req.json() // action: 'approve' | 'reject'
  const supabase = getAdmin()

  if (action === 'reject') {
    const { error } = await supabase.from('ri_access_requests').update({ status: 'rejected' }).eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  }

  if (action === 'approve') {
    // Get the request
    const { data: req_data, error: fetchErr } = await supabase.from('ri_access_requests').select('*').eq('id', id).single()
    if (fetchErr || !req_data) return NextResponse.json({ error: 'Request not found' }, { status: 404 })

    // Generate temp password
    const tempPassword = randomBytes(4).toString('hex') + 'Rb1!'
    const hashed = await bcrypt.hash(tempPassword, 10)

    // Create user
    const { error: userErr } = await supabase.from('ri_users').insert([{
      name: req_data.name,
      email: req_data.email,
      password: hashed,
      role: 'analyst',
    }])

    if (userErr) return NextResponse.json({ error: userErr.message }, { status: 500 })

    // Mark request approved
    await supabase.from('ri_access_requests').update({ status: 'approved' }).eq('id', id)

    return NextResponse.json({ success: true, tempPassword, email: req_data.email })
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}
