import NavBar from '@/components/layout/NavBar'
import SintomasContent from '@/components/cycle/SintomasContent'

export const metadata = { robots: { index: false, follow: false } }

export default function PreviewSintomas() {
  const sintomas = [
    { nombre: 'energía alta', menstrual: 0, folicular: 5, ovulatoria: 7, lutea: 1, total: 13 },
    { nombre: 'cólicos',      menstrual: 8, folicular: 0, ovulatoria: 0, lutea: 2, total: 10 },
    { nombre: 'ansiedad',     menstrual: 0, folicular: 1, ovulatoria: 1, lutea: 6, total: 8 },
    { nombre: 'hinchazón',    menstrual: 2, folicular: 0, ovulatoria: 0, lutea: 5, total: 7 },
    { nombre: 'dolor de cabeza', menstrual: 3, folicular: 0, ovulatoria: 0, lutea: 2, total: 5 },
  ]

  const animo = [
    { semana: 'hace 4', valor: 3, count: 4 },
    { semana: 'hace 3', valor: 4, count: 5 },
    { semana: 'hace 2', valor: 5, count: 7 },
    { semana: 'hace 1', valor: 4, count: 4 },
    { semana: 'esta sem', valor: 3, count: 3 },
  ]

  const today = new Date()
  const ago = (n: number) => {
    const d = new Date(today)
    d.setDate(d.getDate() - n)
    return d.toISOString()
  }
  const recientes = [
    { fecha: ago(0), sintoma: 'energía alta',     fase: 'ovulatoria' },
    { fecha: ago(1), sintoma: 'leve dolor ovulatorio', fase: 'ovulatoria' },
    { fecha: ago(3), sintoma: 'ánimo elevado',    fase: 'folicular' },
    { fecha: ago(5), sintoma: 'flujo claro',      fase: 'folicular' },
    { fecha: ago(8), sintoma: 'cansancio leve',   fase: 'folicular' },
    { fecha: ago(11), sintoma: 'cólicos',         fase: 'menstrual' },
  ]

  const mockUser = { email: 'preview@ciclica.pro', id: 'preview' } as never

  return (
    <div className="min-h-screen bg-[#FFF9FB]">
      <NavBar user={mockUser} />
      <main className="max-w-4xl mx-auto px-4 py-6 pb-24 md:pb-8">
        <SintomasContent
          sintomas={sintomas}
          animo={animo}
          totalRegistros={43}
          recientes={recientes}
        />
      </main>
    </div>
  )
}
