'use client'
import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence, useInView, useMotionValue, useSpring } from 'framer-motion'
import { Search, Sparkles, Database, Cloud, Brain, Shield, Cpu, Network } from 'lucide-react'

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

const CATEGORY_STATS = [
  { label: 'System Design', count: 95, icon: Network,   color: 'from-indigo-500 to-blue-500',   bg: 'bg-indigo-50',   text: 'text-indigo-600',   bar: 'bg-indigo-500' },
  { label: 'ML / AI',       count: 88, icon: Brain,      color: 'from-purple-500 to-violet-500', bg: 'bg-purple-50',   text: 'text-purple-600',   bar: 'bg-purple-500' },
  { label: 'DevOps / Infra', count: 72, icon: Cloud,     color: 'from-sky-500 to-cyan-500',      bg: 'bg-sky-50',      text: 'text-sky-600',      bar: 'bg-sky-500' },
  { label: 'Databases',     count: 58, icon: Database,   color: 'from-emerald-500 to-teal-500',  bg: 'bg-emerald-50',  text: 'text-emerald-600',  bar: 'bg-emerald-500' },
  { label: 'Security',      count: 34, icon: Shield,     color: 'from-rose-500 to-pink-500',     bg: 'bg-rose-50',     text: 'text-rose-600',     bar: 'bg-rose-500' },
  { label: 'Distributed',   count: 57, icon: Cpu,        color: 'from-amber-500 to-orange-500',  bg: 'bg-amber-50',    text: 'text-amber-600',    bar: 'bg-amber-500' },
]

const FILE_BREAKDOWN = [
  { label: 'Foundations',    count: 99,  color: 'bg-indigo-500' },
  { label: 'DevOps & MLOps', count: 100, color: 'bg-purple-500' },
  { label: 'Advanced',       count: 88,  color: 'bg-emerald-500' },
  { label: 'Deep Dives',     count: 117, color: 'bg-amber-500' },
]

function AnimatedNumber({ target, duration = 1.4 }: { target: number; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })
  const motionVal = useMotionValue(0)
  const spring = useSpring(motionVal, { duration: duration * 1000, bounce: 0 })
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    if (isInView) motionVal.set(target)
  }, [isInView, target, motionVal])

  useEffect(() => {
    return spring.on('change', v => setDisplay(Math.round(v)))
  }, [spring])

  return <span ref={ref}>{display}</span>
}

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

      {/* ── Analytics Strip ─────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.65 }}
        className="relative max-w-5xl mx-auto px-4 sm:px-6 pb-14"
      >
        {/* Section label */}
        <div className="flex items-center gap-3 mb-6">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent to-slate-200" />
          <span className="text-[11px] font-mono font-semibold text-slate-400 tracking-widest uppercase">Content breakdown</span>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent to-slate-200" />
        </div>

        {/* Top row: total counter + file distribution */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">

          {/* Total counter card */}
          <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/60 to-purple-50/40 pointer-events-none" />
            <div className="relative">
              <p className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider mb-1">Total Q&amp;As</p>
              <div className="flex items-end gap-2">
                <span className="text-5xl font-extrabold tracking-tight bg-clip-text text-transparent"
                  style={{ backgroundImage: 'linear-gradient(135deg, #6366f1 0%, #a855f7 60%, #ec4899 100%)' }}>
                  <AnimatedNumber target={totalQuestions} duration={1.6} />
                </span>
                <span className="text-slate-400 text-sm font-medium mb-1.5">questions</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                across <span className="font-semibold text-slate-700">{totalChapters} chapters</span> · 4 volumes
              </p>
            </div>
          </div>

          {/* File distribution card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider mb-3">Volume distribution</p>
            <div className="space-y-2.5">
              {FILE_BREAKDOWN.map((file, i) => (
                <div key={file.label}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-slate-600">{file.label}</span>
                    <span className="text-xs font-mono font-semibold text-slate-500">{file.count}</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full ${file.color}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${(file.count / totalQuestions) * 100}%` }}
                      transition={{ duration: 1, delay: 0.8 + i * 0.12, ease: 'easeOut' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Category grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {CATEGORY_STATS.map((cat, i) => {
            const Icon = cat.icon
            const maxCount = Math.max(...CATEGORY_STATS.map(c => c.count))
            return (
              <motion.div
                key={cat.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.75 + i * 0.08 }}
                whileHover={{ y: -3, transition: { duration: 0.2 } }}
                className={`relative overflow-hidden rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm cursor-default`}
              >
                {/* Gradient blob */}
                <div className={`absolute -top-4 -right-4 w-14 h-14 rounded-full bg-gradient-to-br ${cat.color} opacity-10 pointer-events-none`} />

                <div className={`inline-flex items-center justify-center w-7 h-7 rounded-lg ${cat.bg} mb-2.5`}>
                  <Icon size={14} className={cat.text} />
                </div>

                <div className={`text-xl font-extrabold ${cat.text} tabular-nums leading-none mb-0.5`}>
                  <AnimatedNumber target={cat.count} duration={1.2} />
                </div>

                <p className="text-[10px] font-medium text-slate-500 leading-tight mb-2">{cat.label}</p>

                {/* Mini bar */}
                <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${cat.bar}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${(cat.count / maxCount) * 100}%` }}
                    transition={{ duration: 0.9, delay: 0.9 + i * 0.1, ease: 'easeOut' }}
                  />
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Source books strip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1.2 }}
          className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-5"
        >
          <span className="text-[11px] font-mono text-slate-400">Sources:</span>
          {[
            { emoji: '📘', label: 'Alex Xu Vol. 1 & 2' },
            { emoji: '📙', label: 'Designing Data-Intensive Apps' },
            { emoji: '✍️', label: 'Expert-authored' },
          ].map(src => (
            <span key={src.label} className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
              <span>{src.emoji}</span>
              {src.label}
            </span>
          ))}
        </motion.div>
      </motion.div>
    </div>
  )
}
