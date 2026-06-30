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
import QuickAccessCard from '@/components/cycle/QuickAccessCard'
import AsistenteCard from '@/components/cycle/AsistenteCard'
import { ChartLine, CalendarHeart, HeartHandshake, NotebookPen } from 'lucide-react'

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
    { data: sexRows },
    { data: journalRows },
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
    admin
      .from('sex_registros')
      .select('fecha, hubo_proteccion')
      .in('user_id', telefonoVariants)
      .order('fecha', { ascending: false })
      .limit(60),
    admin
      .from('journal_entries')
      .select('fecha, texto')
      .eq('telefono', telefono)
      .order('fecha', { ascending: false })
      .limit(1),
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

  // Stats para los QuickAccess cards
  const sintomaCount = new Map<string, number>()
  for (const r of regs) {
    const s = (r.sintoma ?? '').toLowerCase().trim()
    if (s) sintomaCount.set(s, (sintomaCount.get(s) ?? 0) + 1)
  }
  const topSintoma = Array.from(sintomaCount.entries()).sort((a, b) => b[1] - a[1])[0]
  const totalSintomas = regs.length

  const sexCount = sexRows?.length ?? 0
  const sexConProteccion = sexRows?.filter(r => r.hubo_proteccion === 'si').length ?? 0
  const ultimaSexFecha = sexRows?.[0]?.fecha
    ? new Date(sexRows[0].fecha + 'T00:00:00').toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })
    : null

  const ultimaJournal = journalRows?.[0]
    ? `"${(journalRows[0].texto ?? '').slice(0, 60)}${(journalRows[0].texto?.length ?? 0) > 60 ? '...' : ''}"`
    : null

  return (
    <div className="space-y-4">
      <div className="pb-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-400">
          Hola, {nombre} 👋
        </p>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-[#F4F1F5] mt-1">Tu ciclo hoy</h1>
      </div>

      {phaseData && lastPeriod && (
        <DailyCheckIn
          yaRegistroHoy={registros.some(r => r.fecha === new Date().toISOString().split('T')[0])}
        />
      )}

      <AsistenteCard />

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

          <div className="pt-2">
            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-400 mb-2 px-1">
              Explorar tu data
            </div>
            <div className="grid grid-cols-2 gap-3">
              <QuickAccessCard
                href="/dashboard/sintomas"
                Icon={ChartLine}
                label="Tus síntomas"
                primary={totalSintomas}
                primarySuffix={totalSintomas === 1 ? 'registro' : 'registros'}
                hint={
                  topSintoma
                    ? `Más frecuente: ${topSintoma[0]}`
                    : 'Empezá a registrar cómo te sentís'
                }
              />
              <QuickAccessCard
                href="/dashboard/historial"
                Icon={CalendarHeart}
                label="Tu historial"
                primary={pastCycles.length}
                primarySuffix={pastCycles.length === 1 ? 'ciclo' : 'ciclos'}
                hint={
                  averageLength
                    ? `Promedio: ${averageLength} días`
                    : 'Vas a ver tus ciclos acá'
                }
                accent="#A78BFA"
              />
              <QuickAccessCard
                href="/dashboard/intimidad"
                Icon={HeartHandshake}
                label="Tu intimidad"
                primary={sexCount}
                primarySuffix={sexCount === 1 ? 'registro' : 'registros'}
                hint={
                  sexCount > 0
                    ? `${Math.round((sexConProteccion / sexCount) * 100)}% con protección · último ${ultimaSexFecha}`
                    : 'Privado · solo para vos'
                }
              />
              <QuickAccessCard
                href="/dashboard/journal"
                Icon={NotebookPen}
                label="Tu diario"
                primary={journalRows?.length ? 'Última nota' : '0'}
                primarySuffix={journalRows?.length ? '' : 'notas'}
                hint={ultimaJournal ?? 'Escribí libremente cómo te sentís'}
                accent="#34D399"
              />
            </div>
          </div>
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
