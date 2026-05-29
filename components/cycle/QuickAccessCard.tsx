import Link from 'next/link'

export default function QuickAccessCard({
  href,
  emoji,
  label,
  primary,
  primarySuffix,
  hint,
  accent = '#EC4899',
}: {
  href: string
  emoji: string
  label: string
  primary: string | number
  primarySuffix?: string
  hint?: string
  accent?: string
}) {
  return (
    <Link
      href={href}
      className="group bg-white dark:bg-[#1F1822] rounded-2xl border border-pink-100 dark:border-[#3A2F3F] px-5 py-5 transition-all hover:border-pink-300 hover:shadow-md active:scale-[0.99] flex flex-col justify-between"
    >
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-2xl leading-none">{emoji}</span>
          <span className="text-gray-300 group-hover:text-pink-500 transition-colors text-lg leading-none">
            →
          </span>
        </div>
        <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-400 dark:text-[#8A8190]">
          {label}
        </div>
        <div className="flex items-baseline gap-1.5 mt-1">
          <span className="text-3xl font-bold tabular-nums leading-none" style={{ color: accent }}>
            {primary}
          </span>
          {primarySuffix && (
            <span className="text-xs text-gray-400 dark:text-[#8A8190]">{primarySuffix}</span>
          )}
        </div>
      </div>
      {hint && (
        <p className="text-[11px] text-gray-500 dark:text-[#B4ABB8] mt-3 leading-snug">{hint}</p>
      )}
    </Link>
  )
}
