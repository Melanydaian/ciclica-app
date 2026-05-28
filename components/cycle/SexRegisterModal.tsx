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

const WHATSAPP_INTIMIDAD = 'https://wa.link/fub503?text=' + encodeURIComponent('Hola Cíclica, quiero registrar un momento íntimo 💗')

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

            <div className="pt-2 space-y-3">
              <button
                type="submit"
                disabled={saving}
                className="w-full py-3 rounded-xl bg-[#EC4899] text-white font-semibold text-sm hover:bg-[#db2777] transition-colors disabled:opacity-60"
              >
                {saving ? 'Guardando...' : 'Guardar 💗'}
              </button>

              <a
                href={WHATSAPP_INTIMIDAD}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 rounded-xl bg-white border-2 border-[#25D366]/40 hover:border-[#25D366] text-gray-700 font-medium text-sm transition-colors flex items-center justify-center gap-2"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#25D366">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z"/>
                </svg>
                Prefiero anotarlo con Cíclica
              </a>

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
