import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'
import { NextResponse } from 'next/server'

// This endpoint sets up the database tables and seeds admin user
// Call POST /api/setup once after deployment

export async function POST(req: Request) {
  // Verify setup token to prevent unauthorized access
  const { token } = await req.json().catch(() => ({}))
  if (token !== process.env.NEXTAUTH_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  )

  const results: string[] = []

  // Try creating ri_users table by inserting a dummy row
  // If table exists but user doesn't, upsert the admin
  try {
    const hashedPassword = await bcrypt.hash('changeme123', 10)

    const { error: insertError } = await supabase
      .from('ri_users')
      .upsert([{
        id: 'admin-001',
        email: 'admin@riceberg.vc',
        name: 'Admin',
        password: hashedPassword,
        role: 'admin',
      }], { onConflict: 'email' })

    if (insertError) {
      results.push(`ri_users: ${insertError.message}`)
    } else {
      results.push('ri_users: admin user seeded')
    }
  } catch (e: any) {
    results.push(`ri_users error: ${e.message}`)
  }

  // Try creating ri_access_requests table (insert test)
  try {
    const { error } = await supabase
      .from('ri_access_requests')
      .select('id')
      .limit(1)

    if (error) {
      results.push(`ri_access_requests: table may not exist - ${error.message}`)
    } else {
      results.push('ri_access_requests: table exists')
    }
  } catch (e: any) {
    results.push(`ri_access_requests check: ${e.message}`)
  }

  return NextResponse.json({
    message: 'Setup complete. Check results.',
    results,
    note: 'If tables do not exist, run the SQL from /api/setup GET in Supabase Dashboard SQL Editor'
  })
}

export async function GET() {
  const sql = `
-- Run this in Supabase Dashboard > SQL Editor

CREATE TABLE IF NOT EXISTS ri_users (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'analyst',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ri_access_requests (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  company TEXT,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed admin user (password: changeme123)
INSERT INTO ri_users (id, email, name, password, role)
VALUES ('admin-001', 'admin@riceberg.vc', 'Admin', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lsqy', 'admin')
ON CONFLICT (email) DO NOTHING;
  `

  return new Response(sql, {
    headers: { 'Content-Type': 'text/plain' }
  })
}
