'use client'
import { motion } from 'framer-motion'
import { RotateCcw } from 'lucide-react'

interface FlashCardProps {
  questionId: number
  title: string
  chapter: string
  gradient?: string
  isFlipped?: boolean
  isNew?: boolean
  onClick: () => void
}

export function FlashCard({
  questionId,
  title,
  chapter,
  gradient = 'from-indigo-500 to-purple-600',
  isFlipped = false,
  isNew = false,
  onClick,
}: FlashCardProps) {
  return (
    <motion.div
      className="relative w-full bg-white rounded-3xl border border-slate-200 shadow-xl flex flex-col cursor-pointer select-none overflow-hidden"
      style={{ minHeight: '420px' }}
      animate={{ opacity: isFlipped ? 0.4 : 1, scale: isFlipped ? 0.97 : 1 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label="Click to reveal answer"
      onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && onClick()}
    >
      {/* Top gradient stripe */}
      <div className={`h-1.5 w-full bg-gradient-to-r ${gradient} flex-shrink-0`} />

      {/* Header row */}
      <div className="flex items-center justify-between px-6 pt-5 pb-2 flex-shrink-0">
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold text-white bg-gradient-to-r ${gradient}`}>
          {chapter}
        </span>
        <div className="flex items-center gap-2">
          {isNew && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200">
              NEW
            </span>
          )}
          <span className="text-xs font-mono text-slate-400 bg-slate-50 px-2 py-0.5 rounded-lg">Q{questionId}</span>
        </div>
      </div>

      {/* Question — vertically centred */}
      <div className="flex-1 flex items-center justify-center px-8 py-6">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 text-center leading-snug">
          {title}
        </h2>
      </div>

      {/* Hint */}
      <div className="px-6 pb-6 flex justify-center flex-shrink-0">
        <div className="flex items-center gap-2 text-xs text-slate-400 border border-slate-200 rounded-full px-4 py-1.5 bg-slate-50">
          <RotateCcw size={11} className="opacity-60" />
          <span>Click or press Space to reveal answer</span>
        </div>
      </div>
    </motion.div>
  )
}
