'use client'
import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { Search, Bookmark, Layers, Command, Layers as FlashIcon, LogOut, User } from 'lucide-react'
import { useProgress } from '@/hooks/useProgress'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

interface HeaderProps {
  onSearchOpen?: () => void
  user?: { email: string } | null
  totalQuestions?: number
}

export function Header({ onSearchOpen, user, totalQuestions = 449 }: HeaderProps) {
  const { completedIds } = useProgress()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    setDropdownOpen(false)
    router.refresh()
  }

  const initials = user?.email ? user.email.slice(0, 2).toUpperCase() : ''

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-sm border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Layers size={16} className="text-white" />
            </div>
            <span className="font-bold text-slate-900 text-lg hidden sm:block">
              AI <span className="text-indigo-600">Engineering</span>
            </span>
          </Link>

          {/* Search trigger */}
          <button
            onClick={onSearchOpen}
            className="flex items-center gap-2 flex-1 max-w-sm px-3 py-2 text-sm text-slate-500 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors text-left"
          >
            <Search size={15} />
            <span className="flex-1">Search questions…</span>
            <div className="hidden sm:flex items-center gap-1 text-xs text-slate-400">
              <Command size={11} />
              <span>K</span>
            </div>
          </button>

          {/* Right side */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Progress pill */}
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-20">
                <ProgressBar value={completedIds.length} max={totalQuestions} size="sm" color="bg-green-500" />
              </div>
              <span className="text-xs text-slate-500 whitespace-nowrap">
                {completedIds.length}/{totalQuestions}
              </span>
            </div>

            {/* Flashcards link */}
            <Link
              href="/flashcards"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
              title="Flashcard mode"
            >
              <FlashIcon size={13} />
              <span>Flashcards</span>
            </Link>

            {/* Bookmarks link */}
            <Link
              href="/bookmarks"
              className="p-2 text-slate-500 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-colors"
              title="My Bookmarks"
            >
              <Bookmark size={18} />
            </Link>

            {/* Auth */}
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(v => !v)}
                  className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold hover:opacity-90 transition-opacity"
                  title={user.email}
                >
                  {initials}
                </button>

                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 6, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 4, scale: 0.97 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-10 w-52 bg-white rounded-2xl border border-slate-200 shadow-xl py-2 z-50"
                    >
                      <div className="px-4 py-2 border-b border-slate-100">
                        <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                      </div>
                      <Link
                        href="/account"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <User size={14} className="text-slate-400" />
                        Account
                      </Link>
                      <Link
                        href="/flashcards"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <FlashIcon size={14} className="text-indigo-400" />
                        Flashcards
                      </Link>
                      <div className="border-t border-slate-100 mt-1 pt-1">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 transition-colors w-full text-left"
                        >
                          <LogOut size={14} />
                          Log out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                href="/auth"
                className="px-3 py-1.5 text-xs font-semibold text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors"
              >
                Log in
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
