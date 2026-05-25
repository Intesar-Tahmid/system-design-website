'use client'
import { useState, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase'
import { useRouter, useSearchParams } from 'next/navigation'
import { getProgress, getBookmarks } from '@/lib/storage'
import Link from 'next/link'
import { Layers, Eye, EyeOff, ArrowLeft, Loader2 } from 'lucide-react'
import { Toast } from '@/components/ui/Toast'

type Mode = 'login' | 'signup'

function AuthForm() {
  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [toastShow, setToastShow] = useState(false)
  const [toastMsg, setToastMsg] = useState('')

  const router = useRouter()
  const searchParams = useSearchParams()
  const nextPath = searchParams.get('next') ?? '/'

  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccessMsg(null)

    if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) { setError(error.message); setLoading(false); return }
      setSuccessMsg('Check your email to confirm your account, then come back to log in.')
      setLoading(false)
      return
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); setLoading(false); return }

    // Migrate localStorage progress/bookmarks to Supabase
    const completedIds = getProgress()
    const bookmarkedIds = getBookmarks()
    if (completedIds.length > 0 || bookmarkedIds.length > 0) {
      try {
        const res = await fetch('/api/data/migrate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ completedIds, bookmarkedIds }),
        })
        if (res.ok) {
          const { progressCount, bookmarksCount } = await res.json()
          setToastMsg(`Progress synced — ${progressCount} questions and ${bookmarksCount} bookmarks saved to your account.`)
          setToastShow(true)
        }
      } catch {
        // Silent — localStorage data is still safe
      }
    }

    router.push(nextPath)
    router.refresh()
  }

  return (
    <>
      <Toast message={toastMsg} show={toastShow} onClose={() => setToastShow(false)} />

      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-sm"
        >
          {/* Back link */}
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-6 transition-colors"
          >
            <ArrowLeft size={14} />
            Back to home
          </Link>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-8">
            {/* Logo */}
            <div className="flex items-center gap-2.5 mb-8">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <Layers size={17} className="text-white" />
              </div>
              <span className="font-bold text-slate-900 text-sm">AI Engineering</span>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={mode}
                initial={{ opacity: 0, x: mode === 'login' ? -10 : 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: mode === 'login' ? 10 : -10 }}
                transition={{ duration: 0.2 }}
              >
                <h1 className="text-2xl font-bold text-slate-900 mb-1">
                  {mode === 'login' ? 'Welcome back' : 'Create account'}
                </h1>
                <p className="text-sm text-slate-500 mb-6">
                  {mode === 'login'
                    ? 'Log in to sync your progress and flashcard reviews.'
                    : 'Sign up to save your progress across devices.'}
                </p>
              </motion.div>
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition-all"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    minLength={6}
                    placeholder="Min 6 characters"
                    className="w-full px-4 py-2.5 pr-10 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">
                  {error}
                </div>
              )}

              {/* Success */}
              {successMsg && (
                <div className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2.5">
                  {successMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading && <Loader2 size={15} className="animate-spin" />}
                {loading ? 'Loading…' : mode === 'login' ? 'Log in' : 'Create account'}
              </button>
            </form>

            <p className="text-center text-sm text-slate-500 mt-5">
              {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
              <button
                onClick={() => { setMode(m => m === 'login' ? 'signup' : 'login'); setError(null); setSuccessMsg(null) }}
                className="text-indigo-600 font-semibold hover:underline underline-offset-2"
              >
                {mode === 'login' ? 'Sign up' : 'Log in'}
              </button>
            </p>
          </div>
        </motion.div>
      </div>
    </>
  )
}

export default function AuthPage() {
  return (
    <Suspense>
      <AuthForm />
    </Suspense>
  )
}
