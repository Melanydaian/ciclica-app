import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase, createAdminSupabase } from '@/lib/supabase-server'

// GET /api/cuenta — export all data of the current user as JSON
export async function GET() {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.email) return NextResponse.json({ error: 'No autenticada' }, { status: 401 })

  const admin = createAdminSupabase()
  const { data: webUser } = await admin
    .from('usuarias_web')
    .select('*')
    .eq('email', user.email)
    .single()
  if (!webUser?.telefono) return NextResponse.json({ error: 'Sin teléfono' }, { status: 400 })

  const telefono = webUser.telefono
  const telVariants = [telefono, `=${telefono}`, `+${telefono}`, `${telefono}@s.whatsapp.net`]

  const [usuaria, registros, ciclos, sex, pastilla, puntos, journal] = await Promise.all([
    admin.from('usuarias').select('*').eq('telefono', telefono).maybeSingle(),
    admin.from('registros_ciclo').select('*').in('telefono', telVariants),
    admin.from('historial_ciclos').select('*').in('telefono', telVariants),
    admin.from('sex_registros').select('*').in('user_id', telVariants),
    admin.from('pastillas_log').select('*').eq('telefono', telefono),
    admin.from('puntos_log').select('*').in('telefono', telVariants),
    admin.from('journal_entries').select('*').eq('telefono', telefono),
  ])

  const payload = {
    exportado_en: new Date().toISOString(),
    email: user.email,
    usuaria_web: webUser,
    usuaria: usuaria.data,
    registros_ciclo: registros.data ?? [],
    historial_ciclos: ciclos.data ?? [],
    sex_registros: sex.data ?? [],
    pastillas_log: pastilla.data ?? [],
    puntos_log: puntos.data ?? [],
    journal_entries: journal.data ?? [],
  }

  return new NextResponse(JSON.stringify(payload, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Disposition': `attachment; filename="ciclica-export-${new Date().toISOString().split('T')[0]}.json"`,
    },
  })
}

// DELETE /api/cuenta — borrar todo de la usuaria
export async function DELETE(req: NextRequest) {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.email || !user.id) return NextResponse.json({ error: 'No autenticada' }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  if (body.confirm !== 'BORRAR') {
    return NextResponse.json({ error: 'Debes confirmar escribiendo BORRAR' }, { status: 400 })
  }

  const admin = createAdminSupabase()
  const { data: webUser } = await admin
    .from('usuarias_web')
    .select('telefono')
    .eq('email', user.email)
    .single()

  const telefono = webUser?.telefono
  const telVariants = telefono
    ? [telefono, `=${telefono}`, `+${telefono}`, `${telefono}@s.whatsapp.net`]
    : []

  // Borrar todos los registros relacionados — orden importa (FK eventual)
  if (telefono) {
    await Promise.all([
      admin.from('journal_entries').delete().eq('telefono', telefono),
      admin.from('puntos_log').delete().in('telefono', telVariants),
      admin.from('pastillas_log').delete().eq('telefono', telefono),
      admin.from('sex_registros').delete().in('user_id', telVariants),
      admin.from('registros_ciclo').delete().in('telefono', telVariants),
      admin.from('historial_ciclos').delete().in('telefono', telVariants),
      admin.from('medical_share_tokens').delete().eq('telefono', telefono),
      admin.from('referidos').delete().or(`telefono_referidor.eq.${telefono},telefono_referida.eq.${telefono}`),
    ])
    await admin.from('usuarias').delete().eq('telefono', telefono)
  }
  await admin.from('usuarias_web').delete().eq('email', user.email)

  // Borrar usuario de Supabase Auth
  await admin.auth.admin.deleteUser(user.id).catch(err => {
    console.error('auth.admin.deleteUser failed:', err)
  })

  return NextResponse.json({ ok: true })
}
