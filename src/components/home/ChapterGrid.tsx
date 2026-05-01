import { Chapter } from '@/types'
import { ChapterCard } from './ChapterCard'

// Section labels & emojis per file index
const SECTION_META: Record<number, { emoji: string; tagline: string }> = {
  1: { emoji: '🧱', tagline: 'The fundamentals every engineer needs to know' },
  2: { emoji: '🛠️', tagline: 'Infrastructure, pipelines, and ML operations' },
  3: { emoji: '🔭', tagline: 'Deep dives, patterns, and production systems' },
  4: { emoji: '🧠', tagline: 'Theory, internals, and advanced architecture' },
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

  const meta = SECTION_META[fileIndex] ?? { emoji: '📚', tagline: subtitle }

  // Extract just the Part N number from label like "Part 1 — Foundations"
  const partMatch = label.match(/Part (\d+)/i)
  const partNum = partMatch ? partMatch[1] : ''
  // Extract the section name after the dash
  const sectionName = label.split('—')[1]?.trim() ?? label

  return (
    <section className="mb-16">
      {/* Section header */}
      <div className="flex items-start gap-4 mb-7">
        {/* Big muted part number */}
        {partNum && (
          <div
            className="hidden sm:flex items-center justify-center font-extrabold text-slate-100 text-5xl leading-none select-none tabular-nums shrink-0 w-14 pt-1"
            aria-hidden
          >
            {partNum}
          </div>
        )}
        <div className="flex-1 border-t border-slate-200 pt-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">{meta.emoji}</span>
            <h2 className="text-base font-bold text-slate-800 tracking-tight">{sectionName}</h2>
            <span className="ml-1 text-xs font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
              {chapters.length} topics
            </span>
          </div>
          <p className="text-sm text-slate-500">{meta.tagline}</p>
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
