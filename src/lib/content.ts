import fs from 'fs'
import path from 'path'
import { Question } from '@/types'

const MD_FILES = [
  'system_design_1.md',
  'system_design_2.md',
  'system_design_3.md',
  'system_design_4.md',
]

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-+/g, '-')
}

let _cachedQuestions: Question[] | null = null

export function getAllQuestions(): Question[] {
  if (_cachedQuestions) return _cachedQuestions

  const questions: Question[] = []

  for (let fileIndex = 0; fileIndex < MD_FILES.length; fileIndex++) {
    const filePath = path.join(process.cwd(), MD_FILES[fileIndex])
    const content = fs.readFileSync(filePath, 'utf-8')
    const lines = content.split('\n')

    let currentChapter = ''
    let currentQuestion: Partial<Question> | null = null
    let contentLines: string[] = []

    const saveQuestion = () => {
      if (currentQuestion && currentQuestion.id && currentQuestion.title) {
        questions.push({
          id: currentQuestion.id,
          title: currentQuestion.title,
          chapter: currentQuestion.chapter || '',
          chapterSlug: currentQuestion.chapterSlug || '',
          content: contentLines.join('\n').trim(),
          fileIndex: fileIndex + 1,
        })
      }
    }

    // Headings to skip that aren't real chapter headings
    const SKIP_HEADING_PATTERNS = [
      /^table of contents$/i,
      /^summary/i,
      /^quick reference/i,
      /^recommended/i,
      /^key takeaways/i,
      /^final/i,
      /^additional deep-dive/i,
      /^context$/i,
      /^decision$/i,
      /^consequences$/i,
      /^date:/i,
      /^author/i,
      /^for python/i,
      /^theory-first/i,
      // Sub-section headings within chapters (e.g. "Part 2 — Intermediate Concepts")
      // These should keep questions under their parent chapter heading
      /^part \d+/i,
    ]

    let inCodeBlock = false

    for (const line of lines) {
      // Track code fence state (``` or ~~~)
      if (/^(`{3,}|~{3,})/.test(line)) {
        inCodeBlock = !inCodeBlock
        if (currentQuestion) contentLines.push(line)
        continue
      }

      // Only treat ## as chapter heading when NOT inside a code block
      if (!inCodeBlock && /^## /.test(line) && !/^### /.test(line)) {
        let heading = line.replace(/^## /, '').trim()
        // Strip parenthetical suffixes like "(Continuing from Q93)"
        heading = heading.replace(/\s*\([^)]*\)\s*$/, '').trim()
        const isSkip = SKIP_HEADING_PATTERNS.some((p) => p.test(heading))
        if (!isSkip && heading) {
          currentChapter = heading
        }
        continue
      }

      // Question heading: ### Q\d+. Title
      if (!inCodeBlock) {
        const questionMatch = line.match(/^### Q(\d+)\.\s+(.+)$/)
        if (questionMatch) {
          saveQuestion()
          currentQuestion = {
            id: parseInt(questionMatch[1]),
            title: questionMatch[2].trim(),
            chapter: currentChapter,
            chapterSlug: slugify(currentChapter),
            fileIndex: fileIndex + 1,
          }
          contentLines = []
          continue
        }
      }

      if (currentQuestion) {
        contentLines.push(line)
      }
    }

    // Save last question in file
    saveQuestion()
  }

  _cachedQuestions = questions.sort((a, b) => a.id - b.id)
  return _cachedQuestions
}

export function getQuestionsByChapter(chapterSlug: string): Question[] {
  return getAllQuestions().filter((q) => q.chapterSlug === chapterSlug)
}

export function getAllChapterSlugs(): string[] {
  const seen = new Set<string>()
  const slugs: string[] = []
  for (const q of getAllQuestions()) {
    if (!seen.has(q.chapterSlug)) {
      seen.add(q.chapterSlug)
      slugs.push(q.chapterSlug)
    }
  }
  return slugs
}

export function getAllChaptersFromContent(): Array<{
  slug: string
  title: string
  fileIndex: number
  questionIds: number[]
}> {
  const chaptersMap = new Map<string, { slug: string; title: string; fileIndex: number; questionIds: number[] }>()

  for (const q of getAllQuestions()) {
    if (!chaptersMap.has(q.chapterSlug)) {
      chaptersMap.set(q.chapterSlug, {
        slug: q.chapterSlug,
        title: q.chapter,
        fileIndex: q.fileIndex,
        questionIds: [],
      })
    }
    chaptersMap.get(q.chapterSlug)!.questionIds.push(q.id)
  }

  return Array.from(chaptersMap.values())
}
