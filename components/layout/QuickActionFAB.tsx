'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import SintomaRegisterModal from '@/components/cycle/SintomaRegisterModal'
import SexRegisterModal from '@/components/cycle/SexRegisterModal'

export default function QuickActionFAB() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [sintomaOpen, setSintomaOpen] = useState(false)
  const [sexOpen, setSexOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  const actions = [
    { emoji: '🌸', label: 'Cómo me siento', onClick: () => { setOpen(false); setSintomaOpen(true) } },
    { emoji: '💗', label: 'Momento íntimo', onClick: () => { setOpen(false); setSexOpen(true) } },
    { emoji: '📔', label: 'Escribir nota', onClick: () => { setOpen(false); router.push('/dashboard/journal') } },
  ]

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-30"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      <div className="fixed bottom-20 md:bottom-6 right-4 z-40 flex flex-col items-end gap-3">
        {open && (
          <div className="flex flex-col items-end gap-2 mb-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
            {actions.map((a) => (
              <button
                key={a.label}
                onClick={a.onClick}
                className="flex items-center gap-3 bg-white px-4 py-2.5 rounded-full shadow-lg border border-pink-100 text-sm font-medium text-gray-700 hover:bg-pink-50 transition-colors"
              >
                <span className="text-lg leading-none">{a.emoji}</span>
                <span>{a.label}</span>
              </button>
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          aria-label={open ? 'Cerrar acciones' : 'Acciones rápidas'}
          className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-white font-bold text-2xl transition-all ${
            open ? 'bg-gray-700 rotate-45' : 'bg-gradient-to-br from-pink-500 to-pink-600 hover:scale-105'
          }`}
        >
          +
        </button>
      </div>

      <SintomaRegisterModal open={sintomaOpen} onClose={() => setSintomaOpen(false)} />
      <SexRegisterModal open={sexOpen} onClose={() => setSexOpen(false)} />
    </>
  )
}
