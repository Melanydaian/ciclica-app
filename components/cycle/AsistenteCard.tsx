import Link from 'next/link'
import { Sparkles, ArrowRight } from 'lucide-react'

export default function AsistenteCard() {
  return (
    <Link
      href="/dashboard/asistente"
      className="group block rounded-2xl border border-pink-100 dark:border-[#3A2F3F] bg-gradient-to-br from-pink-50 to-rose-50 dark:from-[#241A24] dark:to-[#1F1822] px-5 py-4 transition-all hover:border-pink-300 hover:shadow-md active:scale-[0.99]"
    >
      <div className="flex items-center gap-4">
        <span className="inline-flex items-center justify-center w-11 h-11 rounded-2xl bg-pink-500/15 text-pink-500 shrink-0">
          <Sparkles size={20} strokeWidth={2.2} />
        </span>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-pink-500/80 dark:text-pink-300/80">
            Asistente
          </div>
          <p className="text-[15px] font-semibold text-gray-800 dark:text-[#F4F1F5] leading-tight mt-0.5">
            Preguntame qué entrenar o comer hoy
          </p>
          <p className="text-[12px] text-gray-500 dark:text-[#B4ABB8] mt-0.5 leading-snug">
            Recomendaciones según tu fase del ciclo
          </p>
        </div>
        <ArrowRight
          size={18}
          className="text-pink-300 dark:text-[#5A4F62] group-hover:text-pink-500 transition-colors shrink-0"
        />
      </div>
    </Link>
  )
}
