'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Chapter } from '@/types'
import { getProgress } from '@/lib/storage'

interface ChapterCardProps {
  chapter: Chapter
  index: number
}

export function ChapterCard({ chapter, index }: ChapterCardProps) {
  const [completedCount, setCompletedCount] = useState(0)
  const total = chapter.questionIds.length
  const pct = total > 0 ? Math.round((completedCount / total) * 100) : 0

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
        <div className="h-full bg-white rounded-2xl border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all overflow-hidden">

          {/* Gradient top accent line */}
          <div className={`h-1 w-full bg-gradient-to-r ${chapter.gradient}`} />

          <div className="p-5">
            {/* Emoji + question count */}
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${chapter.accentBg} shrink-0`}>
                {chapter.emoji}
              </div>
              <span className="text-xs font-mono text-slate-400 pt-1.5 shrink-0">
                {total} Q&amp;As
              </span>
            </div>

            {/* Title */}
            <h3 className="font-bold text-slate-900 text-sm leading-snug mb-1.5 group-hover:text-indigo-700 transition-colors">
              {chapter.title}
            </h3>

            {/* Description */}
            <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 mb-4">
              {chapter.description}
            </p>

            {/* Progress bar — only shows when started */}
            <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${chapter.gradient} rounded-full transition-all duration-700`}
                style={{ width: `${pct}%` }}
              />
            </div>

            {completedCount > 0 && (
              <p className="text-xs text-slate-400 mt-1.5 font-medium">
                {completedCount}/{total} done{pct === 100 ? ' ✓' : ''}
              </p>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
