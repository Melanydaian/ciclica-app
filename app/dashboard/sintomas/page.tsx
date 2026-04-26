'use client'

import { useState } from 'react'

const MOCK_SINTOMAS = [
  { nombre: 'Cólicos', menstrual: 8, folicular: 1, ovulatoria: 0, lutea: 2, pctUsuarias: 72, intensidad: 'alta' },
  { nombre: 'Cansancio', menstrual: 6, folicular: 2, ovulatoria: 1, lutea: 5, pctUsuarias: 85, intensidad: 'moderada' },
  { nombre: 'Hinchazón', menstrual: 3, folicular: 0, ovulatoria: 0, lutea: 7, pctUsuarias: 61, intensidad: 'moderada' },
  { nombre: 'Dolor cabeza', menstrual: 2, folicular: 1, ovulatoria: 0, lutea: 4, pctUsuarias: 43, intensidad: 'leve' },
  { nombre: 'Ansiedad', menstrual: 1, folicular: 0, ovulatoria: 0, lutea: 6, pctUsuarias: 55, intensidad: 'moderada' },
  { nombre: 'Energía alta', menstrual: 0, folicular: 8, ovulatoria: 9, lutea: 2, pctUsuarias: 78, intensidad: 'normal' },
]

const PHASES = [
  { key: 'menstrual', label: 'Menstrual', color: '#EC4899' },
  { key: 'folicular', label: 'Folicular', color: '#34D399' },
  { key: 'ovulatoria', label: 'Ovulatoria', color: '#FBBF24' },
  { key: 'lutea', label: 'Lútea', color: '#A78BFA' },
] as const

const MOCK_ANIMO = [
  { semana: 'hace 4 sem', valor: 3 },
  { semana: 'hace 3 sem', valor: 4 },
  { semana: 'hace 2 sem', valor: 5 },
  { semana: 'hace 1 sem', valor: 2 },
  { semana: 'esta sem', valor: 3 },
]

type PhaseKey = 'menstrual' | 'folicular' | 'ovulatoria' | 'lutea'

export default function SintomasPage() {
  const [activePhase, setActivePhase] = useState<PhaseKey | 'todas'>('todas')

  const max = 10
  const filtered = MOCK_SINTOMAS.filter(s => {
    if (activePhase === 'todas') return true
    return s[activePhase] > 0
  }).sort((a, b) => {
    if (activePhase === 'todas') return (b.menstrual + b.folicular + b.ovulatoria + b.lutea) - (a.menstrual + a.folicular + a.ovulatoria + a.lutea)
    return b[activePhase] - a[activePhase]
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Síntomas & Patrones</h1>
        <p className="text-sm text-gray-400 mt-1">Lo que tu cuerpo repite cada mes</p>
      </div>

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
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border`}
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
        <h3 className="text-sm font-semibold text-gray-700 mb-5">Síntomas más frecuentes</h3>
        <div className="space-y-4">
          {filtered.map(s => {
            const total = activePhase === 'todas'
              ? s.menstrual + s.folicular + s.ovulatoria + s.lutea
              : s[activePhase]
            const pct = Math.round((total / (activePhase === 'todas' ? 40 : max)) * 100)
            const phase = PHASES.find(p => p.key === activePhase)
            const barColor = phase?.color ?? '#EC4899'

            return (
              <div key={s.nombre}>
                <div className="flex justify-between mb-1 items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-700">{s.nombre}</span>
                    <span className="text-[10px] text-gray-400">{s.pctUsuarias}% de usuarias lo reportan</span>
                  </div>
                  <span className="text-xs text-gray-400">{total}x</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${pct}%`, background: barColor }}
                  />
                </div>
                <p className="text-[10px] text-gray-400 mt-1">
                  Intensidad: <span className={`font-medium ${s.intensidad === 'alta' ? 'text-red-400' : s.intensidad === 'moderada' ? 'text-yellow-500' : 'text-green-500'}`}>{s.intensidad}</span>
                  {s.intensidad === 'alta' ? ' · Por encima del promedio' : s.intensidad === 'moderada' ? ' · Dentro del rango normal' : ' · Por debajo del promedio'}
                </p>
              </div>
            )
          })}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-pink-100 p-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-1">Estado de ánimo</h3>
        <p className="text-xs text-gray-400 mb-5">Últimas 5 semanas (1 mal → 5 excelente)</p>
        <div className="flex items-end gap-3 h-24">
          {MOCK_ANIMO.map(a => (
            <div key={a.semana} className="flex-1 flex flex-col items-center gap-1">
              <div
                className="w-full rounded-t-lg transition-all"
                style={{
                  height: `${(a.valor / 5) * 80}px`,
                  background: `linear-gradient(to top, #EC4899, #F9A8D4)`,
                }}
              />
              <span className="text-[10px] text-gray-400 text-center leading-tight">{a.semana}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-pink-100 p-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Patrones detectados</h3>
        <div className="space-y-3">
          <div className="flex gap-3 items-start">
            <span className="text-lg">🔴</span>
            <div>
              <p className="text-sm font-medium text-gray-700">Cólicos fuertes en días 1-2</p>
              <p className="text-xs text-gray-400">Se repite en los últimos 3 ciclos</p>
            </div>
          </div>
          <div className="flex gap-3 items-start">
            <span className="text-lg">🟣</span>
            <div>
              <p className="text-sm font-medium text-gray-700">Ansiedad elevada en fase lútea</p>
              <p className="text-xs text-gray-400">Días 22-26 del ciclo</p>
            </div>
          </div>
          <div className="flex gap-3 items-start">
            <span className="text-lg">🟢</span>
            <div>
              <p className="text-sm font-medium text-gray-700">Pico de energía semana 2</p>
              <p className="text-xs text-gray-400">Fase folicular, constante en todos tus ciclos</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
