import { notFound } from 'next/navigation'
import { getAllChapterSlugs, getQuestionsByChapter } from '@/lib/content'
import { getChapterBySlug } from '@/lib/chapters'
import { ChapterClient } from '@/components/chapter/ChapterClient'
import { createClient } from '@/lib/supabase-server'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const slugs = getAllChapterSlugs()
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const chapter = getChapterBySlug(slug)
  return {
    title: chapter ? `${chapter.title} — AI Engineering with Inte` : 'Chapter Not Found',
  }
}

export default async function ChapterPage({ params }: Props) {
  const { slug } = await params
  const chapter = getChapterBySlug(slug)
  const questions = getQuestionsByChapter(slug)

  if (!chapter || questions.length === 0) {
    notFound()
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return <ChapterClient chapter={chapter} questions={questions} user={user ? { email: user.email ?? '' } : null} />
}
