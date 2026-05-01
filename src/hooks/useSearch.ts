'use client'
import { useState, useCallback } from 'react'
import { SearchResult } from '@/types'
import { search } from '@/lib/search'

export function useSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isOpen, setIsOpen] = useState(false)

  const runSearch = useCallback((q: string) => {
    setQuery(q)
    setResults(search(q))
  }, [])

  const open = useCallback(() => setIsOpen(true), [])
  const close = useCallback(() => {
    setIsOpen(false)
    setQuery('')
    setResults([])
  }, [])

  return { query, results, isOpen, runSearch, open, close }
}
