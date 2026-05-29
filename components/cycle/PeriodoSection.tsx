'use client'

import { useState } from 'react'
import RegistrarPeriodoModal from './RegistrarPeriodoModal'

export default function PeriodoSection({ fechaActual }: { fechaActual: string | null }) {
  const [open, setOpen] = useState(false)

  const fechaTxt = fechaActual
    ? new Date(fechaActual + 'T00:00:00').toLocaleDateString('es-AR', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
      })
    : 'sin registrar'

  return (
    <>
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-pink-100 dark:border-gray-800 px-5 py-6 transition-colors">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">🩸</span>
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Tu último período</h3>
        </div>

        <div className="flex items-center justify-between py-2 mb-4">
          <span className="text-xs text-gray-500 dark:text-gray-400">Primer día</span>
          <span className="text-sm font-medium text-gray-800 dark:text-gray-100 capitalize">{fechaTxt}</span>
        </div>

        <button
          type="button"
          onClick={() => setOpen(true)}
          className="w-full py-2.5 rounded-xl bg-pink-500 hover:bg-pink-600 text-white text-sm font-semibold transition-colors"
        >
          {fechaActual ? 'Actualizar' : 'Registrar'}
        </button>

        <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-2 leading-relaxed text-center">
          Cuando te venga el próximo, actualizalo y Cíclica recalcula todo automáticamente.
        </p>
      </div>

      <RegistrarPeriodoModal open={open} onClose={() => setOpen(false)} fechaActual={fechaActual} />
    </>
  )
}
