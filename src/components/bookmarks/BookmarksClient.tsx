'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Bookmark, ChevronRight, ArrowLeft } from 'lucide-react'
import { Question } from '@/types'
import { Header } from '@/components/layout/Header'
import { SearchModal } from '@/components/search/SearchModal'
import { useBookmarks } from '@/hooks/useBookmarks'
import { useProgress } from '@/hooks/useProgress'
import { CompleteButton } from '@/components/ui/CompleteButton'
import { BookmarkButton } from '@/components/ui/BookmarkButton'

interface BookmarksClientProps {
  questions: Question[]
  user?: { email: string } | null
}

export function BookmarksClient({ questions, user }: BookmarksClientProps) {
  const { toggle: toggleBookmark, isBookmarked } = useBookmarks()
  const { isCompleted, toggle: toggleComplete } = useProgress()
  const [searchOpen, setSearchOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  const bookmarkedQuestions = questions.filter((q) => isBookmarked(q.id))

  return (
    <div>
      <Header onSearchOpen={() => setSearchOpen(true)} user={user} />
      <SearchModal questions={questions} isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-8">
          <Link href="/" className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-indigo-600 mb-4 transition-colors">
            <ArrowLeft size={14} />
            Back to chapters
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
              <Bookmark size={20} className="fill-amber-400 stroke-amber-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Bookmarks</h1>
              {mounted && <p className="text-sm text-slate-500">{bookmarkedQuestions.length} saved questions</p>}
            </div>
          </div>
        </div>

        {!mounted && (
          <div className="text-center py-16 text-slate-400">Loading bookmarks…</div>
        )}

        {mounted && bookmarkedQuestions.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
            <Bookmark size={40} className="mx-auto text-slate-300 mb-3" />
            <p className="text-slate-500 font-medium">No bookmarks yet</p>
            <p className="text-sm text-slate-400 mt-1">Click the bookmark icon on any question to save it here</p>
            <Link href="/" className="mt-4 inline-flex items-center gap-2 text-indigo-600 text-sm font-medium hover:underline">
              Browse chapters <ChevronRight size={14} />
            </Link>
          </div>
        )}

        {mounted && bookmarkedQuestions.length > 0 && (
          <div className="space-y-4">
            {bookmarkedQuestions.map((q, i) => (
              <motion.div
                key={q.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white rounded-2xl border border-amber-200 shadow-sm p-5"
              >
                <div className="flex items-start gap-3">
                  <div className="shrink-0 w-9 h-9 bg-indigo-100 rounded-xl flex items-center justify-center font-bold text-indigo-700 text-sm">
                    {q.id}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/chapter/${q.chapterSlug}/#q${q.id}`}
                      className="font-semibold text-slate-900 hover:text-indigo-700 transition-colors text-sm leading-snug block mb-1"
                    >
                      {q.title}
                    </Link>
                    <p className="text-xs text-slate-500">{q.chapter}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <BookmarkButton isBookmarked={true} onToggle={() => toggleBookmark(q.id)} size={16} />
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <Link
                    href={`/chapter/${q.chapterSlug}/#q${q.id}`}
                    className="text-xs text-indigo-600 hover:underline flex items-center gap-1"
                  >
                    View question <ChevronRight size={11} />
                  </Link>
                  <CompleteButton isCompleted={isCompleted(q.id)} onToggle={() => toggleComplete(q.id)} />
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
