import { requireUsuaria } from '@/lib/usuaria'
import { createAdminSupabase } from '@/lib/supabase-server'
import PerfilContent from '@/components/cycle/PerfilContent'

export default async function PerfilPage() {
  const { email, telefono, webUser } = await requireUsuaria()
  const admin = createAdminSupabase()

  // SELECT defensivo: si la migración 010 no se corrió, las columnas nuevas no existen
  let { data: usuaria } = await admin
    .from('usuarias')
    .select('duracion_ciclo, promedio_duracion_ciclo, toma_anticonceptivas, recordatorio_pastilla_activo, recordatorio_pastilla_hora, codigo_referido')
    .eq('telefono', telefono)
    .maybeSingle()

  if (!usuaria) {
    const fallback = await admin
      .from('usuarias')
      .select('duracion_ciclo, promedio_duracion_ciclo, codigo_referido')
      .eq('telefono', telefono)
      .maybeSingle()
    usuaria = fallback.data
      ? { ...fallback.data, toma_anticonceptivas: false, recordatorio_pastilla_activo: false, recordatorio_pastilla_hora: null }
      : null
  }

  return (
    <PerfilContent
      email={email}
      telefono={telefono}
      duracionCiclo={usuaria?.promedio_duracion_ciclo ?? usuaria?.duracion_ciclo ?? 28}
      tomaAnticonceptivas={usuaria?.toma_anticonceptivas ?? false}
      recordatorioActivo={usuaria?.recordatorio_pastilla_activo ?? false}
      recordatorioHora={usuaria?.recordatorio_pastilla_hora ?? null}
      codigoReferido={usuaria?.codigo_referido ?? null}
      suscripcionActiva={webUser.suscripcion_activa}
    />
  )
}
