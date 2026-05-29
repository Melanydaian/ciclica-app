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
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-pink-100 dark:border-gray-800 px-5 py-8 text-center">
        <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-400 dark:text-gray-500 mb-3">
          Tus ciclos recientes
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">Sin historial todavía</p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
          Con el tiempo vas a ver cómo varía tu cuerpo mes a mes
        </p>
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

  const variability =
    pastCycles.length >= 2
      ? Math.max(...pastCycles.map(c => c.length)) - Math.min(...pastCycles.map(c => c.length))
      : 0

  // Escala fija 21-35 días (rango normal) — barras visibles aunque la variación sea chica
  const MIN = 21
  const MAX = 35
  const RANGE = MAX - MIN

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-pink-100 dark:border-gray-800 px-5 py-6">
      <div className="mb-1">
        <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-400 dark:text-gray-500">
          Tus ciclos recientes
        </div>
        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-3xl font-bold text-gray-800 dark:text-gray-100 tabular-nums leading-none">
            {promedio}
          </span>
          <span className="text-xs text-gray-400 dark:text-gray-500">días de promedio</span>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">
          Tus últimos {series.length} ciclos duraron entre{' '}
          <span className="font-semibold text-gray-700 dark:text-gray-200">
            {Math.min(...series.map(s => s.length))}
          </span>{' '}
          y{' '}
          <span className="font-semibold text-gray-700 dark:text-gray-200">
            {Math.max(...series.map(s => s.length))}
          </span>{' '}
          días. {variability <= 3
            ? 'Tu ciclo es muy regular.'
            : variability <= 6
            ? 'Tenés una regularidad normal.'
            : 'Tu ciclo varía bastante mes a mes.'}
        </p>
      </div>

      <div className="mt-6">
        <div className="relative flex items-end gap-2 h-36">
          {/* Línea del promedio */}
          <div
            className="absolute left-0 right-0 border-t border-dashed border-pink-300 z-10 pointer-events-none"
            style={{
              bottom: `${((promedio - MIN) / RANGE) * 100}%`,
            }}
          >
            <span className="absolute right-0 -top-4 text-[10px] font-semibold text-pink-400 tabular-nums">
              prom {promedio}
            </span>
          </div>

          {series.map((s, i) => {
            const clamped = Math.max(MIN, Math.min(MAX, s.length))
            const heightPct = ((clamped - MIN) / RANGE) * 100
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                <span
                  className={`text-[11px] font-bold tabular-nums ${
                    s.current ? 'text-pink-500' : 'text-gray-400 dark:text-gray-500'
                  }`}
                >
                  {s.length}
                </span>
                <div
                  className="w-full rounded-t-lg transition-all"
                  style={{
                    height: `${heightPct}%`,
                    minHeight: '8px',
                    background: s.current ? '#EC4899' : '#F9A8D4',
                    opacity: s.current ? 1 : 0.5,
                  }}
                />
              </div>
            )
          })}
        </div>

        <div className="flex justify-between text-[10px] text-gray-400 dark:text-gray-500 mt-2 px-0.5">
          <span>hace {series.length - 1} ciclos</span>
          <span>hace 4</span>
          <span>hace 3</span>
          <span>hace 2</span>
          <span>anterior</span>
          <span className="text-pink-500 font-semibold">este</span>
        </div>
      </div>

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 text-[11px]">
        <span className="text-gray-400 dark:text-gray-500">
          📏 Lo normal: <span className="font-semibold text-gray-600 dark:text-gray-300">21 a 35 días</span>
        </span>
        <span className="text-gray-400 dark:text-gray-500">
          📊 Tu variación: <span className="font-semibold text-gray-600 dark:text-gray-300">{variability} días</span>
        </span>
      </div>
    </div>
  )
}
