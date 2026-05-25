'use client'
import { motion } from 'framer-motion'
import { Flame, BookOpen, CalendarCheck, Target } from 'lucide-react'

interface DeckStatsProps {
  streak: number
  retentionRate: number
  totalReviews: number
  dueToday: number
  isLoading?: boolean
}

function RetentionRing({ percentage }: { percentage: number }) {
  const r = 26
  const circ = 2 * Math.PI * r
  const offset = circ - (percentage / 100) * circ

  return (
    <svg width="68" height="68" className="-rotate-90" aria-hidden>
      <circle cx="34" cy="34" r={r} fill="none" stroke="#e2e8f0" strokeWidth="5" />
      <motion.circle
        cx="34" cy="34" r={r}
        fill="none"
        stroke="url(#retGrad)"
        strokeWidth="5"
        strokeLinecap="round"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.3, ease: 'easeOut', delay: 0.2 }}
      />
      <defs>
        <linearGradient id="retGrad" x1="0%" y1="0%" x2="100%">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#a855f7" />
        </linearGradient>
      </defs>
    </svg>
  )
}

export function DeckStats({ streak, retentionRate, totalReviews, dueToday, isLoading }: DeckStatsProps) {
  const cards = [
    { icon: Flame,         label: 'Day Streak',     value: streak,       unit: 'days', iconColor: 'text-orange-500', bg: 'bg-orange-50' },
    { icon: BookOpen,      label: 'Total Reviews',  value: totalReviews, unit: '',     iconColor: 'text-blue-500',   bg: 'bg-blue-50' },
    { icon: CalendarCheck, label: 'Due Today',       value: dueToday,     unit: '',     iconColor: 'text-indigo-500', bg: 'bg-indigo-50' },
  ]

  const shimmer = 'bg-slate-100 animate-pulse rounded-xl h-5 w-12'

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {/* Retention ring */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex flex-col items-center gap-2">
        <div className="relative">
          <RetentionRing percentage={isLoading ? 0 : retentionRate} />
          <div className="absolute inset-0 flex items-center justify-center rotate-90">
            <span className="text-sm font-bold text-slate-800">
              {isLoading ? '—' : `${retentionRate}%`}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Target size={11} className="text-purple-500" />
          <span className="text-[11px] text-slate-500 font-medium">Retention</span>
        </div>
      </div>

      {cards.map(c => (
        <div key={c.label} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
          <div className={`w-8 h-8 ${c.bg} rounded-xl flex items-center justify-center mb-2`}>
            <c.icon size={15} className={c.iconColor} />
          </div>
          {isLoading
            ? <div className={shimmer} />
            : <div className="text-2xl font-extrabold text-slate-900 tabular-nums">{c.value}</div>
          }
          <div className="text-[11px] text-slate-500 mt-0.5">{c.label}</div>
        </div>
      ))}
    </div>
  )
}
