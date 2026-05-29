'use client'

import { useState } from 'react'
import SexRegisterModal from './SexRegisterModal'
import CalendarioCiclo from './CalendarioCiclo'

export type SexRegistro = {
  fecha: string
  fase: string | null
  hubo_proteccion: string | null
  proteccion: string | null
  nota_adicional: string | null
}

const PROTECCION_LABEL: Record<string, string> = {
  preservativo: 'Preservativo',
  anticonceptivo_oral: 'Pastilla',
  diu: 'DIU / SIU',
  inyectable: 'Inyectable',
  metodo_natural: 'Método del calendario',
  otro: 'Otro',
  ninguno: 'Ninguno',
}

const FASE_LABEL: Record<string, { label: string; ring: string }> = {
  menstrual:   { label: 'Menstrual',   ring: '#EC4899' },
  folicular:   { label: 'Folicular',   ring: '#34D399' },
  ovulatoria:  { label: 'Ovulatoria',  ring: '#FBBF24' },
  lutea:       { label: 'Lútea',       ring: '#A78BFA' },
  desconocida: { label: 'Sin fase',    ring: '#9CA3AF' },
}

function fmtFecha(iso: string): string {
  return new Date(iso + 'T00:00:00').toLocaleDateString('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
}

export default function IntimidadContent({
  lastPeriod,
  cycleLength,
  daysUntilNextPeriod,
  registros,
}: {
  lastPeriod: Date | null
  cycleLength: number
  daysUntilNextPeriod: number
  registros: SexRegistro[]
}) {
  const [open, setOpen] = useState(false)
  const sexDates = registros.map(r => r.fecha)

  const conProteccion = registros.filter(r => r.hubo_proteccion === 'si').length
  const pctProteccion = registros.length > 0 ? Math.round((conProteccion / registros.length) * 100) : 0

  return (
    <div className="space-y-4">
      <div className="pb-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-400 dark:text-[#8A8190]">
          Tu intimidad
        </p>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-[#F4F1F5] mt-1">Momentos íntimos</h1>
        <p className="text-sm text-gray-500 dark:text-[#B4ABB8] mt-2 leading-relaxed">
          Registrá tu vida sexual para entender mejor tu ciclo. Tu data es privada — solo vos podés verla.
        </p>
      </div>

      <button
        onClick={() => setOpen(true)}
        className="w-full bg-gradient-to-r from-pink-500 to-pink-400 hover:from-pink-600 hover:to-pink-500 text-white rounded-2xl px-5 py-4 flex items-center justify-center gap-2 font-semibold text-sm shadow-sm transition-all hover:shadow-md active:scale-[0.99]"
      >
        <span className="text-lg">💗</span>
        Registrar momento íntimo
      </button>

      {lastPeriod ? (
        <CalendarioCiclo
          lastPeriod={lastPeriod}
          cycleLength={cycleLength}
          daysUntilNextPeriod={daysUntilNextPeriod}
          sexDates={sexDates}
          showSexMarkers={true}
        />
      ) : (
        <div className="bg-white dark:bg-[#1F1822] rounded-2xl border border-pink-100 dark:border-[#3A2F3F] px-6 py-8 text-center">
          <div className="text-3xl mb-2">📅</div>
          <p className="text-sm text-gray-500 dark:text-[#B4ABB8]">
            Para ver el calendario necesitamos saber cuándo te vino el último período.
          </p>
        </div>
      )}

      {registros.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white dark:bg-[#1F1822] rounded-2xl border border-pink-100 dark:border-[#3A2F3F] px-5 py-5">
            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-400 dark:text-[#8A8190]">
              Registros
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-4xl font-bold text-gray-800 dark:text-[#F4F1F5] tabular-nums leading-none">
                {registros.length}
              </span>
              <span className="text-xs text-gray-400 dark:text-[#8A8190]">
                en tu historial
              </span>
            </div>
          </div>
          <div className="bg-white dark:bg-[#1F1822] rounded-2xl border border-pink-100 dark:border-[#3A2F3F] px-5 py-5">
            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-400 dark:text-[#8A8190]">
              Con protección
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-4xl font-bold text-gray-800 dark:text-[#F4F1F5] tabular-nums leading-none">
                {pctProteccion}
              </span>
              <span className="text-xs text-gray-400 dark:text-[#8A8190]">%</span>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-[#1F1822] rounded-2xl border border-pink-100 dark:border-[#3A2F3F] px-5 py-6">
        <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-400 dark:text-[#8A8190] mb-4">
          Historial
        </div>

        {registros.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-3">💗</div>
            <p className="text-sm font-semibold text-gray-700 dark:text-[#E5DBE8]">
              Aún no registraste relaciones sexuales
            </p>
            <p className="text-xs text-gray-400 dark:text-[#8A8190] mt-2 max-w-xs mx-auto leading-relaxed">
              Tocá <span className="font-medium text-pink-500">Registrar momento íntimo</span> arriba para empezar.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {registros.slice(0, 30).map((r, i) => {
              const fase = FASE_LABEL[r.fase ?? 'desconocida'] ?? FASE_LABEL.desconocida
              return (
                <div key={i} className="flex items-start gap-3 py-3 border-b border-gray-50 dark:border-[#3A2F3F] last:border-0">
                  <span className="text-xl leading-none mt-0.5">💗</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-baseline gap-2">
                      <span className="text-sm font-semibold text-gray-800 dark:text-[#F4F1F5] capitalize">
                        {fmtFecha(r.fecha)}
                      </span>
                      <span
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                        style={{
                          color: fase.ring,
                          background: `${fase.ring}1A`,
                          border: `1px solid ${fase.ring}33`,
                        }}
                      >
                        {fase.label}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-1.5 text-[11px] text-gray-500 dark:text-[#B4ABB8]">
                      {r.hubo_proteccion === 'si' && (
                        <span>
                          ✅ Con protección{r.proteccion ? ` · ${PROTECCION_LABEL[r.proteccion] ?? r.proteccion}` : ''}
                        </span>
                      )}
                      {r.hubo_proteccion === 'no' && <span>⚠️ Sin protección</span>}
                      {r.hubo_proteccion === 'no_recuerdo' && <span>🤔 No recuerda</span>}
                    </div>
                    {r.nota_adicional && (
                      <p className="text-xs text-gray-500 dark:text-[#B4ABB8] mt-2 italic">
                        &ldquo;{r.nota_adicional}&rdquo;
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <SexRegisterModal open={open} onClose={() => setOpen(false)} />
    </div>
  )
}
