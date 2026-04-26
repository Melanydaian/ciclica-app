const ESTA_SEMANA = [
  { dia: 'L', animo: 2, sintomas: ['cólicos'] },
  { dia: 'M', animo: 2, sintomas: ['cólicos', 'cansancio'] },
  { dia: 'X', animo: 3, sintomas: ['cansancio'] },
  { dia: 'J', animo: 4, sintomas: [] },
  { dia: 'V', animo: 4, sintomas: [] },
  { dia: 'S', animo: null, sintomas: [] },
  { dia: 'D', animo: null, sintomas: [] },
]

const SEMANA_PASADA = [
  { dia: 'L', animo: 3, sintomas: ['hinchazón'] },
  { dia: 'M', animo: 2, sintomas: ['hinchazón', 'ansiedad'] },
  { dia: 'X', animo: 2, sintomas: ['ansiedad', 'dolor cabeza'] },
  { dia: 'J', animo: 3, sintomas: ['ansiedad'] },
  { dia: 'V', animo: 3, sintomas: [] },
  { dia: 'S', animo: 4, sintomas: [] },
  { dia: 'D', animo: 4, sintomas: [] },
]

const ANIMO_COLOR = ['', '#F87171', '#FBBF24', '#FCD34D', '#34D399', '#10B981']
const ANIMO_LABEL = ['', 'Mal', 'Regular', 'Bien', 'Muy bien', 'Excelente']

export default function ComparacionSemanalCard() {
  const promedioEsta = ESTA_SEMANA.filter(d => d.animo).reduce((a, d) => a + (d.animo ?? 0), 0) / ESTA_SEMANA.filter(d => d.animo).length
  const promedioPasada = SEMANA_PASADA.filter(d => d.animo).reduce((a, d) => a + (d.animo ?? 0), 0) / SEMANA_PASADA.filter(d => d.animo).length
  const diff = promedioEsta - promedioPasada

  return (
    <div className="bg-white rounded-2xl border border-pink-100 p-6">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-sm font-semibold text-gray-700">Esta semana vs la anterior</h3>
        <span
          className="text-xs font-semibold"
          style={{ color: diff >= 0 ? '#34D399' : '#F87171' }}
        >
          {diff >= 0 ? '▲' : '▼'} {Math.abs(diff).toFixed(1)} pts
        </span>
      </div>
      <p className="text-xs text-gray-400 mb-4">Estado de ánimo promedio diario</p>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {ESTA_SEMANA.map((d, i) => {
          const pasada = SEMANA_PASADA[i]
          return (
            <div key={i} className="flex flex-col items-center gap-1">
              <span className="text-[10px] text-gray-400">{d.dia}</span>
              {/* Esta semana */}
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                style={{ background: d.animo ? ANIMO_COLOR[d.animo] : '#E5E7EB' }}
                title={d.animo ? ANIMO_LABEL[d.animo] : 'Sin registro'}
              >
                {d.animo ?? '·'}
              </div>
              {/* Semana pasada */}
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold opacity-40"
                style={{
                  background: pasada.animo ? ANIMO_COLOR[pasada.animo] : '#E5E7EB',
                  color: pasada.animo ? 'white' : '#9CA3AF',
                }}
                title={`Semana pasada: ${pasada.animo ? ANIMO_LABEL[pasada.animo] : 'Sin registro'}`}
              >
                {pasada.animo ?? '·'}
              </div>
            </div>
          )
        })}
      </div>

      <div className="flex gap-3 mt-3 text-[10px] text-gray-400">
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-pink-400 inline-block opacity-100" /> Esta semana</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-pink-400 inline-block opacity-40" /> Semana pasada</span>
      </div>
    </div>
  )
}
