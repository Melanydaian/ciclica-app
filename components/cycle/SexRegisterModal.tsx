'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

const PROTECCION_OPTS = [
  { value: 'preservativo', label: 'Preservativo' },
  { value: 'anticonceptivo_oral', label: 'Pastilla anticonceptiva' },
  { value: 'diu', label: 'DIU / SIU' },
  { value: 'inyectable', label: 'Inyectable' },
  { value: 'metodo_natural', label: 'Método del calendario' },
  { value: 'otro', label: 'Otro' },
  { value: 'ninguno', label: 'Ninguno' },
]

export default function SexRegisterModal({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const router = useRouter()
  const today = new Date().toISOString().split('T')[0]

  const [fecha, setFecha] = useState(today)
  const [huboProteccion, setHuboProteccion] = useState<'si' | 'no' | 'no_recuerdo'>('si')
  const [proteccion, setProteccion] = useState('preservativo')
  const [nota, setNota] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    // reset al abrir
    setFecha(today)
    setHuboProteccion('si')
    setProteccion('preservativo')
    setNota('')
    setError('')
    setDone(false)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose, today])

  if (!open) return null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/sex', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fecha,
          hubo_proteccion: huboProteccion,
          proteccion: huboProteccion === 'no' ? null : proteccion,
          nota_adicional: nota || null,
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error ?? 'No pudimos guardar el registro.')
        return
      }
      setDone(true)
      router.refresh()
      setTimeout(() => onClose(), 1200)
    } catch (err) {
      console.error(err)
      setError('No se pudo conectar. Probá de nuevo.')
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
        aria-label="Registrar momento íntimo"
        className="relative w-full md:max-w-md max-h-[92vh] bg-white rounded-t-3xl md:rounded-3xl shadow-2xl flex flex-col overflow-hidden"
      >
        <div className="px-5 pt-5 pb-3 border-b border-gray-100">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl leading-none">💗</span>
                <h2 className="text-lg font-bold text-gray-800">Momento íntimo</h2>
              </div>
              <p className="text-xs text-gray-500">Quedará entre vos y tu data — sirve para entender mejor tu ciclo.</p>
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
            <div className="text-4xl mb-3">🌸</div>
            <p className="text-base font-semibold text-gray-800">Registrado</p>
            <p className="text-sm text-gray-500 mt-1">Lo sumamos a tu historial.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="overflow-y-auto px-5 py-5 space-y-5 flex-1">
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500 mb-2 block">
                Cuándo
              </label>
              <input
                type="date"
                value={fecha}
                max={today}
                onChange={e => setFecha(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-pink-200 bg-pink-50/40 text-gray-800 focus:outline-none focus:ring-2 focus:ring-pink-300 text-sm"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500 mb-2 block">
                ¿Hubo protección?
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { v: 'si', label: 'Sí' },
                  { v: 'no', label: 'No' },
                  { v: 'no_recuerdo', label: 'No recuerdo' },
                ].map(o => (
                  <button
                    key={o.v}
                    type="button"
                    onClick={() => setHuboProteccion(o.v as 'si' | 'no' | 'no_recuerdo')}
                    className={`py-2.5 rounded-xl text-sm font-medium transition-all border ${
                      huboProteccion === o.v
                        ? 'bg-pink-500 text-white border-pink-500'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-pink-200'
                    }`}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>

            {huboProteccion !== 'no' && (
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500 mb-2 block">
                  Tipo de método
                </label>
                <select
                  value={proteccion}
                  onChange={e => setProteccion(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-pink-200 bg-pink-50/40 text-gray-800 focus:outline-none focus:ring-2 focus:ring-pink-300 text-sm appearance-none"
                  style={{
                    backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'8\' viewBox=\'0 0 12 8\'%3E%3Cpath fill=\'%23EC4899\' d=\'M6 8L0 0h12z\'/%3E%3C/svg%3E")',
                    backgroundPosition: 'right 16px center',
                    backgroundRepeat: 'no-repeat',
                    paddingRight: '40px',
                  }}
                >
                  {PROTECCION_OPTS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500 mb-2 block">
                Nota (opcional)
              </label>
              <textarea
                value={nota}
                onChange={e => setNota(e.target.value)}
                rows={3}
                maxLength={500}
                placeholder="Cómo te sentiste, algo a recordar..."
                className="w-full px-4 py-3 rounded-xl border border-pink-200 bg-pink-50/40 text-gray-800 focus:outline-none focus:ring-2 focus:ring-pink-300 text-sm resize-none"
              />
            </div>

            {error && <p className="text-red-500 text-xs">{error}</p>}

            <div className="pt-2 space-y-2">
              <button
                type="submit"
                disabled={saving}
                className="w-full py-3 rounded-xl bg-[#EC4899] text-white font-semibold text-sm hover:bg-[#db2777] transition-colors disabled:opacity-60"
              >
                {saving ? 'Guardando...' : 'Guardar 💗'}
              </button>
              <p className="text-[10px] text-gray-400 text-center leading-relaxed">
                Tu data es privada y solo vos podés verla.
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
