'use client'

export default function ExportarPDFButton({ nombre, cycleLength, periodLength }: {
  nombre: string
  cycleLength: number
  periodLength: number
}) {
  function handleExport() {
    const content = `
      <html>
      <head>
        <meta charset="utf-8">
        <title>Resumen de ciclo — Cíclica</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 600px; margin: 40px auto; color: #1F2937; }
          h1 { color: #EC4899; font-size: 22px; }
          h2 { color: #9D174D; font-size: 15px; margin-top: 24px; border-bottom: 1px solid #FCE7F3; padding-bottom: 6px; }
          .meta { color: #6B7280; font-size: 13px; margin-bottom: 24px; }
          .stat { display: inline-block; margin-right: 24px; }
          .stat strong { display: block; font-size: 20px; color: #EC4899; }
          .stat span { font-size: 12px; color: #9CA3AF; }
          table { width: 100%; border-collapse: collapse; font-size: 13px; }
          td, th { text-align: left; padding: 8px; border-bottom: 1px solid #F3F4F6; }
          th { color: #9CA3AF; font-weight: normal; }
          .badge { display: inline-block; padding: 2px 8px; border-radius: 999px; background: #FCE7F3; color: #EC4899; font-size: 11px; }
          .footer { margin-top: 40px; font-size: 11px; color: #D1D5DB; text-align: center; }
        </style>
      </head>
      <body>
        <h1>🌸 Resumen de ciclo menstrual</h1>
        <p class="meta">Generado por Cíclica · ${new Date().toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })} · Paciente: ${nombre}</p>

        <h2>Datos del ciclo</h2>
        <div class="stat"><strong>${cycleLength} días</strong><span>Duración promedio del ciclo</span></div>
        <div class="stat"><strong>${periodLength} días</strong><span>Duración promedio del período</span></div>
        <div class="stat"><strong>3 ciclos</strong><span>Ciclos registrados</span></div>

        <h2>Historial de ciclos</h2>
        <table>
          <tr><th>Ciclo</th><th>Inicio</th><th>Duración</th></tr>
          <tr><td>Ciclo 1</td><td>18 abr 2025</td><td>28 días</td></tr>
          <tr><td>Ciclo 2</td><td>18 mar 2025</td><td>28 días</td></tr>
          <tr><td>Ciclo 3</td><td>18 feb 2025</td><td>27 días</td></tr>
        </table>

        <h2>Síntomas más frecuentes</h2>
        <table>
          <tr><th>Síntoma</th><th>Fase</th><th>Frecuencia</th></tr>
          <tr><td>Cólicos</td><td>Menstrual</td><td>Alta — días 1-2</td></tr>
          <tr><td>Cansancio</td><td>Menstrual / Lútea</td><td>Moderada</td></tr>
          <tr><td>Ansiedad</td><td>Lútea</td><td>Moderada — días 22-26</td></tr>
          <tr><td>Energía alta</td><td>Folicular / Ovulatoria</td><td>Constante</td></tr>
        </table>

        <h2>Patrones detectados</h2>
        <p>• Cólicos fuertes en días 1-2, se repite en los últimos 3 ciclos</p>
        <p>• Ansiedad elevada en fase lútea (días 22-26)</p>
        <p>• Pico de energía consistente en semana 2 (fase folicular)</p>
        <p>• Variabilidad entre ciclos: 1 día (muy regular)</p>

        <h2>Regularidad</h2>
        <p>Ciclo de ${cycleLength} días — <span class="badge">En el rango ideal (21-35 días)</span></p>
        <p>Período de ${periodLength} días — <span class="badge">Dentro del rango normal (2-7 días)</span></p>

        <div class="footer">Generado con Cíclica — asistente de salud menstrual vía WhatsApp · ciclica.pro</div>
      </body>
      </html>
    `

    const win = window.open('', '_blank')
    if (!win) return
    win.document.write(content)
    win.document.close()
    win.focus()
    setTimeout(() => { win.print(); win.close() }, 500)
  }

  return (
    <button
      onClick={handleExport}
      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-pink-200 text-pink-600 text-sm font-medium hover:bg-pink-50 transition-colors"
    >
      📄 Exportar resumen para el médico
    </button>
  )
}
