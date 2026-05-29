'use client'

import { useState } from 'react'

interface Props {
  initial: { tomada: boolean; hora: string | null } | null
}

export default function PastillaCard({ initial }: Props) {
  const [tomada, setTomada] = useState(initial?.tomada ?? false)
  const [hora, setHora] = useState(initial?.hora ?? '')
  const [loading, setLoading] = useState(false)
  const [showHora, setShowHora] = useState(false)

  async function guardar(updates: { tomada: boolean; hora?: string }) {
    setLoading(true)
    try {
      await fetch('/api/pastilla', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tomada: updates.tomada, hora: updates.hora ?? (hora || null) }),
      })
    } finally {
      setLoading(false)
    }
  }

  async function marcarTomada() {
    const ahora = new Date().toTimeString().slice(0, 5)
    setTomada(true)
    setHora(ahora)
    await guardar({ tomada: true, hora: ahora })
  }

  async function desmarcar() {
    setTomada(false)
    setHora('')
    setShowHora(false)
    await guardar({ tomada: false, hora: undefined })
  }

  async function actualizarHora(nuevaHora: string) {
    setHora(nuevaHora)
    await guardar({ tomada: true, hora: nuevaHora })
  }

  return (
    <div className="bg-white dark:bg-[#1F1822] rounded-2xl p-5 shadow-sm border border-pink-100 dark:border-[#3A2F3F]">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">💊</span>
        <h2 className="font-semibold text-gray-800 dark:text-[#F4F1F5]">Tu pastilla de hoy</h2>
      </div>

      {tomada ? (
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl border border-green-100">
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-lg">
              ✓
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-green-700">¡Ya la tomaste!</p>
              {hora && (
                <p className="text-xs text-green-500">
                  {showHora ? '' : `a las ${hora}`}
                </p>
              )}
            </div>
            <button
              onClick={() => setShowHora(v => !v)}
              className="text-xs text-gray-400 dark:text-[#8A8190] hover:text-gray-600 dark:hover:text-[#C9BFCB] underline"
            >
              {showHora ? 'cerrar' : 'editar hora'}
            </button>
          </div>

          {showHora && (
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-500 dark:text-[#B4ABB8]">Hora:</label>
              <input
                type="time"
                value={hora}
                onChange={e => actualizarHora(e.target.value)}
                className="text-sm border border-gray-200 dark:border-[#3A2F3F] rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-pink-200"
              />
            </div>
          )}

          <button
            onClick={desmarcar}
            disabled={loading}
            className="text-xs text-gray-400 dark:text-[#8A8190] hover:text-gray-500 dark:hover:text-[#B4ABB8] underline"
          >
            No la tomé / desmarcar
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-gray-500 dark:text-[#B4ABB8]">¿Ya tomaste tu pastilla anticonceptiva hoy?</p>
          <button
            onClick={marcarTomada}
            disabled={loading}
            className="w-full py-3 px-4 bg-pink-500 hover:bg-pink-600 text-white font-medium rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="text-sm">Guardando...</span>
            ) : (
              <>
                <span>✓</span>
                <span>Sí, ya la tomé</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  )
}
