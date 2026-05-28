import NavBar from '@/components/layout/NavBar'
import IntimidadContent from '@/components/cycle/IntimidadContent'

export const metadata = { robots: { index: false, follow: false } }

export default function PreviewIntimidad() {
  const cycleLength = 28
  const lastPeriod = new Date()
  lastPeriod.setDate(lastPeriod.getDate() - 12)

  const today = new Date()
  const iso = (d: Date) => d.toISOString().split('T')[0]
  const ago = (n: number) => {
    const d = new Date(today)
    d.setDate(d.getDate() - n)
    return iso(d)
  }

  const registros = [
    { fecha: ago(2),  fase: 'folicular',  hubo_proteccion: 'si',  proteccion: 'preservativo', nota_adicional: null },
    { fecha: ago(5),  fase: 'folicular',  hubo_proteccion: 'si',  proteccion: 'anticonceptivo_oral', nota_adicional: 'me sentí súper conectada' },
    { fecha: ago(11), fase: 'menstrual',  hubo_proteccion: 'no',  proteccion: null, nota_adicional: null },
    { fecha: ago(18), fase: 'lutea',      hubo_proteccion: 'si',  proteccion: 'preservativo', nota_adicional: null },
  ]

  const mockUser = { email: 'preview@ciclica.pro', id: 'preview' } as never

  return (
    <div className="min-h-screen bg-[#FFF9FB]">
      <NavBar user={mockUser} />
      <main className="max-w-4xl mx-auto px-4 py-6 pb-24 md:pb-8">
        <IntimidadContent
          lastPeriod={lastPeriod}
          cycleLength={cycleLength}
          daysUntilNextPeriod={16}
          registros={registros}
        />
      </main>
    </div>
  )
}
