import { redirect } from 'next/navigation'
import { createServerSupabase, createAdminSupabase } from './supabase-server'

export type UsuariaContext = {
  email: string
  telefono: string
  webUser: {
    nombre: string | null
    suscripcion_activa: boolean
    suscripcion_plan: string | null
    stripe_customer_id: string | null
  }
}

export async function requireUsuaria(): Promise<UsuariaContext> {
  const supabase = await createServerSupabase()
  const admin = createAdminSupabase()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user?.email) redirect('/')

  // SELECT con columnas opcionales (de migraciones 008+009). Si la columna falta,
  // intentamos con el set mínimo.
  let { data: webUser } = await admin
    .from('usuarias_web')
    .select('telefono, nombre, suscripcion_activa, suscripcion_plan, stripe_customer_id')
    .eq('email', user.email)
    .maybeSingle()

  if (!webUser) {
    const fallback = await admin
      .from('usuarias_web')
      .select('telefono, nombre')
      .eq('email', user.email)
      .maybeSingle()
    if (fallback.data) {
      webUser = {
        ...fallback.data,
        suscripcion_activa: false,
        suscripcion_plan: 'free',
        stripe_customer_id: null,
      }
    }
  }

  if (!webUser?.telefono) redirect('/onboarding')

  return {
    email: user.email,
    telefono: webUser.telefono,
    webUser: {
      nombre: webUser.nombre,
      suscripcion_activa: webUser.suscripcion_activa ?? false,
      suscripcion_plan: webUser.suscripcion_plan ?? 'free',
      stripe_customer_id: webUser.stripe_customer_id ?? null,
    },
  }
}
