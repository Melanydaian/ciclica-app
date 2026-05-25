import { NextResponse } from 'next/server'
import { createAdminSupabase } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const dbConfigured = !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY)
  let db: 'up' | 'down' | 'unconfigured' = 'unconfigured'

  if (dbConfigured) {
    try {
      const admin = createAdminSupabase()
      const { error } = await admin.from('usuarias_web').select('email').limit(1)
      db = error ? 'down' : 'up'
    } catch {
      db = 'down'
    }
  }

  const ok = !dbConfigured || db === 'up'
  return NextResponse.json(
    {
      ok,
      db,
      stripe: !!process.env.STRIPE_SECRET_KEY,
      mp: !!process.env.MP_ACCESS_TOKEN,
      timestamp: new Date().toISOString(),
    },
    { status: ok ? 200 : 503 },
  )
}
