'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? window.location.origin}/auth/callback` },
    })
    if (error) setError('Hubo un error. Verificá tu email e intentá de nuevo.')
    else setSent(true)
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-[#FFF9FB] overflow-x-hidden">
      <div className="w-full max-w-sm">
        {/* Logo sin márgenes negativos */}
        <div className="flex justify-center mb-6">
          <img src="/logo.png" alt="Cíclica" className="h-24 w-auto" />
        </div>

        {!sent ? (
          <div className="bg-white rounded-2xl shadow-sm border border-pink-100 p-6">
            <h1 className="text-xl font-semibold text-gray-800 mb-1">Ingresá a tu dashboard</h1>
            <p className="text-sm text-gray-500 mb-6">
              Te enviamos un enlace mágico a tu email. Sin contraseña.
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="tu@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-pink-200 bg-pink-50/40 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-300 text-base"
              />
              {error && <p className="text-red-500 text-xs">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-[#EC4899] text-white font-semibold text-sm hover:bg-[#db2777] active:bg-[#db2777] transition-colors disabled:opacity-60"
              >
                {loading ? 'Enviando...' : 'Enviarme el enlace ✨'}
              </button>
            </form>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-pink-100 p-6 text-center">
            <div className="text-4xl mb-4">💌</div>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">¡Revisá tu email!</h2>
            <p className="text-sm text-gray-500">
              Te mandamos un enlace a{' '}
              <span className="font-medium text-pink-500">{email}</span>.
              Tocá el enlace para entrar a tu dashboard.
            </p>
          </div>
        )}

        <p className="text-center text-xs text-gray-400 mt-6">
          ¿No tenés cuenta aún?{' '}
          <a href="https://wa.link/fub503" target="_blank" className="text-pink-500 font-medium">
            Empezá por WhatsApp
          </a>
        </p>
      </div>
    </div>
  )
}
