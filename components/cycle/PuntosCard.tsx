'use client'

type PuntoLog = { puntos: number; concepto: string; descripcion: string; created_at: string }

const NIVELES = [
  { min: 0,   label: 'Semilla',  emoji: '🌱', color: '#86EFAC', bg: '#F0FDF4' },
  { min: 100, label: 'Brote',   emoji: '🌸', color: '#F9A8D4', bg: '#FDF2F8' },
  { min: 300, label: 'Flor',    emoji: '🌺', color: '#EC4899', bg: '#FCE7F3' },
  { min: 600, label: 'Jardín',  emoji: '🌻', color: '#FBBF24', bg: '#FFFBEB' },
]

function getNivel(puntos: number) {
  return [...NIVELES].reverse().find(n => puntos >= n.min) ?? NIVELES[0]
}

function getProgresoHaciaSiguiente(puntos: number) {
  const idx = NIVELES.findIndex(n => puntos < n.min)
  if (idx === -1) return { pct: 100, falta: 0, siguiente: null }
  const actual = NIVELES[idx - 1] ?? NIVELES[0]
  const siguiente = NIVELES[idx]
  const rango = siguiente.min - actual.min
  const avance = puntos - actual.min
  return { pct: Math.round((avance / rango) * 100), falta: siguiente.min - puntos, siguiente }
}

export default function PuntosCard({
  puntos = 0,
  codigoReferido,
}: {
  puntos: number
  codigoReferido?: string | null
  log: PuntoLog[]
}) {
  const nivel = getNivel(puntos)
  const { pct, falta, siguiente } = getProgresoHaciaSiguiente(puntos)

  return (
    <div className="bg-white dark:bg-[#1F1822] rounded-2xl border border-pink-100 dark:border-[#3A2F3F] px-5 py-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-400 dark:text-[#8A8190]">
            Tus puntos
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-5xl font-bold text-gray-800 dark:text-[#F4F1F5] tabular-nums leading-none">{puntos}</span>
            <span className="text-xs text-gray-400 dark:text-[#8A8190]">pts</span>
          </div>
        </div>
        <span
          className="text-[10px] font-bold uppercase tracking-[0.18em] px-3 py-1.5 rounded-full"
          style={{ color: nivel.color, background: `${nivel.color}1A`, border: `1px solid ${nivel.color}33` }}
        >
          {nivel.emoji} {nivel.label}
        </span>
      </div>

      {siguiente && (
        <div className="mb-5">
          <div className="flex justify-between text-[11px] text-gray-500 dark:text-[#B4ABB8] mb-1.5">
            <span>{nivel.emoji} {nivel.label}</span>
            <span className="font-medium">faltan {falta} pts → {siguiente.emoji} {siguiente.label}</span>
          </div>
          <div className="h-1.5 bg-gray-100 dark:bg-[#2A2030] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${pct}%`, background: nivel.color }}
            />
          </div>
        </div>
      )}

      {codigoReferido && (
        <div className="rounded-2xl overflow-hidden border border-pink-100 dark:border-[#3A2F3F]">
          <div className="bg-gradient-to-r from-pink-50 to-purple-50 px-4 py-4">
            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-pink-700 mb-2">
              Invitá a una amiga
            </div>
            <div className="text-xs text-gray-600 dark:text-[#C9BFCB] mb-4">Ambas suman puntos (vos +50, ella +10)</div>

            <div className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 border border-pink-100 dark:border-[#3A2F3F]">
              <span className="flex-1 text-xl font-bold text-gray-800 dark:text-[#F4F1F5] tracking-[0.25em] tabular-nums">
                {codigoReferido}
              </span>
              <button
                onClick={async () => {
                  const msg = `¡Sumate a Cíclica! Es un asistente por WhatsApp que te ayuda a trackear tu ciclo 🌸 Usá mi código *${codigoReferido}* cuando te registres y ganás puntos.`
                  if (navigator.share) {
                    await navigator.share({ text: msg }).catch(() => {})
                  } else {
                    await navigator.clipboard.writeText(msg)
                  }
                }}
                className="bg-pink-500 hover:bg-pink-600 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors whitespace-nowrap"
              >
                Compartir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
