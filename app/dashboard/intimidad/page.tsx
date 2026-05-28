import { requireUsuaria } from '@/lib/usuaria'
import { createAdminSupabase } from '@/lib/supabase-server'
import IntimidadContent, { type SexRegistro } from '@/components/cycle/IntimidadContent'
import { getCurrentPhase, calcularPromedioCiclo } from '@/lib/cycle-utils'

export default async function IntimidadPage() {
  const { telefono } = await requireUsuaria()
  const admin = createAdminSupabase()

  const telefonoVariants = [telefono, `=${telefono}`, `+${telefono}`, `${telefono}@s.whatsapp.net`]

  const [usuariaRes, sexRes, ciclosRes] = await Promise.all([
    admin
      .from('usuarias')
      .select('fecha_inicio_ciclo, duracion_ciclo, promedio_duracion_ciclo')
      .eq('telefono', telefono)
      .maybeSingle(),
    admin
      .from('sex_registros')
      .select('fecha, fase, hubo_proteccion, proteccion, nota_adicional')
      .in('user_id', telefonoVariants)
      .order('fecha', { ascending: false })
      .limit(60),
    admin
      .from('historial_ciclos')
      .select('duracion_dias, fecha_inicio')
      .in('telefono', telefonoVariants)
      .order('fecha_inicio', { ascending: false })
      .limit(12),
  ])

  const registros = (sexRes.data ?? []) as SexRegistro[]

  // Datos para el calendario
  const ciclos = (ciclosRes.data ?? [])
    .filter(c => c.fecha_inicio && c.duracion_dias && c.duracion_dias >= 15 && c.duracion_dias <= 60)
  const pastCycles = ciclos.map(c => ({ length: c.duracion_dias as number }))
  const promedioHistorial = calcularPromedioCiclo(pastCycles)
  const cycleLength =
    usuariaRes.data?.promedio_duracion_ciclo ??
    usuariaRes.data?.duracion_ciclo ??
    promedioHistorial

  const lastPeriodIso =
    usuariaRes.data?.fecha_inicio_ciclo ?? ciclos[0]?.fecha_inicio ?? null
  const lastPeriod = lastPeriodIso ? new Date(lastPeriodIso) : null

  const phaseData = lastPeriod ? getCurrentPhase(lastPeriod, cycleLength, 5) : null
  const daysUntilNextPeriod = phaseData?.daysUntilNextPeriod ?? 0

  return (
    <IntimidadContent
      lastPeriod={lastPeriod}
      cycleLength={cycleLength}
      daysUntilNextPeriod={daysUntilNextPeriod}
      registros={registros}
    />
  )
}
