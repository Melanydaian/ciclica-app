type Trend = 'up' | 'down' | 'flat' | null

function TrendArrow({ trend }: { trend: Trend }) {
  if (!trend || trend === 'flat') return null
  const isUp = trend === 'up'
  return (
    <span className={`text-xs font-bold ${isUp ? 'text-green-500' : 'text-pink-500'}`}>
      {isUp ? '↑' : '↓'}
    </span>
  )
}

export default function WhoopStats({
  cycleLength,
  averageLength,
  periodLength,
  variability,
}: {
  cycleLength: number
  averageLength?: number | null
  periodLength: number
  variability?: number | null
}) {
  const diff = averageLength ? cycleLength - averageLength : 0
  const trend: Trend = !averageLength ? null : diff === 0 ? 'flat' : diff > 0 ? 'up' : 'down'
  const variabilityLabel =
    variability == null ? '—' : variability <= 2 ? 'Regular' : variability <= 5 ? 'Moderada' : 'Irregular'
  const variabilityColor =
    variability == null ? '#9CA3AF' : variability <= 2 ? '#34D399' : variability <= 5 ? '#FBBF24' : '#F87171'

  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="bg-white dark:bg-[#1F1822] rounded-2xl border border-pink-100 dark:border-[#3A2F3F] px-5 py-5">
        <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-400 dark:text-[#8A8190]">
          Ciclo actual
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-5xl font-bold text-gray-800 dark:text-[#F4F1F5] tabular-nums leading-none">
            {cycleLength}
          </span>
          <span className="text-xs text-gray-400 dark:text-[#8A8190]">días</span>
        </div>
        {averageLength && (
          <div className="mt-3 flex items-center gap-1.5 text-[11px] text-gray-500 dark:text-[#B4ABB8]">
            <TrendArrow trend={trend} />
            <span>
              {diff === 0
                ? 'igual al promedio'
                : `${Math.abs(diff)} ${Math.abs(diff) === 1 ? 'día' : 'días'} ${diff > 0 ? 'más' : 'menos'} que tu promedio`}
            </span>
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-[#1F1822] rounded-2xl border border-pink-100 dark:border-[#3A2F3F] px-5 py-5">
        <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-400 dark:text-[#8A8190]">
          Período
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-5xl font-bold text-gray-800 dark:text-[#F4F1F5] tabular-nums leading-none">
            {periodLength}
          </span>
          <span className="text-xs text-gray-400 dark:text-[#8A8190]">días</span>
        </div>
        <div className="mt-3 text-[11px] text-gray-500 dark:text-[#B4ABB8]">
          {periodLength >= 2 && periodLength <= 7 ? 'Dentro del rango normal' : 'Fuera del rango habitual'}
        </div>
      </div>

      <div className="bg-white dark:bg-[#1F1822] rounded-2xl border border-pink-100 dark:border-[#3A2F3F] px-5 py-5 col-span-2">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-400 dark:text-[#8A8190]">
              Regularidad
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-5xl font-bold tabular-nums leading-none" style={{ color: variabilityColor }}>
                {variability == null ? '—' : variability}
              </span>
              {variability != null && <span className="text-xs text-gray-400 dark:text-[#8A8190]">días de variación</span>}
            </div>
          </div>
          <span
            className="text-[10px] font-bold uppercase tracking-[0.18em] px-3 py-1 rounded-full"
            style={{ color: variabilityColor, background: `${variabilityColor}1A` }}
          >
            {variabilityLabel}
          </span>
        </div>
      </div>
    </div>
  )
}
