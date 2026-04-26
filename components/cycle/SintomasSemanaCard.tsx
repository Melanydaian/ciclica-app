import type { Registro } from './RecentSymptoms'

const DIAS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

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
    <div className="bg-white rounded-2xl border border-pink-100 p-6">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-sm font-semibold text-gray-700">Síntomas esta semana</h3>
        <span className="text-xs text-gray-400">últimos 7 días</span>
      </div>

      {totalSintomas === 0 ? (
        <p className="text-sm text-gray-400 mt-4 text-center py-2">
          Sin síntomas registrados esta semana 🌿
        </p>
      ) : (
        <>
          <div className="flex gap-1 mt-4 mb-3">
            {ultimos7.map((d, i) => {
              const tiene = d.sintomas.length > 0
              const intensidad = Math.min(d.sintomas.length, 3)
              const bgMap = ['bg-gray-100', 'bg-pink-100', 'bg-pink-300', 'bg-pink-500']
              const textMap = ['text-gray-300', 'text-pink-400', 'text-white', 'text-white']
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[10px] text-gray-400">{d.label}</span>
                  <div
                    className={`w-full aspect-square rounded-lg flex items-center justify-center text-[10px] font-semibold ${bgMap[intensidad]} ${textMap[intensidad]}`}
                    title={tiene ? d.sintomas.join(', ') : 'Sin registros'}
                  >
                    {tiene ? d.sintomas.length : ''}
                  </div>
                </div>
              )
            })}
          </div>

          <div className="flex items-center justify-between text-xs text-gray-500 mt-3 pt-3 border-t border-gray-50">
            <span>{totalDias} días con síntomas</span>
            {topSintoma && (
              <span className="text-pink-500 font-medium">
                Más frecuente: {topSintoma[0]}
              </span>
            )}
          </div>
        </>
      )}
    </div>
  )
}
