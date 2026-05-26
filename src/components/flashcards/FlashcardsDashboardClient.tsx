'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { DeckStats } from './DeckStats'
import Link from 'next/link'
import { BookOpen, ChevronRight, Layers, Sparkles } from 'lucide-react'
import type { Chapter } from '@/types'

interface Stats {
  streak: number
  retentionRate: number
  totalReviews: number
  dueToday: number
  totalCards: number
  anonymous: boolean
}

interface FlashcardsDashboardClientProps {
  isAuthenticated: boolean
  userEmail?: string
  totalQuestions: number
  chapters: Chapter[]
}

export function FlashcardsDashboardClient({
  isAuthenticated,
  userEmail,
  totalQuestions,
  chapters,
}: FlashcardsDashboardClientProps) {
  const [stats, setStats] = useState<Stats | null>(null)
  const [statsLoading, setStatsLoading] = useState(true)

  useEffect(() => {
    fetch('/api/flashcards/stats')
      .then(r => r.json())
      .then(data => { setStats(data); setStatsLoading(false) })
      .catch(() => setStatsLoading(false))
  }, [])

  const fileGroups = [
    { label: 'Foundations',        fileIndex: 1, emoji: '🧱' },
    { label: 'DevOps & MLOps',     fileIndex: 2, emoji: '🛠️' },
    { label: 'Production & Scale', fileIndex: 3, emoji: '🔭' },
    { label: 'Deep Dives',         fileIndex: 4, emoji: '🧠' },
    { label: 'AI Specializations', fileIndex: 5, emoji: '✨' },
  ]

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header strip */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Layers size={16} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900">Flashcard Mode</h1>
              <p className="text-xs text-slate-500">{totalQuestions} questions · SM-2 spaced repetition</p>
            </div>
          </div>
          {!isAuthenticated && (
            <Link
              href="/auth?next=/flashcards"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-colors"
            >
              <Sparkles size={13} />
              Sign in to sync
            </Link>
          )}
          {isAuthenticated && userEmail && (
            <span className="text-xs text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full font-medium">{userEmail}</span>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Stats */}
        <div>
          <h2 className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider mb-3">Your stats</h2>
          <DeckStats
            streak={stats?.streak ?? 0}
            retentionRate={stats?.retentionRate ?? 0}
            totalReviews={stats?.totalReviews ?? 0}
            dueToday={stats?.dueToday ?? 0}
            isLoading={statsLoading}
          />
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-6 text-white shadow-xl"
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.15),transparent)] pointer-events-none" />
          <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <BookOpen size={16} />
                <span className="text-sm font-semibold opacity-90">
                  {stats && !statsLoading
                    ? stats.dueToday > 0
                      ? `${stats.dueToday} cards due today`
                      : 'All caught up! Start a new session'
                    : 'Start studying now'}
                </span>
              </div>
              <p className="text-xs text-white/70">
                SM-2 spaced repetition schedules cards at the optimal moment for memory retention
              </p>
            </div>
            <Link
              href="/flashcards/study"
              className="flex items-center gap-2 bg-white text-indigo-600 font-bold text-sm px-5 py-2.5 rounded-2xl hover:bg-indigo-50 transition-colors shrink-0 shadow-sm"
            >
              Study All
              <ChevronRight size={15} />
            </Link>
          </div>
        </motion.div>

        {/* Anonymous upsell */}
        {!isAuthenticated && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl border border-indigo-200 bg-indigo-50 px-5 py-4 flex items-start gap-3"
          >
            <Sparkles size={16} className="text-indigo-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-indigo-800">Study as guest — no account needed</p>
              <p className="text-xs text-indigo-600 mt-0.5">
                Create a free account to save your review history, build daily streaks, and sync across devices.
                <Link href="/auth?next=/flashcards" className="ml-1 font-semibold underline underline-offset-2">Sign up free</Link>
              </p>
            </div>
          </motion.div>
        )}

        {/* Chapter groups */}
        <div>
          <h2 className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider mb-3">Study by volume</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {fileGroups.map((group, i) => {
              const groupChapters = chapters.filter(c => c.fileIndex === group.fileIndex)
              const questionCount = groupChapters.reduce((s, c) => s + c.questionIds.length, 0)
              return (
                <motion.div
                  key={group.fileIndex}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + i * 0.05 }}
                >
                  <Link
                    href={`/flashcards/study?volume=${group.fileIndex}`}
                    className="flex items-center gap-3 bg-white rounded-2xl border border-slate-200 shadow-sm px-4 py-3.5 hover:shadow-md hover:border-indigo-200 transition-all group"
                  >
                    <span className="text-2xl">{group.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 group-hover:text-indigo-700 transition-colors truncate">{group.label}</p>
                      <p className="text-xs text-slate-500">{questionCount} questions · {groupChapters.length} chapters</p>
                    </div>
                    <ChevronRight size={15} className="text-slate-300 group-hover:text-indigo-400 transition-colors shrink-0" />
                  </Link>
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* Chapter-level grid */}
        <div>
          <h2 className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider mb-3">Study by chapter</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {chapters.map((chapter, i) => (
              <motion.div
                key={chapter.slug}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.05 + i * 0.02 }}
              >
                <Link
                  href={`/flashcards/study?chapter=${chapter.slug}`}
                  className="flex items-center gap-2.5 bg-white rounded-xl border border-slate-200 px-3.5 py-2.5 hover:border-indigo-200 hover:shadow-sm transition-all group text-left"
                >
                  <span className="text-lg leading-none">{chapter.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-700 group-hover:text-indigo-700 transition-colors truncate">{chapter.title}</p>
                    <p className="text-[10px] text-slate-400">{chapter.questionIds.length} Qs</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
