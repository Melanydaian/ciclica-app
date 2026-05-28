'use client'

import { useState } from 'react'
import { phaseAtDate, nextPeriodEstimate, isInRange, fmtRange } from '@/lib/cycle-forecast'
import type { CyclePhase } from '@/lib/cycle-utils'

const PHASE_DOT: Record<CyclePhase, { bg: string; ring: string; label: string }> = {
  menstrual:  { bg: '#FCE7F3', ring: '#EC4899', label: 'Menstrual' },
  folicular:  { bg: '#D1FAE5', ring: '#34D399', label: 'Folicular' },
  ovulatoria: { bg: '#FEF3C7', ring: '#FBBF24', label: 'Ovulatoria' },
  lutea:      { bg: '#EDE9FE', ring: '#A78BFA', label: 'Lútea' },
}

export default function CalendarioCiclo({
  lastPeriod,
  cycleLength,
  periodLength = 5,
  daysUntilNextPeriod,
}: {
  lastPeriod: Date
  cycleLength: number
  periodLength?: number
  daysUntilNextPeriod: number
}) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [view, setView] = useState({ year: today.getFullYear(), month: today.getMonth() })

  const { estimated, rangeStart, rangeEnd } = nextPeriodEstimate(
    lastPeriod,
    cycleLength,
    daysUntilNextPeriod,
  )

  const monthName = new Date(view.year, view.month, 1)
    .toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })

  const firstDay = new Date(view.year, view.month, 1).getDay()
  const daysInMonth = new Date(view.year, view.month + 1, 0).getDate()
  const blanks = Array(firstDay).fill(null)
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  function shift(delta: number) {
    setView(({ year, month }) => {
      const d = new Date(year, month + delta, 1)
      return { year: d.getFullYear(), month: d.getMonth() }
    })
  }

  return (
    <div className="bg-white rounded-2xl border border-pink-100 px-5 py-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-400">
            Calendario del ciclo
          </div>
          <div className="text-base font-semibold text-gray-800 capitalize mt-1">{monthName}</div>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => shift(-1)}
            aria-label="Mes anterior"
            className="w-8 h-8 rounded-lg border border-gray-200 text-gray-500 hover:text-gray-800 hover:border-gray-300 transition-colors text-sm"
          >
            ←
          </button>
          <button
            type="button"
            onClick={() => shift(1)}
            aria-label="Mes siguiente"
            className="w-8 h-8 rounded-lg border border-gray-200 text-gray-500 hover:text-gray-800 hover:border-gray-300 transition-colors text-sm"
          >
            →
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {['D', 'L', 'M', 'M', 'J', 'V', 'S'].map((d, i) => (
          <div key={i} className="text-center text-[10px] font-bold text-gray-400 tracking-wider py-1">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {blanks.map((_, i) => <div key={`b-${i}`} />)}
        {days.map(day => {
          const d = new Date(view.year, view.month, day)
          d.setHours(0, 0, 0, 0)
          const phase = phaseAtDate(d, lastPeriod, cycleLength, periodLength)
          const isToday = d.getTime() === today.getTime()
          const isFuture = d.getTime() > today.getTime()
          const inEstimateRange = isInRange(d, rangeStart, rangeEnd)
          const isEstimatedExact = d.getTime() === estimated.getTime()

          const tone = phase ? PHASE_DOT[phase] : null
          const baseStyle: React.CSSProperties = tone
            ? { background: tone.bg, color: tone.ring }
            : { background: 'transparent', color: '#9CA3AF' }

          return (
            <div
              key={day}
              className="relative aspect-square rounded-xl flex items-center justify-center text-xs font-semibold transition-all"
              style={{
                ...baseStyle,
                opacity: isFuture && !inEstimateRange ? 0.6 : 1,
                border: isToday
                  ? `2px solid ${tone?.ring ?? '#EC4899'}`
                  : inEstimateRange
                  ? '1.5px dashed #EC4899'
                  : 'none',
              }}
            >
              <span className="tabular-nums">{day}</span>
              {isEstimatedExact && (
                <span className="absolute -top-1 -right-1 text-[8px]">🩸</span>
              )}
            </div>
          )
        })}
      </div>

      <div className="mt-5 pt-4 border-t border-gray-100 space-y-2">
        <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-400 mb-2">
          Referencias
        </div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
          {Object.entries(PHASE_DOT).map(([key, { bg, ring, label }]) => (
            <div key={key} className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-md" style={{ background: bg, border: `1.5px solid ${ring}` }} />
              <span className="text-[11px] text-gray-600">{label}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 mt-2">
          <span className="w-3 h-3 rounded-md border-2 border-dashed border-pink-500" />
          <span className="text-[11px] text-gray-600">Próximo período aproximado · {fmtRange(rangeStart, rangeEnd)}</span>
        </div>
      </div>
    </div>
  )
}
