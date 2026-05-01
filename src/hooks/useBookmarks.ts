'use client'
import { useState, useEffect, useCallback } from 'react'
import { getBookmarks, toggleBookmark } from '@/lib/storage'

export function useBookmarks() {
  const [bookmarkedIds, setBookmarkedIds] = useState<number[]>([])

  useEffect(() => {
    setBookmarkedIds(getBookmarks())
  }, [])

  const toggle = useCallback((id: number) => {
    const updated = toggleBookmark(id)
    setBookmarkedIds(updated)
  }, [])

  const isBookmarked = useCallback(
    (id: number) => bookmarkedIds.includes(id),
    [bookmarkedIds]
  )

  return { bookmarkedIds, toggle, isBookmarked }
}
