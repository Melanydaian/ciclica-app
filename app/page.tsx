'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'

// Shortlink del bot de Cíclica. Cambiar acá si rota el número.
const WHATSAPP_BOT_URL = 'https://wa.me/5491122879463?text=' + encodeURIComponent('Hola Cíclica, quiero entrar a mi dashboard 🌸')

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.997 8.997 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  )
}

function LoginForm() {
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loadingEmail, setLoadingEmail] = useState(false)
  const [loadingGoogle, setLoadingGoogle] = useState(false)
  const [error, setError] = useState('')
  const [showEmail, setShowEmail] = useState(false)

  useEffect(() => {
    const err = searchParams.get('error')
    if (err === 'link_expirado') {
      setError('El enlace expiró o ya fue usado. Pedí uno nuevo 👇')
    } else if (err === 'link_invalido') {
      setError('El enlace no es válido. Pedí uno nuevo 👇')
    } else if (err) {
      setError('Hubo un error al ingresar. Probá de nuevo 👇')
    }
  }, [searchParams])

  async function handleGoogle() {
    setError('')
    setLoadingGoogle(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? window.location.origin}/auth/callback`,
          queryParams: { access_type: 'offline', prompt: 'consent' },
        },
      })
      if (error) {
        console.error('Google OAuth error:', error)
        setError('No pudimos conectarte con Google. Probá con email o WhatsApp.')
        setLoadingGoogle(false)
      }
    } catch (err) {
      console.error('Google OAuth threw:', err)
      setError('No se pudo conectar con Google.')
      setLoadingGoogle(false)
    }
  }

  async function handleEmail(e: React.FormEvent) {
    e.preventDefault()
    setLoadingEmail(true)
    setError('')
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? window.location.origin}/auth/callback` },
      })
      if (error) {
        const isRate = /rate|too many|seconds/i.test(error.message)
        setError(
          isRate
            ? 'Pediste varios enlaces seguidos. Esperá un minuto y volvé a intentar.'
            : 'No pudimos enviar el enlace. Revisá tu email e intentá de nuevo.',
        )
      } else {
        setSent(true)
      }
    } catch (err) {
      console.error('signInWithOtp threw:', err)
      setError('No se pudo conectar con el servidor. Revisá tu conexión.')
    } finally {
      setLoadingEmail(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-[#FFF9FB] dark:bg-[#14101A] overflow-x-hidden transition-colors">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-6">
          <img src="/logo.svg" alt="Cíclica" className="h-24 w-auto" />
        </div>

        {sent ? (
          <div className="bg-white dark:bg-[#1F1822] rounded-2xl shadow-sm border border-pink-100 dark:border-[#3A2F3F] p-6 text-center">
            <div className="text-4xl mb-4">💌</div>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">¡Revisá tu email!</h2>
            <p className="text-sm text-gray-500">
              Te mandamos un enlace a{' '}
              <span className="font-medium text-pink-500">{email}</span>.
              Tocá el enlace para entrar.
            </p>
            <button
              onClick={() => {
                setSent(false)
                setEmail('')
              }}
              className="mt-4 text-xs text-gray-400 hover:text-gray-600 underline"
            >
              Usar otro método
            </button>
          </div>
        ) : (
          <div className="bg-white dark:bg-[#1F1822] rounded-2xl shadow-sm border border-pink-100 dark:border-[#3A2F3F] p-6">
            <h1 className="text-xl font-semibold text-gray-800 dark:text-[#F4F1F5] mb-1">Ingresá a tu dashboard</h1>
            <p className="text-sm text-gray-500 dark:text-[#B4ABB8] mb-6">Elegí cómo querés entrar</p>

            {/* Botón Google */}
            <button
              onClick={handleGoogle}
              disabled={loadingGoogle || loadingEmail}
              className="w-full py-3 rounded-xl bg-white border border-gray-200 text-gray-700 font-medium text-sm hover:bg-gray-50 active:bg-gray-100 transition-colors disabled:opacity-60 flex items-center justify-center gap-3"
            >
              <GoogleIcon />
              {loadingGoogle ? 'Conectando...' : 'Continuar con Google'}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-gray-100" />
              <span className="text-[10px] text-gray-400 font-medium tracking-wider">O CON EMAIL</span>
              <div className="flex-1 h-px bg-gray-100" />
            </div>

            {showEmail ? (
              <form onSubmit={handleEmail} className="space-y-3">
                <input
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoFocus
                  className="w-full px-4 py-3 rounded-xl border border-pink-200 bg-pink-50/40 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-300 text-base"
                />
                <button
                  type="submit"
                  disabled={loadingEmail || loadingGoogle}
                  className="w-full py-3 rounded-xl bg-[#EC4899] text-white font-semibold text-sm hover:bg-[#db2777] active:bg-[#db2777] transition-colors disabled:opacity-60"
                >
                  {loadingEmail ? 'Enviando...' : 'Enviarme el enlace ✨'}
                </button>
              </form>
            ) : (
              <button
                type="button"
                onClick={() => setShowEmail(true)}
                className="w-full py-3 rounded-xl bg-transparent border border-pink-200 text-pink-600 font-medium text-sm hover:bg-pink-50 transition-colors"
              >
                Recibir enlace por email
              </button>
            )}

            {error && <p className="text-red-500 text-xs mt-4 text-center">{error}</p>}
          </div>
        )}

        <p className="text-center text-xs text-gray-400 dark:text-[#8A8190] mt-6">
          ¿Nunca usaste Cíclica?{' '}
          <a href={WHATSAPP_BOT_URL} target="_blank" rel="noopener noreferrer" className="text-pink-500 font-medium">
            Empezá por WhatsApp
          </a>
        </p>

        <div className="text-center text-[10px] text-gray-400 mt-8 space-x-3">
          <a href="/privacidad" className="hover:text-pink-500">Política de privacidad</a>
          <span>·</span>
          <a href="/terminos" className="hover:text-pink-500">Términos</a>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
