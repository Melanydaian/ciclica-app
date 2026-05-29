import { createAdminSupabase } from '@/lib/supabase-server'
import { calcularPromedioCiclo, getCurrentPhase, PHASE_INFO } from '@/lib/cycle-utils'

export const dynamic = 'force-dynamic'
export const metadata = { robots: { index: false, follow: false } }

export default async function SharePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const admin = createAdminSupabase()

  const { data: share } = await admin
    .from('medical_share_tokens')
    .select('telefono, email, expira, revocado')
    .eq('token', token)
    .maybeSingle()

  if (!share || share.revocado || new Date(share.expira) < new Date()) {
    return (
      <div className="min-h-screen bg-[#FFF9FB] flex items-center justify-center px-4">
        <div className="max-w-md text-center bg-white rounded-2xl border border-pink-100 p-8">
          <div className="text-4xl mb-3">🔒</div>
          <h1 className="text-lg font-semibold text-gray-800 dark:text-[#F4F1F5]">Este link ya no está disponible</h1>
          <p className="text-sm text-gray-500 dark:text-[#B4ABB8] mt-3">
            La paciente puede generar uno nuevo desde su perfil de Cíclica.
          </p>
        </div>
      </div>
    )
  }

  const telefono = share.telefono
  const telVariants = [telefono, `=${telefono}`, `+${telefono}`, `${telefono}@s.whatsapp.net`]

  const [usuariaRes, ciclosRes, regsRes, sexRes] = await Promise.all([
    admin.from('usuarias').select('nombre, fecha_inicio_ciclo, duracion_ciclo, promedio_duracion_ciclo, toma_anticonceptivas').eq('telefono', telefono).maybeSingle(),
    admin.from('historial_ciclos').select('fecha_inicio, duracion_dias').in('telefono', telVariants).order('fecha_inicio', { ascending: false }).limit(12),
    admin.from('registros_ciclo').select('created_at, fase_actual, sintoma').in('telefono', telVariants).order('created_at', { ascending: false }).limit(200),
    admin.from('sex_registros').select('fecha, hubo_proteccion').in('user_id', telVariants).limit(60),
  ])

  const ciclos = (ciclosRes.data ?? []).filter(c => c.duracion_dias && c.duracion_dias >= 15 && c.duracion_dias <= 60)
  const pastCycles = ciclos.map(c => ({ length: c.duracion_dias as number }))
  const promedio = calcularPromedioCiclo(pastCycles)
  const cycleLength = usuariaRes.data?.promedio_duracion_ciclo ?? usuariaRes.data?.duracion_ciclo ?? promedio

  const lastPeriodIso = usuariaRes.data?.fecha_inicio_ciclo ?? ciclos[0]?.fecha_inicio ?? null
  const phaseData = lastPeriodIso ? getCurrentPhase(new Date(lastPeriodIso), cycleLength, 5) : null

  const sintomaCount = new Map<string, number>()
  for (const r of regsRes.data ?? []) {
    const s = (r.sintoma ?? '').toLowerCase().trim()
    if (!s) continue
    sintomaCount.set(s, (sintomaCount.get(s) ?? 0) + 1)
  }
  const topSintomas = Array.from(sintomaCount.entries()).sort((a, b) => b[1] - a[1]).slice(0, 8)

  const variability = pastCycles.length >= 2
    ? Math.max(...pastCycles.map(c => c.length)) - Math.min(...pastCycles.map(c => c.length))
    : null

  const sexCount = sexRes.data?.length ?? 0
  const sexConProteccion = sexRes.data?.filter(r => r.hubo_proteccion === 'si').length ?? 0

  return (
    <div className="min-h-screen bg-[#FFF9FB] py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <header className="text-center mb-8">
          <img src="/logo.png" alt="Cíclica" className="h-14 w-auto mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 dark:text-[#F4F1F5]">
            Resumen de ciclo · {usuariaRes.data?.nombre ?? 'Paciente'}
          </h1>
          <p className="text-sm text-gray-500 dark:text-[#B4ABB8] mt-2">
            Compartido por la paciente · Link válido hasta{' '}
            {new Date(share.expira).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </header>

        <section className="bg-white rounded-2xl border border-pink-100 p-6 mb-4">
          <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400 dark:text-[#8A8190] mb-4">Resumen</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-[#8A8190]">Ciclo promedio</div>
              <div className="text-2xl font-bold text-gray-800 dark:text-[#F4F1F5] tabular-nums mt-1">{cycleLength} <span className="text-sm font-normal text-gray-400 dark:text-[#8A8190]">días</span></div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-[#8A8190]">Variabilidad</div>
              <div className="text-2xl font-bold text-gray-800 dark:text-[#F4F1F5] tabular-nums mt-1">
                {variability ?? '—'} <span className="text-sm font-normal text-gray-400 dark:text-[#8A8190]">días</span>
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-[#8A8190]">Ciclos registrados</div>
              <div className="text-2xl font-bold text-gray-800 dark:text-[#F4F1F5] tabular-nums mt-1">{pastCycles.length}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-[#8A8190]">Anticonceptivo oral</div>
              <div className="text-base font-semibold text-gray-800 dark:text-[#F4F1F5] mt-1">
                {usuariaRes.data?.toma_anticonceptivas ? 'Sí' : 'No'}
              </div>
            </div>
          </div>
          {phaseData && (
            <p className="text-sm text-gray-600 dark:text-[#C9BFCB] mt-4">
              Fase actual: <span className="font-semibold capitalize">{PHASE_INFO[phaseData.phase].name}</span> (día {phaseData.dayOfCycle} de {cycleLength}).
            </p>
          )}
        </section>

        <section className="bg-white rounded-2xl border border-pink-100 p-6 mb-4">
          <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400 dark:text-[#8A8190] mb-4">Síntomas más frecuentes</h2>
          {topSintomas.length === 0 ? (
            <p className="text-sm text-gray-400 dark:text-[#8A8190]">Sin síntomas registrados.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 dark:text-[#8A8190] text-xs">
                  <th className="font-normal pb-2">Síntoma</th>
                  <th className="font-normal pb-2 text-right">Frecuencia</th>
                </tr>
              </thead>
              <tbody>
                {topSintomas.map(([s, count]) => (
                  <tr key={s} className="border-t border-gray-100">
                    <td className="py-2 capitalize">{s}</td>
                    <td className="py-2 text-right tabular-nums text-gray-600 dark:text-[#C9BFCB]">{count}×</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        <section className="bg-white rounded-2xl border border-pink-100 p-6 mb-4">
          <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400 dark:text-[#8A8190] mb-4">Historial de ciclos</h2>
          {ciclos.length === 0 ? (
            <p className="text-sm text-gray-400 dark:text-[#8A8190]">Sin ciclos registrados.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 dark:text-[#8A8190] text-xs">
                  <th className="font-normal pb-2">Inicio</th>
                  <th className="font-normal pb-2 text-right">Duración</th>
                </tr>
              </thead>
              <tbody>
                {ciclos.slice(0, 12).map((c, i) => (
                  <tr key={i} className="border-t border-gray-100">
                    <td className="py-2">{new Date(c.fecha_inicio).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                    <td className="py-2 text-right tabular-nums text-gray-600 dark:text-[#C9BFCB]">{c.duracion_dias} días</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        <section className="bg-white rounded-2xl border border-pink-100 p-6 mb-4">
          <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400 dark:text-[#8A8190] mb-4">Vida sexual</h2>
          <p className="text-sm text-gray-600 dark:text-[#C9BFCB]">
            {sexCount === 0
              ? 'Sin registros.'
              : `${sexCount} ${sexCount === 1 ? 'registro' : 'registros'} en el historial · ${Math.round((sexConProteccion / sexCount) * 100)}% con método de protección.`}
          </p>
        </section>

        <footer className="text-center text-xs text-gray-400 dark:text-[#8A8190] mt-8 leading-relaxed">
          Este resumen se basa en los registros autorreportados de la paciente.<br />
          No es un diagnóstico ni reemplaza la evaluación clínica.<br />
          Generado por Cíclica · ciclica.pro
        </footer>
      </div>
    </div>
  )
}
