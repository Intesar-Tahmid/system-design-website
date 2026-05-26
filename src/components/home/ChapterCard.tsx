'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { CheckCircle2 } from 'lucide-react'
import { Chapter } from '@/types'
import { getProgress } from '@/lib/storage'

interface ChapterCardProps {
  chapter: Chapter
  index: number
}

const DIFFICULTY_STYLES: Record<string, string> = {
  Beginner:     'bg-emerald-50 text-emerald-600 border-emerald-100',
  Intermediate: 'bg-amber-50   text-amber-600   border-amber-100',
  Advanced:     'bg-rose-50    text-rose-600    border-rose-100',
}

export function ChapterCard({ chapter, index }: ChapterCardProps) {
  const [completedCount, setCompletedCount] = useState(0)
  const total = chapter.questionIds.length
  const pct = total > 0 ? Math.round((completedCount / total) * 100) : 0
  const isFinished = pct === 100 && total > 0

  useEffect(() => {
    const progress = getProgress()
    setCompletedCount(chapter.questionIds.filter((id) => progress.includes(id)).length)
  }, [chapter.questionIds])

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.045, 0.4) }}
      whileHover={{ y: -3, transition: { duration: 0.18 } }}
    >
      <Link href={`/chapter/${chapter.slug}`} className="block h-full group">
        <div className={`h-full bg-white rounded-2xl border transition-all overflow-hidden ${
          isFinished
            ? 'border-emerald-200 hover:border-emerald-300 hover:shadow-md'
            : 'border-slate-200 hover:border-slate-300 hover:shadow-md'
        }`}>

          {/* Gradient top accent line — thicker when finished */}
          <div className={`w-full bg-gradient-to-r ${chapter.gradient} ${isFinished ? 'h-1.5' : 'h-1'}`} />

          <div className="p-5">
            {/* Emoji + difficulty badge */}
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${chapter.accentBg} shrink-0`}>
                {chapter.emoji}
              </div>
              <div className="flex items-center gap-1.5 pt-1">
                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md border ${DIFFICULTY_STYLES[chapter.difficulty] ?? DIFFICULTY_STYLES.Intermediate}`}>
                  {chapter.difficulty}
                </span>
                <span className="text-xs font-mono text-slate-400">
                  {total} Q&amp;As
                </span>
              </div>
            </div>

            {/* Title */}
            <h3 className="font-bold text-slate-900 text-sm leading-snug mb-1.5 group-hover:text-indigo-700 transition-colors">
              {chapter.title}
            </h3>

            {/* Description */}
            <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 mb-4">
              {chapter.description}
            </p>

            {/* Progress */}
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${chapter.gradient} rounded-full transition-all duration-700`}
                style={{ width: `${pct}%` }}
              />
            </div>

            <div className="flex items-center justify-between mt-1.5">
              {completedCount > 0 ? (
                <p className="text-xs text-slate-400 font-medium">
                  {completedCount}/{total} done
                </p>
              ) : (
                <span />
              )}
              {isFinished && (
                <div className="flex items-center gap-1 text-emerald-600">
                  <CheckCircle2 size={13} className="fill-emerald-100" />
                  <span className="text-[10px] font-semibold">Complete</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
