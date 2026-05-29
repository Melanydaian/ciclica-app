'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const MOODS = [
  { emoji: '😊', label: 'Bien', value: 'bien' },
  { emoji: '🤩', label: 'Genial', value: 'excelente' },
  { emoji: '😐', label: 'Normal', value: 'regular' },
  { emoji: '😴', label: 'Cansada', value: 'cansada' },
  { emoji: '😰', label: 'Ansiosa', value: 'ansiosa' },
  { emoji: '😢', label: 'Mal', value: 'mal' },
]

const SUGERIDOS = ['Cólicos', 'Cansancio', 'Hinchazón', 'Ansiedad', 'Energía alta', 'Antojos']

export default function DailyCheckIn({ yaRegistroHoy = false }: { yaRegistroHoy?: boolean }) {
  const router = useRouter()
  const [mood, setMood] = useState<string | null>(null)
  const [sintoma, setSintoma] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(yaRegistroHoy)

  async function handleSubmit() {
    if (!mood) return
    setSaving(true)
    try {
      const all = [mood]
      if (sintoma) all.push(sintoma.toLowerCase())
      const res = await fetch('/api/sintomas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sintomas: all }),
      })
      if (res.ok) {
        setDone(true)
        router.refresh()
      }
    } finally {
      setSaving(false)
    }
  }

  if (done) {
    return (
      <div className="bg-white rounded-3xl border border-pink-100 px-5 py-5">
        <div className="flex items-center gap-3">
          <span className="text-2xl">✅</span>
          <div>
            <p className="text-sm font-semibold text-gray-800">Ya registraste hoy</p>
            <p className="text-xs text-gray-500 mt-0.5">+5 pts · Tu racha sigue 🔥</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-3xl border border-pink-100 px-5 py-5">
      <div className="flex items-baseline justify-between mb-4">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-400">
            Check-in del día
          </div>
          <p className="text-base font-semibold text-gray-800 mt-1">¿Cómo te sentís hoy?</p>
        </div>
        {mood && (
          <button
            type="button"
            onClick={() => { setMood(null); setSintoma(null) }}
            className="text-[11px] text-gray-400 hover:text-gray-600"
          >
            limpiar
          </button>
        )}
      </div>

      <div className="grid grid-cols-6 gap-2">
        {MOODS.map(m => {
          const active = mood === m.value
          return (
            <button
              key={m.value}
              type="button"
              onClick={() => setMood(m.value)}
              className={`flex flex-col items-center justify-center py-2.5 rounded-2xl border transition-all ${
                active
                  ? 'bg-pink-50 border-pink-300 scale-105'
                  : 'bg-white border-gray-100 hover:border-pink-200'
              }`}
            >
              <span className="text-2xl leading-none">{m.emoji}</span>
              <span className={`text-[9px] mt-1 font-medium ${active ? 'text-pink-600' : 'text-gray-400'}`}>
                {m.label}
              </span>
            </button>
          )
        })}
      </div>

      {mood && (
        <div className="mt-4 animate-in fade-in slide-in-from-top-1 duration-200">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-400 mb-2">
            ¿Algún síntoma? <span className="text-gray-400 normal-case tracking-normal">(opcional)</span>
          </p>
          <div className="flex flex-wrap gap-1.5">
            {SUGERIDOS.map(s => {
              const active = sintoma === s
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSintoma(active ? null : s)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
                    active
                      ? 'bg-pink-500 text-white border-pink-500'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-pink-200'
                  }`}
                >
                  {s}
                </button>
              )
            })}
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="mt-4 w-full py-2.5 rounded-xl bg-[#EC4899] text-white font-semibold text-sm hover:bg-[#db2777] transition-colors disabled:opacity-60"
          >
            {saving ? 'Guardando...' : 'Guardar registro'}
          </button>
        </div>
      )}
    </div>
  )
}
