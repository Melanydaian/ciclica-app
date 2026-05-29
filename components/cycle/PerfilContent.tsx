'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

function maskPhone(tel: string): string {
  const digits = tel.replace(/\D/g, '')
  if (digits.length < 6) return tel
  const inicio = digits.slice(0, 4)
  const fin = digits.slice(-4)
  return `+${inicio} ··· ${fin}`
}

export default function PerfilContent({
  email,
  telefono,
  duracionCiclo,
  tomaAnticonceptivas,
  recordatorioActivo,
  recordatorioHora,
  codigoReferido,
  suscripcionActiva,
}: {
  email: string
  telefono: string
  duracionCiclo: number
  tomaAnticonceptivas: boolean
  recordatorioActivo: boolean
  recordatorioHora: string | null
  codigoReferido: string | null
  suscripcionActiva: boolean
}) {
  const router = useRouter()
  const [ciclo, setCiclo] = useState(duracionCiclo)
  const [pastillas, setPastillas] = useState(tomaAnticonceptivas)
  const [recActivo, setRecActivo] = useState(recordatorioActivo)
  const [recHora, setRecHora] = useState(recordatorioHora ?? '08:00')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  async function persistir(payload: Record<string, unknown>) {
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/perfil', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error ?? 'No pudimos guardar tus cambios.')
        return false
      }
      router.refresh()
      return true
    } finally {
      setSaving(false)
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    const ok = await persistir({ duracion_ciclo: ciclo })
    if (ok) {
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }
  }

  async function togglePastillas() {
    const nuevo = !pastillas
    setPastillas(nuevo)
    await persistir({ toma_anticonceptivas: nuevo })
  }

  async function toggleRecordatorio() {
    const nuevo = !recActivo
    setRecActivo(nuevo)
    await persistir({ recordatorio_pastilla_activo: nuevo, recordatorio_pastilla_hora: recHora })
  }

  async function actualizarHora(nuevaHora: string) {
    setRecHora(nuevaHora)
    if (recActivo) {
      await persistir({ recordatorio_pastilla_hora: nuevaHora })
    }
  }

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-[#F4F1F5]">Tu perfil</h1>
        <p className="text-sm text-gray-400 dark:text-[#8A8190] mt-1">Ajustá tu información para predicciones más precisas</p>
      </div>

      <div className="bg-white dark:bg-[#1F1822] rounded-2xl border border-pink-100 dark:border-[#3A2F3F] p-6">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-[#E5DBE8] mb-4">Cuenta</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-gray-50 dark:border-[#3A2F3F]">
            <span className="text-sm text-gray-500 dark:text-[#B4ABB8]">Email</span>
            <span className="text-sm font-medium text-gray-800 dark:text-[#F4F1F5] truncate ml-2">{email}</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-gray-50 dark:border-[#3A2F3F]">
            <span className="text-sm text-gray-500 dark:text-[#B4ABB8]">WhatsApp vinculado</span>
            <span className="text-sm font-medium text-green-600 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-400 inline-block" />
              {maskPhone(telefono)}
            </span>
          </div>
          {codigoReferido && (
            <div className="flex items-center justify-between py-2 border-b border-gray-50 dark:border-[#3A2F3F]">
              <span className="text-sm text-gray-500 dark:text-[#B4ABB8]">Código de referido</span>
              <span className="text-sm font-mono font-bold text-pink-500 tracking-widest">{codigoReferido}</span>
            </div>
          )}
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-gray-500 dark:text-[#B4ABB8]">Plan</span>
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                suscripcionActiva ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 dark:bg-[#2A2030] text-gray-500 dark:text-[#B4ABB8]'
              }`}
            >
              {suscripcionActiva ? 'Premium ✨' : 'Free'}
            </span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="bg-white dark:bg-[#1F1822] rounded-2xl border border-pink-100 dark:border-[#3A2F3F] p-6 space-y-5">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-[#E5DBE8]">Tu ciclo</h3>

        <div>
          <label className="text-sm text-gray-600 dark:text-[#C9BFCB] mb-2 block">
            Duración promedio del ciclo
            <span className="text-pink-500 font-semibold ml-2">{ciclo} días</span>
          </label>
          <input
            type="range"
            min={21}
            max={40}
            value={ciclo}
            onChange={e => setCiclo(Number(e.target.value))}
            className="w-full accent-pink-500"
          />
          <div className="flex justify-between text-xs text-gray-400 dark:text-[#8A8190] mt-1">
            <span>21</span>
            <span>40</span>
          </div>
        </div>

        {error && <p className="text-red-500 text-xs">{error}</p>}

        <button
          type="submit"
          disabled={saving}
          className="w-full py-3 rounded-xl bg-[#EC4899] text-white font-semibold text-sm hover:bg-[#db2777] transition-colors disabled:opacity-60"
        >
          {saving ? 'Guardando...' : saved ? '✓ Guardado' : 'Guardar cambios'}
        </button>
      </form>

      <div className="bg-white dark:bg-[#1F1822] rounded-2xl border border-pink-100 dark:border-[#3A2F3F] p-6">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-[#E5DBE8] mb-3">Anticonceptivos</h3>

        <div className="flex items-center justify-between py-2">
          <div className="min-w-0">
            <p className="text-sm text-gray-700 dark:text-[#E5DBE8]">Tomo pastillas anticonceptivas</p>
            <p className="text-xs text-gray-400 dark:text-[#8A8190]">Habilita el recordatorio diario</p>
          </div>
          <button
            type="button"
            onClick={togglePastillas}
            disabled={saving}
            aria-pressed={pastillas}
            className={`w-10 h-6 rounded-full relative transition-colors ${pastillas ? 'bg-pink-400' : 'bg-gray-200'}`}
          >
            <span
              className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${
                pastillas ? 'left-5' : 'left-1'
              }`}
            />
          </button>
        </div>

        {pastillas && (
          <>
            <div className="flex items-center justify-between py-2 border-t border-gray-50 dark:border-[#3A2F3F]">
              <div>
                <p className="text-sm text-gray-700 dark:text-[#E5DBE8]">Recordatorio diario por WhatsApp</p>
                <p className="text-xs text-gray-400 dark:text-[#8A8190]">Te avisamos a la hora que elijas</p>
              </div>
              <button
                type="button"
                onClick={toggleRecordatorio}
                disabled={saving}
                aria-pressed={recActivo}
                className={`w-10 h-6 rounded-full relative transition-colors ${recActivo ? 'bg-pink-400' : 'bg-gray-200'}`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${
                    recActivo ? 'left-5' : 'left-1'
                  }`}
                />
              </button>
            </div>

            {recActivo && (
              <div className="flex items-center justify-between py-2 border-t border-gray-50 dark:border-[#3A2F3F]">
                <label className="text-sm text-gray-700 dark:text-[#E5DBE8]">Hora del recordatorio</label>
                <input
                  type="time"
                  value={recHora}
                  onChange={e => actualizarHora(e.target.value)}
                  className="text-sm border border-gray-200 dark:border-[#3A2F3F] rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-pink-200"
                />
              </div>
            )}
          </>
        )}
      </div>

      <button
        type="button"
        onClick={handleLogout}
        className="w-full py-3 rounded-xl border border-gray-200 dark:border-[#3A2F3F] text-gray-500 dark:text-[#B4ABB8] text-sm hover:text-gray-700 dark:hover:text-[#E5DBE8] hover:bg-gray-50 transition-colors"
      >
        Cerrar sesión
      </button>
    </div>
  )
}
