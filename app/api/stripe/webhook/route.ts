import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

// Cliente admin (bypasea RLS) para el webhook
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
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
