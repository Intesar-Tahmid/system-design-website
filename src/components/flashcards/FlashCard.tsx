'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import { CodeBlock } from '@/components/ui/CodeBlock'
import { RotateCcw } from 'lucide-react'

interface FlashCardProps {
  questionId: number
  title: string
  chapter: string
  content: string
  gradient?: string
  onFlip?: () => void
  isNew?: boolean
}

export function FlashCard({
  questionId,
  title,
  chapter,
  content,
  gradient = 'from-indigo-500 to-purple-600',
  onFlip,
  isNew = false,
}: FlashCardProps) {
  const [isFlipped, setIsFlipped] = useState(false)

  const handleFlip = () => {
    const next = !isFlipped
    setIsFlipped(next)
    if (next) onFlip?.()
  }

  return (
    <div
      className="relative w-full select-none"
      style={{ perspective: '1400px', minHeight: '420px' }}
      onClick={handleFlip}
      role="button"
      tabIndex={0}
      aria-label={isFlipped ? 'Click to see question' : 'Click to reveal answer'}
      onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && handleFlip()}
    >
      <motion.div
        className="relative w-full h-full"
        style={{ transformStyle: 'preserve-3d' }}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      >
        {/* FRONT */}
        <div
          className="absolute inset-0 w-full bg-white rounded-3xl border border-slate-200 shadow-xl flex flex-col cursor-pointer"
          style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', minHeight: '420px' }}
        >
          {/* Top stripe */}
          <div className={`h-1.5 rounded-t-3xl bg-gradient-to-r ${gradient} flex-shrink-0`} />

          <div className="flex items-center justify-between px-6 pt-5 pb-2 flex-shrink-0">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold text-white bg-gradient-to-r ${gradient}`}>
              {chapter}
            </span>
            <div className="flex items-center gap-2">
              {isNew && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200">
                  NEW
                </span>
              )}
              <span className="text-xs font-mono text-slate-400 bg-slate-50 px-2 py-0.5 rounded-lg">Q{questionId}</span>
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center px-8 py-6">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 text-center leading-snug">
              {title}
            </h2>
          </div>

          <div className="px-6 pb-6 flex justify-center flex-shrink-0">
            <div className="flex items-center gap-2 text-xs text-slate-400 border border-slate-200 rounded-full px-4 py-1.5 bg-slate-50">
              <RotateCcw size={11} className="opacity-60" />
              <span>Click or press Space to reveal answer</span>
            </div>
          </div>
        </div>

        {/* BACK */}
        <div
          className="absolute inset-0 w-full bg-white rounded-3xl border border-slate-200 shadow-xl flex flex-col overflow-hidden cursor-pointer"
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            minHeight: '420px',
          }}
        >
          <div className={`h-1.5 rounded-t-3xl bg-gradient-to-r ${gradient} flex-shrink-0`} />

          <div className="flex items-center justify-between px-6 py-3 border-b border-slate-100 flex-shrink-0">
            <span className="text-xs font-mono text-slate-400">Q{questionId} — Answer</span>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold text-white bg-gradient-to-r ${gradient}`}>
              {chapter}
            </span>
          </div>

          <div
            className="flex-1 overflow-y-auto px-6 py-4"
            onClick={e => e.stopPropagation()}
          >
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw]}
              components={{
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                code({ className, children, ...props }: any) {
                  const match = /language-(\w+)/.exec(className || '')
                  const codeStr = String(children).replace(/\n$/, '')
                  const isBlock = !!match || codeStr.includes('\n')
                  if (isBlock) {
                    return <CodeBlock code={codeStr} language={match?.[1] ?? ''} />
                  }
                  return (
                    <code
                      className="bg-slate-100 text-rose-600 px-1.5 py-0.5 rounded text-[0.8em] font-mono"
                      {...props}
                    >
                      {children}
                    </code>
                  )
                },
                pre({ children }) { return <>{children}</> },
                h3({ children }) { return <h3 className="text-sm font-bold text-slate-800 mt-4 mb-1">{children}</h3> },
                p({ children }) { return <p className="text-sm text-slate-700 leading-relaxed mb-2">{children}</p> },
                ul({ children }) { return <ul className="text-sm text-slate-700 list-disc pl-4 mb-2 space-y-0.5">{children}</ul> },
                ol({ children }) { return <ol className="text-sm text-slate-700 list-decimal pl-4 mb-2 space-y-0.5">{children}</ol> },
                li({ children }) { return <li className="leading-relaxed">{children}</li> },
                strong({ children }) { return <strong className="font-semibold text-slate-900">{children}</strong> },
                table({ children }) { return <div className="overflow-x-auto mb-3"><table className="text-xs border-collapse w-full">{children}</table></div> },
                th({ children }) { return <th className="border border-slate-200 bg-slate-50 px-2 py-1 text-left font-semibold text-slate-700">{children}</th> },
                td({ children }) { return <td className="border border-slate-200 px-2 py-1 text-slate-600">{children}</td> },
              }}
            >
              {content}
            </ReactMarkdown>
          </div>

          <div className="px-6 py-3 border-t border-slate-100 flex-shrink-0">
            <p className="text-[11px] text-slate-400 text-center">Rate how well you knew this ↓</p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
