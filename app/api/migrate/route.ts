import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'

export const runtime = 'nodejs'

export async function POST() {
  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    )

    // Check if table exists by trying to query it
    const { error: checkError } = await supabaseAdmin
      .from('ri_users')
      .select('id')
      .limit(1)

    if (checkError && checkError.code === 'PGRST205') {
      // Table doesn't exist - needs to be created via the Supabase dashboard SQL editor
      return NextResponse.json({
        success: false,
        message: 'Table ri_users does not exist. Please create it via the Supabase dashboard SQL editor.',
        sql: `CREATE TABLE IF NOT EXISTS ri_users (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'analyst',
  created_at TIMESTAMPTZ DEFAULT NOW()
);`
      }, { status: 400 })
    }

    if (checkError) {
      return NextResponse.json({ success: false, error: checkError.message, code: checkError.code }, { status: 500 })
    }

    // Seed admin user
    const password = await bcrypt.hash('changeme123', 10)
    const { error: upsertError } = await supabaseAdmin
      .from('ri_users')
      .upsert([{
        id: 'admin-001',
        email: 'admin@riceberg.vc',
        name: 'Admin',
        password,
        role: 'admin',
      }], { onConflict: 'email' })

    if (upsertError) {
      return NextResponse.json({ success: false, error: upsertError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Seeded admin@riceberg.vc / changeme123' })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: String(err?.message || err) }, { status: 500 })
  }
}
