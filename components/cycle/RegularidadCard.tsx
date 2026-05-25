type CycleData = { length: number }[]

function getStatus(value: number, min: number, max: number, ideal: number) {
  if (value < min || value > max) return { label: 'Fuera del rango', color: '#F87171', bg: '#FEF2F2' }
  const diff = Math.abs(value - ideal)
  if (diff <= 2) return { label: 'En el rango ideal', color: '#34D399', bg: '#F0FDF4' }
  return { label: 'Dentro del rango normal', color: '#FBBF24', bg: '#FFFBEB' }
}

function getCycleVariability(cycles: CycleData) {
  if (cycles.length < 2) return null
  const lengths = cycles.map(c => c.length)
  const max = Math.max(...lengths)
  const min = Math.min(...lengths)
  return max - min
}

export default function RegularidadCard({
  cycleLength,
  periodLength,
  pastCycles,
}: {
  cycleLength: number
  periodLength: number
  pastCycles: CycleData
}) {
  const cycleStatus = getStatus(cycleLength, 21, 35, 28)
  const periodStatus = getStatus(periodLength, 2, 7, 5)
  const variability = getCycleVariability(pastCycles)

  const cyclePercent = Math.min(100, Math.round(((cycleLength - 21) / (35 - 21)) * 100))
  const idealLeft = Math.round(((26 - 21) / (35 - 21)) * 100)
  const idealRight = Math.round(((30 - 21) / (35 - 21)) * 100)

  return (
    <div className="bg-white rounded-2xl border border-pink-100 p-6">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">Regularidad de tu ciclo</h3>

      <div className="space-y-5">
        {/* Cycle length */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">Duración del ciclo</span>
            <span
              className="text-xs font-medium px-2 py-0.5 rounded-full"
              style={{ color: cycleStatus.color, background: cycleStatus.bg }}
            >
              {cycleStatus.label}
            </span>
          </div>
          <div className="relative h-2 bg-gray-100 rounded-full">
            {/* Ideal zone */}
            <div
              className="absolute h-full rounded-full opacity-20"
              style={{
                left: `${idealLeft}%`,
                width: `${idealRight - idealLeft}%`,
                background: '#34D399',
              }}
            />
            {/* Marker */}
            <div
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-white shadow"
              style={{ left: `${cyclePercent}%`, background: cycleStatus.color }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>21 días</span>
            <span className="text-green-500 text-[10px]">ideal 26-30</span>
            <span>35 días</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Tu ciclo de <span className="font-semibold">{cycleLength} días</span> está {cycleStatus.label.toLowerCase()}{' '}
            (normal: 21-35 días)
          </p>
        </div>

        {/* Period length */}
        <div className="flex items-start justify-between gap-2 py-2 border-t border-gray-50">
          <div className="min-w-0">
            <p className="text-sm text-gray-600">Duración del período</p>
            <p className="text-xs text-gray-400">{periodLength} días · normal: 2-7 días</p>
          </div>
          <span
            className="shrink-0 text-xs font-medium px-2 py-0.5 rounded-full"
            style={{ color: periodStatus.color, background: periodStatus.bg }}
          >
            {periodStatus.label}
          </span>
        </div>

        {/* Variability */}
        {variability !== null && (
          <div className="flex items-start justify-between gap-2 py-2 border-t border-gray-50">
            <div className="min-w-0">
              <p className="text-sm text-gray-600">Variabilidad entre ciclos</p>
              <p className="text-xs text-gray-400">
                {variability <= 2 ? 'Muy regular' : variability <= 5 ? 'Moderadamente regular' : 'Variable'} · {variability} días de diferencia
              </p>
            </div>
            <span
              className="shrink-0 text-xs font-medium px-2 py-0.5 rounded-full"
              style={{
                color: variability <= 2 ? '#34D399' : variability <= 5 ? '#FBBF24' : '#F87171',
                background: variability <= 2 ? '#F0FDF4' : variability <= 5 ? '#FFFBEB' : '#FEF2F2',
              }}
            >
              {variability <= 2 ? '✓ Regular' : variability <= 5 ? 'Regular' : 'Irregular'}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
