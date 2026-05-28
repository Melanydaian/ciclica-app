import { requireUsuaria } from '@/lib/usuaria'
import { createAdminSupabase } from '@/lib/supabase-server'
import SintomasContent from '@/components/cycle/SintomasContent'

const ANIMO_VALOR: Record<string, number> = {
  excelente: 5, energica: 5, feliz: 5,
  bien: 4, contenta: 4,
  regular: 3, normal: 3, neutra: 3,
  cansada: 2, triste: 2, ansiosa: 2, irritable: 2,
  mal: 1,
}

type Registro = {
  fase_actual: string | null
  sintoma: string | null
  created_at: string | null
}

function aggregateSintomas(registros: Registro[]) {
  const map = new Map<string, { menstrual: number; folicular: number; ovulatoria: number; lutea: number; total: number }>()
  for (const r of registros) {
    if (!r.sintoma) continue
    const sintomasArr = r.sintoma.split(/[,;]+/).map(s => s.trim().toLowerCase()).filter(Boolean)
    const fase = (r.fase_actual ?? '').toLowerCase()
    for (const s of sintomasArr) {
      const curr = map.get(s) ?? { menstrual: 0, folicular: 0, ovulatoria: 0, lutea: 0, total: 0 }
      if (fase === 'menstrual' || fase === 'folicular' || fase === 'ovulatoria' || fase === 'lutea') {
        curr[fase as 'menstrual' | 'folicular' | 'ovulatoria' | 'lutea']++
      }
      curr.total++
      map.set(s, curr)
    }
  }
  return Array.from(map.entries()).map(([nombre, stats]) => ({ nombre, ...stats }))
}

function aggregateAnimoSemanal(registros: Registro[]) {
  const buckets: { semana: string; valor: number; count: number; suma: number }[] = []
  const now = new Date()
  for (let i = 4; i >= 0; i--) {
    const inicio = new Date(now)
    inicio.setDate(now.getDate() - (i + 1) * 7)
    const fin = new Date(now)
    fin.setDate(now.getDate() - i * 7)
    const label = i === 0 ? 'esta sem' : `hace ${i} sem`

    let suma = 0
    let count = 0
    for (const r of registros) {
      if (!r.created_at || !r.sintoma) continue
      const fecha = new Date(r.created_at)
      if (fecha < inicio || fecha >= fin) continue
      const animoMatch = r.sintoma.toLowerCase().match(/\b(excelente|energica|feliz|bien|contenta|regular|normal|neutra|cansada|triste|ansiosa|irritable|mal)\b/)
      if (animoMatch) {
        suma += ANIMO_VALOR[animoMatch[1]] ?? 3
        count++
      }
    }

    buckets.push({
      semana: label,
      valor: count > 0 ? Math.round(suma / count) : 0,
      count,
      suma,
    })
  }
  return buckets.map(({ semana, valor, count }) => ({ semana, valor, count }))
}

export default async function SintomasPage() {
  const { telefono } = await requireUsuaria()
  const admin = createAdminSupabase()

  const telefonoVariants = [telefono, `=${telefono}`, `+${telefono}`, `${telefono}@s.whatsapp.net`]

  const { data: registros } = await admin
    .from('registros_ciclo')
    .select('fase_actual, sintoma, created_at')
    .in('telefono', telefonoVariants)
    .order('created_at', { ascending: false })
    .limit(500)

  // Dedupe — n8n a veces escribe el mismo registro varias veces
  const seen = new Set<string>()
  const regs = ((registros ?? []) as Registro[]).filter(r => {
    const key = `${r.created_at}|${r.sintoma ?? ''}|${r.fase_actual ?? ''}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
  const sintomas = aggregateSintomas(regs).sort((a, b) => b.total - a.total)
  const animo = aggregateAnimoSemanal(regs)

  const recientes = regs
    .filter(r => r.sintoma && r.created_at)
    .slice(0, 12)
    .map(r => ({
      fecha: r.created_at!,
      sintoma: r.sintoma!,
      fase: r.fase_actual,
    }))

  return (
    <SintomasContent
      sintomas={sintomas}
      animo={animo}
      totalRegistros={regs.length}
      recientes={recientes}
    />
  )
}
