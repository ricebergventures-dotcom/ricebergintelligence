import { auth } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

function getAdmin() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!)
}

async function requireAdmin() {
  const session = await auth()
  if (!session || (session.user as any)?.role !== 'admin') return null
  return session
}

// GET all users
export async function GET() {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const supabase = getAdmin()
  const { data, error } = await supabase.from('ri_users').select('id,email,name,role,created_at').order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// POST create new user
export async function POST(req: Request) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { name, email, role = 'analyst', password } = await req.json()
  if (!name || !email || !password) return NextResponse.json({ error: 'name, email, password required' }, { status: 400 })

  const supabase = getAdmin()
  const hashed = await bcrypt.hash(password, 10)
  const { data, error } = await supabase.from('ri_users').insert([{ name, email, role, password: hashed }]).select('id,email,name,role,created_at').single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// DELETE user
export async function DELETE(req: Request) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { id } = await req.json()
  if (id === 'admin-001') return NextResponse.json({ error: 'Cannot delete root admin' }, { status: 400 })
  const supabase = getAdmin()
  const { error } = await supabase.from('ri_users').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
