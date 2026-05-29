import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase, createAdminSupabase } from '@/lib/supabase-server'
import { phaseAtDate } from '@/lib/cycle-forecast'

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.email) return NextResponse.json({ error: 'No autenticada' }, { status: 401 })

  const body = await req.json().catch(() => null)
  if (!body || typeof body.texto !== 'string' || !body.texto.trim()) {
    return NextResponse.json({ error: 'Texto requerido' }, { status: 400 })
  }
  const texto = body.texto.trim().slice(0, 4000)
  const fechaIso = typeof body.fecha === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(body.fecha)
    ? body.fecha
    : new Date().toISOString().split('T')[0]

  const admin = createAdminSupabase()
  const { data: webUser } = await admin
    .from('usuarias_web')
    .select('telefono')
    .eq('email', user.email)
    .single()
  if (!webUser?.telefono) return NextResponse.json({ error: 'Sin teléfono vinculado' }, { status: 400 })

  // Calcular fase
  const { data: usuaria } = await admin
    .from('usuarias')
    .select('fecha_inicio_ciclo, duracion_ciclo, promedio_duracion_ciclo')
    .eq('telefono', webUser.telefono)
    .maybeSingle()
  let fase: string | null = null
  if (usuaria?.fecha_inicio_ciclo) {
    const lastPeriod = new Date(usuaria.fecha_inicio_ciclo)
    const cycleLength = usuaria.promedio_duracion_ciclo ?? usuaria.duracion_ciclo ?? 28
    fase = phaseAtDate(new Date(fechaIso + 'T00:00:00'), lastPeriod, cycleLength, 5)
  }

  const { error } = await admin.from('journal_entries').insert({
    telefono: webUser.telefono,
    fecha: fechaIso,
    fase,
    texto,
  })
  if (error) {
    console.error('journal insert error:', error)
    return NextResponse.json({ error: 'No se pudo guardar' }, { status: 500 })
  }
  return NextResponse.json({ ok: true, fase })
}

export async function DELETE(req: NextRequest) {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.email) return NextResponse.json({ error: 'No autenticada' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Falta id' }, { status: 400 })

  const admin = createAdminSupabase()
  const { data: webUser } = await admin
    .from('usuarias_web')
    .select('telefono')
    .eq('email', user.email)
    .single()
  if (!webUser?.telefono) return NextResponse.json({ error: 'Sin teléfono' }, { status: 400 })

  const { error } = await admin
    .from('journal_entries')
    .delete()
    .eq('id', id)
    .eq('telefono', webUser.telefono)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
