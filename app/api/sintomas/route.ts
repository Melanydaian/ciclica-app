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
  if (!body || !Array.isArray(body.sintomas) || body.sintomas.length === 0) {
    return NextResponse.json({ error: 'Falta lista de síntomas' }, { status: 400 })
  }

  // Normalizar y filtrar
  const sintomas: string[] = body.sintomas
    .map((s: unknown) => (typeof s === 'string' ? s.trim().slice(0, 80) : ''))
    .filter((s: string) => s.length > 0)

  if (sintomas.length === 0) {
    return NextResponse.json({ error: 'Síntomas inválidos' }, { status: 400 })
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

  // Calcular fase actual
  const { data: usuaria } = await admin
    .from('usuarias')
    .select('fecha_inicio_ciclo, duracion_ciclo, promedio_duracion_ciclo')
    .eq('telefono', webUser.telefono)
    .maybeSingle()

  let fase: string | null = null
  if (usuaria?.fecha_inicio_ciclo) {
    const lastPeriod = new Date(usuaria.fecha_inicio_ciclo)
    const cycleLength = usuaria.promedio_duracion_ciclo ?? usuaria.duracion_ciclo ?? 28
    fase = phaseAtDate(new Date(), lastPeriod, cycleLength, 5)
  }

  // Insertar un registro por síntoma para mantener el patrón existente de n8n
  const rows = sintomas.map(sintoma => ({
    telefono: webUser.telefono,
    fase_actual: fase,
    sintoma,
  }))

  const { error } = await admin.from('registros_ciclo').insert(rows)

  if (error) {
    console.error('sintoma insert error:', error)
    return NextResponse.json({ error: 'No se pudo guardar' }, { status: 500 })
  }

  return NextResponse.json({ ok: true, count: sintomas.length, fase })
}
