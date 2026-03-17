import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://epejbmuooudknsjehavc.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!

if (!supabaseServiceKey) {
  console.error('SUPABASE_SERVICE_KEY env var is required')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function seed() {
  const password = await bcrypt.hash('changeme123', 10)

  const { error } = await supabase
    .from('ri_users')
    .upsert([{
      id: 'admin-001',
      email: 'admin@riceberg.vc',
      name: 'Admin',
      password,
      role: 'admin',
    }], { onConflict: 'email' })

  if (error) {
    console.error('Seed error:', error)
  } else {
    console.log('Seeded: admin@riceberg.vc / changeme123')
  }
}

seed()
