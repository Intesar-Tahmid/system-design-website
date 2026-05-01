import { ProgressState, BookmarkState } from '@/types'

const PROGRESS_KEY = 'sdm-progress'
const BOOKMARKS_KEY = 'sdm-bookmarks'

function isBrowser(): boolean {
  return typeof window !== 'undefined'
}

export function getProgress(): number[] {
  if (!isBrowser()) return []
  try {
    const raw = localStorage.getItem(PROGRESS_KEY)
    if (!raw) return []
    const parsed: ProgressState = JSON.parse(raw)
    return parsed.completedIds || []
  } catch {
    return []
  }
}

export function setProgress(completedIds: number[]): void {
  if (!isBrowser()) return
  const state: ProgressState = { completedIds }
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(state))
}

export function toggleComplete(questionId: number): number[] {
  const current = getProgress()
  const updated = current.includes(questionId)
    ? current.filter((id) => id !== questionId)
    : [...current, questionId]
  setProgress(updated)
  return updated
}

export function getBookmarks(): number[] {
  if (!isBrowser()) return []
  try {
    const raw = localStorage.getItem(BOOKMARKS_KEY)
    if (!raw) return []
    const parsed: BookmarkState = JSON.parse(raw)
    return parsed.bookmarkedIds || []
  } catch {
    return []
  }
}

export function setBookmarks(bookmarkedIds: number[]): void {
  if (!isBrowser()) return
  const state: BookmarkState = { bookmarkedIds }
  localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(state))
}

export function toggleBookmark(questionId: number): number[] {
  const current = getBookmarks()
  const updated = current.includes(questionId)
    ? current.filter((id) => id !== questionId)
    : [...current, questionId]
  setBookmarks(updated)
  return updated
}
