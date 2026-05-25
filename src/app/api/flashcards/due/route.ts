import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { getAllQuestions } from '@/lib/content'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { searchParams } = new URL(request.url)
  const chapterFilter = searchParams.get('chapter')

  const allQuestions = getAllQuestions()
  const questions = chapterFilter
    ? allQuestions.filter(q => q.chapterSlug === chapterFilter)
    : allQuestions

  if (!user) {
    const shuffled = [...questions].sort(() => Math.random() - 0.5).slice(0, 15)
    return NextResponse.json({
      anonymous: true,
      cards: shuffled.map(q => ({
        questionId: q.id,
        title: q.title,
        chapter: q.chapter,
        chapterSlug: q.chapterSlug,
        content: q.content,
        sm2State: null,
        nextReviewDate: new Date().toISOString().split('T')[0],
      })),
      dueCount: 0,
      newCount: shuffled.length,
    })
  }

  const today = new Date().toISOString().split('T')[0]
  const questionIds = questions.map(q => q.id)

  const { data: reviews, error } = await supabase
    .from('flashcard_reviews')
    .select('question_id, ease_factor, interval_days, repetitions, next_review_date')
    .eq('user_id', user.id)
    .in('question_id', questionIds)
    .lte('next_review_date', today)
    .order('next_review_date', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const questionMap = new Map(questions.map(q => [q.id, q]))
  const dueCards = (reviews ?? []).map(r => {
    const q = questionMap.get(r.question_id)
    return {
      questionId: r.question_id,
      title: q?.title ?? `Question ${r.question_id}`,
      chapter: q?.chapter ?? '',
      chapterSlug: q?.chapterSlug ?? '',
      content: q?.content ?? '',
      sm2State: {
        easeFactor: Number(r.ease_factor),
        intervalDays: r.interval_days,
        repetitions: r.repetitions,
      },
      nextReviewDate: r.next_review_date,
    }
  })

  // New cards (never reviewed) up to 20 per session
  const reviewedIds = new Set((reviews ?? []).map(r => r.question_id))
  const newCards = questions
    .filter(q => !reviewedIds.has(q.id))
    .slice(0, 20)
    .map(q => ({
      questionId: q.id,
      title: q.title,
      chapter: q.chapter,
      chapterSlug: q.chapterSlug,
      content: q.content,
      sm2State: null,
      nextReviewDate: today,
    }))

  return NextResponse.json({
    anonymous: false,
    cards: [...dueCards, ...newCards],
    dueCount: dueCards.length,
    newCount: newCards.length,
  })
}
