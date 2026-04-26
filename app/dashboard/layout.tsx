import NavBar from '@/components/layout/NavBar'
import type { User } from '@supabase/supabase-js'

const MOCK_USER = { email: 'meli@email.com', id: 'mock' } as User

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  let user: User | null = MOCK_USER

  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    const { createServerSupabase } = await import('@/lib/supabase-server')
    const { redirect } = await import('next/navigation')
    const supabase = await createServerSupabase()
    const { data } = await supabase.auth.getUser()
    user = data.user

    if (!user) redirect('/')

    // Si no tiene teléfono vinculado → onboarding
    const { data: webUser } = await supabase
      .from('usuarias_web')
      .select('telefono')
      .eq('email', user!.email ?? '')
      .single()

    if (!webUser?.telefono) redirect('/onboarding')
  }

  return (
    <div className="min-h-screen bg-[#FFF9FB]">
      <NavBar user={user!} />
      <main className="max-w-4xl mx-auto px-4 py-6 pb-24 md:pb-8">{children}</main>
    </div>
  )
}
