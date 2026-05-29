import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase, createAdminSupabase } from '@/lib/supabase-server'

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.email) return NextResponse.json({ error: 'No autenticada' }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const dias = Math.max(1, Math.min(30, Number(body.dias ?? 7)))

  const admin = createAdminSupabase()
  const { data: webUser } = await admin
    .from('usuarias_web')
    .select('telefono')
    .eq('email', user.email)
    .single()
  if (!webUser?.telefono) return NextResponse.json({ error: 'Sin teléfono' }, { status: 400 })

  const expira = new Date()
  expira.setDate(expira.getDate() + dias)

  const { data, error } = await admin
    .from('medical_share_tokens')
    .insert({
      telefono: webUser.telefono,
      email: user.email,
      expira: expira.toISOString(),
    })
    .select('token, expira')
    .single()

  if (error) {
    console.error('share insert error:', error)
    return NextResponse.json({ error: 'No se pudo crear el link' }, { status: 500 })
  }
  return NextResponse.json({ token: data.token, expira: data.expira })
}

export async function DELETE(req: NextRequest) {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.email) return NextResponse.json({ error: 'No autenticada' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const token = searchParams.get('token')
  if (!token) return NextResponse.json({ error: 'Falta token' }, { status: 400 })

  const admin = createAdminSupabase()
  const { error } = await admin
    .from('medical_share_tokens')
    .update({ revocado: true })
    .eq('token', token)
    .eq('email', user.email)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
