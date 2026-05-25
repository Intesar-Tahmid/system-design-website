'use client'
import { useEffect } from 'react'
import { motion } from 'framer-motion'
import type { RatingLabel } from '@/lib/spaced-repetition'

interface ButtonConfig {
  label: RatingLabel
  display: string
  key: string
  description: string
  classes: string
  textClass: string
}

const BUTTONS: ButtonConfig[] = [
  {
    label: 'again',
    display: 'Again',
    key: '1',
    description: 'Complete blackout',
    classes: 'bg-red-50 border-red-200 hover:bg-red-100 hover:border-red-300',
    textClass: 'text-red-700',
  },
  {
    label: 'hard',
    display: 'Hard',
    key: '2',
    description: 'Significant difficulty',
    classes: 'bg-orange-50 border-orange-200 hover:bg-orange-100 hover:border-orange-300',
    textClass: 'text-orange-700',
  },
  {
    label: 'good',
    display: 'Good',
    key: '3',
    description: 'Correct with effort',
    classes: 'bg-blue-50 border-blue-200 hover:bg-blue-100 hover:border-blue-300',
    textClass: 'text-blue-700',
  },
  {
    label: 'easy',
    display: 'Easy',
    key: '4',
    description: 'Perfect recall',
    classes: 'bg-emerald-50 border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300',
    textClass: 'text-emerald-700',
  },
]

interface ReviewButtonsProps {
  onRate: (label: RatingLabel) => void
  disabled?: boolean
  isVisible: boolean
}

export function ReviewButtons({ onRate, disabled = false, isVisible }: ReviewButtonsProps) {
  useEffect(() => {
    if (!isVisible || disabled) return
    const handler = (e: KeyboardEvent) => {
      const btn = BUTTONS.find(b => b.key === e.key)
      if (btn) { e.preventDefault(); onRate(btn.label) }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isVisible, disabled, onRate])

  if (!isVisible) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="grid grid-cols-4 gap-2 w-full"
    >
      {BUTTONS.map(btn => (
        <motion.button
          key={btn.label}
          onClick={() => !disabled && onRate(btn.label)}
          disabled={disabled}
          whileTap={{ scale: 0.94 }}
          className={`
            flex flex-col items-center gap-1 px-2 py-3 rounded-2xl border-2 transition-colors
            ${btn.classes}
            ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
          `}
        >
          <span className={`text-sm font-bold ${btn.textClass}`}>{btn.display}</span>
          <span className="text-[10px] text-slate-500 text-center leading-tight hidden sm:block">{btn.description}</span>
          <kbd className="text-[10px] bg-white/80 border border-slate-200 rounded px-1.5 py-0.5 font-mono text-slate-400">
            {btn.key}
          </kbd>
        </motion.button>
      ))}
    </motion.div>
  )
}
