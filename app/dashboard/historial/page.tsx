import { requireUsuaria } from '@/lib/usuaria'
import { createAdminSupabase } from '@/lib/supabase-server'
import HistorialContent, { type RegistroDia } from '@/components/cycle/HistorialContent'

export default async function HistorialPage() {
  const { telefono } = await requireUsuaria()
  const admin = createAdminSupabase()

  const telefonoVariants = [telefono, `=${telefono}`, `+${telefono}`, `${telefono}@s.whatsapp.net`]

  const [ciclosRes, registrosRes, usuariaRes] = await Promise.all([
    admin
      .from('historial_ciclos')
      .select('fecha_inicio, duracion_dias')
      .in('telefono', telefonoVariants)
      .order('fecha_inicio', { ascending: false })
      .limit(120),
    admin
      .from('registros_ciclo')
      .select('created_at, fase_actual, sintoma')
      .in('telefono', telefonoVariants)
      .order('created_at', { ascending: false })
      .limit(500),
    admin
      .from('usuarias')
      .select('duracion_ciclo, promedio_duracion_ciclo')
      .eq('telefono', telefono)
      .maybeSingle(),
  ])

  // Dedupe ciclos por fecha_inicio (n8n duplica filas) y filtrar duraciones inválidas
  const ciclosMap = new Map<string, number>()
  for (const c of ciclosRes.data ?? []) {
    if (!c.fecha_inicio) continue
    const dur = c.duracion_dias ?? 0
    const prev = ciclosMap.get(c.fecha_inicio) ?? 0
    if (dur > prev) ciclosMap.set(c.fecha_inicio, dur)
  }
  const ciclos = Array.from(ciclosMap.entries())
    .map(([fecha_inicio, duracion_dias]) => ({ fecha_inicio, duracion_dias }))
    .filter(c => c.duracion_dias >= 15 && c.duracion_dias <= 60)
    .sort((a, b) => (a.fecha_inicio < b.fecha_inicio ? 1 : -1))
  const defaultCycleLength =
    usuariaRes.data?.promedio_duracion_ciclo ?? usuariaRes.data?.duracion_ciclo ?? 28

  const registrosPorDia: Record<string, RegistroDia> = {}
  for (const r of registrosRes.data ?? []) {
    if (!r.created_at) continue
    const fecha = r.created_at.split('T')[0]
    const prev = registrosPorDia[fecha]
    const sintomas = prev?.sintomas ?? []
    if (r.sintoma && !sintomas.includes(r.sintoma)) sintomas.push(r.sintoma)
    registrosPorDia[fecha] = {
      fecha,
      fase: r.fase_actual ?? prev?.fase ?? null,
      sintomas,
    }
  }

  return (
    <HistorialContent
      ciclos={ciclos}
      registrosPorDia={registrosPorDia}
      defaultCycleLength={defaultCycleLength}
    />
  )
}
