'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

const SINTOMAS_COMUNES = [
  'Cólicos',
  'Dolor lumbar',
  'Dolor de cabeza',
  'Cansancio',
  'Hinchazón',
  'Sensibilidad mamaria',
  'Antojos',
  'Acné',
  'Náuseas',
  'Ansiedad',
  'Irritabilidad',
  'Tristeza',
  'Energía alta',
  'Libido alta',
  'Insomnio',
  'Sueño excesivo',
]

const WHATSAPP_SINTOMAS = 'https://wa.link/fub503?text=' + encodeURIComponent('Hola Cíclica, quiero registrar cómo me siento hoy 🌸')

export default function SintomaRegisterModal({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const router = useRouter()
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [otro, setOtro] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    setSelected(new Set())
    setOtro('')
    setError('')
    setDone(false)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  function toggle(s: string) {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(s)) next.delete(s)
      else next.add(s)
      return next
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const all = Array.from(selected)
    if (otro.trim()) all.push(otro.trim())
    if (all.length === 0) {
      setError('Elegí al menos uno o escribí cómo te sentís.')
      return
    }
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/sintomas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sintomas: all }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error ?? 'No pudimos guardar.')
        return
      }
      setDone(true)
      router.refresh()
      setTimeout(() => onClose(), 1200)
    } catch (err) {
      console.error(err)
      setError('No se pudo conectar.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Registrar síntomas"
        className="relative w-full md:max-w-md max-h-[92vh] bg-white rounded-t-3xl md:rounded-3xl shadow-2xl flex flex-col overflow-hidden"
      >
        <div className="px-5 pt-5 pb-3 border-b border-gray-100">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl leading-none">🌸</span>
                <h2 className="text-lg font-bold text-gray-800">¿Cómo te sentís?</h2>
              </div>
              <p className="text-xs text-gray-500">Elegí lo que sentiste hoy. Podés sumar varias.</p>
            </div>
            <button
              onClick={onClose}
              aria-label="Cerrar"
              className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center text-lg leading-none"
            >
              ×
            </button>
          </div>
        </div>

        {done ? (
          <div className="p-8 text-center">
            <div className="text-4xl mb-3">✨</div>
            <p className="text-base font-semibold text-gray-800">Anotado</p>
            <p className="text-sm text-gray-500 mt-1">Lo sumamos a tu historial · +5 pts por cada uno</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="overflow-y-auto px-5 py-5 space-y-5 flex-1">
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500 mb-3 block">
                Síntomas comunes
              </label>
              <div className="flex flex-wrap gap-2">
                {SINTOMAS_COMUNES.map(s => {
                  const active = selected.has(s)
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => toggle(s)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                        active
                          ? 'bg-pink-500 text-white border-pink-500'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-pink-200 hover:text-pink-600'
                      }`}
                    >
                      {s}
                    </button>
                  )
                })}
              </div>
              <p className="text-[10px] text-gray-400 mt-2">
                {selected.size > 0 ? `${selected.size} seleccionado${selected.size > 1 ? 's' : ''}` : 'Tocá para seleccionar'}
              </p>
            </div>

            <div>
              <label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500 mb-2 block">
                Otro síntoma o nota
              </label>
              <input
                type="text"
                value={otro}
                onChange={e => setOtro(e.target.value)}
                placeholder="Ej: dolor en la cadera, ganas de llorar..."
                maxLength={80}
                className="w-full px-4 py-3 rounded-xl border border-pink-200 bg-pink-50/40 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-300 text-sm"
              />
            </div>

            {error && <p className="text-red-500 text-xs">{error}</p>}

            <div className="pt-2 space-y-3">
              <button
                type="submit"
                disabled={saving}
                className="w-full py-3 rounded-xl bg-[#EC4899] text-white font-semibold text-sm hover:bg-[#db2777] transition-colors disabled:opacity-60"
              >
                {saving ? 'Guardando...' : `Guardar ${selected.size + (otro.trim() ? 1 : 0) > 0 ? `(${selected.size + (otro.trim() ? 1 : 0)})` : ''}`}
              </button>

              <div className="text-center">
                <a
                  href={WHATSAPP_SINTOMAS}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block text-xs text-gray-500 hover:text-pink-500 underline underline-offset-2 transition-colors"
                >
                  🤍 mejor lo anoto por WhatsApp
                </a>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
