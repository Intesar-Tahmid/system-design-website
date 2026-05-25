import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { calculateSM2, initialSM2State, type Quality } from '@/lib/spaced-repetition'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized', anonymous: true }, { status: 401 })
  }

  const body = await request.json()
  const { questionId, quality } = body as { questionId: number; quality: Quality }

  if (!questionId || ![1, 2, 4, 5].includes(quality)) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const { data: existing } = await supabase
    .from('flashcard_reviews')
    .select('ease_factor, interval_days, repetitions, total_reviews, correct_reviews')
    .eq('user_id', user.id)
    .eq('question_id', questionId)
    .single()

  const currentState = existing
    ? {
        easeFactor: Number(existing.ease_factor),
        intervalDays: existing.interval_days,
        repetitions: existing.repetitions,
      }
    : initialSM2State()

  const result = calculateSM2(quality, currentState)
  const nextDateStr = result.nextReviewDate.toISOString().split('T')[0]
  const isCorrect = quality >= 3

  await supabase
    .from('flashcard_reviews')
    .upsert({
      user_id: user.id,
      question_id: questionId,
      ease_factor: result.newEaseFactor,
      interval_days: result.newInterval,
      repetitions: result.newRepetitions,
      next_review_date: nextDateStr,
      last_reviewed_at: new Date().toISOString(),
      total_reviews: (existing?.total_reviews ?? 0) + 1,
      correct_reviews: (existing?.correct_reviews ?? 0) + (isCorrect ? 1 : 0),
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id,question_id' })

  await supabase.from('flashcard_review_log').insert({
    user_id: user.id,
    question_id: questionId,
    quality,
    ease_factor: result.newEaseFactor,
    interval_days: result.newInterval,
    next_review_date: nextDateStr,
  })

  return NextResponse.json({
    nextReviewDate: nextDateStr,
    newInterval: result.newInterval,
    newEaseFactor: result.newEaseFactor,
    newRepetitions: result.newRepetitions,
  })
}
