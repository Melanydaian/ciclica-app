import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase, createAdminSupabase } from '@/lib/supabase-server'
import { phaseAtDate } from '@/lib/cycle-forecast'

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.email) {
    return NextResponse.json({ error: 'No autenticada' }, { status: 401 })
  }

  const body = await req.json().catch(() => null)
  if (!body || !body.fecha) {
    return NextResponse.json({ error: 'Falta fecha' }, { status: 400 })
  }

  // Validar fecha
  const fechaIso = String(body.fecha)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fechaIso)) {
    return NextResponse.json({ error: 'Fecha inválida' }, { status: 400 })
  }

  const admin = createAdminSupabase()
  const { data: webUser } = await admin
    .from('usuarias_web')
    .select('telefono')
    .eq('email', user.email)
    .single()

  if (!webUser?.telefono) {
    return NextResponse.json({ error: 'Sin teléfono vinculado' }, { status: 400 })
  }

  // Calcular la fase del ciclo en esa fecha
  const { data: usuaria } = await admin
    .from('usuarias')
    .select('fecha_inicio_ciclo, duracion_ciclo, promedio_duracion_ciclo')
    .eq('telefono', webUser.telefono)
    .maybeSingle()

  let fase = 'desconocida'
  if (usuaria?.fecha_inicio_ciclo) {
    const lastPeriod = new Date(usuaria.fecha_inicio_ciclo)
    const cycleLength =
      usuaria.promedio_duracion_ciclo ?? usuaria.duracion_ciclo ?? 28
    const fecha = new Date(fechaIso + 'T00:00:00')
    fase = phaseAtDate(fecha, lastPeriod, cycleLength, 5) ?? 'desconocida'
  }

  const hubo = String(body.hubo_proteccion ?? '').toLowerCase()
  const huboProteccion =
    hubo === 'si' || hubo === 'sí' || hubo === 'true' ? 'si'
    : hubo === 'no' || hubo === 'false' ? 'no'
    : 'no_recuerdo'

  const proteccion =
    typeof body.proteccion === 'string' && body.proteccion.trim()
      ? body.proteccion.trim().slice(0, 80)
      : null

  const nota =
    typeof body.nota_adicional === 'string' && body.nota_adicional.trim()
      ? body.nota_adicional.trim().slice(0, 500)
      : null

  const { error } = await admin
    .from('sex_registros')
    .insert({
      user_id: webUser.telefono,
      fecha: fechaIso,
      fase,
      hubo_proteccion: huboProteccion,
      proteccion,
      nota_adicional: nota,
    })

  if (error) {
    console.error('sex insert error:', error)
    return NextResponse.json({ error: 'No se pudo guardar' }, { status: 500 })
  }

  return NextResponse.json({ ok: true, fase })
}
