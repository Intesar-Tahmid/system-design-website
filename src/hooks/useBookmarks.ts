'use client'
import { useState, useEffect, useCallback } from 'react'
import { getBookmarks, setBookmarks, toggleBookmark as localToggle } from '@/lib/storage'
import { useAuthState } from './useAuthState'
import { createClient } from '@/lib/supabase'

export function useBookmarks() {
  const [bookmarkedIds, setBookmarkedIds] = useState<number[]>([])
  const { user } = useAuthState()

  useEffect(() => {
    if (user) {
      const supabase = createClient()
      supabase
        .from('bookmarks')
        .select('question_id')
        .eq('user_id', user.id)
        .then(({ data }) => {
          if (data) {
            const ids = data.map((r: { question_id: number }) => r.question_id)
            setBookmarks(ids)
            setBookmarkedIds(ids)
          }
        })
    } else {
      setBookmarkedIds(getBookmarks())
    }
  }, [user])

  const toggle = useCallback(async (id: number) => {
    const updated = localToggle(id)
    setBookmarkedIds(updated)

    if (user) {
      const supabase = createClient()
      if (updated.includes(id)) {
        await supabase.from('bookmarks').upsert({ user_id: user.id, question_id: id })
      } else {
        await supabase.from('bookmarks').delete().eq('user_id', user.id).eq('question_id', id)
      }
    }
  }, [user])

  const isBookmarked = useCallback(
    (id: number) => bookmarkedIds.includes(id),
    [bookmarkedIds]
  )

  return { bookmarkedIds, toggle, isBookmarked }
}
