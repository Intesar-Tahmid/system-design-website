import { getAllQuestions } from '@/lib/content'
import { BookmarksClient } from '@/components/bookmarks/BookmarksClient'

export default function BookmarksPage() {
  const questions = getAllQuestions()
  return <BookmarksClient questions={questions} />
}
