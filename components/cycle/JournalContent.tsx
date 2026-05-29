'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export type JournalEntry = {
  id: string
  fecha: string
  fase: string | null
  texto: string
}

const FASE_COLOR: Record<string, string> = {
  menstrual: '#EC4899',
  folicular: '#34D399',
  ovulatoria: '#FBBF24',
  lutea: '#A78BFA',
}

export default function JournalContent({ entries }: { entries: JournalEntry[] }) {
  const router = useRouter()
  const [texto, setTexto] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!texto.trim()) return
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/journal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ texto }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error ?? 'No pudimos guardar.')
        return
      }
      setTexto('')
      router.refresh()
    } finally {
      setSaving(false)
    }
  }

  async function eliminar(id: string) {
    if (!confirm('¿Borrar esta nota?')) return
    await fetch(`/api/journal?id=${encodeURIComponent(id)}`, { method: 'DELETE' })
    router.refresh()
  }

  return (
    <div className="space-y-4">
      <div className="pb-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-400">Tu diario</p>
        <h1 className="text-2xl font-bold text-gray-800 mt-1">Cómo te sentís hoy</h1>
        <p className="text-sm text-gray-500 mt-2 leading-relaxed">
          Escribí libremente. Lo que pasa por tu cabeza, tu cuerpo, tu día.
          Lo guardamos junto con la fase de tu ciclo para que veas patrones después.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-pink-100 p-5 space-y-3">
        <textarea
          value={texto}
          onChange={e => setTexto(e.target.value)}
          rows={5}
          maxLength={4000}
          placeholder="Hoy me sentí..."
          className="w-full px-4 py-3 rounded-xl border border-pink-100 bg-pink-50/40 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-300 text-sm resize-none leading-relaxed"
        />
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-gray-400">{texto.length}/4000</span>
          <button
            type="submit"
            disabled={saving || !texto.trim()}
            className="px-6 py-2.5 rounded-xl bg-[#EC4899] text-white font-semibold text-sm hover:bg-[#db2777] transition-colors disabled:opacity-60"
          >
            {saving ? 'Guardando...' : 'Guardar nota'}
          </button>
        </div>
        {error && <p className="text-red-500 text-xs">{error}</p>}
      </form>

      <div className="bg-white rounded-2xl border border-pink-100 px-5 py-6">
        <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-400 mb-4">
          Tus notas
        </div>
        {entries.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-3">📔</div>
            <p className="text-sm text-gray-500">Todavía no escribiste nada.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {entries.map(e => {
              const color = e.fase ? FASE_COLOR[e.fase] : '#9CA3AF'
              return (
                <article key={e.id} className="border-b border-gray-50 last:border-0 pb-4 last:pb-0">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ background: color }} />
                      <span className="text-xs font-semibold text-gray-700 capitalize">
                        {new Date(e.fecha + 'T00:00:00').toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}
                      </span>
                      {e.fase && (
                        <span className="text-[10px] text-gray-400 capitalize">· {e.fase}</span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => eliminar(e.id)}
                      className="text-[11px] text-gray-300 hover:text-red-400 transition-colors"
                      aria-label="Borrar nota"
                    >
                      ✕
                    </button>
                  </div>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{e.texto}</p>
                </article>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
