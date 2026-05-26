import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const rawCompleted = Array.isArray(body.completedIds) ? body.completedIds : []
  const rawBookmarked = Array.isArray(body.bookmarkedIds) ? body.bookmarkedIds : []

  // Validate and sanitize: only positive integers, max 2000 per call
  const isPositiveInt = (v: unknown): v is number => typeof v === 'number' && Number.isInteger(v) && v > 0
  const completedIds = rawCompleted.filter(isPositiveInt).slice(0, 2000)
  const bookmarkedIds = rawBookmarked.filter(isPositiveInt).slice(0, 2000)

  const now = new Date().toISOString()

  if (completedIds.length > 0) {
    await supabase.from('progress').upsert(
      completedIds.map((id: number) => ({
        user_id: user.id,
        question_id: id,
        completed_at: now,
      })),
      { onConflict: 'user_id,question_id', ignoreDuplicates: true }
    )
  }

  if (bookmarkedIds.length > 0) {
    await supabase.from('bookmarks').upsert(
      bookmarkedIds.map((id: number) => ({
        user_id: user.id,
        question_id: id,
        bookmarked_at: now,
      })),
      { onConflict: 'user_id,question_id', ignoreDuplicates: true }
    )
  }

  return NextResponse.json({
    synced: true,
    progressCount: completedIds.length,
    bookmarksCount: bookmarkedIds.length,
  })
}
