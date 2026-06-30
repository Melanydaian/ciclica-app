'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'
import { Home, CalendarHeart, Sparkles, HeartHandshake, UserRound, LogOut, MessageCircleHeart } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

type NavLink = { href: string; label: string; Icon: LucideIcon }

const links: NavLink[] = [
  { href: '/dashboard',            label: 'Inicio',     Icon: Home },
  { href: '/dashboard/asistente',  label: 'Asistente',  Icon: MessageCircleHeart },
  { href: '/dashboard/historial',  label: 'Historial',  Icon: CalendarHeart },
  { href: '/dashboard/sintomas',   label: 'Síntomas',   Icon: Sparkles },
  { href: '/dashboard/intimidad',  label: 'Intimidad',  Icon: HeartHandshake },
  { href: '/dashboard/perfil',     label: 'Perfil',     Icon: UserRound },
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
      <nav className="bg-white dark:bg-[#1F1822] border-b border-pink-100 dark:border-[#3A2F3F] sticky top-0 z-20 transition-colors">
        <div className="px-4 md:px-6 h-24 md:h-28 flex items-center justify-between w-full">
          <Link href="/dashboard" className="flex items-center" aria-label="Cíclica">
            <img src="/logo.png" alt="Cíclica" className="h-20 w-auto md:h-24" />
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {links.map(({ href, label, Icon }) => {
              const active = pathname === href
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? 'bg-pink-50 dark:bg-pink-500/15 text-pink-600 dark:text-pink-300'
                      : 'text-gray-500 dark:text-[#B4ABB8] hover:text-gray-800 dark:hover:text-[#F4F1F5]'
                  }`}
                >
                  <Icon size={16} strokeWidth={2} />
                  {label}
                </Link>
              )
            })}
            <button
              onClick={handleSignOut}
              className="ml-2 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-gray-400 dark:text-[#8A8190] hover:text-gray-600 dark:hover:text-[#C9BFCB] transition-colors"
            >
              <LogOut size={14} strokeWidth={2} />
              Salir
            </button>
          </div>

          <button
            onClick={handleSignOut}
            aria-label="Salir"
            className="md:hidden flex items-center gap-1 text-xs text-gray-400 dark:text-[#8A8190] hover:text-gray-600 dark:hover:text-[#C9BFCB] transition-colors px-2 py-1"
          >
            <LogOut size={14} strokeWidth={2} />
            Salir
          </button>
        </div>
      </nav>

      {/* Bottom tab bar — sólo mobile, 4 pestañas (Intimidad pasa a vivir como pestaña secundaria accesible desde el FAB y desde el calendario) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-10 bg-white dark:bg-[#1F1822] border-t border-pink-100 dark:border-[#3A2F3F] safe-area-bottom transition-colors">
        <div className="flex">
          {bottomLinks.map(({ href, label, Icon }) => {
            const active = pathname === href || (href === '/dashboard/historial' && pathname === '/dashboard/intimidad')
            return (
              <Link
                key={href}
                href={href}
                className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-colors ${
                  active ? 'text-pink-500' : 'text-gray-400 dark:text-[#8A8190]'
                }`}
              >
                <Icon size={20} strokeWidth={active ? 2.4 : 2} />
                <span className={`text-[10px] font-medium ${active ? 'text-pink-500' : 'text-gray-400 dark:text-[#8A8190]'}`}>
                  {label}
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </>
  )
}
