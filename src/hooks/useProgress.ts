'use client'
import { useState, useEffect, useCallback } from 'react'
import { getProgress, setProgress, toggleComplete as localToggle } from '@/lib/storage'
import { useAuthState } from './useAuthState'
import { createClient } from '@/lib/supabase'

export function useProgress() {
  const [completedIds, setCompletedIds] = useState<number[]>([])
  const { user } = useAuthState()

  useEffect(() => {
    if (user) {
      const supabase = createClient()
      supabase
        .from('progress')
        .select('question_id')
        .eq('user_id', user.id)
        .then(({ data }) => {
          if (data) {
            const ids = data.map((r: { question_id: number }) => r.question_id)
            setProgress(ids)
            setCompletedIds(ids)
          }
        })
    } else {
      setCompletedIds(getProgress())
    }
  }, [user])

  const toggle = useCallback(async (id: number) => {
    const updated = localToggle(id)
    setCompletedIds(updated)

    if (user) {
      const supabase = createClient()
      if (updated.includes(id)) {
        await supabase.from('progress').upsert({ user_id: user.id, question_id: id })
      } else {
        await supabase.from('progress').delete().eq('user_id', user.id).eq('question_id', id)
      }
    }
  }, [user])

  const isCompleted = useCallback(
    (id: number) => completedIds.includes(id),
    [completedIds]
  )

  return { completedIds, toggle, isCompleted }
}
