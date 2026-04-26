import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { MercadoPagoConfig, PreApproval } from 'mercadopago'

const mp = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN! })

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

export async function POST(req: NextRequest) {
  const body = await req.json()

  // MP envía distintos tipos de notificaciones
  if (body.type !== 'preapproval') {
    return NextResponse.json({ ok: true })
  }

  const preApprovalId = body.data?.id
  if (!preApprovalId) return NextResponse.json({ ok: true })

  const preApproval = new PreApproval(mp)
  const subscription = await preApproval.get({ id: preApprovalId })

  const email = subscription.payer_email
  const activa = subscription.status === 'authorized'

  await supabaseAdmin
    .from('usuarias_web')
    .update({
      suscripcion_activa: activa,
      suscripcion_plan: activa ? 'premium' : 'free',
      proveedor_pago: 'mercadopago',
      mp_subscription_id: preApprovalId,
      mp_payer_id: String(subscription.payer_id ?? ''),
    })
    .eq('email', email)

  return NextResponse.json({ ok: true })
}
