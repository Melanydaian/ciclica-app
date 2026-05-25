'use client'

type CicloRow = { fecha_inicio?: string | null; duracion_dias?: number | null }
type RegistroRow = { fase_actual?: string | null; sintoma?: string | null; created_at?: string | null }

function esc(str: string): string {
  return str.replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] ?? c),
  )
}

function fmtDate(iso?: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function ExportarPDFButton({
  nombre,
  cycleLength,
  periodLength,
  pastCycles,
  registros,
}: {
  nombre: string
  cycleLength: number
  periodLength: number
  pastCycles: CicloRow[]
  registros: RegistroRow[]
}) {
  function handleExport() {
    const frecuencia = new Map<string, number>()
    const porFase = new Map<string, Map<string, number>>()
    for (const r of registros) {
      if (!r.sintoma) continue
      const sintomasArr = r.sintoma.split(/[,;]+/).map(s => s.trim().toLowerCase()).filter(Boolean)
      const fase = (r.fase_actual ?? 'sin fase').toLowerCase()
      for (const s of sintomasArr) {
        frecuencia.set(s, (frecuencia.get(s) ?? 0) + 1)
        if (!porFase.has(s)) porFase.set(s, new Map())
        porFase.get(s)!.set(fase, (porFase.get(s)!.get(fase) ?? 0) + 1)
      }
    }

    const topSintomas = Array.from(frecuencia.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([s, count]) => {
        const fases = porFase.get(s)!
        const faseTop = Array.from(fases.entries()).sort((a, b) => b[1] - a[1])[0][0]
        return { sintoma: s, count, fase: faseTop }
      })

    const cyclesRows = pastCycles
      .filter(c => c.fecha_inicio)
      .slice(0, 12)
      .map((c, i) => `<tr><td>Ciclo ${i + 1}</td><td>${esc(fmtDate(c.fecha_inicio))}</td><td>${c.duracion_dias ?? '—'} días</td></tr>`)
      .join('')

    const sintomasRows = topSintomas
      .map(t => `<tr><td>${esc(t.sintoma)}</td><td>${esc(t.fase)}</td><td>${t.count}×</td></tr>`)
      .join('')

    const dur = pastCycles.map(c => c.duracion_dias ?? 0).filter(Boolean)
    const variabilidad = dur.length >= 2 ? Math.max(...dur) - Math.min(...dur) : null
    const totalCiclos = pastCycles.length

    const content = `
      <html>
      <head>
        <meta charset="utf-8">
        <title>Resumen de ciclo — Cíclica</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 640px; margin: 40px auto; color: #1F2937; }
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
          .empty { color: #9CA3AF; font-style: italic; font-size: 13px; }
          .footer { margin-top: 40px; font-size: 11px; color: #D1D5DB; text-align: center; }
        </style>
      </head>
      <body>
        <h1>🌸 Resumen de ciclo menstrual</h1>
        <p class="meta">Generado por Cíclica · ${new Date().toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })} · Paciente: ${esc(nombre)}</p>

        <h2>Datos del ciclo</h2>
        <div class="stat"><strong>${cycleLength} días</strong><span>Duración promedio del ciclo</span></div>
        <div class="stat"><strong>${periodLength} días</strong><span>Duración promedio del período</span></div>
        <div class="stat"><strong>${totalCiclos} ${totalCiclos === 1 ? 'ciclo' : 'ciclos'}</strong><span>Registrados</span></div>

        <h2>Historial de ciclos</h2>
        ${cyclesRows ? `<table><tr><th>Ciclo</th><th>Inicio</th><th>Duración</th></tr>${cyclesRows}</table>` : '<p class="empty">Sin ciclos registrados todavía.</p>'}

        <h2>Síntomas más frecuentes</h2>
        ${sintomasRows ? `<table><tr><th>Síntoma</th><th>Fase predominante</th><th>Frecuencia</th></tr>${sintomasRows}</table>` : '<p class="empty">Sin síntomas registrados todavía.</p>'}

        <h2>Regularidad</h2>
        <p>Ciclo de ${cycleLength} días — <span class="badge">${cycleLength >= 21 && cycleLength <= 35 ? 'En el rango normal (21-35 días)' : 'Fuera del rango habitual'}</span></p>
        <p>Período de ${periodLength} días — <span class="badge">${periodLength >= 2 && periodLength <= 7 ? 'Dentro del rango normal (2-7 días)' : 'Fuera del rango habitual'}</span></p>
        ${variabilidad !== null ? `<p>Variabilidad entre ciclos: <strong>${variabilidad} días</strong> ${variabilidad <= 5 ? '(regular)' : '(irregular — comentar con profesional)'}</p>` : ''}

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
