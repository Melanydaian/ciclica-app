import { getCurrentPhase, calcularPromedioCiclo, PHASE_INFO } from '@/lib/cycle-utils'
import PhaseCard from '@/components/cycle/PhaseCard'
import StatsRow from '@/components/cycle/StatsRow'
import RecentSymptoms from '@/components/cycle/RecentSymptoms'
import RegularidadCard from '@/components/cycle/RegularidadCard'
import ProximaSemanaCard from '@/components/cycle/ProximaSemanaCard'
import CorrelacionesCard from '@/components/cycle/CorrelacionesCard'
import SintomasSemanaCard from '@/components/cycle/SintomasSemanaCard'
import ExportarPDFButton from '@/components/cycle/ExportarPDFButton'
import TendenciaCiclosCard from '@/components/cycle/TendenciaCiclosCard'
import PuntosCard from '@/components/cycle/PuntosCard'
import ProximamenteCard from '@/components/cycle/ProximamenteCard'

const MOCK_REGISTROS = [
  { fecha: '2026-04-21', sintomas: ['cólicos fuertes'], estado_animo: 'mal',       notas: '' },
  { fecha: '2026-04-20', sintomas: ['cansancio'],        estado_animo: 'cansada',   notas: '' },
  { fecha: '2026-04-15', sintomas: ['ansiedad'],          estado_animo: 'irritable', notas: '' },
  { fecha: '2026-04-10', sintomas: ['dolor leve'],        estado_animo: 'excelente', notas: 'Me sentí con mucha energía' },
]

const MOCK_PAST_CYCLES = [{ length: 28 }, { length: 28 }, { length: 28 }]

export default async function DashboardPage() {
  let usuaria: {
    nombre?: string
    fecha_inicio_ciclo?: string
    duracion_ciclo?: number
    promedio_duracion_ciclo?: number
    puntos?: number
    codigo_referido?: string
    objetivo?: string
  } | null = null
  let registros = MOCK_REGISTROS
  let pastCycles = MOCK_PAST_CYCLES
  let nombre = 'vos'
  let puntosLog: { puntos: number; concepto: string; descripcion: string; created_at: string }[] = []
  let suscripcionActiva = false

  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    const { createServerSupabase, createAdminSupabase } = await import('@/lib/supabase-server')
    const supabase = await createServerSupabase()
    const admin = createAdminSupabase()

    const { data: { user } } = await supabase.auth.getUser()

    if (user?.email) {
      const { data: webUser } = await admin
        .from('usuarias_web')
        .select('telefono, nombre, suscripcion_activa, suscripcion_plan')
        .eq('email', user.email)
        .single()

      const telefono = webUser?.telefono
      suscripcionActiva = webUser?.suscripcion_activa ?? false

      if (telefono) {
        const [
          { data: u },
          { data: regs },
          { data: ciclos },
          { data: log },
        ] = await Promise.all([
          admin.from('usuarias')
            .select('nombre, fecha_inicio_ciclo, duracion_ciclo, promedio_duracion_ciclo, puntos, codigo_referido, objetivo')
            .eq('telefono', telefono).single(),
          admin.from('registros_ciclo')
            .select('created_at, fase_actual, sintoma')
            .eq('telefono', telefono)
            .order('created_at', { ascending: false }).limit(14),
          admin.from('historial_ciclos')
            .select('duracion_dias')
            .eq('telefono', telefono)
            .order('fecha_inicio', { ascending: false }).limit(6),
          admin.from('puntos_log')
            .select('puntos, concepto, descripcion, created_at')
            .eq('telefono', telefono)
            .order('created_at', { ascending: false }).limit(4),
        ])

        usuaria = u
        nombre = u?.nombre ?? webUser?.nombre ?? 'vos'
        if (regs?.length) registros = regs.map(r => ({
          fecha: r.created_at?.split('T')[0] ?? '',
          sintomas: r.sintoma ? [r.sintoma] : [],
          estado_animo: '', notas: '',
        }))
        if (ciclos?.length) pastCycles = ciclos.map(c => ({ length: c.duracion_dias ?? 28 }))
        if (log?.length) puntosLog = log
      }
    }
  }

  const lastPeriod = usuaria?.fecha_inicio_ciclo
    ? new Date(usuaria.fecha_inicio_ciclo)
    : new Date('2026-04-18')

  // Preferir el promedio calculado sobre el valor por defecto; calcularPromedioCiclo
  // filtra ciclos anómalos (<21 o >45 días) para no distorsionar el resultado
  const promedioHistorial = calcularPromedioCiclo(pastCycles)
  const cycleLength = usuaria?.promedio_duracion_ciclo ?? usuaria?.duracion_ciclo ?? promedioHistorial

  const { phase, dayOfCycle, daysUntilNextPeriod } = getCurrentPhase(lastPeriod, cycleLength, 5)
  const info = PHASE_INFO[phase]

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-gray-400 mb-1">Hola, {nombre} 👋</p>
        <h1 className="text-2xl font-bold text-gray-800">Tu ciclo hoy</h1>
      </div>

      <PhaseCard info={info} dayOfCycle={dayOfCycle} />

      <StatsRow daysUntilNextPeriod={daysUntilNextPeriod} dayOfCycle={dayOfCycle} cycleLength={cycleLength} />

      <ProximaSemanaCard nextPhase={phase} daysUntilNextPeriod={daysUntilNextPeriod} />

      <SintomasSemanaCard registros={registros} />

      <RegularidadCard cycleLength={cycleLength} periodLength={5} pastCycles={pastCycles} />

      <TendenciaCiclosCard pastCycles={pastCycles} currentCycleLength={cycleLength} />

      <CorrelacionesCard registros={registros} />

      <PuntosCard
        puntos={usuaria?.puntos ?? 0}
        codigoReferido={usuaria?.codigo_referido}
        log={puntosLog}
      />

      {!suscripcionActiva && <ProximamenteCard />}

      <RecentSymptoms registros={registros} />

      <ExportarPDFButton nombre={nombre} cycleLength={cycleLength} periodLength={5} />
    </div>
  )
}
