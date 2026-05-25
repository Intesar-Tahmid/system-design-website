import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({
      streak: 0, retentionRate: 0, totalReviews: 0, dueToday: 0, totalCards: 0, anonymous: true,
    })
  }

  const today = new Date().toISOString().split('T')[0]

  const [dueResult, logResult, reviewsResult] = await Promise.all([
    supabase
      .from('flashcard_reviews')
      .select('question_id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .lte('next_review_date', today),

    supabase
      .from('flashcard_review_log')
      .select('reviewed_at')
      .eq('user_id', user.id)
      .order('reviewed_at', { ascending: false }),

    supabase
      .from('flashcard_reviews')
      .select('total_reviews, correct_reviews')
      .eq('user_id', user.id),
  ])

  // Streak: consecutive days (ending today) with at least one review
  const reviewDates = new Set(
    (logResult.data ?? []).map(r =>
      new Date(r.reviewed_at).toISOString().split('T')[0]
    )
  )
  let streak = 0
  const checkDate = new Date()
  while (true) {
    const dateStr = checkDate.toISOString().split('T')[0]
    if (!reviewDates.has(dateStr)) break
    streak++
    checkDate.setDate(checkDate.getDate() - 1)
  }

  const totalReviews = (reviewsResult.data ?? []).reduce((s, r) => s + r.total_reviews, 0)
  const correctReviews = (reviewsResult.data ?? []).reduce((s, r) => s + r.correct_reviews, 0)
  const retentionRate = totalReviews > 0 ? Math.round((correctReviews / totalReviews) * 100) : 0

  return NextResponse.json({
    streak,
    retentionRate,
    totalReviews,
    dueToday: dueResult.count ?? 0,
    totalCards: (reviewsResult.data ?? []).length,
    anonymous: false,
  })
}
