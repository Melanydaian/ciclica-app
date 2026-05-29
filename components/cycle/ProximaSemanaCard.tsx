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

export default function ProximaSemanaCard({
  nextPhase,
  daysUntilNextPeriod,
}: {
  nextPhase: PhaseKey
  daysUntilNextPeriod: number
}) {
  const pred = PREDICTIONS[nextPhase]
  const energiaColor = ENERGIA_COLOR[pred.energia]

  return (
    <div className="bg-white dark:bg-[#1F1822] rounded-2xl border border-pink-100 dark:border-[#3A2F3F] px-5 py-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-400 dark:text-[#8A8190]">
            Esta semana
          </div>
          <div className="text-base font-semibold text-gray-800 dark:text-[#F4F1F5] mt-1 capitalize">
            Energía {pred.energia}
          </div>
        </div>
        <span
          className="inline-block w-3 h-3 rounded-full"
          style={{ background: energiaColor }}
        />
      </div>

      <p className="text-sm text-gray-600 dark:text-[#C9BFCB] leading-relaxed">{pred.consejo}</p>

      <div className="mt-5 pt-5 border-t border-gray-100 dark:border-[#3A2F3F]">
        <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-400 dark:text-[#8A8190] mb-2">
          Síntomas probables
        </div>
        <div className="flex flex-wrap gap-1.5">
          {pred.sintomas.map(s => (
            <span
              key={s}
              className="text-xs px-2.5 py-1 bg-pink-50 dark:bg-pink-500/10 text-pink-700 rounded-full font-medium"
            >
              {s}
            </span>
          ))}
        </div>
      </div>

      {daysUntilNextPeriod <= 7 && (
        <div className="mt-5 p-4 rounded-xl bg-pink-50 dark:bg-pink-500/10 border border-pink-100 dark:border-[#3A2F3F] flex items-center gap-3">
          <span className="text-xl">🩸</span>
          <p className="text-xs text-pink-700 font-medium leading-relaxed">
            Tu período se espera en{' '}
            <span className="font-bold">{daysUntilNextPeriod} {daysUntilNextPeriod === 1 ? 'día' : 'días'}</span>.
            Prepará lo que necesitás.
          </p>
        </div>
      )}
    </div>
  )
}
