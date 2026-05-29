type Registro = { fecha: string }

function calcularStreak(registros: Registro[]): { actual: number; mejor: number } {
  if (registros.length === 0) return { actual: 0, mejor: 0 }
  const fechas = new Set(registros.map(r => r.fecha))

  let actual = 0
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)
  for (let i = 0; i < 365; i++) {
    const d = new Date(hoy)
    d.setDate(hoy.getDate() - i)
    const iso = d.toISOString().split('T')[0]
    if (fechas.has(iso)) {
      actual++
    } else {
      if (i === 0) continue // hoy todavía puede no haber registrado
      break
    }
  }

  let mejor = 0
  let corriendo = 0
  let prev: Date | null = null
  const fechasOrd = Array.from(fechas)
    .map(f => new Date(f + 'T00:00:00'))
    .sort((a, b) => a.getTime() - b.getTime())
  for (const f of fechasOrd) {
    if (!prev) {
      corriendo = 1
    } else {
      const diff = Math.round((f.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24))
      if (diff === 1) corriendo++
      else corriendo = 1
    }
    if (corriendo > mejor) mejor = corriendo
    prev = f
  }

  return { actual, mejor }
}

export default function StreakCard({ registros }: { registros: Registro[] }) {
  const { actual, mejor } = calcularStreak(registros)
  const totalRegistros = new Set(registros.map(r => r.fecha)).size

  return (
    <div className="bg-white dark:bg-[#1F1822] rounded-2xl border border-pink-100 dark:border-[#3A2F3F] px-5 py-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-400 dark:text-[#8A8190]">
            Racha de registros
          </div>
          <div className="flex items-baseline gap-2 mt-1.5">
            <span className="text-4xl font-bold text-gray-800 dark:text-[#F4F1F5] tabular-nums leading-none">
              {actual}
            </span>
            <span className="text-sm text-gray-400 dark:text-[#8A8190]">
              {actual === 1 ? 'día seguido' : 'días seguidos'}
            </span>
          </div>
          <p className="text-[11px] text-gray-500 dark:text-[#B4ABB8] mt-2 leading-relaxed">
            {actual === 0
              ? 'Registrá hoy para empezar tu racha 🌸'
              : actual < 3
              ? '¡Vas bien! Seguí registrando cada día.'
              : actual < 7
              ? `Buenísimo. Tu mejor racha fue de ${mejor} días.`
              : `Increíble, llevás ${actual} días. Tu cuerpo te lo va a agradecer.`}
          </p>
        </div>
        <div className="flex flex-col items-center justify-center bg-pink-50 dark:bg-pink-500/10 rounded-2xl px-4 py-3 min-w-[78px]">
          <span className="text-2xl">🔥</span>
          <span className="text-[10px] text-gray-500 dark:text-[#B4ABB8] mt-1 font-semibold uppercase tracking-wider">
            {totalRegistros} total
          </span>
        </div>
      </div>
    </div>
  )
}
