'use client'
import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Search, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { Question } from '@/types'
import { search, buildSearchIndex } from '@/lib/search'

interface SearchModalProps {
  questions: Question[]
  isOpen: boolean
  onClose: () => void
}

export function SearchModal({ questions, isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Question[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  // Build index once
  useEffect(() => {
    buildSearchIndex(questions)
  }, [questions])

  // Focus on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50)
    } else {
      setQuery('')
      setResults([])
    }
  }, [isOpen])

  const handleSearch = (q: string) => {
    setQuery(q)
    if (!q.trim()) { setResults([]); return }
    const found = search(q)
    setResults(found.map(r => r.question))
  }

  // Keyboard shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        if (isOpen) onClose()
      }
      if (e.key === 'Escape' && isOpen) onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  const getSnippet = (content: string): string => {
    const clean = content.replace(/[#*`_[\]()]/g, '').replace(/\n+/g, ' ')
    return clean.slice(0, 120) + (clean.length > 120 ? '…' : '')
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -8 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
            >
              {/* Search input */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-200">
                <Search size={18} className="text-slate-400 shrink-0" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Search 197 questions…"
                  className="flex-1 text-base outline-none text-slate-900 placeholder-slate-400 bg-transparent"
                />
                <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg">
                  <X size={16} className="text-slate-400" />
                </button>
              </div>

              {/* Results */}
              <div className="max-h-96 overflow-y-auto">
                {!query && (
                  <div className="p-6 text-center text-slate-400 text-sm">
                    Type to search across all 197 questions…
                  </div>
                )}
                {query && results.length === 0 && (
                  <div className="p-6 text-center text-slate-400 text-sm">
                    No results for &quot;{query}&quot;
                  </div>
                )}
                {results.map((q) => (
                  <Link
                    key={q.id}
                    href={`/chapter/${q.chapterSlug}/#q${q.id}`}
                    onClick={onClose}
                    className="flex items-start gap-3 px-4 py-3 hover:bg-indigo-50 transition-colors group border-b border-slate-100 last:border-0"
                  >
                    <div className="shrink-0 w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                      <span className="text-xs font-bold text-indigo-600">{q.id}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-slate-900 text-sm mb-0.5 group-hover:text-indigo-700">
                        {q.title}
                      </div>
                      <div className="text-xs text-slate-500 truncate">{getSnippet(q.content)}</div>
                      <div className="text-xs text-slate-400 mt-1">{q.chapter}</div>
                    </div>
                    <ArrowRight size={14} className="shrink-0 text-slate-300 group-hover:text-indigo-500 mt-1 transition-colors" />
                  </Link>
                ))}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
