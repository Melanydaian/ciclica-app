'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

function formatPhone(raw: string): string {
  // Strip everything except digits
  const digits = raw.replace(/\D/g, '')
  return `${digits}@s.whatsapp.net`
}

export default function OnboardingPage() {
  const router = useRouter()
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    const digits = phone.replace(/\D/g, '')
    if (digits.length < 10) {
      setError('Ingresá tu número completo con código de país (ej: 5491122334455)')
      return
    }

    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user?.email) {
      setError('Sesión inválida. Volvé a iniciar sesión.')
      setLoading(false)
      return
    }

    const telefono = formatPhone(digits)

    const { error: dbError } = await supabase
      .from('usuarias_web')
      .upsert({ email: user.email, telefono }, { onConflict: 'email' })

    if (dbError) {
      setError('No pudimos guardar tu número. Intentá de nuevo.')
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-[#FFF9FB] dark:bg-[#14101A] transition-colors">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-8">
          <img src="/logo.png" alt="Cíclica" className="h-24 w-auto" />
        </div>

        <div className="bg-white dark:bg-[#1F1822] rounded-2xl shadow-sm border border-pink-100 dark:border-[#3A2F3F] p-8">
          <h1 className="text-xl font-semibold text-gray-800 dark:text-[#F4F1F5] mb-1">Vinculá tu WhatsApp</h1>
          <p className="text-sm text-gray-500 dark:text-[#B4ABB8] mb-6">
            Para ver tu ciclo necesitamos conectar tu email con tu número de WhatsApp.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-gray-500 dark:text-[#B4ABB8] mb-1 block">
                Número de WhatsApp (con código de país)
              </label>
              <input
                type="tel"
                placeholder="ej: 5491122334455"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-pink-200 bg-pink-50/40 text-gray-800 dark:text-[#F4F1F5] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-300 text-sm"
              />
              <p className="text-xs text-gray-400 dark:text-[#8A8190] mt-1">
                Argentina: 549 + código de área + número (sin el 15)
              </p>
            </div>

            {error && <p className="text-red-500 text-xs">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-[#EC4899] text-white font-semibold text-sm hover:bg-[#db2777] transition-colors disabled:opacity-60"
            >
              {loading ? 'Guardando...' : 'Ver mi dashboard →'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-400 dark:text-[#8A8190] mt-6">
          ¿Nunca usaste Cíclica por WhatsApp?{' '}
          <a href="https://wa.link/fub503" target="_blank" className="text-pink-500 font-medium">
            Empezá acá
          </a>
        </p>
      </div>
    </div>
  )
}
