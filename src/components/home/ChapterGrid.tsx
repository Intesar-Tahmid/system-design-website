import { Chapter } from '@/types'
import { ChapterCard } from './ChapterCard'

// Section metadata per file index
const SECTION_META: Record<number, { emoji: string; tagline: string; gradient: string }> = {
  1: { emoji: '🧱', tagline: 'The fundamentals every engineer needs to know',              gradient: 'from-blue-500 to-indigo-500'    },
  2: { emoji: '🛠️', tagline: 'Infrastructure, pipelines, and ML operations',               gradient: 'from-purple-500 to-fuchsia-500'  },
  3: { emoji: '🔭', tagline: 'Deep dives, patterns, and production systems',              gradient: 'from-emerald-500 to-teal-500'    },
  4: { emoji: '🧠', tagline: 'Theory, internals, and advanced architecture',              gradient: 'from-amber-500 to-orange-500'    },
  5: { emoji: '✨', tagline: 'Reinforcement learning and the full generative AI stack',   gradient: 'from-violet-500 to-fuchsia-500'  },
}

interface ChapterGroupProps {
  label: string
  subtitle: string
  chapters: Chapter[]
  startIndex: number
  fileIndex: number
}

export function ChapterGroup({ label, subtitle, chapters, startIndex, fileIndex }: ChapterGroupProps) {
  if (chapters.length === 0) return null

  const meta = SECTION_META[fileIndex] ?? { emoji: '📚', tagline: subtitle, gradient: 'from-slate-400 to-slate-500' }

  // Extract just the Part N number from label like "Part 1 — Foundations"
  const partMatch = label.match(/Part (\d+)/i)
  const partNum = partMatch ? partMatch[1] : ''
  // Extract the section name after the dash
  const sectionName = label.split('—')[1]?.trim() ?? label

  return (
    <section className="mb-16">
      {/* Section header */}
      <div className="flex items-center gap-4 mb-7">
        {/* Colored part number pill */}
        {partNum && (
          <div
            className={`hidden sm:flex items-center justify-center w-10 h-10 rounded-xl text-white font-extrabold text-sm shrink-0 bg-gradient-to-br ${meta.gradient} shadow-sm`}
            aria-hidden
          >
            {partNum}
          </div>
        )}

        <div className="flex-1 min-w-0">
          {/* Thin gradient rule above */}
          <div className={`h-px w-full bg-gradient-to-r ${meta.gradient} opacity-30 mb-3`} />

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-lg leading-none">{meta.emoji}</span>
            <h2 className="text-base font-extrabold text-slate-900 tracking-tight">{sectionName}</h2>
            <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
              {chapters.length} topics
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">{meta.tagline}</p>
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {chapters.map((chapter, i) => (
          <ChapterCard key={chapter.slug} chapter={chapter} index={startIndex + i} />
        ))}
      </div>
    </section>
  )
}
