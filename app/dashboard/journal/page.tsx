import { requireUsuaria } from '@/lib/usuaria'
import { createAdminSupabase } from '@/lib/supabase-server'
import JournalContent, { type JournalEntry } from '@/components/cycle/JournalContent'

export default async function JournalPage() {
  const { telefono } = await requireUsuaria()
  const admin = createAdminSupabase()

  const { data } = await admin
    .from('journal_entries')
    .select('id, fecha, fase, texto')
    .eq('telefono', telefono)
    .order('fecha', { ascending: false })
    .limit(100)

  return <JournalContent entries={(data ?? []) as JournalEntry[]} />
}
