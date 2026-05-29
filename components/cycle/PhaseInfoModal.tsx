'use client'

import { useEffect } from 'react'
import type { CyclePhase, PhaseInfo } from '@/lib/cycle-utils'
import { PHASE_KNOWLEDGE } from '@/lib/phase-knowledge'

const PHASE_ACCENT: Record<CyclePhase, { ring: string; chipBg: string; chipText: string }> = {
  menstrual:  { ring: '#EC4899', chipBg: '#FCE7F3', chipText: '#9D174D' },
  folicular:  { ring: '#34D399', chipBg: '#D1FAE5', chipText: '#065F46' },
  ovulatoria: { ring: '#FBBF24', chipBg: '#FEF3C7', chipText: '#92400E' },
  lutea:      { ring: '#A78BFA', chipBg: '#EDE9FE', chipText: '#5B21B6' },
}

export default function PhaseInfoModal({
  open,
  onClose,
  phase,
  info,
}: {
  open: boolean
  onClose: () => void
  phase: CyclePhase
  info: PhaseInfo
}) {
  const knowledge = PHASE_KNOWLEDGE[phase]
  const accent = PHASE_ACCENT[phase]

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Información de la fase ${info.name}`}
        className="relative w-full md:max-w-lg max-h-[92vh] bg-white dark:bg-[#1F1822] rounded-t-3xl md:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300"
      >
        <div className="sticky top-0 z-10 px-5 pt-5 pb-3 bg-white dark:bg-[#1F1822] border-b border-gray-100 dark:border-[#3A2F3F]">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <span
                className="inline-block text-[10px] font-bold uppercase tracking-[0.18em] px-2.5 py-1 rounded-full"
                style={{ color: accent.chipText, background: accent.chipBg }}
              >
                {info.emoji} Fase {info.name}
              </span>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-[#F4F1F5] mt-2 leading-tight">
                Tu cuerpo en esta fase
              </h2>
            </div>
            <button
              onClick={onClose}
              aria-label="Cerrar"
              className="w-9 h-9 rounded-full bg-gray-100 dark:bg-[#2A2030] hover:bg-gray-200 dark:hover:bg-[#3A2F3F] text-gray-600 dark:text-[#C9BFCB] hover:text-gray-800 dark:hover:text-[#F4F1F5] flex items-center justify-center transition-colors text-lg leading-none"
            >
              ×
            </button>
          </div>

          <p className="text-sm text-gray-600 dark:text-[#C9BFCB] mt-3 leading-relaxed">
            {knowledge.hero}
          </p>
        </div>

        <div className="overflow-y-auto px-5 py-5 space-y-7 flex-1">
          {knowledge.sections.map((s, i) => (
            <section key={i}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg leading-none">{s.emoji}</span>
                <h3 className="text-[11px] font-bold uppercase tracking-[0.18em]" style={{ color: accent.chipText }}>
                  {s.title}
                </h3>
              </div>
              <div className="space-y-3">
                {s.paragraphs.map((p, j) => (
                  <p key={j} className="text-sm text-gray-700 dark:text-[#E5DBE8] leading-relaxed">
                    {p}
                  </p>
                ))}
                {s.list && (
                  <ul className="space-y-1.5 mt-2">
                    {s.list.map((item, j) => (
                      <li key={j} className="text-sm text-gray-700 dark:text-[#E5DBE8] leading-relaxed pl-5 relative">
                        <span
                          className="absolute left-0 top-2 w-1.5 h-1.5 rounded-full"
                          style={{ background: accent.ring }}
                        />
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>
          ))}

          <div className="pt-5 border-t border-gray-100">
            <p className="text-[11px] text-gray-400 dark:text-[#8A8190] leading-relaxed">
              Esta información es educativa y se basa en investigación sobre el ciclo
              menstrual. No reemplaza una consulta médica. Cada cuerpo es único —
              tomá lo que te sirva y consultá a tu ginecóloga si tenés dudas.
            </p>
          </div>
        </div>

        <div className="sticky bottom-0 px-5 py-4 bg-white dark:bg-[#1F1822] border-t border-gray-100 dark:border-[#3A2F3F]">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl font-semibold text-sm text-white transition-opacity hover:opacity-90"
            style={{ background: accent.ring }}
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  )
}
