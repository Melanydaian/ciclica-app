import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'

function getAppUrl(request: Request): string {
  const fromEnv = process.env.NEXT_PUBLIC_APP_URL
  if (fromEnv) return fromEnv.replace(/\/$/, '')
  return new URL(request.url).origin
}

export async function GET(request: Request) {
  const appUrl = getAppUrl(request)
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  if (error) {
    return NextResponse.redirect(`${appUrl}/?error=${encodeURIComponent(error)}`)
  }

  if (!code) {
    return NextResponse.redirect(`${appUrl}/?error=link_expirado`)
  }

  const supabase = await createServerSupabase()
  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
  if (exchangeError) {
    return NextResponse.redirect(`${appUrl}/?error=link_expirado`)
  }

  return NextResponse.redirect(`${appUrl}/dashboard`)
}
