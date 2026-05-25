import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { MercadoPagoConfig, PreApproval } from 'mercadopago'
import crypto from 'crypto'

export const runtime = 'nodejs'

function verifyMpSignature(req: NextRequest, dataId: string, secret: string): boolean {
  const xSignature = req.headers.get('x-signature') ?? ''
  const xRequestId = req.headers.get('x-request-id') ?? ''
  if (!xSignature || !xRequestId) return false

  const parts = Object.fromEntries(
    xSignature.split(',').map(s => s.trim().split('=').map(v => v.trim())),
  )
  const ts = parts.ts
  const v1 = parts.v1
  if (!ts || !v1) return false

  const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`
  const expected = crypto.createHmac('sha256', secret).update(manifest).digest('hex')
  try {
    return crypto.timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(v1, 'hex'))
  } catch {
    return false
  }
}

export async function POST(req: NextRequest) {
  const mpToken = process.env.MP_ACCESS_TOKEN
  const mpSecret = process.env.MP_WEBHOOK_SECRET
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_KEY

  if (!mpToken || !supabaseUrl || !serviceKey) {
    return NextResponse.json({ error: 'MP webhook no configurado' }, { status: 503 })
  }

  const body = await req.json().catch(() => null)
  if (!body || body.type !== 'preapproval') {
    return NextResponse.json({ ok: true })
  }

  const preApprovalId = body.data?.id
  if (!preApprovalId) return NextResponse.json({ ok: true })

  // Verificar firma si hay secret configurado (en dev puede no estarlo)
  if (mpSecret && !verifyMpSignature(req, preApprovalId, mpSecret)) {
    console.warn('MP webhook firma inválida')
    return NextResponse.json({ error: 'Firma inválida' }, { status: 401 })
  }

  const mp = new MercadoPagoConfig({ accessToken: mpToken })
  const preApproval = new PreApproval(mp)
  const subscription = await preApproval.get({ id: preApprovalId })

  const email = subscription.payer_email
  const activa = subscription.status === 'authorized'

  if (!email) {
    return NextResponse.json({ ok: true })
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceKey)
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
