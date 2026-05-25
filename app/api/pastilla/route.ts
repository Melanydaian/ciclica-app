import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase, createAdminSupabase } from '@/lib/supabase-server'

async function getTelefono() {
  const supabase = await createServerSupabase()
  const admin = createAdminSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.email) return null

  const { data: webUser } = await admin
    .from('usuarias_web')
    .select('telefono')
    .eq('email', user.email)
    .single()

  return webUser?.telefono ?? null
}

export async function GET() {
  const telefono = await getTelefono()
  if (!telefono) return NextResponse.json({ data: null }, { status: 401 })

  const admin = createAdminSupabase()
  const hoy = new Date().toISOString().split('T')[0]

  const { data } = await admin
    .from('pastillas_log')
    .select('tomada, hora')
    .eq('telefono', telefono)
    .eq('fecha', hoy)
    .single()

  return NextResponse.json({ data })
}

export async function POST(request: NextRequest) {
  const telefono = await getTelefono()
  if (!telefono) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const admin = createAdminSupabase()
  const hoy = new Date().toISOString().split('T')[0]

  const { data, error } = await admin
    .from('pastillas_log')
    .upsert(
      { telefono, fecha: hoy, tomada: body.tomada, hora: body.hora ?? null },
      { onConflict: 'telefono,fecha' }
    )
    .select('tomada, hora')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}
