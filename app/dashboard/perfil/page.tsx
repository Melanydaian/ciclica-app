'use client'

import { useState } from 'react'

export default function PerfilPage() {
  const [ciclo, setCiclo] = useState(28)
  const [periodo, setPeriodo] = useState(5)
  const [saved, setSaved] = useState(false)

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Tu perfil</h1>
        <p className="text-sm text-gray-400 mt-1">Ajustá tu información para predicciones más precisas</p>
      </div>

      <div className="bg-white rounded-2xl border border-pink-100 p-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Cuenta</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-gray-50">
            <span className="text-sm text-gray-500">Email</span>
            <span className="text-sm font-medium text-gray-800">meli@email.com</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-gray-500">WhatsApp vinculado</span>
            <span className="text-sm font-medium text-green-600 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-400 inline-block" />
              +54 9 11 ···· 4892
            </span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="bg-white rounded-2xl border border-pink-100 p-6 space-y-5">
        <h3 className="text-sm font-semibold text-gray-700">Tu ciclo</h3>

        <div>
          <label className="text-sm text-gray-600 mb-2 block">
            Duración promedio del ciclo
            <span className="text-pink-500 font-semibold ml-2">{ciclo} días</span>
          </label>
          <input
            type="range"
            min={21} max={40}
            value={ciclo}
            onChange={e => setCiclo(Number(e.target.value))}
            className="w-full accent-pink-500"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>21</span><span>40</span>
          </div>
        </div>

        <div>
          <label className="text-sm text-gray-600 mb-2 block">
            Duración del período
            <span className="text-pink-500 font-semibold ml-2">{periodo} días</span>
          </label>
          <input
            type="range"
            min={2} max={10}
            value={periodo}
            onChange={e => setPeriodo(Number(e.target.value))}
            className="w-full accent-pink-500"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>2</span><span>10</span>
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-3 rounded-xl bg-[#EC4899] text-white font-semibold text-sm hover:bg-[#db2777] transition-colors"
        >
          {saved ? '✓ Guardado' : 'Guardar cambios'}
        </button>
      </form>

      <div className="bg-white rounded-2xl border border-pink-100 p-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Recordatorios</h3>
        <div className="space-y-3">
          {[
            { label: 'Aviso antes del período', desc: '3 días antes', active: true },
            { label: 'Mensajes de fase', desc: 'Al cambiar de fase', active: true },
            { label: 'Check-in semanal', desc: 'Todos los lunes', active: false },
          ].map(item => (
            <div key={item.label} className="flex items-center justify-between py-1">
              <div>
                <p className="text-sm text-gray-700">{item.label}</p>
                <p className="text-xs text-gray-400">{item.desc}</p>
              </div>
              <div
                className={`w-10 h-6 rounded-full relative transition-colors ${item.active ? 'bg-pink-400' : 'bg-gray-200'}`}
              >
                <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${item.active ? 'left-5' : 'left-1'}`} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <button className="w-full py-3 rounded-xl border border-gray-200 text-gray-400 text-sm hover:text-gray-600 transition-colors">
        Cerrar sesión
      </button>
    </div>
  )
}
