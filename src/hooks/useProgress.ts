'use client'
import { useState, useEffect, useCallback } from 'react'
import { getProgress, toggleComplete } from '@/lib/storage'

export function useProgress() {
  const [completedIds, setCompletedIds] = useState<number[]>([])

  useEffect(() => {
    setCompletedIds(getProgress())
  }, [])

  const toggle = useCallback((id: number) => {
    const updated = toggleComplete(id)
    setCompletedIds(updated)
  }, [])

  const isCompleted = useCallback(
    (id: number) => completedIds.includes(id),
    [completedIds]
  )

  return { completedIds, toggle, isCompleted }
}
