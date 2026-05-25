'use client'
import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FlashCard } from './FlashCard'
import { ReviewButtons } from './ReviewButtons'
import { QUALITY_MAP, calculateSM2, initialSM2State, type RatingLabel, type StoredSM2State } from '@/lib/spaced-repetition'
import { ArrowLeft, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

export interface StudyCard {
  questionId: number
  title: string
  chapter: string
  chapterSlug: string
  content: string
  gradient?: string
  isNew: boolean
}

interface StudySessionProps {
  cards: StudyCard[]
  isAuthenticated: boolean
  onSessionComplete?: (reviewCount: number) => void
}

const SM2_STORAGE_KEY = 'sdm-sm2'

function loadLocalSM2(): Record<number, StoredSM2State> {
  try {
    return JSON.parse(localStorage.getItem(SM2_STORAGE_KEY) ?? '{}')
  } catch {
    return {}
  }
}

function saveLocalSM2(state: Record<number, StoredSM2State>) {
  localStorage.setItem(SM2_STORAGE_KEY, JSON.stringify(state))
}

export function StudySession({ cards, isAuthenticated, onSessionComplete }: StudySessionProps) {
  const [index, setIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [reviewedCount, setReviewedCount] = useState(0)
  const [direction, setDirection] = useState(1)

  const current = cards[index]
  const isComplete = index >= cards.length

  const handleRate = useCallback(async (label: RatingLabel) => {
    if (isSubmitting || !isFlipped || !current) return
    setIsSubmitting(true)

    const quality = QUALITY_MAP[label]

    if (isAuthenticated) {
      fetch('/api/flashcards/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionId: current.questionId, quality }),
      }).catch(() => {/* silent — optimistic */})
    } else {
      const store = loadLocalSM2()
      const existing = store[current.questionId]
      const state = existing
        ? { easeFactor: existing.easeFactor, intervalDays: existing.intervalDays, repetitions: existing.repetitions }
        : initialSM2State()
      const result = calculateSM2(quality, state)
      store[current.questionId] = {
        easeFactor: result.newEaseFactor,
        intervalDays: result.newInterval,
        repetitions: result.newRepetitions,
        nextReviewDate: result.nextReviewDate.toISOString().split('T')[0],
      }
      saveLocalSM2(store)
    }

    const next = reviewedCount + 1
    setReviewedCount(next)
    setDirection(1)
    await new Promise(r => setTimeout(r, 180))
    setIsFlipped(false)
    setIsSubmitting(false)

    if (index + 1 >= cards.length) {
      onSessionComplete?.(next)
      setIndex(cards.length) // triggers complete screen
    } else {
      setIndex(i => i + 1)
    }
  }, [isSubmitting, isFlipped, current, isAuthenticated, reviewedCount, index, cards.length, onSessionComplete])

  if (isComplete) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center gap-6 py-20 text-center"
      >
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg">
          <CheckCircle2 size={40} className="text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Session complete!</h2>
          <p className="text-slate-500 mt-1">You reviewed <span className="font-semibold text-slate-700">{reviewedCount} cards</span> this session.</p>
        </div>
        {!isAuthenticated && (
          <div className="bg-indigo-50 border border-indigo-200 rounded-2xl px-6 py-4 max-w-sm">
            <p className="text-sm text-indigo-700 font-medium mb-2">Want to save your progress?</p>
            <p className="text-xs text-indigo-600">Create a free account to sync reviews across devices and build a study streak.</p>
            <Link
              href="/auth?next=/flashcards"
              className="mt-3 inline-flex px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-colors"
            >
              Create account
            </Link>
          </div>
        )}
        <div className="flex gap-3">
          <Link
            href="/flashcards"
            className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-xl hover:bg-slate-50 transition-colors"
          >
            Back to dashboard
          </Link>
          <button
            onClick={() => { setIndex(0); setReviewedCount(0); setIsFlipped(false) }}
            className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity"
          >
            Study again
          </button>
        </div>
      </motion.div>
    )
  }

  const progress = (index / cards.length) * 100

  return (
    <div className="flex flex-col items-center gap-5 w-full max-w-2xl mx-auto px-4">
      {/* Header */}
      <div className="w-full flex items-center gap-3">
        <Link href="/flashcards" className="p-1.5 rounded-xl hover:bg-slate-100 transition-colors">
          <ArrowLeft size={16} className="text-slate-500" />
        </Link>
        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <span className="text-xs font-mono text-slate-400 shrink-0 tabular-nums">
          {index}/{cards.length}
        </span>
      </div>

      {/* Card with slide transition */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current.questionId}
          className="w-full"
          initial={{ opacity: 0, x: direction * 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: direction * -50 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
        >
          <FlashCard
            questionId={current.questionId}
            title={current.title}
            chapter={current.chapter}
            content={current.content}
            gradient={current.gradient}
            isNew={current.isNew}
            onFlip={() => setIsFlipped(true)}
          />
        </motion.div>
      </AnimatePresence>

      {/* Review buttons */}
      <ReviewButtons
        onRate={handleRate}
        disabled={isSubmitting}
        isVisible={isFlipped}
      />

      {!isFlipped && (
        <p className="text-xs text-slate-400 text-center">
          Think of your answer, then click the card to reveal it
        </p>
      )}
    </div>
  )
}
