export type CyclePhase = 'menstrual' | 'folicular' | 'ovulatoria' | 'lutea'

export interface PhaseInfo {
  name: string
  emoji: string
  color: string
  description: string
  tip: string
}

export const PHASE_INFO: Record<CyclePhase, PhaseInfo> = {
  menstrual: {
    name: 'Menstrual',
    emoji: '🩸',
    color: '#EC4899',
    description: 'Tu cuerpo se renueva. Es momento de descanso y cuidado.',
    tip: 'Priorizá el descanso y el calor. Tu energía está baja y eso es completamente normal.',
  },
  folicular: {
    name: 'Folicular',
    emoji: '🌱',
    color: '#34D399',
    description: 'Tu energía empieza a crecer. Es el mejor momento para empezar proyectos.',
    tip: 'Aprovechá esta energía ascendente para planificar y comenzar cosas nuevas.',
  },
  ovulatoria: {
    name: 'Ovulatoria',
    emoji: '✨',
    color: '#FBBF24',
    description: 'Estás en tu pico de energía y sociabilidad.',
    tip: 'Es tu mejor momento para presentaciones, reuniones importantes y conexión social.',
  },
  lutea: {
    name: 'Lútea',
    emoji: '🌙',
    color: '#A78BFA',
    description: 'Tu cuerpo se prepara para el próximo ciclo. Podés sentirte más introspectiva.',
    tip: 'Es normal sentirte más sensible. Honorá ese espacio y reducí compromisos si podés.',
  },
}

export function getCurrentPhase(
  lastPeriodStart: Date,
  cycleLength = 28,
  periodLength = 5
): { phase: CyclePhase; dayOfCycle: number; daysUntilNextPeriod: number } {
  const today = new Date()
  const dayOfCycle = Math.floor(
    (today.getTime() - lastPeriodStart.getTime()) / (1000 * 60 * 60 * 24)
  ) % cycleLength + 1

  const daysUntilNextPeriod = cycleLength - dayOfCycle + 1

  let phase: CyclePhase
  if (dayOfCycle <= periodLength) phase = 'menstrual'
  else if (dayOfCycle <= 13) phase = 'folicular'
  else if (dayOfCycle <= 16) phase = 'ovulatoria'
  else phase = 'lutea'

  return { phase, dayOfCycle, daysUntilNextPeriod }
}
