'use client'

import { useState } from 'react'
import RegistrarPeriodoModal from './RegistrarPeriodoModal'

const PHASE_COLORS: Record<string, string> = {
  menstrual: '#EC4899',
  folicular: '#34D399',
  ovulatoria: '#FBBF24',
  lutea: '#A78BFA',
}

export type CicloHistorial = {
  fecha_inicio: string
  duracion_dias: number
}

export type RegistroDia = {
  fecha: string
  fase: string | null
  sintomas: string[]
}

function getDayPhase(date: Date, cycles: CicloHistorial[], defaultCycleLength: number): string | null {
  for (const c of cycles) {
    if (!c.fecha_inicio || !c.duracion_dias) continue
    const start = new Date(c.fecha_inicio)
    const end = new Date(start)
    end.setDate(start.getDate() + c.duracion_dias - 1)
    if (date >= start && date <= end) {
      const day = Math.floor((date.getTime() - start.getTime()) / 86400000) + 1
      const len = c.duracion_dias || defaultCycleLength
      const ovulation = Math.max(8, len - 14)
      if (day <= 5) return 'menstrual'
      if (day < ovulation - 2) return 'folicular'
      if (day <= ovulation + 2) return 'ovulatoria'
      return 'lutea'
    }
  }
  return null
}

export default function HistorialContent({
  ciclos,
  registrosPorDia,
  defaultCycleLength,
}: {
  ciclos: CicloHistorial[]
  registrosPorDia: Record<string, RegistroDia>
  defaultCycleLength: number
}) {
  const today = new Date()
  const [viewMonth, setViewMonth] = useState({ year: today.getFullYear(), month: today.getMonth() })
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [periodoOpen, setPeriodoOpen] = useState(false)

  const monthName = new Date(viewMonth.year, viewMonth.month, 1)
    .toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })

  const firstDay = new Date(viewMonth.year, viewMonth.month, 1).getDay()
  const daysInMonth = new Date(viewMonth.year, viewMonth.month + 1, 0).getDate()
  const blanks = Array(firstDay).fill(null)
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  const registroSeleccionado = selectedDate ? registrosPorDia[selectedDate] : null

  function shiftMonth(delta: number) {
    setSelectedDate(null)
    setViewMonth(({ year, month }) => {
      const next = new Date(year, month + delta, 1)
      return { year: next.getFullYear(), month: next.getMonth() }
    })
  }

  return (
    <div className="space-y-4">
      <div className="pb-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-400 dark:text-gray-500 dark:text-gray-500">
          Tu historial
        </p>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 dark:text-gray-100 mt-1">Tu ciclo mes a mes</h1>
      </div>

      <button
        type="button"
        onClick={() => setPeriodoOpen(true)}
        className="w-full bg-gradient-to-r from-pink-500 to-pink-400 hover:from-pink-600 hover:to-pink-500 text-white rounded-2xl px-5 py-4 flex items-center justify-center gap-2 font-semibold text-sm shadow-sm transition-all hover:shadow-md active:scale-[0.99]"
      >
        <span className="text-lg">🩸</span>
        Registrar nuevo período
      </button>

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-pink-100 dark:border-gray-800 p-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => shiftMonth(-1)}
            className="text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:text-gray-200 px-2 py-1 text-sm"
            aria-label="Mes anterior"
          >
            ←
          </button>
          <h2 className="text-sm font-semibold text-gray-600 dark:text-gray-300 capitalize">{monthName}</h2>
          <button
            onClick={() => shiftMonth(1)}
            className="text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:text-gray-200 px-2 py-1 text-sm"
            aria-label="Mes siguiente"
          >
            →
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {['D', 'L', 'M', 'X', 'J', 'V', 'S'].map(d => (
            <div key={d} className="text-center text-xs text-gray-400 dark:text-gray-500 font-medium py-1">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {blanks.map((_, i) => <div key={`b-${i}`} />)}
          {days.map(day => {
            const dateStr = `${viewMonth.year}-${String(viewMonth.month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
            const phase = getDayPhase(new Date(dateStr), ciclos, defaultCycleLength)
            const hasRegistro = !!registrosPorDia[dateStr]
            const isSelected = selectedDate === dateStr
            const isToday =
              day === today.getDate() &&
              viewMonth.month === today.getMonth() &&
              viewMonth.year === today.getFullYear()

            return (
              <button
                key={day}
                onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                className="relative aspect-square rounded-full flex items-center justify-center text-xs font-medium transition-all"
                style={{
                  background: phase ? `${PHASE_COLORS[phase]}${isSelected ? 'ff' : '33'}` : 'transparent',
                  color: phase ? (isSelected ? '#fff' : PHASE_COLORS[phase]) : '#9ca3af',
                  outline: isToday ? '2px solid #EC4899' : 'none',
                  outlineOffset: '2px',
                }}
              >
                {day}
                {hasRegistro && (
                  <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-current opacity-60" />
                )}
              </button>
            )
          })}
        </div>

        <div className="flex gap-4 mt-5 flex-wrap">
          {Object.entries(PHASE_COLORS).map(([phase, color]) => (
            <div key={phase} className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full inline-block" style={{ background: color }} />
              <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">{phase}</span>
            </div>
          ))}
        </div>
      </div>

      {registroSeleccionado && selectedDate && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-pink-100 dark:border-gray-800 p-5">
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-3">
            {new Date(selectedDate).toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
          {registroSeleccionado.fase && (
            <div className="flex items-center gap-2 mb-3">
              <span
                className="px-2 py-0.5 rounded-full text-xs font-medium text-white capitalize"
                style={{ background: PHASE_COLORS[registroSeleccionado.fase] ?? '#9CA3AF' }}
              >
                {registroSeleccionado.fase}
              </span>
            </div>
          )}
          {registroSeleccionado.sintomas.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {registroSeleccionado.sintomas.map((s, i) => (
                <span key={i} className="text-xs px-2 py-0.5 bg-pink-50 dark:bg-pink-950/20 text-pink-600 rounded-full">{s}</span>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-pink-100 dark:border-gray-800 p-5">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">Ciclos anteriores</h3>
        {ciclos.length === 0 ? (
          <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-4">
            Todavía no hay ciclos registrados. Contale a Cíclica cuándo te vino la regla por WhatsApp 🌸
          </p>
        ) : (
          <div className="space-y-2">
            {ciclos.slice(0, 12).map((c, i) => {
              const start = new Date(c.fecha_inicio)
              const end = new Date(start)
              end.setDate(start.getDate() + (c.duracion_dias ?? 28) - 1)
              return (
                <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 dark:border-gray-800 last:border-0">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    {start.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })} →{' '}
                    {end.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })}
                  </p>
                  <span className="text-sm font-semibold text-pink-500">{c.duracion_dias ?? '—'} días</span>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <RegistrarPeriodoModal open={periodoOpen} onClose={() => setPeriodoOpen(false)} fechaActual={null} />
    </div>
  )
}
