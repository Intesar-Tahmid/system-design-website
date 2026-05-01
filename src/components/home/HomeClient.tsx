'use client'
import { useState } from 'react'
import { Header } from '@/components/layout/Header'
import { SearchModal } from '@/components/search/SearchModal'
import { HeroSection } from '@/components/home/HeroSection'
import { Question } from '@/types'

interface HomeClientProps {
  questions: Question[]
  totalQuestions: number
  totalChapters: number
}

export function HomeClient({ questions, totalQuestions, totalChapters }: HomeClientProps) {
  const [searchOpen, setSearchOpen] = useState(false)
  const open = () => setSearchOpen(true)
  const close = () => setSearchOpen(false)

  return (
    <>
      <Header onSearchOpen={open} />
      <SearchModal questions={questions} isOpen={searchOpen} onClose={close} />
      <HeroSection
        totalQuestions={totalQuestions}
        totalChapters={totalChapters}
        onSearchOpen={open}
      />
    </>
  )
}
