'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

const links = [
  { href: '/dashboard',            label: 'Inicio',     icon: '🏠' },
  { href: '/dashboard/historial',  label: 'Historial',  icon: '📅' },
  { href: '/dashboard/sintomas',   label: 'Síntomas',   icon: '📊' },
  { href: '/dashboard/intimidad',  label: 'Intimidad',  icon: '💗' },
  { href: '/dashboard/perfil',     label: 'Perfil',     icon: '👤' },
]

const bottomLinks = links.filter(l => l.href !== '/dashboard/intimidad')

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
      <nav className="bg-white border-b border-pink-100 sticky top-0 z-20">
        <div className="px-4 md:px-6 h-20 md:h-24 flex items-center justify-between w-full">
          <Link href="/dashboard" className="flex items-center" aria-label="Cíclica">
            <img src="/logo.svg" alt="Cíclica" className="h-16 w-auto md:h-20" />
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
              onClick={handleSignOut}
              className="ml-2 px-3 py-1.5 rounded-lg text-sm text-gray-400 hover:text-gray-600 transition-colors"
            >
              Salir
            </button>
          </div>

          <button
            onClick={handleSignOut}
            className="md:hidden text-xs text-gray-400 hover:text-gray-600 transition-colors px-2 py-1"
          >
            Salir
          </button>
        </div>
      </nav>

      {/* Bottom tab bar — sólo mobile, 4 pestañas (Intimidad pasa a vivir como pestaña secundaria accesible desde el FAB y desde el calendario) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-10 bg-white border-t border-pink-100 safe-area-bottom">
        <div className="flex">
          {bottomLinks.map(link => {
            const active = pathname === link.href || (link.href === '/dashboard/historial' && pathname === '/dashboard/intimidad')
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-colors ${
                  active ? 'text-pink-500' : 'text-gray-400'
                }`}
              >
                <span className="text-lg leading-none">{link.icon}</span>
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
