'use client'
import { motion } from 'framer-motion'
import { Bookmark } from 'lucide-react'

interface BookmarkButtonProps {
  isBookmarked: boolean
  onToggle: () => void
  size?: number
}

export function BookmarkButton({ isBookmarked, onToggle, size = 18 }: BookmarkButtonProps) {
  return (
    <motion.button
      onClick={onToggle}
      whileTap={{ scale: 0.85 }}
      className="relative p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
      title={isBookmarked ? 'Remove bookmark' : 'Bookmark this question'}
    >
      <motion.div
        animate={isBookmarked ? { scale: [1, 1.3, 1] } : {}}
        transition={{ duration: 0.3 }}
      >
        <Bookmark
          size={size}
          className={isBookmarked ? 'fill-amber-400 stroke-amber-400' : 'stroke-slate-400'}
        />
      </motion.div>
    </motion.button>
  )
}
