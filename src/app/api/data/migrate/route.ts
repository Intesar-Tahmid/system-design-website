import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { completedIds = [], bookmarkedIds = [] } = await request.json()
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
