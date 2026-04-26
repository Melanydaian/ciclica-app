'use client'

import { useState } from 'react'

const PHASE_COLORS: Record<string, string> = {
  menstrual: '#EC4899',
  folicular: '#34D399',
  ovulatoria: '#FBBF24',
  lutea: '#A78BFA',
}

const MOCK_CYCLES = [
  { start: '2025-03-18', end: '2025-04-14', length: 28 },
  { start: '2025-02-18', end: '2025-03-17', length: 27 },
  { start: '2025-01-21', end: '2025-02-17', length: 28 },
]

const MOCK_REGISTROS: Record<string, { sintomas?: string[]; animo?: string; notas?: string; fase: string }> = {
  '2025-04-01': { fase: 'folicular', animo: 'energica', sintomas: ['flujo'] },
  '2025-04-03': { fase: 'folicular', animo: 'bien', notas: 'Me sentí súper bien hoy' },
  '2025-04-07': { fase: 'ovulatoria', animo: 'excelente', sintomas: ['dolor leve'] },
  '2025-04-10': { fase: 'lutea', animo: 'regular', sintomas: ['hinchazón', 'cansancio'] },
  '2025-04-13': { fase: 'lutea', animo: 'irritable', sintomas: ['dolor de cabeza'] },
  '2025-04-18': { fase: 'menstrual', animo: 'cansada', sintomas: ['cólicos', 'dolor lumbar'] },
  '2025-04-19': { fase: 'menstrual', animo: 'mal', sintomas: ['cólicos fuertes'] },
}

function getDayPhase(date: Date, cycles: typeof MOCK_CYCLES): string | null {
  for (const c of cycles) {
    const start = new Date(c.start)
    const end = new Date(c.end)
    if (date >= start && date <= end) {
      const day = Math.floor((date.getTime() - start.getTime()) / 86400000) + 1
      if (day <= 5) return 'menstrual'
      if (day <= 13) return 'folicular'
      if (day <= 16) return 'ovulatoria'
      return 'lutea'
    }
  }
  return null
}

export default function HistorialPage() {
  const today = new Date('2025-04-19')
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  const year = today.getFullYear()
  const month = today.getMonth()
  const monthName = today.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })

  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const blanks = Array(firstDay).fill(null)
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  const registro = selectedDate ? MOCK_REGISTROS[selectedDate] : null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Historial</h1>
        <p className="text-sm text-gray-400 mt-1">Tu ciclo mes a mes</p>
      </div>

      <div className="bg-white rounded-2xl border border-pink-100 p-6">
        <h2 className="text-sm font-semibold text-gray-600 capitalize mb-4">{monthName}</h2>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {['D','L','M','X','J','V','S'].map(d => (
            <div key={d} className="text-center text-xs text-gray-400 font-medium py-1">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {blanks.map((_, i) => <div key={`b-${i}`} />)}
          {days.map(day => {
            const dateStr = `${year}-${String(month + 1).padStart(2,'0')}-${String(day).padStart(2,'0')}`
            const phase = getDayPhase(new Date(dateStr), MOCK_CYCLES)
            const hasRegistro = !!MOCK_REGISTROS[dateStr]
            const isSelected = selectedDate === dateStr
            const isToday = day === today.getDate()

            return (
              <button
                key={day}
                onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                className="relative aspect-square rounded-full flex items-center justify-center text-xs font-medium transition-all"
                style={{
                  background: phase ? `${PHASE_COLORS[phase]}${isSelected ? 'ff' : '33'}` : 'transparent',
                  color: phase ? (isSelected ? '#fff' : PHASE_COLORS[phase]) : '#9ca3af',
                  outline: isToday ? `2px solid #EC4899` : 'none',
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
              <span className="text-xs text-gray-500 capitalize">{phase}</span>
            </div>
          ))}
        </div>
      </div>

      {registro && selectedDate && (
        <div className="bg-white rounded-2xl border border-pink-100 p-5">
          <p className="text-xs text-gray-400 mb-3">
            {new Date(selectedDate).toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
          <div className="flex items-center gap-2 mb-3">
            <span className="px-2 py-0.5 rounded-full text-xs font-medium text-white capitalize" style={{ background: PHASE_COLORS[registro.fase] }}>
              {registro.fase}
            </span>
            {registro.animo && <span className="text-sm text-gray-600">Estado: {registro.animo}</span>}
          </div>
          {registro.sintomas?.length && (
            <div className="flex flex-wrap gap-1 mb-2">
              {registro.sintomas.map(s => (
                <span key={s} className="text-xs px-2 py-0.5 bg-pink-50 text-pink-600 rounded-full">{s}</span>
              ))}
            </div>
          )}
          {registro.notas && <p className="text-sm text-gray-500 italic">&ldquo;{registro.notas}&rdquo;</p>}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-pink-100 p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Ciclos anteriores</h3>
        <div className="space-y-2">
          {MOCK_CYCLES.map((c, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
              <div>
                <p className="text-sm font-medium text-gray-700">
                  {new Date(c.start).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })} →{' '}
                  {new Date(c.end).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })}
                </p>
              </div>
              <span className="text-sm font-semibold text-pink-500">{c.length} días</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
