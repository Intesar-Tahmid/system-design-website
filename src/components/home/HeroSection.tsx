'use client'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Sparkles } from 'lucide-react'

const EXAMPLE_QUERIES = [
  'How does DNS work?',
  'What is the CAP theorem?',
  'How to design Twitter?',
  'What is consistent hashing?',
  'How does Redis work?',
  'What is a circuit breaker?',
  'How does JWT work?',
  'What is database sharding?',
  'How does Kafka differ from RabbitMQ?',
  'What happens when you type a URL?',
]

const FLOATING_CHIPS = [
  { label: 'DNS', color: 'bg-blue-100 text-blue-600 border-blue-200' },
  { label: 'Redis', color: 'bg-rose-100 text-rose-600 border-rose-200' },
  { label: 'Kafka', color: 'bg-orange-100 text-orange-600 border-orange-200' },
  { label: 'gRPC', color: 'bg-emerald-100 text-emerald-600 border-emerald-200' },
  { label: 'CAP', color: 'bg-violet-100 text-violet-600 border-violet-200' },
  { label: 'Docker', color: 'bg-sky-100 text-sky-600 border-sky-200' },
  { label: 'JWT', color: 'bg-amber-100 text-amber-600 border-amber-200' },
  { label: 'WebSocket', color: 'bg-teal-100 text-teal-600 border-teal-200' },
  { label: 'CDN', color: 'bg-pink-100 text-pink-600 border-pink-200' },
  { label: 'ACID', color: 'bg-indigo-100 text-indigo-600 border-indigo-200' },
  { label: 'Kubernetes', color: 'bg-lime-100 text-lime-700 border-lime-200' },
  { label: 'GraphQL', color: 'bg-fuchsia-100 text-fuchsia-600 border-fuchsia-200' },
  { label: 'Raft', color: 'bg-cyan-100 text-cyan-600 border-cyan-200' },
  { label: 'MLOps', color: 'bg-purple-100 text-purple-600 border-purple-200' },
]

// Deterministic positions to avoid hydration mismatch
const CHIP_POSITIONS = [
  { left: '4%',  top: '18%' },
  { left: '88%', top: '12%' },
  { left: '2%',  top: '62%' },
  { left: '91%', top: '55%' },
  { left: '8%',  top: '82%' },
  { left: '83%', top: '80%' },
  { left: '20%', top: '8%'  },
  { left: '72%', top: '6%'  },
  { left: '16%', top: '88%' },
  { left: '76%', top: '88%' },
  { left: '1%',  top: '38%' },
  { left: '92%', top: '35%' },
  { left: '38%', top: '4%'  },
  { left: '58%', top: '92%' },
]

const FLOAT_DELAYS = [0, 0.8, 1.6, 0.4, 1.2, 2.0, 0.6, 1.4, 0.2, 1.0, 1.8, 0.3, 1.1, 1.7]

interface HeroSectionProps {
  totalQuestions: number
  totalChapters: number
  onSearchOpen?: () => void
}

export function HeroSection({ totalQuestions, totalChapters, onSearchOpen }: HeroSectionProps) {
  const [queryIndex, setQueryIndex] = useState(0)

  // Cycle through example queries with crossfade
  useEffect(() => {
    const cycle = setInterval(() => {
      setTimeout(() => {
        setQueryIndex(i => (i + 1) % EXAMPLE_QUERIES.length)
      }, 300)
    }, 2800)
    return () => clearInterval(cycle)
  }, [])

  return (
    <div className="relative overflow-hidden bg-white border-b border-slate-200" style={{ minHeight: '520px' }}>

      {/* Dot grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, #c7d2fe 1px, transparent 1px)',
          backgroundSize: '30px 30px',
          opacity: 0.55,
        }}
      />

      {/* Fade out dot grid toward center */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 70% 60% at 50% 50%, white 30%, transparent 100%)',
        }}
      />

      {/* Floating topic chips — decorative only */}
      {FLOATING_CHIPS.map((chip, i) => (
        <motion.div
          key={chip.label}
          className={`absolute hidden lg:flex items-center text-xs font-semibold font-mono px-2.5 py-1 rounded-lg border pointer-events-none select-none ${chip.color}`}
          style={{ left: CHIP_POSITIONS[i].left, top: CHIP_POSITIONS[i].top }}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: [0.55, 0.85, 0.55], y: [0, -6, 0] }}
          transition={{
            opacity: { duration: 3.5, delay: FLOAT_DELAYS[i], repeat: Infinity, ease: 'easeInOut' },
            y: { duration: 3.5, delay: FLOAT_DELAYS[i], repeat: Infinity, ease: 'easeInOut' },
          }}
        >
          {chip.label}
        </motion.div>
      ))}

      {/* Content */}
      <div className="relative max-w-2xl mx-auto px-4 sm:px-6 py-20 sm:py-28 text-center">

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="inline-flex items-center gap-1.5 text-xs font-mono font-medium text-indigo-600 bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded-full mb-7"
        >
          <Sparkles size={11} className="fill-indigo-400 stroke-indigo-400" />
          {totalQuestions} Q&amp;As · {totalChapters} topics · zero hand-waving
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.1 }}
          className="text-5xl sm:text-6xl lg:text-[4.25rem] font-extrabold text-slate-900 tracking-tight leading-[1.08] mb-5"
        >
          System design,{' '}
          <span
            className="bg-clip-text text-transparent"
            style={{ backgroundImage: 'linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%)' }}
          >
            explained.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-lg text-slate-500 leading-relaxed mb-10 max-w-lg mx-auto"
        >
          From &ldquo;what happens when you type a URL&rdquo; to designing systems that handle a billion users.
          Real answers, real code.
        </motion.p>

        {/* Search bar — the main CTA */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <button
            onClick={onSearchOpen}
            className="w-full max-w-md mx-auto flex items-center gap-3 px-5 py-4 bg-white border-2 border-slate-200 rounded-2xl shadow-sm hover:shadow-md hover:border-indigo-300 transition-all text-left group"
          >
            <Search size={18} className="text-slate-400 group-hover:text-indigo-500 transition-colors shrink-0" />
            <span className="flex-1 text-sm overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.span
                  key={queryIndex}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.25 }}
                  className="block text-slate-400"
                >
                  {EXAMPLE_QUERIES[queryIndex]}
                </motion.span>
              </AnimatePresence>
            </span>
            <kbd className="hidden sm:flex items-center gap-0.5 bg-slate-100 text-slate-500 text-xs px-2 py-1 rounded-lg font-mono shrink-0 border border-slate-200">
              ⌘K
            </kbd>
          </button>
        </motion.div>

        {/* Jump links */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 mt-7 text-sm"
        >
          <span className="text-slate-400 text-xs font-medium">Jump to →</span>
          {['DNS', 'CAP theorem', 'Redis', 'Kafka', 'JWT', 'Docker', 'Sharding'].map(tag => (
            <button
              key={tag}
              onClick={onSearchOpen}
              className="text-indigo-500 hover:text-indigo-700 font-medium text-xs hover:underline underline-offset-2 transition-colors"
            >
              {tag}
            </button>
          ))}
        </motion.div>
      </div>
    </div>
  )
}
