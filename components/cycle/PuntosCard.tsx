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

const CONCEPTO_LABEL: Record<string, string> = {
  registro_sintoma: '📝 Registraste un síntoma',
  nuevo_ciclo:      '🔄 Nuevo ciclo registrado',
  referido:         '💌 Referiste a una amiga',
}

export default function PuntosCard({
  puntos = 0,
  codigoReferido,
  log = [],
}: {
  puntos: number
  codigoReferido?: string | null
  log: PuntoLog[]
}) {
  const nivel = getNivel(puntos)
  const { pct, falta, siguiente } = getProgresoHaciaSiguiente(puntos)

  return (
    <div className="bg-white rounded-2xl border border-pink-100 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-700">Tus puntos</h3>
        <span
          className="text-xs font-semibold px-2 py-0.5 rounded-full"
          style={{ color: nivel.color, background: nivel.bg }}
        >
          {nivel.emoji} {nivel.label}
        </span>
      </div>

      {/* Puntos grandes */}
      <div className="flex items-end gap-2 mb-4">
        <span className="text-4xl font-bold text-gray-800">{puntos}</span>
        <span className="text-sm text-gray-400 mb-1">puntos</span>
      </div>

      {/* Barra de progreso hacia siguiente nivel */}
      {siguiente && (
        <div className="mb-5">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>{nivel.emoji} {nivel.label}</span>
            <span>{siguiente.emoji} {siguiente.label} — faltan {falta} pts</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${pct}%`, background: nivel.color }}
            />
          </div>
        </div>
      )}

      {/* Cómo ganar puntos */}
      <div className="grid grid-cols-3 gap-2 mb-5">
        {[
          { emoji: '📝', accion: 'Registrar síntoma', pts: '+5' },
          { emoji: '🔄', accion: 'Nuevo ciclo', pts: '+10' },
          { emoji: '💌', accion: 'Referir amiga', pts: '+50' },
        ].map(({ emoji, accion, pts }) => (
          <div key={accion} className="bg-pink-50/60 rounded-xl p-2 text-center">
            <div className="text-lg">{emoji}</div>
            <div className="text-[10px] text-gray-500 leading-tight mt-0.5">{accion}</div>
            <div className="text-xs font-bold text-pink-500 mt-0.5">{pts} pts</div>
          </div>
        ))}
      </div>

      {/* Código de referido */}
      {codigoReferido && (
        <div className="rounded-2xl overflow-hidden mb-4 border border-pink-200">
          {/* Header con gradiente */}
          <div className="bg-gradient-to-r from-pink-400 to-purple-400 px-4 py-3">
            <p className="text-white font-semibold text-sm">Invitá a una amiga</p>
            <p className="text-pink-100 text-xs mt-0.5">Ambas ganan puntos cuando se une con tu código</p>
          </div>

          {/* Cuerpo */}
          <div className="bg-gradient-to-r from-pink-50 to-purple-50 px-4 py-4">
            {/* Premio destacado */}
            <div className="flex gap-3 mb-4">
              <div className="flex-1 bg-white rounded-xl p-3 text-center border border-pink-100">
                <p className="text-2xl font-bold text-pink-500">+50</p>
                <p className="text-[10px] text-gray-500 leading-tight">pts para vos</p>
              </div>
              <div className="flex items-center text-gray-300 text-xl">+</div>
              <div className="flex-1 bg-white rounded-xl p-3 text-center border border-pink-100">
                <p className="text-2xl font-bold text-purple-400">+10</p>
                <p className="text-[10px] text-gray-500 leading-tight">pts para ella</p>
              </div>
            </div>

            {/* Código */}
            <p className="text-[10px] text-gray-400 mb-1 font-medium uppercase tracking-wide">Tu código</p>
            <div className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 border border-pink-100">
              <span className="flex-1 text-2xl font-bold text-gray-800 tracking-[0.3em]">{codigoReferido}</span>
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
                Compartir 🌸
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Historial reciente */}
      {log.length > 0 && (
        <div>
          <p className="text-xs text-gray-400 mb-2">Últimos puntos ganados</p>
          <div className="space-y-2">
            {log.slice(0, 4).map((l, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-xs text-gray-600">
                  {CONCEPTO_LABEL[l.concepto] ?? l.descripcion}
                </span>
                <span className="text-xs font-semibold text-green-500">+{l.puntos}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
