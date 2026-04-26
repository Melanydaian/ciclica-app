'use client'

import { useState } from 'react'

const FEATURES = [
  { icon: '🌡️', text: 'Método sintotérmico — temperatura + moco cervical' },
  { icon: '💊', text: 'Recordatorio diario de pastillas a tu hora' },
  { icon: '🌙', text: 'Alertas proactivas por fase del ciclo' },
  { icon: '📄', text: 'Exportar historial en PDF para tu ginecóloga' },
  { icon: '🔍', text: 'Análisis de patrones con IA' },
  { icon: '📅', text: 'Historial ilimitado de ciclos' },
]

export default function PremiumCard() {
  const [loadingStripe, setLoadingStripe] = useState(false)
  const [loadingMP, setLoadingMP] = useState(false)

  async function handleStripe() {
    setLoadingStripe(true)
    const res = await fetch('/api/stripe/checkout', { method: 'POST' })
    const { url } = await res.json()
    if (url) window.location.href = url
    else setLoadingStripe(false)
  }

  async function handleMP() {
    setLoadingMP(true)
    const res = await fetch('/api/mp/checkout', { method: 'POST' })
    const { url } = await res.json()
    if (url) window.location.href = url
    else setLoadingMP(false)
  }

  return (
    <div className="bg-white rounded-2xl border border-purple-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 px-5 py-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white font-bold text-base">Plan Premium ✨</p>
            <p className="text-purple-100 text-xs mt-0.5">Todo lo que necesitás para conocer tu cuerpo</p>
          </div>
          <div className="text-right">
            <p className="text-white font-bold text-2xl">$4.99</p>
            <p className="text-purple-200 text-xs">por mes</p>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="px-5 py-4 space-y-2.5">
        {FEATURES.map(({ icon, text }) => (
          <div key={text} className="flex items-start gap-3">
            <span className="text-base leading-none mt-0.5">{icon}</span>
            <span className="text-xs text-gray-600 leading-snug">{text}</span>
          </div>
        ))}
      </div>

      {/* Botones de pago */}
      <div className="px-5 pb-5 space-y-2">
        {/* Mercado Pago — primero por ser LATAM */}
        <button
          onClick={handleMP}
          disabled={loadingMP || loadingStripe}
          className="w-full py-3 rounded-xl font-semibold text-sm transition-opacity disabled:opacity-60 flex items-center justify-center gap-2"
          style={{ background: '#009EE3', color: '#fff' }}
        >
          {loadingMP ? 'Redirigiendo...' : (
            <>
              <span>Pagar con Mercado Pago</span>
              <span className="text-base">💳</span>
            </>
          )}
        </button>

        {/* Stripe */}
        <button
          onClick={handleStripe}
          disabled={loadingStripe || loadingMP}
          className="w-full py-3 rounded-xl bg-gray-900 text-white font-semibold text-sm hover:bg-gray-800 active:bg-gray-800 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {loadingStripe ? 'Redirigiendo...' : (
            <>
              <span>Pagar con tarjeta</span>
              <span className="text-base">💳</span>
            </>
          )}
        </button>

        <p className="text-center text-[10px] text-gray-400">
          Cancelás cuando quieras · Pago 100% seguro
        </p>
      </div>
    </div>
  )
}
