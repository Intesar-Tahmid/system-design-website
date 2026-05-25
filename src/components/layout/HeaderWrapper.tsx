import { createClient } from '@/lib/supabase-server'
import { Header } from './Header'
import { getAllQuestions } from '@/lib/content'

interface HeaderWrapperProps {
  onSearchOpen?: () => void
}

export async function HeaderWrapper({ onSearchOpen }: HeaderWrapperProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const totalQuestions = getAllQuestions().length

  return (
    <Header
      onSearchOpen={onSearchOpen}
      user={user ? { email: user.email ?? '' } : null}
      totalQuestions={totalQuestions}
    />
  )
}
