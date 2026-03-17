import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}))
  if (body.token !== process.env.NEXTAUTH_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  )

  const results: Record<string, string> = {}

  // Check if ri_users table exists by querying it
  const { error: usersCheckError } = await supabase.from('ri_users').select('id').limit(1)
  results.ri_users_exists = usersCheckError ? `NO - ${usersCheckError.message}` : 'YES'

  // Check if ri_access_requests table exists
  const { error: reqCheckError } = await supabase.from('ri_access_requests').select('id').limit(1)
  results.ri_access_requests_exists = reqCheckError ? `NO - ${reqCheckError.message}` : 'YES'

  // If ri_users exists, seed admin
  if (!usersCheckError) {
    const hashedPassword = await bcrypt.hash('changeme123', 10)
    const { error: seedError } = await supabase.from('ri_users').upsert([{
      id: 'admin-001',
      email: 'admin@riceberg.vc',
      name: 'Admin',
      password: hashedPassword,
      role: 'admin',
    }], { onConflict: 'email' })
    results.admin_seeded = seedError ? `FAILED - ${seedError.message}` : 'OK'
  }

  const tablesReady = !usersCheckError && !reqCheckError
  return NextResponse.json({ tablesReady, results, sqlNeeded: tablesReady ? null : getSql() })
}

export async function GET() {
  return new Response(getSql(), { headers: { 'Content-Type': 'text/plain' } })
}

function getSql() {
  return `
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

INSERT INTO ri_users (id, email, name, password, role)
VALUES ('admin-001', 'admin@riceberg.vc', 'Admin', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lsqy', 'admin')
ON CONFLICT (email) DO NOTHING;
  `.trim()
}
