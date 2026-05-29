'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

const WHATSAPP_PERIODO =
  'https://wa.link/fub503?text=' +
  encodeURIComponent('Hola Cíclica, quiero registrar el primer día de mi período 🩸')

export default function RegistrarPeriodoModal({
  open,
  onClose,
  fechaActual,
}: {
  open: boolean
  onClose: () => void
  fechaActual?: string | null
}) {
  const router = useRouter()
  const today = new Date().toISOString().split('T')[0]
  const [fecha, setFecha] = useState(fechaActual ?? today)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    setFecha(fechaActual ?? today)
    setError('')
    setDone(false)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose, fechaActual, today])

  if (!open) return null

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
      setDone(true)
      router.refresh()
      setTimeout(() => onClose(), 1100)
    } catch {
      setError('Sin conexión')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Registrar período"
        className="relative w-full md:max-w-md bg-white dark:bg-gray-900 rounded-t-3xl md:rounded-3xl shadow-2xl flex flex-col overflow-hidden"
      >
        <div className="px-5 pt-5 pb-3 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl leading-none">🩸</span>
                <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">Registrar período</h2>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Marcá el primer día de tu período.
              </p>
            </div>
            <button
              onClick={onClose}
              aria-label="Cerrar"
              className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 flex items-center justify-center text-lg leading-none"
            >
              ×
            </button>
          </div>
        </div>

        {done ? (
          <div className="p-8 text-center">
            <div className="text-4xl mb-3">🌸</div>
            <p className="text-base font-semibold text-gray-800 dark:text-gray-100">Registrado</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-5 py-5 space-y-4">
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400 mb-2 block">
                Primer día del período
              </label>
              <input
                type="date"
                value={fecha}
                max={today}
                onChange={e => setFecha(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-pink-200 dark:border-gray-700 bg-pink-50/40 dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-pink-300 text-base"
              />
            </div>

            {error && <p className="text-red-500 text-xs">{error}</p>}

            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 rounded-xl bg-[#EC4899] text-white font-semibold text-sm hover:bg-[#db2777] transition-colors disabled:opacity-60"
            >
              {saving ? 'Guardando...' : 'Guardar 🩸'}
            </button>

            <div className="text-center">
              <a
                href={WHATSAPP_PERIODO}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block text-xs text-gray-500 dark:text-gray-400 hover:text-pink-500 underline underline-offset-2 transition-colors"
              >
                🤍 mejor lo anoto por WhatsApp
              </a>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
