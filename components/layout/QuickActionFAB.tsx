'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Sparkles, HeartHandshake, NotebookPen, Plus } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
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

  const actions: Array<{ Icon: LucideIcon; label: string; onClick: () => void; color: string }> = [
    { Icon: Sparkles,       label: 'Cómo me siento', color: '#EC4899', onClick: () => { setOpen(false); setSintomaOpen(true) } },
    { Icon: HeartHandshake, label: 'Momento íntimo', color: '#F472B6', onClick: () => { setOpen(false); setSexOpen(true) } },
    { Icon: NotebookPen,    label: 'Escribir nota',  color: '#34D399', onClick: () => { setOpen(false); router.push('/dashboard/journal') } },
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
            {actions.map(({ Icon, label, onClick, color }) => (
              <button
                key={label}
                onClick={onClick}
                className="flex items-center gap-3 bg-white dark:bg-[#1F1822] pl-2.5 pr-4 py-2 rounded-full shadow-lg border border-pink-100 dark:border-[#3A2F3F] text-sm font-medium text-gray-700 dark:text-[#E5DBE8] hover:bg-pink-50 dark:hover:bg-[#2A2030] transition-colors"
              >
                <span
                  className="inline-flex items-center justify-center w-7 h-7 rounded-full"
                  style={{ background: `${color}26`, color }}
                >
                  <Icon size={15} strokeWidth={2.4} />
                </span>
                <span>{label}</span>
              </button>
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          aria-label={open ? 'Cerrar acciones' : 'Acciones rápidas'}
          className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-white transition-all ${
            open ? 'bg-gray-700 rotate-45' : 'bg-gradient-to-br from-pink-500 to-pink-600 hover:scale-105'
          }`}
        >
          <Plus size={26} strokeWidth={2.4} />
        </button>
      </div>

      <SintomaRegisterModal open={sintomaOpen} onClose={() => setSintomaOpen(false)} />
      <SexRegisterModal open={sexOpen} onClose={() => setSexOpen(false)} />
    </>
  )
}
