import type { CyclePhase } from './cycle-utils'

const MS_DAY = 24 * 60 * 60 * 1000

/**
 * Devuelve la fase del ciclo para una fecha cualquiera, dado un último período
 * y la longitud del ciclo. Si la fecha está en el futuro, también es una
 * proyección razonable (no garantía).
 */
export function phaseAtDate(
  date: Date,
  lastPeriodStart: Date,
  cycleLength: number,
  periodLength = 5,
): CyclePhase | null {
  const diffMs = date.getTime() - lastPeriodStart.getTime()
  if (diffMs < 0) return null
  const diffDays = Math.floor(diffMs / MS_DAY)
  const day = (diffDays % cycleLength) + 1
  const ovulationDay = Math.max(periodLength + 3, cycleLength - 14)
  if (day <= periodLength) return 'menstrual'
  if (day < ovulationDay - 2) return 'folicular'
  if (day <= ovulationDay + 2) return 'ovulatoria'
  return 'lutea'
}

/**
 * Fecha estimada del próximo período + rango aproximado (±3 días).
 */
export function nextPeriodEstimate(
  lastPeriodStart: Date,
  cycleLength: number,
  daysUntilNextPeriod: number,
  bufferDays = 3,
): { estimated: Date; rangeStart: Date; rangeEnd: Date } {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const estimated = new Date(today)
  estimated.setDate(today.getDate() + daysUntilNextPeriod - 1)
  const rangeStart = new Date(estimated)
  rangeStart.setDate(estimated.getDate() - bufferDays)
  const rangeEnd = new Date(estimated)
  rangeEnd.setDate(estimated.getDate() + bufferDays)
  // suprimir variable no usada
  void lastPeriodStart
  void cycleLength
  return { estimated, rangeStart, rangeEnd }
}

/**
 * Verifica si una fecha está dentro del rango aproximado de un período próximo.
 */
export function isInRange(d: Date, start: Date, end: Date): boolean {
  const t = d.getTime()
  return t >= start.getTime() && t <= end.getTime()
}

/**
 * Formato corto en español: "8 jun" / "12 sept"
 */
export function fmtShort(d: Date): string {
  return d.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' }).replace('.', '')
}

/**
 * Rango legible: si ambos días son del mismo mes → "8-12 jun"; si no → "30 may - 2 jun".
 */
export function fmtRange(a: Date, b: Date): string {
  if (a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear()) {
    const month = a.toLocaleDateString('es-AR', { month: 'short' }).replace('.', '')
    return `${a.getDate()}-${b.getDate()} ${month}`
  }
  return `${fmtShort(a)} - ${fmtShort(b)}`
}
