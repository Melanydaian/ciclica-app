import Link from 'next/link'
import { Sparkles, Dumbbell, Salad, NotebookText, Lock } from 'lucide-react'

const FEATURES = [
  { Icon: Dumbbell, label: 'Rutinas de gym según tu fase del ciclo' },
  { Icon: Salad, label: 'Comidas y recetas pensadas para cómo te sentís hoy' },
  { Icon: NotebookText, label: 'Actividades y consejos personalizados, cuando los necesites' },
]

export default function AsistentePaywall() {
  return (
    <div className="space-y-5">
      <div className="pb-1">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-400">
          Tu asistente
        </p>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-[#F4F1F5] mt-1 flex items-center gap-2">
          <Sparkles size={22} className="text-pink-500" />
          Hablá con Cíclica
        </h1>
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-pink-100 dark:border-[#3A2F3F] bg-gradient-to-br from-pink-50 to-rose-50 dark:from-[#241A24] dark:to-[#1F1822] p-6">
        <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-pink-600 dark:text-pink-300 bg-white/70 dark:bg-pink-500/10 rounded-full px-3 py-1 mb-4">
          <Lock size={12} />
          Función premium
        </div>

        <p className="text-gray-700 dark:text-[#D8D0DC] text-[15px] leading-relaxed mb-5">
          Cíclica puede acompañarte en el día a día: contame cómo te sentís y te
          recomiendo qué entrenar, qué comer y qué actividades te van a sentar mejor
          según tu fase del ciclo.
        </p>

        <ul className="space-y-3 mb-6">
          {FEATURES.map(({ Icon, label }) => (
            <li key={label} className="flex items-start gap-3">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-pink-500/10 text-pink-500 shrink-0">
                <Icon size={16} strokeWidth={2.2} />
              </span>
              <span className="text-[14px] text-gray-700 dark:text-[#D8D0DC] leading-snug pt-1">
                {label}
              </span>
            </li>
          ))}
        </ul>

        <Link
          href="/dashboard/perfil"
          className="inline-flex items-center justify-center w-full rounded-2xl bg-pink-500 text-white font-semibold py-3.5 hover:bg-pink-600 transition-colors active:scale-[0.99]"
        >
          Activar mi plan
        </Link>
      </div>
    </div>
  )
}
