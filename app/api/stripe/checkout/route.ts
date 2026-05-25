import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createServerSupabase } from '@/lib/supabase-server'

export async function POST() {
  const stripeKey = process.env.STRIPE_SECRET_KEY
  const priceId = process.env.STRIPE_PRICE_ID
  const appUrl = process.env.NEXT_PUBLIC_APP_URL

  if (!stripeKey || !priceId) {
    return NextResponse.json(
      { error: 'Stripe no está configurado en el servidor.' },
      { status: 503 },
    )
  }

  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user?.email) {
    return NextResponse.json({ error: 'No autenticada' }, { status: 401 })
  }

  const stripe = new Stripe(stripeKey)

  const { data: webUser } = await supabase
    .from('usuarias_web')
    .select('stripe_customer_id')
    .eq('email', user.email)
    .single()

  let customerId = webUser?.stripe_customer_id

  if (!customerId) {
    const customer = await stripe.customers.create({ email: user.email })
    customerId = customer.id
    await supabase
      .from('usuarias_web')
      .update({ stripe_customer_id: customerId })
      .eq('email', user.email)
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${appUrl}/dashboard?plan=activado`,
    cancel_url: `${appUrl}/dashboard`,
    locale: 'es-419',
  })

  return NextResponse.json({ url: session.url })
}
