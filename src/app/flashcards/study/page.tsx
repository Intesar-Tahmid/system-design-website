'use client'
import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { StudySession, type StudyCard } from '@/components/flashcards/StudySession'
import { Loader2, Layers } from 'lucide-react'
import Link from 'next/link'

const GRADIENT_MAP: Record<number, string> = {
  1: 'from-blue-500 to-indigo-500',
  2: 'from-purple-500 to-fuchsia-500',
  3: 'from-emerald-500 to-teal-500',
  4: 'from-amber-500 to-orange-500',
}

interface ApiCard {
  questionId: number
  title: string
  chapter: string
  chapterSlug: string
  content: string
  sm2State: unknown
  nextReviewDate: string
}

function StudyPageInner() {
  const searchParams = useSearchParams()
  const chapterFilter = searchParams.get('chapter')
  const volumeFilter = searchParams.get('volume')

  const [cards, setCards] = useState<StudyCard[]>([])
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const params = new URLSearchParams()
    if (chapterFilter) params.set('chapter', chapterFilter)
    fetch(`/api/flashcards/due?${params}`)
      .then(r => r.json())
      .then(data => {
        setIsAuthenticated(!data.anonymous)
        // Map fileIndex from chapterSlug isn't available here; use volume param
        const fileIndex = volumeFilter ? parseInt(volumeFilter) : 0
        const mapped: StudyCard[] = (data.cards as ApiCard[]).map(c => ({
          questionId: c.questionId,
          title: c.title,
          chapter: c.chapter,
          chapterSlug: c.chapterSlug,
          content: c.content,
          gradient: GRADIENT_MAP[fileIndex] ?? 'from-indigo-500 to-purple-600',
          isNew: !c.sm2State,
        }))
        setCards(mapped)
        setLoading(false)
      })
      .catch(() => { setError('Failed to load cards.'); setLoading(false) })
  }, [chapterFilter, volumeFilter])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <Loader2 size={28} className="animate-spin" />
          <span className="text-sm font-medium">Loading your deck…</span>
        </div>
      </div>
    )
  }

  if (error || cards.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🎉</div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">{error ?? 'No cards due!'}</h2>
          <p className="text-slate-500 mb-6 text-sm">
            {error ? 'Please try again.' : 'You\'ve reviewed all cards for this filter. Come back tomorrow!'}
          </p>
          <Link
            href="/flashcards"
            className="px-5 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-colors"
          >
            Back to dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
          <Layers size={14} className="text-white" />
        </div>
        <span className="text-sm font-semibold text-slate-800">
          {chapterFilter ? `Studying: ${chapterFilter.replace(/-/g, ' ')}` : 'Study Session'}
        </span>
      </div>
      <div className="py-8">
        <StudySession
          cards={cards}
          isAuthenticated={isAuthenticated}
        />
      </div>
    </div>
  )
}

export default function StudyPage() {
  return (
    <Suspense>
      <StudyPageInner />
    </Suspense>
  )
}
