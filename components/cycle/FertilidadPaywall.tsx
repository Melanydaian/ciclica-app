'use client'

import { useState } from 'react'

export default function FertilidadPaywall() {
  const [loading, setLoading] = useState(false)

  async function handleCheckout() {
    setLoading(true)
    const res = await fetch('/api/stripe/checkout', { method: 'POST' })
    const { url } = await res.json()
    if (url) window.location.href = url
    else setLoading(false)
  }

  return (
    <div className="bg-white rounded-2xl border border-purple-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-400 to-pink-400 px-5 py-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xl">🌡️</span>
          <h3 className="text-white font-semibold text-sm">Plan Fertilidad</h3>
          <span className="ml-auto text-xs bg-white/20 text-white px-2 py-0.5 rounded-full font-medium">
            $4 / mes
          </span>
        </div>
        <p className="text-purple-100 text-xs">Para quienes buscan o evitan el embarazo de forma natural</p>
      </div>

      {/* Features */}
      <div className="px-5 py-4 space-y-3">
        {[
          { icon: '🌡️', text: 'Registro de temperatura basal cada mañana' },
          { icon: '💧', text: 'Seguimiento de moco cervical' },
          { icon: '📈', text: 'Gráfico de temperatura con curva de ovulación' },
          { icon: '🎯', text: 'Ventana fértil confirmada (no estimada)' },
          { icon: '⚠️', text: 'Días de riesgo marcados en el calendario' },
        ].map(({ icon, text }) => (
          <div key={text} className="flex items-start gap-3">
            <span className="text-base leading-none mt-0.5">{icon}</span>
            <span className="text-xs text-gray-600">{text}</span>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="px-5 pb-5">
        <button
          onClick={handleCheckout}
          disabled={loading}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold text-sm hover:opacity-90 active:opacity-80 transition-opacity disabled:opacity-60"
        >
          {loading ? 'Redirigiendo...' : 'Desbloquear Plan Fertilidad ✨'}
        </button>
        <p className="text-center text-[10px] text-gray-400 mt-2">
          Cancelás cuando quieras · Pago seguro con Stripe
        </p>
      </div>
    </div>
  )
}
