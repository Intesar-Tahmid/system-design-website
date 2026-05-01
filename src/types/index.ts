export interface Question {
  id: number
  title: string
  chapter: string
  chapterSlug: string
  content: string
  fileIndex: number
}

export interface Chapter {
  slug: string
  title: string
  description: string
  emoji: string
  gradient: string
  accentBg: string
  accentBorder: string
  accentText: string
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  fileIndex: number
  questionIds: number[]
}

export interface SearchResult {
  question: Question
  score: number
}

export interface ProgressState {
  completedIds: number[]
}

export interface BookmarkState {
  bookmarkedIds: number[]
}
