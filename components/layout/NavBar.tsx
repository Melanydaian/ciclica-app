'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'
import SexRegisterModal from '@/components/cycle/SexRegisterModal'

const links = [
  { href: '/dashboard',           label: 'Inicio',    icon: '🏠' },
  { href: '/dashboard/historial', label: 'Historial', icon: '📅' },
  { href: '/dashboard/sintomas',  label: 'Síntomas',  icon: '📊' },
  { href: '/dashboard/perfil',    label: 'Perfil',    icon: '👤' },
]

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function NavBar({ user }: { user: User }) {
  const pathname = usePathname()
  const router = useRouter()
  const [sexOpen, setSexOpen] = useState(false)

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <>
      <nav className="bg-white border-b border-pink-100 sticky top-0 z-20">
        <div className="px-4 md:px-6 h-14 flex items-center justify-between w-full">
          <Link href="/dashboard" className="flex items-center" aria-label="Cíclica">
            <img src="/logo.png" alt="Cíclica" className="h-8 w-auto md:h-9" />
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {links.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  pathname === link.href
                    ? 'bg-pink-50 text-pink-600'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                {link.label}
              </Link>
            ))}

            <button
              type="button"
              onClick={() => setSexOpen(true)}
              aria-label="Registrar momento íntimo"
              title="Registrar momento íntimo"
              className="ml-1 w-9 h-9 rounded-lg flex items-center justify-center text-pink-500 hover:bg-pink-50 transition-colors text-lg"
            >
              💗
            </button>

            <button
              onClick={handleSignOut}
              className="ml-1 px-3 py-1.5 rounded-lg text-sm text-gray-400 hover:text-gray-600 transition-colors"
            >
              Salir
            </button>
          </div>

          <div className="md:hidden flex items-center gap-1">
            <button
              type="button"
              onClick={() => setSexOpen(true)}
              aria-label="Registrar momento íntimo"
              className="w-9 h-9 rounded-lg flex items-center justify-center text-pink-500 hover:bg-pink-50 transition-colors text-lg"
            >
              💗
            </button>
            <button
              onClick={handleSignOut}
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors px-2 py-1"
            >
              Salir
            </button>
          </div>
        </div>
      </nav>

      <div className="md:hidden fixed bottom-0 left-0 right-0 z-10 bg-white border-t border-pink-100 safe-area-bottom">
        <div className="flex">
          {links.map(link => {
            const active = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-colors ${
                  active ? 'text-pink-500' : 'text-gray-400'
                }`}
              >
                <span className="text-xl leading-none">{link.icon}</span>
                <span className={`text-[10px] font-medium ${active ? 'text-pink-500' : 'text-gray-400'}`}>
                  {link.label}
                </span>
              </Link>
            )
          })}
        </div>
      </div>

      <SexRegisterModal open={sexOpen} onClose={() => setSexOpen(false)} />
    </>
  )
}
