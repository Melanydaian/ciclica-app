import type { Registro } from './RecentSymptoms'

export default function CorrelacionesCard({ registros }: { registros: Registro[] }) {
  // Agrupamos síntomas por fase (usando campo notas como fase proxy si disponible)
  // En realidad los registros vienen de registros_ciclo que tiene fase_actual pero no lo mapeamos aún
  // Por ahora calculamos frecuencia de síntomas y días con síntomas
  const frecuencia: Record<string, number> = {}
  registros.forEach(r => r.sintomas?.forEach(s => { if (s) frecuencia[s] = (frecuencia[s] ?? 0) + 1 }))

  const topSintomas = Object.entries(frecuencia)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)

  const totalRegistros = registros.length

  if (totalRegistros < 3) {
    return (
      <div className="bg-white dark:bg-[#1F1822] rounded-2xl border border-pink-100 dark:border-[#3A2F3F] p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-[#E5DBE8]">Patrones detectados</h3>
          <span className="text-xs text-gray-400 dark:text-[#8A8190]">últimos ciclos</span>
        </div>
        <div className="text-center py-6">
          <p className="text-2xl mb-2">🌱</p>
          <p className="text-sm text-gray-500 dark:text-[#B4ABB8]">Recopilando tus patrones...</p>
          <p className="text-xs text-gray-400 dark:text-[#8A8190] mt-1">
            Con más registros vía WhatsApp podremos detectar correlaciones entre síntomas y fases.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-[#1F1822] rounded-2xl border border-pink-100 dark:border-[#3A2F3F] p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-[#E5DBE8]">Síntomas más frecuentes</h3>
        <span className="text-xs text-gray-400 dark:text-[#8A8190]">{totalRegistros} registros</span>
      </div>

      {topSintomas.length === 0 ? (
        <p className="text-sm text-gray-400 dark:text-[#8A8190] text-center py-3">Sin síntomas registrados aún.</p>
      ) : (
        <div className="space-y-3">
          {topSintomas.map(([sintoma, count], i) => {
            const pct = Math.round((count / totalRegistros) * 100)
            const emoji = i === 0 ? '🔴' : i === 1 ? '🟠' : i === 2 ? '🟡' : '🟢'
            return (
              <div key={sintoma}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-700 dark:text-[#E5DBE8] flex items-center gap-2">
                    <span>{emoji}</span> {sintoma}
                  </span>
                  <span className="text-xs text-gray-400 dark:text-[#8A8190]">{count}× ({pct}%)</span>
                </div>
                <div className="h-1.5 bg-gray-100 dark:bg-[#2A2030] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-pink-400"
                    style={{ width: `${Math.min(pct * 2, 100)}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}

      <p className="text-[11px] text-gray-300 mt-4">
        Con más registros detectaremos patrones por fase del ciclo.
      </p>
    </div>
  )
}
