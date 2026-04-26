const FEATURES = [
  { icon: '🌡️', text: 'Método sintotérmico — temperatura + moco cervical' },
  { icon: '💊', text: 'Recordatorio diario de pastillas' },
  { icon: '🌙', text: 'Alertas proactivas por fase del ciclo' },
  { icon: '📄', text: 'Exportar historial en PDF para tu ginecóloga' },
  { icon: '🔍', text: 'Análisis de patrones con IA' },
  { icon: '📅', text: 'Historial ilimitado de ciclos' },
]

export default function ProximamenteCard() {
  return (
    <div className="bg-white rounded-2xl border border-purple-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 px-5 py-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <p className="text-white font-bold text-base">Plan Premium</p>
              <span className="text-[10px] bg-white/20 text-white px-2 py-0.5 rounded-full font-semibold tracking-wide">
                PRÓXIMAMENTE
              </span>
            </div>
            <p className="text-purple-100 text-xs">Conocé tu cuerpo en profundidad</p>
          </div>
          <div className="text-right">
            <p className="text-white font-bold text-2xl">$4.99</p>
            <p className="text-purple-200 text-xs">por mes</p>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="px-5 py-4 space-y-2.5">
        {FEATURES.map(({ icon, text }) => (
          <div key={text} className="flex items-start gap-3">
            <span className="text-base leading-none mt-0.5">{icon}</span>
            <span className="text-xs text-gray-600 leading-snug">{text}</span>
          </div>
        ))}
      </div>

      {/* CTA pasivo */}
      <div className="px-5 pb-5">
        <div className="w-full py-3 rounded-xl bg-gray-100 text-center">
          <p className="text-sm text-gray-400 font-medium">Disponible muy pronto 🌸</p>
        </div>
        <p className="text-center text-[10px] text-gray-400 mt-2">
          Te avisamos por WhatsApp cuando esté listo
        </p>
      </div>
    </div>
  )
}
