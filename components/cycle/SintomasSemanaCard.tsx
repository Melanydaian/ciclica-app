import type { Registro } from './RecentSymptoms'

const DIAS = ['D', 'L', 'M', 'M', 'J', 'V', 'S']

export default function SintomasSemanaCard({ registros }: { registros: Registro[] }) {
  const hoy = new Date()
  const ultimos7: { fecha: string; label: string; sintomas: string[] }[] = []

  for (let i = 6; i >= 0; i--) {
    const d = new Date(hoy)
    d.setDate(hoy.getDate() - i)
    const iso = d.toISOString().split('T')[0]
    const regsDelDia = registros.filter(r => r.fecha === iso)
    const sintomas = regsDelDia.flatMap(r => r.sintomas ?? []).filter(Boolean)
    ultimos7.push({ fecha: iso, label: DIAS[d.getDay()], sintomas })
  }

  const totalDias = ultimos7.filter(d => d.sintomas.length > 0).length
  const totalSintomas = ultimos7.reduce((acc, d) => acc + d.sintomas.length, 0)

  const frecuencia: Record<string, number> = {}
  registros.forEach(r => r.sintomas?.forEach(s => { if (s) frecuencia[s] = (frecuencia[s] ?? 0) + 1 }))
  const topSintoma = Object.entries(frecuencia).sort((a, b) => b[1] - a[1])[0]

  return (
    <div className="bg-white rounded-2xl border border-pink-100 px-5 py-6">
      <div className="flex items-center justify-between mb-1">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-400">
            Últimos 7 días
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-bold text-gray-800 tabular-nums leading-none">
              {totalDias}
            </span>
            <span className="text-xs text-gray-400">
              {totalDias === 1 ? 'día' : 'días'} con registros
            </span>
          </div>
        </div>
        {topSintoma && (
          <div className="text-right">
            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-400">
              Más frecuente
            </div>
            <div className="text-sm font-semibold text-pink-500 mt-1 max-w-[160px] truncate">
              {topSintoma[0]}
            </div>
          </div>
        )}
      </div>

      {totalSintomas === 0 ? (
        <p className="text-sm text-gray-400 mt-5 text-center py-2">
          Sin síntomas registrados esta semana 🌿
        </p>
      ) : (
        <div className="flex gap-2 mt-5">
          {ultimos7.map((d, i) => {
            const tiene = d.sintomas.length > 0
            const intensidad = Math.min(d.sintomas.length, 4)
            const bgScale = ['#F3F4F6', '#FBCFE8', '#F9A8D4', '#EC4899', '#9D174D']
            const txtScale = ['#9CA3AF', '#9D174D', '#FFFFFF', '#FFFFFF', '#FFFFFF']
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                <span className="text-[10px] font-semibold text-gray-400">{d.label}</span>
                <div
                  className="w-full aspect-square rounded-xl flex items-center justify-center text-xs font-bold transition-all"
                  style={{
                    background: bgScale[intensidad],
                    color: txtScale[intensidad],
                  }}
                  title={tiene ? d.sintomas.join(', ') : 'Sin registros'}
                >
                  {tiene ? d.sintomas.length : ''}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
