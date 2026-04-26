export default function StatsRow({
  daysUntilNextPeriod,
  dayOfCycle,
  cycleLength,
}: {
  daysUntilNextPeriod: number
  dayOfCycle: number
  cycleLength: number
}) {
  const progress = Math.round((dayOfCycle / cycleLength) * 100)

  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="bg-white rounded-2xl p-4 border border-pink-100 text-center">
        <p className="text-3xl font-bold text-pink-500">{daysUntilNextPeriod}</p>
        <p className="text-xs text-gray-400 mt-1">días para tu período</p>
      </div>
      <div className="bg-white rounded-2xl p-4 border border-pink-100 text-center">
        <p className="text-3xl font-bold text-pink-500">{dayOfCycle}</p>
        <p className="text-xs text-gray-400 mt-1">día del ciclo</p>
      </div>
      <div className="bg-white rounded-2xl p-4 border border-pink-100 text-center">
        <p className="text-3xl font-bold text-pink-500">{progress}%</p>
        <p className="text-xs text-gray-400 mt-1">del ciclo</p>
      </div>
    </div>
  )
}
