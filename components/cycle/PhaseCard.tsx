import type { PhaseInfo } from '@/lib/cycle-utils'

export default function PhaseCard({
  info,
  dayOfCycle,
}: {
  info: PhaseInfo
  dayOfCycle: number
}) {
  return (
    <div
      className="rounded-2xl p-6 text-white relative overflow-hidden"
      style={{ background: `linear-gradient(135deg, ${info.color}cc, ${info.color})` }}
    >
      <div className="absolute right-6 top-4 text-5xl opacity-30 select-none">{info.emoji}</div>
      <span className="inline-block px-3 py-1 rounded-full bg-white/20 text-xs font-medium mb-3">
        Día {dayOfCycle} · Fase {info.name}
      </span>
      <h2 className="text-xl font-bold mb-1">{info.description}</h2>
      <p className="text-sm text-white/80 mt-2 max-w-sm">{info.tip}</p>
    </div>
  )
}
