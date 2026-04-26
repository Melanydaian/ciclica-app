const MOCK_MENSAJES = [
  {
    tipo: 'bot',
    texto: 'Hola Meli 🌸 Hoy es tu día 4. Estás en fase menstrual. ¿Cómo venís con los cólicos?',
    hora: 'hoy 9:00',
  },
  {
    tipo: 'user',
    texto: 'mejor que ayer, igual con calor en la panza',
    hora: 'hoy 9:14',
  },
  {
    tipo: 'bot',
    texto: 'Qué bueno que mejoraste 💜 El calor es perfecto para esta fase. Lo registro — día 4 con cólicos leves y mejoría.',
    hora: 'hoy 9:14',
  },
  {
    tipo: 'bot',
    texto: 'Recordatorio 🩸 Tu período se espera en 25 días. Si querés podemos repasar tus síntomas de los últimos días.',
    hora: 'ayer 10:00',
  },
  {
    tipo: 'user',
    texto: 'dale, día 3. cólicos fuertes y muy cansada',
    hora: 'ayer 10:22',
  },
  {
    tipo: 'bot',
    texto: 'Anotado 📝 Día 3: cólicos fuertes + cansancio. Es la segunda vez este ciclo con cólicos fuertes al inicio. Lo estoy siguiendo de cerca.',
    hora: 'ayer 10:22',
  },
]

export default function FeedMensajesCard() {
  return (
    <div className="bg-white rounded-2xl border border-pink-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-700">Tu chat con Cíclica</h3>
        <a
          href="https://wa.link/fub503"
          target="_blank"
          className="text-xs text-pink-500 font-medium hover:opacity-70 transition-opacity"
        >
          Abrir en WhatsApp →
        </a>
      </div>

      <div className="space-y-2 max-h-72 overflow-y-auto">
        {MOCK_MENSAJES.map((m, i) => (
          <div key={i} className={`flex ${m.tipo === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[80%] px-3 py-2 rounded-xl text-xs leading-relaxed ${
                m.tipo === 'user'
                  ? 'bg-[#DCF8C6] text-gray-800 rounded-br-sm'
                  : 'bg-gray-100 text-gray-800 rounded-bl-sm'
              }`}
            >
              <p>{m.texto}</p>
              <p className="text-[10px] text-gray-400 text-right mt-1">{m.hora}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
