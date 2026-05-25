import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase, createAdminSupabase } from '@/lib/supabase-server'

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.email) {
    return NextResponse.json({ error: 'No autenticada' }, { status: 401 })
  }

  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Body inválido' }, { status: 400 })

  const admin = createAdminSupabase()
  const { data: webUser } = await admin
    .from('usuarias_web')
    .select('telefono')
    .eq('email', user.email)
    .single()

  if (!webUser?.telefono) {
    return NextResponse.json({ error: 'Sin teléfono vinculado' }, { status: 400 })
  }

  const updates: Record<string, unknown> = {}
  if (typeof body.duracion_ciclo === 'number' && body.duracion_ciclo >= 21 && body.duracion_ciclo <= 40) {
    updates.duracion_ciclo = body.duracion_ciclo
  }
  if (typeof body.toma_anticonceptivas === 'boolean') {
    updates.toma_anticonceptivas = body.toma_anticonceptivas
  }
  if (typeof body.recordatorio_pastilla_hora === 'string' && /^\d{2}:\d{2}$/.test(body.recordatorio_pastilla_hora)) {
    updates.recordatorio_pastilla_hora = body.recordatorio_pastilla_hora
  }
  if (typeof body.recordatorio_pastilla_activo === 'boolean') {
    updates.recordatorio_pastilla_activo = body.recordatorio_pastilla_activo
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'Nada para actualizar' }, { status: 400 })
  }

  const { error } = await admin
    .from('usuarias')
    .update(updates)
    .eq('telefono', webUser.telefono)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
