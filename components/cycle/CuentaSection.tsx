'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function CuentaSection() {
  const router = useRouter()
  const [exporting, setExporting] = useState(false)
  const [shareToken, setShareToken] = useState<{ token: string; expira: string } | null>(null)
  const [creating, setCreating] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmText, setConfirmText] = useState('')
  const [showConfirm, setShowConfirm] = useState(false)

  async function exportar() {
    setExporting(true)
    try {
      window.location.href = '/api/cuenta'
    } finally {
      setTimeout(() => setExporting(false), 1500)
    }
  }

  async function crearShareLink() {
    setCreating(true)
    try {
      const res = await fetch('/api/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dias: 7 }),
      })
      if (res.ok) {
        const data = await res.json()
        setShareToken(data)
      }
    } finally {
      setCreating(false)
    }
  }

  async function borrarCuenta() {
    if (confirmText !== 'BORRAR') return
    setDeleting(true)
    try {
      const res = await fetch('/api/cuenta', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirm: 'BORRAR' }),
      })
      if (res.ok) {
        router.push('/')
      }
    } finally {
      setDeleting(false)
    }
  }

  const shareUrl = shareToken
    ? `${typeof window !== 'undefined' ? window.location.origin : 'https://app.ciclica.pro'}/share/${shareToken.token}`
    : null

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-pink-100 dark:border-gray-800 px-5 py-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-lg">🩺</span>
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Compartir con tu ginecóloga</h3>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 leading-relaxed">
          Generá un link de solo lectura con tu resumen de ciclo. Vale 7 días y podés revocarlo cuando quieras.
        </p>

        {shareToken && shareUrl ? (
          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-pink-50 dark:bg-pink-950/20 border border-pink-100 dark:border-gray-800">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-pink-600 mb-1">
                Tu link
              </p>
              <p className="text-xs text-gray-700 dark:text-gray-200 break-all font-mono">{shareUrl}</p>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-2">
                Expira el {new Date(shareToken.expira).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => navigator.clipboard.writeText(shareUrl)}
                className="py-2 rounded-lg bg-pink-500 hover:bg-pink-600 text-white text-xs font-semibold"
              >
                Copiar link
              </button>
              <button
                type="button"
                onClick={async () => {
                  await fetch(`/api/share?token=${shareToken.token}`, { method: 'DELETE' })
                  setShareToken(null)
                }}
                className="py-2 rounded-lg bg-white border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 text-xs font-medium hover:bg-gray-50"
              >
                Revocar
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={crearShareLink}
            disabled={creating}
            className="w-full py-2.5 rounded-xl bg-pink-500 hover:bg-pink-600 text-white text-sm font-semibold transition-colors disabled:opacity-60"
          >
            {creating ? 'Generando...' : 'Generar link para 7 días'}
          </button>
        )}
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-pink-100 dark:border-gray-800 px-5 py-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-lg">🔒</span>
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Tu privacidad y datos</h3>
        </div>

        <div className="space-y-2">
          <button
            type="button"
            onClick={exportar}
            disabled={exporting}
            className="w-full py-2.5 px-4 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 text-sm font-medium hover:bg-gray-50 transition-colors flex items-center gap-3 disabled:opacity-60"
          >
            <span>📥</span>
            <span className="flex-1 text-left">
              {exporting ? 'Descargando...' : 'Descargar todos mis datos'}
            </span>
            <span className="text-gray-400 dark:text-gray-500">→</span>
          </button>

          <a
            href="/privacidad"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2.5 px-4 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 text-sm font-medium hover:bg-gray-50 transition-colors flex items-center gap-3"
          >
            <span>📄</span>
            <span className="flex-1 text-left">Política de privacidad</span>
            <span className="text-gray-400 dark:text-gray-500">↗</span>
          </a>

          <a
            href="/terminos"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2.5 px-4 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 text-sm font-medium hover:bg-gray-50 transition-colors flex items-center gap-3"
          >
            <span>📋</span>
            <span className="flex-1 text-left">Términos de uso</span>
            <span className="text-gray-400 dark:text-gray-500">↗</span>
          </a>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-red-100 px-5 py-6">
        <h3 className="text-sm font-semibold text-red-600 mb-2">Zona de peligro</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 leading-relaxed">
          Al borrar tu cuenta se eliminan para siempre todos tus registros, datos y este perfil.
          No se puede deshacer.
        </p>

        {!showConfirm ? (
          <button
            type="button"
            onClick={() => setShowConfirm(true)}
            className="w-full py-2.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-sm font-medium transition-colors"
          >
            Borrar mi cuenta
          </button>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-gray-700 dark:text-gray-200">
              Para confirmar escribí <strong>BORRAR</strong> en mayúsculas:
            </p>
            <input
              type="text"
              value={confirmText}
              onChange={e => setConfirmText(e.target.value)}
              placeholder="BORRAR"
              className="w-full px-4 py-2 rounded-lg border border-red-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-300"
            />
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => { setShowConfirm(false); setConfirmText('') }}
                className="py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 text-xs font-medium"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={borrarCuenta}
                disabled={confirmText !== 'BORRAR' || deleting}
                className="py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-xs font-semibold disabled:opacity-50 disabled:bg-red-300"
              >
                {deleting ? 'Borrando...' : 'Sí, borrar para siempre'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
