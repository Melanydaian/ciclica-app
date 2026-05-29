export type Registro = {
  fecha: string
  sintomas?: string[]
  estado_animo?: string
  notas?: string
}

const MOOD_EMOJI: Record<string, string> = {
  bien: '😊', excelente: '🤩', regular: '😐', mal: '😔', ansiosa: '😰',
  cansada: '😴', energica: '⚡', irritable: '😤', triste: '😢',
}

export default function RecentSymptoms({ registros }: { registros: Registro[] }) {
  if (!registros.length) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-pink-100 dark:border-gray-800 text-center">
        <p className="text-gray-400 dark:text-gray-500 text-sm">Todavía no hay registros esta semana.</p>
        <p className="text-xs text-gray-300 mt-1">Escribile a Cíclica por WhatsApp para empezar 🌸</p>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-pink-100 dark:border-gray-800">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-4">Últimos 14 días</h3>
      <div className="space-y-3">
        {registros.slice(0, 7).map((r, i) => (
          <div key={i} className="flex items-start gap-3">
            <span className="text-lg">{r.estado_animo ? (MOOD_EMOJI[r.estado_animo] ?? '🌸') : '🌸'}</span>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-400 dark:text-gray-500">
                {new Date(r.fecha).toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short' })}
              </p>
              {r.sintomas?.length ? (
                <div className="flex flex-wrap gap-1 mt-1">
                  {r.sintomas.map((s, j) => (
                    <span key={j} className="text-xs px-2 py-0.5 bg-pink-50 dark:bg-pink-950/20 text-pink-600 rounded-full">{s}</span>
                  ))}
                </div>
              ) : null}
              {r.notas && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">{r.notas}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
