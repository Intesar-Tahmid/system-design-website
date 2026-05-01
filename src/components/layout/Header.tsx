'use client'
import Link from 'next/link'
import { Search, Bookmark, Layers, Command } from 'lucide-react'
import { useProgress } from '@/hooks/useProgress'
import { ProgressBar } from '@/components/ui/ProgressBar'

const TOTAL_QUESTIONS = 197

interface HeaderProps {
  onSearchOpen?: () => void
}

export function Header({ onSearchOpen }: HeaderProps) {
  const { completedIds } = useProgress()

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
              System Design <span className="text-indigo-600">Mastery</span>
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
          <div className="flex items-center gap-3 shrink-0">
            {/* Progress pill */}
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-24">
                <ProgressBar
                  value={completedIds.length}
                  max={TOTAL_QUESTIONS}
                  size="sm"
                  color="bg-green-500"
                />
              </div>
              <span className="text-xs text-slate-500 whitespace-nowrap">
                {completedIds.length}/{TOTAL_QUESTIONS}
              </span>
            </div>

            {/* Bookmarks link */}
            <Link
              href="/bookmarks"
              className="p-2 text-slate-500 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-colors"
              title="My Bookmarks"
            >
              <Bookmark size={18} />
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
