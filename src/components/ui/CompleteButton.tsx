'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, Circle } from 'lucide-react'

interface CompleteButtonProps {
  isCompleted: boolean
  onToggle: () => void
}

export function CompleteButton({ isCompleted, onToggle }: CompleteButtonProps) {
  const [justCompleted, setJustCompleted] = useState(false)

  const handleClick = () => {
    if (!isCompleted) {
      setJustCompleted(true)
      setTimeout(() => setJustCompleted(false), 1200)
    }
    onToggle()
  }

  return (
    <div className="relative">
      <motion.button
        onClick={handleClick}
        whileTap={{ scale: 0.88 }}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
          isCompleted
            ? 'bg-green-100 text-green-700 hover:bg-green-200'
            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
        }`}
      >
        <AnimatePresence mode="wait">
          {isCompleted ? (
            <motion.div
              key="done"
              initial={{ scale: 0, rotate: -30 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            >
              <CheckCircle2 size={16} className="text-green-600" />
            </motion.div>
          ) : (
            <motion.div
              key="undone"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ duration: 0.15 }}
            >
              <Circle size={16} className="text-slate-400" />
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence mode="wait">
          <motion.span
            key={isCompleted ? 'c' : 'u'}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
          >
            {isCompleted ? 'Completed' : 'Mark complete'}
          </motion.span>
        </AnimatePresence>
      </motion.button>

      {/* Burst ring on first completion */}
      <AnimatePresence>
        {justCompleted && (
          <motion.span
            key="burst"
            className="absolute inset-0 rounded-lg border-2 border-green-400 pointer-events-none"
            initial={{ opacity: 1, scale: 1 }}
            animate={{ opacity: 0, scale: 1.6 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.55, ease: 'easeOut' }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
