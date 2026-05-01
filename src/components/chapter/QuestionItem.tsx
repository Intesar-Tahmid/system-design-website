'use client'
import React from 'react'
import { motion } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Question } from '@/types'
import { BookmarkButton } from '@/components/ui/BookmarkButton'
import { CompleteButton } from '@/components/ui/CompleteButton'
import { CodeBlock } from '@/components/ui/CodeBlock'

interface QuestionItemProps {
  question: Question
  isCompleted: boolean
  isBookmarked: boolean
  onToggleComplete: (id: number) => void
  onToggleBookmark: (id: number) => void
}

export function QuestionItem({
  question,
  isCompleted,
  isBookmarked,
  onToggleComplete,
  onToggleBookmark,
}: QuestionItemProps) {
  return (
    <motion.div
      id={`q${question.id}`}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all ${
        isCompleted ? 'border-green-200' : 'border-slate-200'
      }`}
    >
      {/* Question header */}
      <div className={`px-5 sm:px-6 py-4 border-b flex items-start gap-3 ${isCompleted ? 'border-green-100 bg-green-50/50' : 'border-slate-100 bg-slate-50'}`}>
        {/* Q number badge */}
        <div className={`shrink-0 w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm ${
          isCompleted ? 'bg-green-500 text-white' : 'bg-indigo-100 text-indigo-700'
        }`}>
          {question.id}
        </div>

        <div className="flex-1 min-w-0">
          <h2 className="font-bold text-slate-900 text-base leading-snug">
            {question.title}
          </h2>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1 shrink-0">
          <BookmarkButton
            isBookmarked={isBookmarked}
            onToggle={() => onToggleBookmark(question.id)}
          />
        </div>
      </div>

      {/* Answer content */}
      <div className="px-5 sm:px-6 py-5">
        <div className="prose-custom">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              code({ className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || '')
                const codeStr = String(children).replace(/\n$/, '')
                // Block code (has language class or is multiline)
                const isBlock = !!match || codeStr.includes('\n')
                if (isBlock) {
                  return <CodeBlock code={codeStr} language={match ? match[1] : ''} />
                }
                // Inline code
                return (
                  <code className="bg-slate-100 text-rose-600 px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
                    {children}
                  </code>
                )
              },
              pre({ children }) {
                // pre is handled by CodeBlock already
                return <>{children}</>
              },
              table({ children }) {
                return (
                  <div className="overflow-x-auto my-4">
                    <table className="w-full text-sm border-collapse">{children}</table>
                  </div>
                )
              },
              th({ children }) {
                return <th className="bg-slate-100 px-3 py-2 text-left font-semibold border border-slate-200 text-slate-800">{children}</th>
              },
              td({ children }) {
                return <td className="px-3 py-2 border border-slate-200 text-slate-700">{children}</td>
              },
            }}
          >
            {question.content}
          </ReactMarkdown>
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 sm:px-6 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
        <span className="text-xs text-slate-400">Q{question.id} · {question.chapter}</span>
        <CompleteButton
          isCompleted={isCompleted}
          onToggle={() => onToggleComplete(question.id)}
        />
      </div>
    </motion.div>
  )
}
