type Ciclo = { length: number }

export default function CiclosTrend({
  pastCycles,
  currentCycleLength,
}: {
  pastCycles: Ciclo[]
  currentCycleLength: number
}) {
  if (pastCycles.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-pink-100 px-5 py-8 text-center">
        <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-400 mb-3">
          Tendencia de ciclos
        </div>
        <p className="text-sm text-gray-500">Sin historial todavía</p>
        <p className="text-xs text-gray-400 mt-1">Con el tiempo vas a ver tu patrón acá</p>
      </div>
    )
  }

  const promedio = Math.round(
    pastCycles.reduce((acc, c) => acc + c.length, 0) / pastCycles.length,
  )

  const series = [
    ...pastCycles.slice(0, 5).reverse().map(c => ({ length: c.length, current: false })),
    { length: currentCycleLength, current: true },
  ]

  const maxLen = Math.max(...series.map(s => s.length), 35)
  const minLen = Math.min(...series.map(s => s.length), 21)
  const range = Math.max(maxLen - minLen, 1)

  return (
    <div className="bg-white rounded-2xl border border-pink-100 px-5 py-6">
      <div className="flex items-center justify-between mb-1">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-400">
            Tendencia
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-bold text-gray-800 tabular-nums leading-none">{promedio}</span>
            <span className="text-xs text-gray-400">días promedio</span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-400">
            Últimos
          </div>
          <div className="text-sm text-gray-500 mt-1">{series.length} ciclos</div>
        </div>
      </div>

      <div className="mt-6 flex items-end gap-3 h-32">
        {series.map((s, i) => {
          const heightPct = ((s.length - minLen) / range) * 75 + 25
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-2 justify-end">
              <span
                className={`text-[11px] font-bold tabular-nums ${s.current ? 'text-pink-500' : 'text-gray-400'}`}
              >
                {s.length}
              </span>
              <div
                className="w-full rounded-lg transition-all"
                style={{
                  height: `${heightPct}%`,
                  background: s.current ? '#EC4899' : '#F9A8D4',
                  opacity: s.current ? 1 : 0.4,
                }}
              />
            </div>
          )
        })}
      </div>

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-sm bg-pink-500 inline-block" />
          <span className="text-[11px] text-gray-500">Este ciclo</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-sm bg-pink-200 inline-block" />
          <span className="text-[11px] text-gray-500">Ciclos anteriores</span>
        </div>
      </div>
    </div>
  )
}
