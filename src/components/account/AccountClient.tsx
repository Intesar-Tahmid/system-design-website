'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, LogOut, CheckCircle2, Bookmark, Layers } from 'lucide-react'

interface AccountClientProps {
  user: { id: string; email: string }
  progressCount: number
  bookmarksCount: number
}

export function AccountClient({ user, progressCount, bookmarksCount }: AccountClientProps) {
  const [loggingOut, setLoggingOut] = useState(false)
  const router = useRouter()

  const handleLogout = async () => {
    setLoggingOut(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const initials = user.email.slice(0, 2).toUpperCase()

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3">
          <Link href="/" className="p-1.5 rounded-xl hover:bg-slate-100 transition-colors">
            <ArrowLeft size={16} className="text-slate-500" />
          </Link>
          <h1 className="text-base font-bold text-slate-900">Account</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-5">
        {/* Profile card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 flex items-center gap-4"
        >
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-lg font-bold shadow-sm">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-slate-900 truncate">{user.email}</p>
            <p className="text-xs text-slate-500 mt-0.5">Free account · Cloud sync enabled</p>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="grid grid-cols-2 gap-3"
        >
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
            <div className="w-8 h-8 bg-emerald-50 rounded-xl flex items-center justify-center mb-2">
              <CheckCircle2 size={15} className="text-emerald-500" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900">{progressCount}</div>
            <div className="text-xs text-slate-500">Questions completed</div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
            <div className="w-8 h-8 bg-indigo-50 rounded-xl flex items-center justify-center mb-2">
              <Bookmark size={15} className="text-indigo-500" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900">{bookmarksCount}</div>
            <div className="text-xs text-slate-500">Bookmarks saved</div>
          </div>
        </motion.div>

        {/* Quick links */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl border border-slate-200 shadow-sm divide-y divide-slate-100"
        >
          <Link href="/flashcards" className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50 transition-colors">
            <Layers size={15} className="text-indigo-500" />
            <span className="text-sm font-medium text-slate-700">Flashcard mode</span>
          </Link>
          <Link href="/bookmarks" className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50 transition-colors">
            <Bookmark size={15} className="text-slate-500" />
            <span className="text-sm font-medium text-slate-700">My bookmarks</span>
          </Link>
        </motion.div>

        {/* Logout */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
        >
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border border-rose-200 text-rose-600 text-sm font-semibold hover:bg-rose-50 transition-colors disabled:opacity-50"
          >
            <LogOut size={15} />
            {loggingOut ? 'Logging out…' : 'Log out'}
          </button>
        </motion.div>
      </div>
    </div>
  )
}
