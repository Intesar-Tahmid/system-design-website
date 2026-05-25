import { getAllQuestions } from '@/lib/content'
import { BookmarksClient } from '@/components/bookmarks/BookmarksClient'
import { getServerUser } from '@/lib/supabase-server'

export default async function BookmarksPage() {
  const questions = getAllQuestions()
  const user = await getServerUser()
  return <BookmarksClient questions={questions} user={user ? { email: user.email ?? '' } : null} />
}
