'use client'
import { useState, useEffect } from 'react'
import { Chapter, Question } from '@/types'
import { Header } from '@/components/layout/Header'
import { SearchModal } from '@/components/search/SearchModal'
import { Sidebar } from '@/components/chapter/Sidebar'
import { QuestionItem } from '@/components/chapter/QuestionItem'
import { useProgress } from '@/hooks/useProgress'
import { useBookmarks } from '@/hooks/useBookmarks'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Menu, X } from 'lucide-react'

interface ChapterClientProps {
  chapter: Chapter
  questions: Question[]
}

export function ChapterClient({ chapter, questions }: ChapterClientProps) {
  const { completedIds, toggle: toggleComplete, isCompleted } = useProgress()
  const { bookmarkedIds, toggle: toggleBookmark, isBookmarked } = useBookmarks()
  const [activeId, setActiveId] = useState<number | undefined>(questions[0]?.id)
  const [searchOpen, setSearchOpen] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  // IntersectionObserver for active question tracking
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const id = parseInt(entry.target.id.replace('q', ''))
            if (!isNaN(id)) setActiveId(id)
          }
        }
      },
      { rootMargin: '-20% 0px -60% 0px' }
    )

    questions.forEach((q) => {
      const el = document.getElementById(`q${q.id}`)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [questions])

  const completed = questions.filter((q) => isCompleted(q.id)).length

  return (
    <div>
      <Header onSearchOpen={() => setSearchOpen(true)} />
      <SearchModal
        questions={questions}
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
      />

      {/* Mobile sidebar toggle */}
      <div className="lg:hidden sticky top-16 z-30 bg-white border-b border-slate-200 px-4 py-2 flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-900 truncate">{chapter.title}</p>
          <p className="text-xs text-slate-500">{completed}/{questions.length} completed</p>
        </div>
        <button
          onClick={() => setMobileSidebarOpen((v) => !v)}
          className="p-2 rounded-lg hover:bg-slate-100 ml-2"
        >
          {mobileSidebarOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {/* Mobile sidebar drawer */}
      {mobileSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-slate-900/40" onClick={() => setMobileSidebarOpen(false)} />
          <div className="relative w-80 max-w-full bg-white h-full overflow-y-auto">
            <div className="px-4 py-4 border-b border-slate-100">
              <p className="font-bold text-slate-900">{chapter.title}</p>
              <ProgressBar value={completed} max={questions.length} size="sm" className="mt-2" />
            </div>
            {questions.map((q) => (
              <a
                key={q.id}
                href={`#q${q.id}`}
                onClick={() => setMobileSidebarOpen(false)}
                className="flex items-start gap-2 px-4 py-2.5 text-sm hover:bg-indigo-50 transition-colors"
              >
                <span className={`mt-0.5 w-3.5 h-3.5 rounded-full border-2 shrink-0 ${isCompleted(q.id) ? 'bg-green-500 border-green-500' : 'border-slate-300'}`} />
                <span className={`text-xs leading-snug ${isCompleted(q.id) ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                  <span className="font-bold text-slate-400 mr-1">Q{q.id}.</span>{q.title}
                </span>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Main layout */}
      <div className="flex min-h-screen">
        <Sidebar
          questions={questions}
          completedIds={completedIds}
          bookmarkedIds={bookmarkedIds}
          chapterTitle={chapter.title}
          chapterGradient={chapter.gradient}
          activeId={activeId}
        />

        {/* Content */}
        <main className="flex-1 min-w-0 px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-3xl mx-auto">
            {/* Chapter header */}
            <div className="mb-8">
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 ${chapter.accentBg} ${chapter.accentText} rounded-xl text-sm font-semibold mb-3`}>
                <span>{chapter.emoji}</span>
                <span>{chapter.title}</span>
              </div>
              <p className="text-slate-500 text-sm">{chapter.description}</p>
              <div className="mt-3">
                <ProgressBar
                  value={completed}
                  max={questions.length}
                  showLabel
                  color={`bg-gradient-to-r ${chapter.gradient}`}
                />
              </div>
            </div>

            {/* Questions */}
            <div className="space-y-6">
              {questions.map((q) => (
                <QuestionItem
                  key={q.id}
                  question={q}
                  isCompleted={isCompleted(q.id)}
                  isBookmarked={isBookmarked(q.id)}
                  onToggleComplete={toggleComplete}
                  onToggleBookmark={toggleBookmark}
                />
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
