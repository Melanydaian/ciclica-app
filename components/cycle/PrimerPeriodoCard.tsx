'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function PrimerPeriodoCard() {
  const router = useRouter()
  const today = new Date().toISOString().split('T')[0]
  const [fecha, setFecha] = useState(today)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/perfil', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fecha_inicio_ciclo: fecha }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error ?? 'No pudimos guardar.')
        return
      }
      router.refresh()
    } catch {
      setError('Sin conexión.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-white rounded-3xl border border-pink-100 px-6 py-8">
      <div className="text-center mb-6">
        <div className="text-5xl mb-3">🌸</div>
        <h2 className="text-xl font-bold text-gray-800">
          Empecemos por tu último período
        </h2>
        <p className="text-sm text-gray-500 mt-3 max-w-sm mx-auto leading-relaxed">
          Decinos cuándo te vino la última vez para empezar a calcular tu ciclo.
          Vas a poder editarlo después si te equivocás.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 max-w-sm mx-auto">
        <div>
          <label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500 mb-2 block">
            Primer día de tu último período
          </label>
          <input
            type="date"
            value={fecha}
            max={today}
            onChange={e => setFecha(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl border border-pink-200 bg-pink-50/40 text-gray-800 focus:outline-none focus:ring-2 focus:ring-pink-300 text-base"
          />
        </div>

        {error && <p className="text-red-500 text-xs text-center">{error}</p>}

        <button
          type="submit"
          disabled={saving}
          className="w-full py-3 rounded-xl bg-[#EC4899] text-white font-semibold text-sm hover:bg-[#db2777] transition-colors disabled:opacity-60"
        >
          {saving ? 'Guardando...' : 'Empezar a usar Cíclica ✨'}
        </button>

        <p className="text-[11px] text-gray-400 text-center leading-relaxed">
          Si preferís, también podés contárselo por WhatsApp y va a aparecer acá automáticamente.
        </p>
      </form>
    </div>
  )
}
