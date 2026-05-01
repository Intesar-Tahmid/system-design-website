# Todo List — System Design Mastery Website

Progress legend: [ ] = pending, [x] = complete, [~] = in progress

---

## Phase 1: Project Setup

- [ ] Initialize Next.js 15 project with TypeScript and Tailwind CSS
- [ ] Install additional dependencies (framer-motion, react-markdown, remark-gfm, rehype-raw, react-syntax-highlighter, fuse.js, lucide-react)
- [ ] Configure next.config.ts for static export
- [ ] Configure tailwind.config.ts with custom fonts and design tokens
- [ ] Set up Google Fonts (Inter + JetBrains Mono) in layout.tsx
- [ ] Create globals.css with base styles

---

## Phase 2: Data Layer

- [ ] Define TypeScript interfaces in src/types/index.ts
- [ ] Write MD file parser in src/lib/content.ts
  - [ ] Parse chapter headings (## ...)
  - [ ] Parse question headings (### Q\d+. ...)
  - [ ] Extract question body content
  - [ ] Assign chapterSlug from chapter title
  - [ ] Test parser against all 4 MD files → confirm 197 questions parsed
- [ ] Create chapter metadata config in src/lib/chapters.ts
  - [ ] All 39 chapters with slug, title, description, emoji, color
- [ ] Create localStorage helpers in src/lib/storage.ts
- [ ] Create Fuse.js search config in src/lib/search.ts

---

## Phase 3: Hooks

- [ ] useProgress.ts — read/set/clear completion state
- [ ] useBookmarks.ts — read/toggle/clear bookmark state
- [ ] useSearch.ts — query state, results, modal open/close

---

## Phase 4: UI Components

- [ ] Badge.tsx — small colored label
- [ ] ProgressBar.tsx — animated fill bar
- [ ] BookmarkButton.tsx — star icon with pop animation
- [ ] CompleteButton.tsx — checkmark with pulse animation
- [ ] CodeBlock.tsx — syntax highlighted + copy button

---

## Phase 5: Layout Components

- [ ] Header.tsx — logo, search trigger, overall progress pill
- [ ] Sidebar.tsx — chapter question list with completion states
- [ ] MobileSidebarDrawer.tsx — drawer version for mobile

---

## Phase 6: Home Page

- [ ] HeroSection.tsx — animated headline + stats (197 Qs, 39 chapters)
- [ ] StatsCounter.tsx — count-up animation
- [ ] ChapterCard.tsx — gradient card with emoji, title, question count, progress bar
- [ ] ChapterGrid.tsx — responsive grid of chapter cards (grouped by level/file)
- [ ] app/page.tsx — home page assembling all components

---

## Phase 7: Chapter Page

- [ ] ChapterProgress.tsx — progress bar for current chapter
- [ ] QuestionItem.tsx — full Q&A block with bookmark + complete buttons
- [ ] QuestionList.tsx — all questions for a chapter
- [ ] app/chapter/[slug]/page.tsx — chapter page with sidebar layout

---

## Phase 8: Search

- [ ] SearchModal.tsx — overlay modal with input + results list
- [ ] SearchResult.tsx — single result card
- [ ] Wire Cmd+K keyboard shortcut globally
- [ ] Test search across all 197 questions

---

## Phase 9: Bookmarks Page

- [ ] app/bookmarks/page.tsx — list all bookmarked questions

---

## Phase 10: Polish & QA

- [ ] Verify all 197 questions render correctly
- [ ] Verify code blocks in all languages render with highlighting
- [ ] Verify tables render correctly
- [ ] Test search with common queries
- [ ] Test progress tracking persist/restore
- [ ] Test bookmark add/remove/persist
- [ ] Test on mobile viewport (320px–768px)
- [ ] Test on tablet viewport (768px–1024px)
- [ ] Test on desktop viewport (1024px+)
- [ ] Check all chapter pages have correct question ranges
- [ ] Add proper page titles and meta descriptions
- [ ] Final animation review (timing, easing)

---

## Phase 11: Deployment

- [ ] Test `next build` with static export
- [ ] Verify output folder has all chapter routes
- [ ] Connect to Vercel project
- [ ] Deploy and smoke test on live URL
- [ ] Verify all 197 questions accessible on live URL

---

## Known Risks

- MD file parsing: regex must handle edge cases (nested code blocks, special characters in question titles)
- Content length: some questions are very long — ensure page performance is acceptable
- Static export: check that all dynamic routes are statically generated via generateStaticParams
