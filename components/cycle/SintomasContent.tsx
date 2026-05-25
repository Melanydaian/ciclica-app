'use client'

import { useState } from 'react'

type SintomaStat = {
  nombre: string
  menstrual: number
  folicular: number
  ovulatoria: number
  lutea: number
  total: number
}

type AnimoSemanal = { semana: string; valor: number; count: number }

const PHASES = [
  { key: 'menstrual', label: 'Menstrual', color: '#EC4899' },
  { key: 'folicular', label: 'Folicular', color: '#34D399' },
  { key: 'ovulatoria', label: 'Ovulatoria', color: '#FBBF24' },
  { key: 'lutea', label: 'Lútea', color: '#A78BFA' },
] as const

type PhaseKey = 'menstrual' | 'folicular' | 'ovulatoria' | 'lutea'

function intensidad(valor: number, max: number): 'leve' | 'moderada' | 'alta' {
  if (max === 0) return 'leve'
  const ratio = valor / max
  if (ratio >= 0.66) return 'alta'
  if (ratio >= 0.33) return 'moderada'
  return 'leve'
}

export default function SintomasContent({
  sintomas,
  animo,
  totalRegistros,
}: {
  sintomas: SintomaStat[]
  animo: AnimoSemanal[]
  totalRegistros: number
}) {
  const [activePhase, setActivePhase] = useState<PhaseKey | 'todas'>('todas')

  const maxTotal = Math.max(1, ...sintomas.map(s => s.total))
  const maxFase = activePhase !== 'todas'
    ? Math.max(1, ...sintomas.map(s => s[activePhase]))
    : maxTotal

  const filtered = sintomas
    .filter(s => (activePhase === 'todas' ? s.total > 0 : s[activePhase] > 0))
    .sort((a, b) => (activePhase === 'todas' ? b.total - a.total : b[activePhase] - a[activePhase]))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Síntomas & Patrones</h1>
        <p className="text-sm text-gray-400 mt-1">Lo que tu cuerpo repite cada mes</p>
      </div>

      {totalRegistros < 3 ? (
        <div className="bg-white rounded-2xl border border-pink-100 p-8 text-center">
          <div className="text-4xl mb-3">🌱</div>
          <p className="text-sm font-medium text-gray-700">Necesitamos más registros</p>
          <p className="text-xs text-gray-400 mt-2 max-w-xs mx-auto">
            Contanos por WhatsApp cómo te sentís cada día. Con al menos 3 registros podemos empezar a mostrar tus patrones.
          </p>
        </div>
      ) : (
        <>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setActivePhase('todas')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                activePhase === 'todas' ? 'bg-gray-800 text-white' : 'bg-white text-gray-500 border border-gray-200'
              }`}
            >
              Todas
            </button>
            {PHASES.map(p => (
              <button
                key={p.key}
                onClick={() => setActivePhase(p.key)}
                className="px-3 py-1.5 rounded-full text-xs font-medium transition-colors border"
                style={{
                  background: activePhase === p.key ? p.color : 'white',
                  color: activePhase === p.key ? 'white' : p.color,
                  borderColor: p.color,
                }}
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className="bg-white rounded-2xl border border-pink-100 p-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-5">
              {activePhase === 'todas' ? 'Síntomas más frecuentes' : `En fase ${PHASES.find(p => p.key === activePhase)?.label.toLowerCase()}`}
            </h3>

            {filtered.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">
                Sin síntomas registrados en esta fase todavía.
              </p>
            ) : (
              <div className="space-y-4">
                {filtered.slice(0, 8).map(s => {
                  const total = activePhase === 'todas' ? s.total : s[activePhase]
                  const max = activePhase === 'todas' ? maxTotal : maxFase
                  const pct = Math.round((total / max) * 100)
                  const phase = PHASES.find(p => p.key === activePhase)
                  const barColor = phase?.color ?? '#EC4899'
                  const sev = intensidad(total, max)

                  return (
                    <div key={s.nombre}>
                      <div className="flex justify-between mb-1 items-start gap-2">
                        <span className="text-sm text-gray-700 capitalize">{s.nombre}</span>
                        <span className="shrink-0 text-xs text-gray-400">{total}×</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${pct}%`, background: barColor }}
                        />
                      </div>
                      <p className="text-[10px] text-gray-400 mt-1">
                        Intensidad:{' '}
                        <span
                          className={`font-medium ${
                            sev === 'alta' ? 'text-red-400' : sev === 'moderada' ? 'text-yellow-500' : 'text-green-500'
                          }`}
                        >
                          {sev}
                        </span>
                      </p>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-pink-100 p-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-1">Estado de ánimo</h3>
            <p className="text-xs text-gray-400 mb-5">Últimas 5 semanas (1 mal → 5 excelente)</p>

            {animo.every(a => a.count === 0) ? (
              <p className="text-sm text-gray-400 text-center py-2">
                Aún no registraste tu ánimo en las últimas semanas.
              </p>
            ) : (
              <div className="flex items-end gap-3 h-24">
                {animo.map(a => (
                  <div key={a.semana} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full rounded-t-lg transition-all"
                      style={{
                        height: a.count > 0 ? `${(a.valor / 5) * 80}px` : '4px',
                        background: a.count > 0 ? 'linear-gradient(to top, #EC4899, #F9A8D4)' : '#F3F4F6',
                        opacity: a.count > 0 ? 1 : 0.5,
                      }}
                    />
                    <span className="text-[10px] text-gray-400 text-center leading-tight">{a.semana}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
