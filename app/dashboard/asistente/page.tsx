import { requireUsuaria } from '@/lib/usuaria'
import { createAdminSupabase } from '@/lib/supabase-server'
import { getCurrentPhase, calcularPromedioCiclo, PHASE_INFO } from '@/lib/cycle-utils'
import { sugerenciasPorFase } from '@/lib/asistente'
import AsistenteChat from '@/components/cycle/AsistenteChat'
import AsistentePaywall from '@/components/cycle/AsistentePaywall'

export default async function AsistentePage() {
  const { telefono, webUser } = await requireUsuaria()

  if (!webUser.suscripcion_activa) {
    return <AsistentePaywall />
  }

  const admin = createAdminSupabase()

  const { data: usuaria } = await admin
    .from('usuarias')
    .select('nombre, fecha_inicio_ciclo, duracion_ciclo, promedio_duracion_ciclo')
    .eq('telefono', telefono)
    .maybeSingle()

  const telefonoVariants = [
    telefono,
    `=${telefono}`,
    `+${telefono}`,
    `${telefono}@s.whatsapp.net`,
  ]

  const { data: ciclos } = await admin
    .from('historial_ciclos')
    .select('duracion_dias')
    .in('telefono', telefonoVariants)
    .order('fecha_inicio', { ascending: false })
    .limit(6)

  const pastCycles = (ciclos ?? [])
    .map((c) => ({ length: c.duracion_dias ?? 28 }))
    .filter((c) => c.length >= 15 && c.length <= 60)
  const cycleLength =
    usuaria?.promedio_duracion_ciclo ??
    usuaria?.duracion_ciclo ??
    calcularPromedioCiclo(pastCycles)

  const lastPeriod = usuaria?.fecha_inicio_ciclo ? new Date(usuaria.fecha_inicio_ciclo) : null
  const phaseData = lastPeriod ? getCurrentPhase(lastPeriod, cycleLength, 5) : null
  const nombre = usuaria?.nombre ?? webUser.nombre ?? 'vos'

  const saludo = phaseData
    ? `¡Hola, ${nombre}! ${PHASE_INFO[phaseData.phase].emoji} Estás en tu fase ${PHASE_INFO[
        phaseData.phase
      ].name.toLowerCase()} (día ${phaseData.dayOfCycle}). ${
        PHASE_INFO[phaseData.phase].description
      } Contame cómo venís hoy y te digo qué entrenar, comer o hacer — y por qué te conviene justo en este momento del ciclo.`
    : `¡Hola, ${nombre}! 💗 Soy tu coach de ciclo. Puedo recomendarte entrenamientos, comidas y recetas según tu fase, y explicarte el porqué de cada uno. Para afinar las recomendaciones, registrá tu período cuando puedas. ¿En qué te ayudo hoy?`

  return (
    <AsistenteChat
      nombre={nombre}
      saludo={saludo}
      sugerencias={sugerenciasPorFase(phaseData?.phase ?? null)}
    />
  )
}
