'use client'

import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark' | 'system'

type ThemeContextValue = {
  theme: Theme
  resolved: 'light' | 'dark'
  setTheme: (t: Theme) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

function applyTheme(t: Theme): 'light' | 'dark' {
  const root = document.documentElement
  const sysDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  const effective: 'light' | 'dark' = t === 'system' ? (sysDark ? 'dark' : 'light') : t
  if (effective === 'dark') root.classList.add('dark')
  else root.classList.remove('dark')
  return effective
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('system')
  const [resolved, setResolved] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    const stored = (typeof localStorage !== 'undefined' && localStorage.getItem('ciclica-theme')) as Theme | null
    const initial: Theme = stored ?? 'system'
    setThemeState(initial)
    setResolved(applyTheme(initial))

    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    function onChange() {
      if (theme === 'system') setResolved(applyTheme('system'))
    }
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function setTheme(t: Theme) {
    setThemeState(t)
    localStorage.setItem('ciclica-theme', t)
    setResolved(applyTheme(t))
  }

  return (
    <ThemeContext.Provider value={{ theme, resolved, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider')
  return ctx
}
