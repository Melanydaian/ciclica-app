import { NextResponse } from 'next/server'
import type { EmailOtpType } from '@supabase/supabase-js'
import { createServerSupabase } from '@/lib/supabase-server'

function getAppUrl(request: Request): string {
  const fromEnv = process.env.NEXT_PUBLIC_APP_URL
  if (fromEnv) return fromEnv.replace(/\/$/, '')
  return new URL(request.url).origin
}

/**
 * Bridge endpoint para magic links. El template de email de Supabase apunta acá
 * (no a melsupabase.n8nflip.online/auth/v1/verify) — así el usuario sólo ve
 * dominios de Cíclica y no leakeamos la URL del backend.
 *
 * El template del email debe armar el link así:
 *   {{ .SiteURL }}/auth/verify?token_hash={{ .TokenHash }}&type=magiclink&next=/dashboard
 */
export async function GET(request: Request) {
  const appUrl = getAppUrl(request)
  const { searchParams } = new URL(request.url)
  const tokenHash = searchParams.get('token_hash')
  const type = (searchParams.get('type') ?? 'magiclink') as EmailOtpType
  const next = searchParams.get('next') ?? '/dashboard'

  // Ruta destino debe ser interna (no permitir open redirect)
  const safeNext = next.startsWith('/') && !next.startsWith('//') ? next : '/dashboard'

  if (!tokenHash) {
    return NextResponse.redirect(`${appUrl}/?error=link_invalido`)
  }

  const supabase = await createServerSupabase()
  const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type })

  if (error) {
    console.error('verifyOtp error:', error.message)
    return NextResponse.redirect(`${appUrl}/?error=link_expirado`)
  }

  return NextResponse.redirect(`${appUrl}${safeNext}`)
}
