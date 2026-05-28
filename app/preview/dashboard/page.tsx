import { getCurrentPhase, calcularPromedioCiclo, PHASE_INFO } from '@/lib/cycle-utils'
import PhaseRing from '@/components/cycle/PhaseRing'
import WhoopStats from '@/components/cycle/WhoopStats'
import CalendarioCiclo from '@/components/cycle/CalendarioCiclo'
import CiclosTrend from '@/components/cycle/CiclosTrend'
import RecentSymptoms from '@/components/cycle/RecentSymptoms'
import ProximaSemanaCard from '@/components/cycle/ProximaSemanaCard'
import CorrelacionesCard from '@/components/cycle/CorrelacionesCard'
import ExportarPDFButton from '@/components/cycle/ExportarPDFButton'
import PuntosCard from '@/components/cycle/PuntosCard'
import ProximamenteCard from '@/components/cycle/ProximamenteCard'
import DisclaimerMedico from '@/components/cycle/DisclaimerMedico'
import NavBar from '@/components/layout/NavBar'

// Página de PREVIEW con datos mock — pública, solo para screenshots y diseño.
// NO mostrar en producción a usuarias reales.

export const metadata = { robots: { index: false, follow: false } }

const MOCK_REGISTROS = [
  { fecha: '2026-05-27', sintomas: ['energía alta', 'flujo claro'], estado_animo: 'energica', notas: '' },
  { fecha: '2026-05-26', sintomas: ['ánimo elevado'], estado_animo: 'feliz', notas: '' },
  { fecha: '2026-05-25', sintomas: ['leve dolor ovulatorio'], estado_animo: 'bien', notas: '' },
  { fecha: '2026-05-22', sintomas: ['energía alta'], estado_animo: 'feliz', notas: '' },
  { fecha: '2026-05-19', sintomas: ['cansancio leve'], estado_animo: 'regular', notas: '' },
  { fecha: '2026-05-15', sintomas: ['cólicos suaves'], estado_animo: 'cansada', notas: '' },
]

const MOCK_PAST_CYCLES = [
  { length: 28 },
  { length: 29 },
  { length: 27 },
  { length: 28 },
  { length: 28 },
]

export default function PreviewDashboardPage() {
  const cycleLength = 28
  const lastPeriod = new Date()
  lastPeriod.setDate(lastPeriod.getDate() - 12) // día 12 del ciclo

  const phaseData = getCurrentPhase(lastPeriod, cycleLength, 5)
  const promedio = calcularPromedioCiclo(MOCK_PAST_CYCLES)
  const durs = MOCK_PAST_CYCLES.map(c => c.length)
  const variability = Math.max(...durs) - Math.min(...durs)

  const mockUser = { email: 'preview@ciclica.pro', id: 'preview' } as never

  return (
    <div className="min-h-screen bg-[#FFF9FB]">
      <NavBar user={mockUser} />
      <main className="max-w-4xl mx-auto px-4 py-6 pb-24 md:pb-8">
        <div className="space-y-4">
          <div className="pb-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-400">
              Hola, Mel 👋
            </p>
            <h1 className="text-2xl font-bold text-gray-800 mt-1">Tu ciclo hoy</h1>
          </div>

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

          <WhoopStats
            cycleLength={cycleLength}
            averageLength={promedio}
            periodLength={5}
            variability={variability}
          />

          <ProximaSemanaCard
            nextPhase={phaseData.phase}
            daysUntilNextPeriod={phaseData.daysUntilNextPeriod}
          />

          <CiclosTrend pastCycles={MOCK_PAST_CYCLES} currentCycleLength={cycleLength} />

          <CorrelacionesCard registros={MOCK_REGISTROS} />

          <PuntosCard puntos={285} codigoReferido="ROSA42" log={[]} />

          <ProximamenteCard />

          <RecentSymptoms registros={MOCK_REGISTROS} />

          <ExportarPDFButton
            nombre="Mel"
            cycleLength={cycleLength}
            periodLength={5}
            pastCycles={MOCK_PAST_CYCLES.map((c, i) => ({
              fecha_inicio: new Date(Date.now() - (i + 1) * 28 * 86400000).toISOString().split('T')[0],
              duracion_dias: c.length,
            }))}
            registros={MOCK_REGISTROS.map(r => ({
              created_at: r.fecha,
              fase_actual: phaseData.phase,
              sintoma: r.sintomas.join(', '),
            }))}
          />

          <DisclaimerMedico />
        </div>
      </main>
    </div>
  )
}
