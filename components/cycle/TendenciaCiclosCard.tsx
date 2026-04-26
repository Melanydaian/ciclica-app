type Ciclo = { length: number }

function getTendencia(ciclos: Ciclo[]) {
  if (ciclos.length < 3) return null
  const ultimos = ciclos.slice(0, 3).map(c => c.length)
  const diff = ultimos[0] - ultimos[2]
  if (Math.abs(diff) <= 1) return { label: 'Estable', emoji: '→', color: '#34D399' }
  if (diff < 0) return { label: 'Acortándose', emoji: '↓', color: '#FBBF24' }
  return { label: 'Alargándose', emoji: '↑', color: '#A78BFA' }
}

export default function TendenciaCiclosCard({
  pastCycles,
  currentCycleLength,
}: {
  pastCycles: Ciclo[]
  currentCycleLength: number
}) {
  if (pastCycles.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-pink-100 p-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Tendencia de ciclos</h3>
        <p className="text-sm text-gray-400 text-center py-4">
          🌱 Aún no hay ciclos anteriores registrados. Con el tiempo verás tu tendencia aquí.
        </p>
      </div>
    )
  }

  const promedio = Math.round(
    pastCycles.reduce((acc, c) => acc + c.length, 0) / pastCycles.length
  )
  const anterior = pastCycles[0]?.length ?? null
  const tendencia = getTendencia(pastCycles)
  const maxLen = Math.max(...pastCycles.map(c => c.length), currentCycleLength, 35)
  const minLen = Math.min(...pastCycles.map(c => c.length), currentCycleLength, 21)
  const range = maxLen - minLen || 1

  const ciclosVisual = [
    { length: currentCycleLength, label: 'Este', actual: true },
    ...pastCycles.slice(0, 5).map((c, i) => ({
      length: c.length,
      label: i === 0 ? 'Ant.' : `-${i + 1}`,
      actual: false,
    })),
  ].reverse()

  return (
    <div className="bg-white rounded-2xl border border-pink-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-700">Tendencia de ciclos</h3>
        {tendencia && (
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-50" style={{ color: tendencia.color }}>
            {tendencia.emoji} {tendencia.label}
          </span>
        )}
      </div>

      {/* Barras */}
      <div className="flex items-end gap-2 h-20 mb-3">
        {ciclosVisual.map((c, i) => {
          const heightPct = ((c.length - minLen) / range) * 70 + 30
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-[10px] text-gray-500 font-medium">{c.length}</span>
              <div className="w-full relative flex items-end" style={{ height: '56px' }}>
                {/* Línea del promedio */}
                {i === ciclosVisual.length - 1 && (
                  <div
                    className="absolute left-0 right-0 border-t-2 border-dashed border-pink-300 z-10"
                    style={{ bottom: `${((promedio - minLen) / range) * 70 + 30}%` }}
                  />
                )}
                <div
                  className="w-full rounded-t-md transition-all"
                  style={{
                    height: `${heightPct}%`,
                    background: c.actual
                      ? 'linear-gradient(to top, #EC4899, #F9A8D4)'
                      : c.length > promedio
                      ? '#FDE8F3'
                      : '#FCE7F3',
                    opacity: c.actual ? 1 : 0.7,
                  }}
                />
              </div>
              <span className="text-[9px] text-gray-400">{c.label}</span>
            </div>
          )
        })}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 pt-3 border-t border-gray-50 text-center">
        <div>
          <p className="text-xs text-gray-400">Promedio</p>
          <p className="text-sm font-bold text-gray-700">{promedio} días</p>
        </div>
        <div>
          <p className="text-xs text-gray-400">Este ciclo</p>
          <p className="text-sm font-bold" style={{
            color: currentCycleLength === promedio ? '#34D399'
              : Math.abs(currentCycleLength - promedio) <= 2 ? '#FBBF24' : '#F87171'
          }}>
            {currentCycleLength} días
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-400">Anterior</p>
          <p className="text-sm font-bold text-gray-700">{anterior ?? '—'} días</p>
        </div>
      </div>

      {anterior !== null && (
        <p className="text-xs text-gray-400 mt-3 text-center">
          {currentCycleLength === anterior
            ? 'Igual al ciclo anterior'
            : currentCycleLength > anterior
            ? `${currentCycleLength - anterior} días más largo que el anterior`
            : `${anterior - currentCycleLength} días más corto que el anterior`}
          {' · '}
          {currentCycleLength === promedio
            ? 'Igual al promedio'
            : currentCycleLength > promedio
            ? `${currentCycleLength - promedio} días sobre tu promedio`
            : `${promedio - currentCycleLength} días bajo tu promedio`}
        </p>
      )}
    </div>
  )
}
