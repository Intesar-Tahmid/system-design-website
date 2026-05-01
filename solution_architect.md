# Solution Architecture
## System Design Mastery — Learning Website

---

## 1. Technology Stack

| Layer | Technology | Reason |
|---|---|---|
| Framework | Next.js 15 (App Router) | Static export, file-based routing, Server Components for MD parsing |
| Language | TypeScript | Type safety across all components and data |
| Styling | Tailwind CSS v3 | Utility-first, easy responsive design, consistent design tokens |
| Animations | Framer Motion | Smooth, physics-based animations for cards and page transitions |
| Syntax Highlight | react-syntax-highlighter (Prism) | Easy integration, 100+ languages, customizable themes |
| Markdown Render | react-markdown + remark-gfm + rehype-raw | Renders GFM tables, strikethrough, code fences |
| Search | Fuse.js | Client-side fuzzy search — no backend needed |
| Icons | lucide-react | Clean, consistent icon set |
| State | React useState + localStorage | No external state manager needed |

---

## 2. Project Directory Structure

```
system-design-website/
├── system_design_1.md          ← Source content (stay in root)
├── system_design_2.md
├── system_design_3.md
├── system_design_4.md
├── product_requirement.md
├── solution_architect.md
├── todo_list.md
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
├── .eslintrc.json
├── public/
│   └── favicon.ico
└── src/
    ├── app/
    │   ├── layout.tsx              ← Root layout (header, fonts)
    │   ├── page.tsx                ← Home page (chapter cards grid)
    │   ├── globals.css             ← Base styles, Tailwind directives
    │   ├── bookmarks/
    │   │   └── page.tsx            ← Bookmarked questions list
    │   └── chapter/
    │       └── [slug]/
    │           └── page.tsx        ← Chapter page (sidebar + questions)
    ├── components/
    │   ├── layout/
    │   │   ├── Header.tsx          ← Global header with search + progress
    │   │   ├── Sidebar.tsx         ← Chapter sidebar (question list)
    │   │   └── MobileSidebarDrawer.tsx
    │   ├── home/
    │   │   ├── HeroSection.tsx     ← Animated hero with stats
    │   │   ├── ChapterCard.tsx     ← Individual chapter card
    │   │   ├── ChapterGrid.tsx     ← Grid of chapter cards
    │   │   └── StatsCounter.tsx    ← Animated counters
    │   ├── chapter/
    │   │   ├── QuestionItem.tsx    ← Individual Q&A card
    │   │   ├── QuestionList.tsx    ← Scrollable question list
    │   │   └── ChapterProgress.tsx ← Progress bar for this chapter
    │   ├── search/
    │   │   ├── SearchModal.tsx     ← Full-screen search overlay
    │   │   └── SearchResult.tsx    ← Single search result item
    │   └── ui/
    │       ├── BookmarkButton.tsx  ← Animated star/bookmark icon
    │       ├── CompleteButton.tsx  ← Mark complete with animation
    │       ├── CodeBlock.tsx       ← Code block with copy button
    │       ├── ProgressBar.tsx     ← Animated progress bar
    │       └── Badge.tsx           ← Small label badge
    ├── lib/
    │   ├── content.ts              ← MD file parser (server-side)
    │   ├── chapters.ts             ← Chapter metadata (colors, icons, slugs)
    │   ├── search.ts               ← Fuse.js search configuration
    │   └── storage.ts              ← localStorage helpers (progress + bookmarks)
    ├── hooks/
    │   ├── useProgress.ts          ← Read/write completion state
    │   ├── useBookmarks.ts         ← Read/write bookmark state
    │   └── useSearch.ts            ← Search state and results
    └── types/
        └── index.ts                ← Shared TypeScript interfaces
```

---

## 3. Content Parsing Strategy

### 3.1 Source Files
The four Markdown files remain in the project root. They are read using Node.js `fs` module inside Next.js Server Components (runs at build time for static export).

### 3.2 Parsing Algorithm

```
For each MD file:
  1. Read file content with fs.readFileSync
  2. Split into lines
  3. Track current chapter (detected by "## " prefix)
  4. Track current question (detected by "### Q\d+\." prefix)
  5. Accumulate lines between question headers as the question body
  6. Return array of { id, title, chapter, chapterSlug, content, fileIndex }
```

Key regex patterns:
```typescript
const CHAPTER_REGEX = /^## (.+)$/
const QUESTION_REGEX = /^### (Q\d+)\. (.+)$/
```

### 3.3 Data Models

```typescript
interface Question {
  id: number              // e.g., 1
  title: string           // e.g., "What happens when you type a URL..."
  chapter: string         // e.g., "Web Fundamentals"
  chapterSlug: string     // e.g., "web-fundamentals"
  content: string         // Full markdown content of the answer
  fileIndex: number       // 1, 2, 3, or 4 (which source file)
}

interface Chapter {
  slug: string
  title: string
  description: string
  color: string           // Tailwind gradient classes
  accentColor: string     // Tailwind solid color class
  emoji: string
  questionIds: number[]
  fileIndex: number
}
```

### 3.4 Static Generation

- `app/page.tsx` — calls `getAllChapters()` and `getAllQuestions()` at build time
- `app/chapter/[slug]/page.tsx` — uses `generateStaticParams()` to pre-render all 39 chapters
- All content is available in the static HTML bundle — no client-side fetching needed

---

## 4. Chapter Configuration (`src/lib/chapters.ts`)

Each chapter is manually configured with metadata (color, description, emoji). The question ranges are auto-detected from parsing.

### Color System (One per chapter, cycling through):
```
indigo, violet, purple, fuchsia, pink, rose,
red, orange, amber, yellow, lime, green,
emerald, teal, cyan, sky, blue, slate
```

Each chapter card has:
- Gradient: `from-{color}-500 to-{color}-600`
- Light background: `bg-{color}-50`
- Border: `border-{color}-200`
- Icon: emoji representing the topic

---

## 5. State Management

### 5.1 Progress (localStorage)
```typescript
// Key: 'sdm-progress'
// Value: { completedIds: number[] }
```

### 5.2 Bookmarks (localStorage)
```typescript
// Key: 'sdm-bookmarks'
// Value: { bookmarkedIds: number[] }
```

### 5.3 Client-Side Rendering for State
Progress and bookmark components are Client Components (`'use client'`) that read from localStorage on mount. Server Components render the content; Client Components layer in interactive state.

---

## 6. Routing Structure

| Route | Description |
|---|---|
| `/` | Home page — hero + all chapter cards |
| `/chapter/[slug]` | Chapter page — sidebar + all Q&As for that chapter |
| `/bookmarks` | All bookmarked questions listed |

Search is a modal overlay accessible from any page (not a separate route).

---

## 7. Code Block Rendering

- Detected via triple backtick fence in markdown
- Language parsed from the fence (```python, ```sql, etc.)
- Rendered with `react-syntax-highlighter` using `vscDarkPlus` theme
- Always dark background regardless of page theme (industry standard)
- Copy-to-clipboard button (top-right corner)
- Language label shown (top-left corner)
- Horizontal scrolling for long lines

---

## 8. Search Implementation

### Fuse.js Configuration
```typescript
const fuseOptions = {
  keys: [
    { name: 'title', weight: 0.7 },
    { name: 'content', weight: 0.3 },
  ],
  threshold: 0.4,
  includeScore: true,
  ignoreLocation: true,
}
```

Search index built from all 197 questions. Triggered by `Cmd+K` or clicking the search bar in header. Results show up in a modal with chapter name, question number, and content snippet. Clicking a result navigates to the chapter page and highlights that question.

---

## 9. Animation Strategy (Framer Motion)

| Element | Animation |
|---|---|
| Chapter cards | Stagger fade-in on page load; hover: `y: -4, shadow increase` |
| Hero stats | Count-up animation from 0 to value |
| Progress bar | Width animation from 0% to actual% |
| Search modal | `opacity: 0→1, scale: 0.95→1` |
| Sidebar items | Stagger entrance; smooth active highlight |
| Complete button | Scale pulse + checkmark draw animation |
| Bookmark button | Scale + color pop |
| Page transition | Fade in (`opacity: 0→1`) |

---

## 10. Deployment (Vercel)

```typescript
// next.config.ts
const config = {
  output: 'export',        // Static HTML generation
  trailingSlash: true,     // Vercel compatibility
  images: { unoptimized: true }, // Required for static export
}
```

All pages are statically generated at build time. Zero server required. Vercel serves directly from CDN.

---

## 11. Design Tokens

```
Background:     #F8FAFC (slate-50)
Card surface:   #FFFFFF
Border:         #E2E8F0 (slate-200)
Text primary:   #0F172A (slate-900)
Text secondary: #64748B (slate-500)
Text muted:     #94A3B8 (slate-400)
Primary:        #6366F1 (indigo-500)
Code bg:        #1E293B (slate-800)
Code text:      #E2E8F0 (slate-200)

Font body:      Inter (Google Fonts)
Font mono:      JetBrains Mono (Google Fonts)
```
