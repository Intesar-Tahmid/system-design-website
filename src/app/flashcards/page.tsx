import { getServerUser } from '@/lib/supabase-server'
import { getAllQuestions } from '@/lib/content'
import { getChapters } from '@/lib/chapters'
import { FlashcardsDashboardClient } from '@/components/flashcards/FlashcardsDashboardClient'

export const dynamic = 'force-dynamic'

export default async function FlashcardsPage() {
  const user = await getServerUser()
  const questions = getAllQuestions()
  const chapters = getChapters()

  return (
    <FlashcardsDashboardClient
      isAuthenticated={!!user}
      userEmail={user?.email ?? undefined}
      totalQuestions={questions.length}
      chapters={chapters}
    />
  )
}
