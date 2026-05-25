'use client'
import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import { CodeBlock } from '@/components/ui/CodeBlock'
import { ChevronDown } from 'lucide-react'
import { ReviewButtons } from './ReviewButtons'
import type { RatingLabel } from '@/lib/spaced-repetition'

interface AnswerOverlayProps {
  questionId: number
  title: string
  chapter: string
  content: string
  gradient?: string
  onRate: (label: RatingLabel) => void
  onClose: () => void
  isSubmitting: boolean
}

export function AnswerOverlay({
  questionId,
  title,
  chapter,
  content,
  gradient = 'from-indigo-500 to-purple-600',
  onRate,
  onClose,
  isSubmitting,
}: AnswerOverlayProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  // Scroll answer back to top whenever a new card is shown
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 })
  }, [questionId])

  return (
    // Backdrop — clicking it collapses back to question
    <motion.div
      className="fixed inset-0 z-50 flex flex-col justify-end"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      style={{ background: 'rgba(15, 23, 42, 0.45)', backdropFilter: 'blur(2px)' }}
      onClick={onClose}
    >
      {/* Panel — stops click propagation so tapping inside doesn't close */}
      <motion.div
        className="relative bg-white flex flex-col overflow-hidden"
        style={{ borderRadius: '24px 24px 0 0', maxHeight: '92vh', height: '92vh' }}
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 320, damping: 38, mass: 0.9 }}
        onClick={e => e.stopPropagation()}
      >
        {/* Gradient top bar */}
        <div className={`h-1 w-full bg-gradient-to-r ${gradient} flex-shrink-0`} />

        {/* Drag handle */}
        <button
          onClick={onClose}
          className="flex items-center justify-center gap-1.5 pt-3 pb-1 text-slate-400 hover:text-slate-600 transition-colors group flex-shrink-0"
          aria-label="Close answer"
        >
          <ChevronDown size={18} className="group-hover:translate-y-0.5 transition-transform" />
          <span className="text-xs font-medium">back to question</span>
        </button>

        {/* Question recap header */}
        <div className="px-5 pt-2 pb-4 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-2 mb-2">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold text-white bg-gradient-to-r ${gradient}`}>
              {chapter}
            </span>
            <span className="text-xs font-mono text-slate-400 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-100">
              Q{questionId}
            </span>
          </div>
          <h3 className="text-base font-semibold text-slate-800 leading-snug line-clamp-2">
            {title}
          </h3>
        </div>

        {/* Answer body — scrollable */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-5 py-5 sm:px-8"
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
                if (isBlock) return <CodeBlock code={codeStr} language={match?.[1] ?? ''} />
                return (
                  <code className="bg-slate-100 text-rose-600 px-1.5 py-0.5 rounded text-[0.85em] font-mono" {...props}>
                    {children}
                  </code>
                )
              },
              pre({ children }) { return <>{children}</> },
              h2({ children }) { return <h2 className="text-lg font-bold text-slate-900 mt-6 mb-2 pb-1 border-b border-slate-100">{children}</h2> },
              h3({ children }) { return <h3 className="text-base font-bold text-slate-800 mt-5 mb-1.5">{children}</h3> },
              h4({ children }) { return <h4 className="text-sm font-semibold text-slate-700 mt-3 mb-1">{children}</h4> },
              p({ children }) { return <p className="text-[15px] text-slate-700 leading-relaxed mb-3">{children}</p> },
              ul({ children }) { return <ul className="text-[15px] text-slate-700 list-disc pl-5 mb-3 space-y-1">{children}</ul> },
              ol({ children }) { return <ol className="text-[15px] text-slate-700 list-decimal pl-5 mb-3 space-y-1">{children}</ol> },
              li({ children }) { return <li className="leading-relaxed">{children}</li> },
              strong({ children }) { return <strong className="font-semibold text-slate-900">{children}</strong> },
              blockquote({ children }) { return <blockquote className="border-l-3 border-indigo-300 pl-4 my-3 text-slate-600 italic">{children}</blockquote> },
              table({ children }) { return <div className="overflow-x-auto mb-4 rounded-xl border border-slate-200"><table className="text-sm border-collapse w-full">{children}</table></div> },
              thead({ children }) { return <thead className="bg-slate-50">{children}</thead> },
              th({ children }) { return <th className="border-b border-slate-200 px-4 py-2.5 text-left font-semibold text-slate-700 text-xs uppercase tracking-wide">{children}</th> },
              td({ children }) { return <td className="border-b border-slate-100 px-4 py-2.5 text-slate-600">{children}</td> },
              hr() { return <hr className="my-5 border-slate-100" /> },
            }}
          >
            {content}
          </ReactMarkdown>

          {/* Bottom breathing room so last line isn't hidden behind rating bar */}
          <div className="h-4" />
        </div>

        {/* Rating bar — pinned to bottom */}
        <div className="flex-shrink-0 border-t border-slate-100 bg-white px-4 pt-3 pb-4 sm:px-6">
          <p className="text-[11px] text-slate-400 text-center mb-2.5 font-medium tracking-wide uppercase">
            How well did you know this?
          </p>
          <ReviewButtons onRate={onRate} disabled={isSubmitting} isVisible={true} />
        </div>
      </motion.div>
    </motion.div>
  )
}
