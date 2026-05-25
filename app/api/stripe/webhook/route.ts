import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const stripeKey = process.env.STRIPE_SECRET_KEY
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_KEY

  if (!stripeKey || !webhookSecret || !supabaseUrl || !serviceKey) {
    return NextResponse.json({ error: 'Stripe webhook no configurado' }, { status: 503 })
  }

  const body = await req.text()
  const sig = req.headers.get('stripe-signature')
  if (!sig) {
    return NextResponse.json({ error: 'Firma faltante' }, { status: 400 })
  }

  const stripe = new Stripe(stripeKey)
  const supabaseAdmin = createClient(supabaseUrl, serviceKey)

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch (err) {
    console.error('Stripe webhook signature error:', err)
    return NextResponse.json({ error: 'Webhook inválido' }, { status: 400 })
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      if (session.mode === 'subscription') {
        await supabaseAdmin
          .from('usuarias_web')
          .update({
            suscripcion_activa: true,
            suscripcion_plan: 'premium',
            proveedor_pago: 'stripe',
            stripe_subscription_id: session.subscription as string,
          })
          .eq('stripe_customer_id', session.customer as string)
      }
      break
    }

    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription
      const activa = sub.status === 'active' || sub.status === 'trialing'
      await supabaseAdmin
        .from('usuarias_web')
        .update({
          suscripcion_activa: activa,
          suscripcion_plan: activa ? 'premium' : 'free',
          stripe_subscription_id: sub.id,
        })
        .eq('stripe_customer_id', sub.customer as string)
      break
    }

    case 'customer.subscription.deleted':
    case 'customer.subscription.paused': {
      const sub = event.data.object as Stripe.Subscription
      await supabaseAdmin
        .from('usuarias_web')
        .update({ suscripcion_activa: false, suscripcion_plan: 'free' })
        .eq('stripe_customer_id', sub.customer as string)
      break
    }
  }

  return NextResponse.json({ ok: true })
}
