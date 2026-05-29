'use client'

import { useState } from 'react'
import type { PhaseInfo, CyclePhase } from '@/lib/cycle-utils'
import { nextPeriodEstimate, fmtRange } from '@/lib/cycle-forecast'
import PhaseInfoModal from './PhaseInfoModal'

const PHASE_ACCENT: Record<string, { ring: string; track: string; chip: string; chipBg: string }> = {
  menstrual:  { ring: '#EC4899', track: '#FCE7F3', chip: '#9D174D', chipBg: '#FCE7F3' },
  folicular:  { ring: '#34D399', track: '#D1FAE5', chip: '#065F46', chipBg: '#D1FAE5' },
  ovulatoria: { ring: '#FBBF24', track: '#FEF3C7', chip: '#92400E', chipBg: '#FEF3C7' },
  lutea:      { ring: '#A78BFA', track: '#EDE9FE', chip: '#5B21B6', chipBg: '#EDE9FE' },
}

export default function PhaseRing({
  info,
  phase,
  dayOfCycle,
  cycleLength,
  daysUntilNextPeriod,
  lastPeriod,
}: {
  info: PhaseInfo
  phase: CyclePhase
  dayOfCycle: number
  cycleLength: number
  daysUntilNextPeriod: number
  lastPeriod: Date
}) {
  const accent = PHASE_ACCENT[phase] ?? PHASE_ACCENT.menstrual
  const progress = Math.min(100, Math.round((dayOfCycle / cycleLength) * 100))
  const { rangeStart, rangeEnd } = nextPeriodEstimate(lastPeriod, cycleLength, daysUntilNextPeriod)
  const [open, setOpen] = useState(false)

  const radius = 110
  const stroke = 14
  const normalizedRadius = radius - stroke / 2
  const circumference = normalizedRadius * 2 * Math.PI
  const strokeDashoffset = circumference - (progress / 100) * circumference

  return (
    <div className="bg-white dark:bg-gray-900 rounded-3xl border border-pink-100 dark:border-gray-800 px-6 py-8 shadow-sm">
      <div className="flex items-center justify-center mb-4">
        <span
          className="text-[10px] font-bold uppercase tracking-[0.18em] px-3 py-1 rounded-full"
          style={{ color: accent.chip, background: accent.chipBg }}
        >
          {info.emoji} Fase {info.name}
        </span>
      </div>

      <div className="relative flex items-center justify-center" style={{ height: radius * 2 + 8 }}>
        <svg
          width={radius * 2}
          height={radius * 2}
          style={{ transform: 'rotate(-90deg)' }}
        >
          <circle
            cx={radius}
            cy={radius}
            r={normalizedRadius}
            stroke={accent.track}
            strokeWidth={stroke}
            fill="transparent"
          />
          <circle
            cx={radius}
            cy={radius}
            r={normalizedRadius}
            stroke={accent.ring}
            strokeWidth={stroke}
            fill="transparent"
            strokeLinecap="round"
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            style={{ transition: 'stroke-dashoffset 1.2s ease-out' }}
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500">
            Día
          </div>
          <div className="text-7xl font-bold text-gray-800 dark:text-gray-100 leading-none mt-0.5 tabular-nums">
            {dayOfCycle}
          </div>
          <div className="text-xs text-gray-400 dark:text-gray-500 mt-2">
            de {cycleLength}
          </div>
        </div>
      </div>

      <div className="mt-6 text-center max-w-xs mx-auto">
        <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 leading-snug">
          {info.description}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">
          {info.tip}
        </p>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-full border transition-all hover:scale-[1.02] active:scale-[0.98]"
          style={{ color: accent.chip, borderColor: accent.ring, background: accent.chipBg }}
        >
          <span>📖</span>
          Aprender sobre esta fase
        </button>
      </div>

      <div className="mt-6 pt-5 border-t border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-400 dark:text-gray-500">
              Próximo período aprox.
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold tabular-nums" style={{ color: accent.ring }}>
                {fmtRange(rangeStart, rangeEnd)}
              </span>
            </div>
            <div className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">
              ~en {daysUntilNextPeriod} {daysUntilNextPeriod === 1 ? 'día' : 'días'} · margen de ±3
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-400 dark:text-gray-500">
              Progreso
            </div>
            <div className="flex items-baseline gap-1.5 mt-1 justify-end">
              <span className="text-3xl font-bold text-gray-800 dark:text-gray-100 tabular-nums">{progress}</span>
              <span className="text-xs text-gray-400 dark:text-gray-500">%</span>
            </div>
          </div>
        </div>
      </div>

      <PhaseInfoModal open={open} onClose={() => setOpen(false)} phase={phase} info={info} />
    </div>
  )
}
