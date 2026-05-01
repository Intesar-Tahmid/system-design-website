import { ChapterGroup } from '@/components/home/ChapterGrid'
import { HomeClient } from '@/components/home/HomeClient'
import { getAllQuestions } from '@/lib/content'
import { getChapters, getChapterGroups } from '@/lib/chapters'

export default function HomePage() {
  const questions = getAllQuestions()
  const chapters = getChapters()
  const groups = getChapterGroups()

  let cardIndex = 0

  return (
    <div>
      <HomeClient
        questions={questions}
        totalQuestions={questions.length}
        totalChapters={chapters.length}
      />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {groups.map((group) => {
          const start = cardIndex
          cardIndex += group.chapters.length
          return (
            <ChapterGroup
              key={group.fileIndex}
              label={group.label}
              subtitle={group.subtitle}
              chapters={group.chapters}
              startIndex={start}
              fileIndex={group.fileIndex}
            />
          )
        })}
      </main>
    </div>
  )
}
