import NavBar from '@/components/layout/NavBar'
import QuickActionFAB from '@/components/layout/QuickActionFAB'
import { redirect } from 'next/navigation'
import { createServerSupabase } from '@/lib/supabase-server'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/')

  const { data: webUser } = await supabase
    .from('usuarias_web')
    .select('telefono')
    .eq('email', user.email ?? '')
    .single()

  if (!webUser?.telefono) redirect('/onboarding')

  return (
    <div className="min-h-screen bg-[#FFF9FB] dark:bg-[#0F0B0E] transition-colors">
      <NavBar user={user} />
      <main className="max-w-4xl mx-auto px-4 py-6 pb-24 md:pb-8">{children}</main>
      <QuickActionFAB />
    </div>
  )
}
