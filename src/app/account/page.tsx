import { createClient, getServerUser } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import { AccountClient } from '@/components/account/AccountClient'

export const dynamic = 'force-dynamic'

export default async function AccountPage() {
  const user = await getServerUser()

  if (!user) redirect('/auth?next=/account')

  const supabase = await createClient()
  const [progressRes, bookmarksRes] = await Promise.all([
    supabase.from('progress').select('question_id', { count: 'exact', head: true }).eq('user_id', user.id),
    supabase.from('bookmarks').select('question_id', { count: 'exact', head: true }).eq('user_id', user.id),
  ])

  return (
    <AccountClient
      user={{ id: user.id, email: user.email ?? '' }}
      progressCount={progressRes.count ?? 0}
      bookmarksCount={bookmarksRes.count ?? 0}
    />
  )
}
