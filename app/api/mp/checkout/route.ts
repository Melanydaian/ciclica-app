import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'
import { MercadoPagoConfig, PreApproval } from 'mercadopago'

const mp = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN! })

export async function POST() {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user?.email) {
    return NextResponse.json({ error: 'No autenticada' }, { status: 401 })
  }

  const preApproval = new PreApproval(mp)

  const result = await preApproval.create({
    body: {
      reason: 'Plan Premium Cíclica',
      payer_email: user.email,
      auto_recurring: {
        frequency: 1,
        frequency_type: 'months',
        transaction_amount: Number(process.env.MP_PLAN_AMOUNT ?? 4.99),
        currency_id: process.env.MP_CURRENCY ?? 'USD',
      },
      back_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?plan=activado`,
      status: 'pending',
    },
  })

  return NextResponse.json({ url: result.init_point })
}
