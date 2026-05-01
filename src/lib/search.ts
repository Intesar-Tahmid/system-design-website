import Fuse from 'fuse.js'
import { Question, SearchResult } from '@/types'

let fuseInstance: Fuse<Question> | null = null

export function buildSearchIndex(questions: Question[]): void {
  fuseInstance = new Fuse(questions, {
    keys: [
      { name: 'title', weight: 0.7 },
      { name: 'content', weight: 0.3 },
    ],
    threshold: 0.4,
    includeScore: true,
    ignoreLocation: true,
    minMatchCharLength: 2,
  })
}

export function search(query: string): SearchResult[] {
  if (!fuseInstance || !query.trim()) return []
  const results = fuseInstance.search(query, { limit: 20 })
  return results.map((r) => ({
    question: r.item,
    score: r.score ?? 1,
  }))
}
