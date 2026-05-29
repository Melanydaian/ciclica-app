'use client'

import { useTheme } from '@/components/layout/ThemeProvider'

const OPTIONS = [
  { value: 'light',  emoji: '☀️', label: 'Claro' },
  { value: 'dark',   emoji: '🌙', label: 'Oscuro' },
  { value: 'system', emoji: '💻', label: 'Sistema' },
] as const

export default function AparienciaSection() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="bg-white dark:bg-[#1F1822] rounded-2xl border border-pink-100 dark:border-[#3A2F3F] px-5 py-6 transition-colors">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">🎨</span>
        <h3 className="text-sm font-semibold text-gray-800 dark:text-[#F4F1F5]">Apariencia</h3>
      </div>
      <p className="text-xs text-gray-500 dark:text-[#B4ABB8] mb-4 leading-relaxed">
        Elegí cómo querés ver Cíclica.
      </p>
      <div className="grid grid-cols-3 gap-2">
        {OPTIONS.map(o => {
          const active = theme === o.value
          return (
            <button
              key={o.value}
              type="button"
              onClick={() => setTheme(o.value)}
              className={`flex flex-col items-center justify-center py-3 rounded-xl border transition-all ${
                active
                  ? 'bg-pink-500 border-pink-500 text-white'
                  : 'bg-white dark:bg-[#2A2030] border-gray-200 dark:border-[#3A2F3F] text-gray-600 dark:text-[#C9BFCB] hover:border-pink-200'
              }`}
            >
              <span className="text-xl leading-none">{o.emoji}</span>
              <span className="text-[11px] font-medium mt-1">{o.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
