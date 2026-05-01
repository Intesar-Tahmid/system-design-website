'use client'
import { motion } from 'framer-motion'
import { CheckCircle2, Circle } from 'lucide-react'

interface CompleteButtonProps {
  isCompleted: boolean
  onToggle: () => void
}

export function CompleteButton({ isCompleted, onToggle }: CompleteButtonProps) {
  return (
    <motion.button
      onClick={onToggle}
      whileTap={{ scale: 0.9 }}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
        isCompleted
          ? 'bg-green-100 text-green-700 hover:bg-green-200'
          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
      }`}
    >
      <motion.div
        animate={isCompleted ? { rotate: [0, -10, 10, 0], scale: [1, 1.2, 1] } : {}}
        transition={{ duration: 0.4 }}
      >
        {isCompleted ? (
          <CheckCircle2 size={16} className="text-green-600" />
        ) : (
          <Circle size={16} className="text-slate-400" />
        )}
      </motion.div>
      {isCompleted ? 'Completed' : 'Mark complete'}
    </motion.button>
  )
}
