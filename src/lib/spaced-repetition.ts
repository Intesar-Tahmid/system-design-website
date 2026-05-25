export type Quality = 1 | 2 | 4 | 5

export const QUALITY_MAP = {
  again: 1 as Quality,
  hard:  2 as Quality,
  good:  4 as Quality,
  easy:  5 as Quality,
} as const

export type RatingLabel = keyof typeof QUALITY_MAP

export interface SM2State {
  easeFactor: number
  intervalDays: number
  repetitions: number
}

export interface SM2Result {
  nextReviewDate: Date
  newInterval: number
  newEaseFactor: number
  newRepetitions: number
}

const MIN_EASE_FACTOR = 1.3

export function calculateSM2(quality: Quality, state: SM2State): SM2Result {
  const { easeFactor, intervalDays, repetitions } = state

  const efDelta = 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)
  const newEaseFactor = Math.max(MIN_EASE_FACTOR, easeFactor + efDelta)

  let newInterval: number
  let newRepetitions: number

  if (quality >= 3) {
    if (repetitions === 0) newInterval = 1
    else if (repetitions === 1) newInterval = 6
    else newInterval = Math.round(intervalDays * easeFactor)
    newRepetitions = repetitions + 1
  } else {
    newInterval = 1
    newRepetitions = 0
  }

  const nextReviewDate = new Date()
  nextReviewDate.setDate(nextReviewDate.getDate() + newInterval)
  nextReviewDate.setUTCHours(0, 0, 0, 0)

  return { nextReviewDate, newInterval, newEaseFactor, newRepetitions }
}

export function initialSM2State(): SM2State {
  return { easeFactor: 2.5, intervalDays: 1, repetitions: 0 }
}

export interface StoredSM2State extends SM2State {
  nextReviewDate: string // ISO date string YYYY-MM-DD
}
