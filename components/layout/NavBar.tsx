'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

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

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <>
      {/* Top bar — logo + salir (siempre visible) */}
      <nav className="bg-white border-b border-pink-100 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <img src="/logo.png" alt="Cíclica" className="w-auto" style={{ height: '140px', margin: '-44px -20px' }} />

          {/* Links horizontales solo en desktop */}
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
              onClick={handleSignOut}
              className="ml-2 px-3 py-1.5 rounded-lg text-sm text-gray-400 hover:text-gray-600 transition-colors"
            >
              Salir
            </button>
          </div>

          {/* Salir solo visible en mobile en el top bar */}
          <button
            onClick={handleSignOut}
            className="md:hidden text-xs text-gray-400 hover:text-gray-600 transition-colors px-2 py-1"
          >
            Salir
          </button>
        </div>
      </nav>

      {/* Bottom tab bar — solo mobile */}
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
    </>
  )
}
