import { getAllQuestions } from '@/lib/content'
import { BookmarksClient } from '@/components/bookmarks/BookmarksClient'
import { createClient } from '@/lib/supabase-server'

export default async function BookmarksPage() {
  const questions = getAllQuestions()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return <BookmarksClient questions={questions} user={user ? { email: user.email ?? '' } : null} />
}
