import { getCurrentPhase, calcularPromedioCiclo, PHASE_INFO } from '@/lib/cycle-utils'
import { requireUsuaria } from '@/lib/usuaria'
import { createAdminSupabase } from '@/lib/supabase-server'
import PhaseRing from '@/components/cycle/PhaseRing'
import WhoopStats from '@/components/cycle/WhoopStats'
import CalendarioCiclo from '@/components/cycle/CalendarioCiclo'
import CiclosTrend from '@/components/cycle/CiclosTrend'
import ProximaSemanaCard from '@/components/cycle/ProximaSemanaCard'
import ExportarPDFButton from '@/components/cycle/ExportarPDFButton'
import PastillaCard from '@/components/cycle/PastillaCard'
import DisclaimerMedico from '@/components/cycle/DisclaimerMedico'
import PrimerPeriodoCard from '@/components/cycle/PrimerPeriodoCard'
import StreakCard from '@/components/cycle/StreakCard'
import DailyCheckIn from '@/components/cycle/DailyCheckIn'

export default async function DashboardPage() {
  const { telefono, webUser } = await requireUsuaria()
  void webUser
  const admin = createAdminSupabase()

  let { data: usuaria } = await admin
    .from('usuarias')
    .select('nombre, fecha_inicio_ciclo, duracion_ciclo, promedio_duracion_ciclo, puntos, codigo_referido, objetivo, toma_anticonceptivas')
    .eq('telefono', telefono)
    .maybeSingle()

  if (!usuaria) {
    const fallback = await admin
      .from('usuarias')
      .select('nombre, fecha_inicio_ciclo, duracion_ciclo, promedio_duracion_ciclo, puntos, codigo_referido, objetivo')
      .eq('telefono', telefono)
      .maybeSingle()
    usuaria = fallback.data ? { ...fallback.data, toma_anticonceptivas: false } : null
  }

  const tomaAnticonceptivas = usuaria?.toma_anticonceptivas ?? false
  const hoy = new Date().toISOString().split('T')[0]

  const telefonoVariants = [telefono, `=${telefono}`, `+${telefono}`, `${telefono}@s.whatsapp.net`]

  const [
    { data: regsRaw },
    { data: ciclosRaw },
    { data: pastilla },
  ] = await Promise.all([
    admin
      .from('registros_ciclo')
      .select('created_at, fase_actual, sintoma')
      .in('telefono', telefonoVariants)
      .order('created_at', { ascending: false })
      .limit(120),
    admin
      .from('historial_ciclos')
      .select('duracion_dias, fecha_inicio')
      .in('telefono', telefonoVariants)
      .order('fecha_inicio', { ascending: false })
      .limit(60),
    tomaAnticonceptivas
      ? admin
          .from('pastillas_log')
          .select('tomada, hora')
          .eq('telefono', telefono)
          .eq('fecha', hoy)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ])

  const regsSeen = new Set<string>()
  const regs = (regsRaw ?? []).filter(r => {
    const key = `${r.created_at}|${r.sintoma ?? ''}|${r.fase_actual ?? ''}`
    if (regsSeen.has(key)) return false
    regsSeen.add(key)
    return true
  })

  const ciclosMap = new Map<string, number>()
  for (const c of ciclosRaw ?? []) {
    if (!c.fecha_inicio) continue
    const prev = ciclosMap.get(c.fecha_inicio) ?? 0
    if ((c.duracion_dias ?? 0) > prev) ciclosMap.set(c.fecha_inicio, c.duracion_dias ?? 0)
  }
  const ciclos = Array.from(ciclosMap.entries())
    .filter(([, d]) => d >= 15 && d <= 60)
    .sort((a, b) => (a[0] < b[0] ? 1 : -1))
    .map(([fecha_inicio, duracion_dias]) => ({ fecha_inicio, duracion_dias }))
    .slice(0, 6)

  const nombre = usuaria?.nombre ?? webUser.nombre ?? 'vos'

  const registros = (regs ?? []).map(r => ({
    fecha: r.created_at?.split('T')[0] ?? '',
    sintomas: r.sintoma ? [r.sintoma] : [],
    estado_animo: '',
    notas: '',
  }))

  const pastCycles = (ciclos ?? []).map(c => ({ length: c.duracion_dias ?? 28 }))

  const lastPeriodIso = usuaria?.fecha_inicio_ciclo ?? ciclos[0]?.fecha_inicio ?? null
  const lastPeriod = lastPeriodIso ? new Date(lastPeriodIso) : null

  const promedioHistorial = calcularPromedioCiclo(pastCycles)
  const cycleLength = usuaria?.promedio_duracion_ciclo ?? usuaria?.duracion_ciclo ?? promedioHistorial

  const phaseData = lastPeriod ? getCurrentPhase(lastPeriod, cycleLength, 5) : null

  const pastillaHoy = pastilla
    ? { tomada: pastilla.tomada ?? false, hora: pastilla.hora ?? null }
    : null

  // Variabilidad de ciclos pasados (max-min)
  const durs = pastCycles.map(c => c.length).filter(Boolean)
  const variability = durs.length >= 2 ? Math.max(...durs) - Math.min(...durs) : null
  const averageLength = pastCycles.length > 0 ? promedioHistorial : null

  return (
    <div className="space-y-4">
      <div className="pb-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-400">
          Hola, {nombre} 👋
        </p>
        <h1 className="text-2xl font-bold text-gray-800 mt-1">Tu ciclo hoy</h1>
      </div>

      {phaseData && lastPeriod && (
        <DailyCheckIn
          yaRegistroHoy={registros.some(r => r.fecha === new Date().toISOString().split('T')[0])}
        />
      )}

      {phaseData && lastPeriod ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <PhaseRing
            info={PHASE_INFO[phaseData.phase]}
            phase={phaseData.phase}
            dayOfCycle={phaseData.dayOfCycle}
            cycleLength={cycleLength}
            daysUntilNextPeriod={phaseData.daysUntilNextPeriod}
            lastPeriod={lastPeriod}
          />
          <CalendarioCiclo
            lastPeriod={lastPeriod}
            cycleLength={cycleLength}
            periodLength={5}
            daysUntilNextPeriod={phaseData.daysUntilNextPeriod}
          />
        </div>
      ) : (
        <PrimerPeriodoCard />
      )}

      {tomaAnticonceptivas && <PastillaCard initial={pastillaHoy} />}

      {phaseData && lastPeriod && (
        <>
          <WhoopStats
            cycleLength={cycleLength}
            averageLength={averageLength}
            periodLength={5}
            variability={variability}
          />

          <StreakCard registros={registros} />

          <ProximaSemanaCard
            nextPhase={phaseData.phase}
            daysUntilNextPeriod={phaseData.daysUntilNextPeriod}
          />

          {pastCycles.length >= 2 && (
            <CiclosTrend pastCycles={pastCycles} currentCycleLength={cycleLength} />
          )}
        </>
      )}

      <ExportarPDFButton
        nombre={nombre}
        cycleLength={cycleLength}
        periodLength={5}
        pastCycles={ciclos ?? []}
        registros={regs ?? []}
      />

      <DisclaimerMedico />
    </div>
  )
}
