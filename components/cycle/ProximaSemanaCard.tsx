type PhaseKey = 'menstrual' | 'folicular' | 'ovulatoria' | 'lutea'

const PREDICTIONS: Record<PhaseKey, { sintomas: string[]; energia: string; consejo: string }> = {
  menstrual: {
    sintomas: ['cólicos', 'cansancio', 'dolor lumbar'],
    energia: 'baja',
    consejo: 'Priorizá el descanso. Calor en el abdomen y mucha hidratación.',
  },
  folicular: {
    sintomas: ['flujo leve', 'energía en alza'],
    energia: 'en alza',
    consejo: 'Buen momento para arrancar proyectos y hacer ejercicio más intenso.',
  },
  ovulatoria: {
    sintomas: ['leve dolor ovulatorio', 'flujo claro'],
    energia: 'alta',
    consejo: 'Tu pico de energía y sociabilidad. Aprovechalo para reuniones y decisiones importantes.',
  },
  lutea: {
    sintomas: ['hinchazón', 'ansiedad', 'antojos'],
    energia: 'variable',
    consejo: 'Reducí el café y el azúcar. Más magnesio y omega-3 te van a ayudar.',
  },
}

const ENERGIA_COLOR: Record<string, string> = {
  baja: '#F87171',
  'en alza': '#34D399',
  alta: '#FBBF24',
  variable: '#A78BFA',
}

export default function ProximaSemanaCard({ nextPhase, daysUntilNextPeriod }: { nextPhase: PhaseKey; daysUntilNextPeriod: number }) {
  const pred = PREDICTIONS[nextPhase]

  return (
    <div className="bg-white rounded-2xl border border-pink-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-700">Qué esperar esta semana</h3>
        <span className="text-xs text-gray-400">según tu fase actual</span>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <span className="text-lg">⚡</span>
          <div>
            <p className="text-xs text-gray-400">Energía esperada</p>
            <p className="text-sm font-medium capitalize" style={{ color: ENERGIA_COLOR[pred.energia] }}>
              {pred.energia}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <span className="text-lg">🔮</span>
          <div>
            <p className="text-xs text-gray-400 mb-1">Síntomas probables</p>
            <div className="flex flex-wrap gap-1">
              {pred.sintomas.map(s => (
                <span key={s} className="text-xs px-2 py-0.5 bg-pink-50 text-pink-600 rounded-full">{s}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <span className="text-lg">💡</span>
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Consejo para esta fase</p>
            <p className="text-sm text-gray-600">{pred.consejo}</p>
          </div>
        </div>

        {daysUntilNextPeriod <= 7 && (
          <div className="mt-2 p-3 rounded-xl bg-pink-50 border border-pink-100 flex items-center gap-2">
            <span>🩸</span>
            <p className="text-xs text-pink-600 font-medium">
              Tu período se espera en {daysUntilNextPeriod} días. Prepará lo que necesitás.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
