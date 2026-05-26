'use client'
import { useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { CheckCircle2, Bookmark, ChevronLeft, ChevronsDown } from 'lucide-react'
import { Question } from '@/types'
import { ProgressBar } from '@/components/ui/ProgressBar'

interface SidebarProps {
  questions: Question[]
  completedIds: number[]
  bookmarkedIds: number[]
  chapterTitle: string
  chapterGradient: string
  activeId?: number
}

export function Sidebar({
  questions,
  completedIds,
  bookmarkedIds,
  chapterTitle,
  chapterGradient,
  activeId,
}: SidebarProps) {
  const completed = questions.filter((q) => completedIds.includes(q.id)).length
  const pct = questions.length > 0 ? Math.round((completed / questions.length) * 100) : 0
  const activeRef = useRef<HTMLAnchorElement>(null)
  const allDone = completed === questions.length && questions.length > 0

  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: 'nearest' })
  }, [activeId])

  const jumpToNextIncomplete = useCallback(() => {
    const next = questions.find((q) => !completedIds.includes(q.id))
    if (next) {
      document.getElementById(`q${next.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [questions, completedIds])

  return (
    <aside className="hidden lg:flex flex-col w-72 xl:w-80 shrink-0 sticky top-16 h-[calc(100vh-4rem)] overflow-hidden border-r border-slate-200 bg-white">
      {/* Chapter header */}
      <div className="px-4 py-4 border-b border-slate-100">
        <Link
          href="/"
          className="flex items-center gap-1 text-xs text-slate-500 hover:text-indigo-600 mb-3 transition-colors"
        >
          <ChevronLeft size={13} />
          All chapters
        </Link>
        <h2 className="font-bold text-slate-900 text-sm leading-tight mb-3">{chapterTitle}</h2>
        <ProgressBar
          value={completed}
          max={questions.length}
          size="sm"
          showLabel
          color={`bg-gradient-to-r ${chapterGradient}`}
        />

        {/* Next incomplete button — only visible when there are incomplete questions */}
        {!allDone && completed > 0 && (
          <button
            onClick={jumpToNextIncomplete}
            className="mt-2.5 w-full flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
          >
            <ChevronsDown size={12} />
            Jump to next ({questions.length - completed} left)
          </button>
        )}

        {allDone && (
          <div className="mt-2.5 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 rounded-lg">
            <CheckCircle2 size={12} />
            Chapter complete — {pct}%
          </div>
        )}
      </div>

      {/* Question list */}
      <div className="flex-1 overflow-y-auto py-2">
        {questions.map((q) => {
          const isDone = completedIds.includes(q.id)
          const isBookmark = bookmarkedIds.includes(q.id)
          const isActive = activeId === q.id

          return (
            <a
              key={q.id}
              href={`#q${q.id}`}
              ref={isActive ? activeRef : undefined}
              className={`flex items-start gap-2.5 px-4 py-2.5 text-sm transition-colors hover:bg-indigo-50 group ${
                isActive ? 'bg-indigo-50 border-r-2 border-indigo-500' : ''
              }`}
            >
              {/* Status icon */}
              <div className="shrink-0 mt-0.5">
                {isDone ? (
                  <CheckCircle2 size={14} className="text-green-500" />
                ) : (
                  <div className={`w-3.5 h-3.5 rounded-full border-2 ${isActive ? 'border-indigo-500' : 'border-slate-300'}`} />
                )}
              </div>

              {/* Question title */}
              <span className={`flex-1 leading-snug text-xs ${
                isDone
                  ? 'text-slate-400 line-through'
                  : isActive
                  ? 'text-indigo-700 font-semibold'
                  : 'text-slate-600 group-hover:text-slate-900'
              }`}>
                <span className="font-bold text-slate-400 mr-1">Q{q.id}.</span>
                {q.title}
              </span>

              {/* Bookmark indicator */}
              {isBookmark && <Bookmark size={11} className="shrink-0 fill-amber-400 stroke-amber-400 mt-0.5" />}
            </a>
          )
        })}
      </div>
    </aside>
  )
}
