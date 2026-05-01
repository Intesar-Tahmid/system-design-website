# Product Requirements Document
## System Design Mastery — Learning Website

---

## 1. Overview

A static, interactive learning website that presents 197 system design Q&A questions in a fun, professional, and engaging way. Target audience is AI/ML engineers and software engineers learning system design. Content is sourced from four pre-written Markdown files and must be 100% preserved.

**Deployment:** Vercel (static export via Next.js)
**Backend:** None — fully client-side

---

## 2. Content Structure

| Source File | Question Range | Chapters |
|---|---|---|
| system_design_1.md | Q1 – Q64 | 11 chapters |
| system_design_2.md | Q65 – Q92 | 10 chapters |
| system_design_3.md | Q93 – Q117 | 10 chapters |
| system_design_4.md | Q118 – Q197 | 8 chapters |

**Total:** 197 questions across 39 chapters

All 197 questions MUST appear on the website. No question may be skipped or omitted.

---

## 3. Chapter List (All 39)

### From system_design_1.md
1. Web Fundamentals (Q1–Q6)
2. Browser Internals & DevTools (Q7–Q12)
3. Networking Basics (Q13–Q18)
4. Server-Side Concepts (Q19–Q24)
5. Databases (Q25–Q29)
6. Caching (Q30–Q32)
7. Scalability & Load Balancing (Q33–Q35)
8. Microservices & APIs (Q36–Q39)
9. Message Queues & Async Systems (Q40–Q41)
10. Security (Q42–Q45)
11. Advanced System Design (Q46–Q64)

### From system_design_2.md
12. DevOps & Infrastructure (Q65–Q68)
13. CI/CD Pipelines (Q69–Q70)
14. Monitoring & Observability (Q71–Q73)
15. MLOps Fundamentals (Q74–Q76)
16. Data Pipelines & ETL (Q77–Q78)
17. Feature Engineering & Serving (Q79–Q80)
18. Model Training & Experimentation (Q81–Q82)
19. AI/ML System Design (Q83–Q84)
20. Inference & Serving (Q85–Q92) *[approximate range]*
21. Data Quality & Monitoring *[approximate range]*

### From system_design_3.md
22. Database Selection — Which DB When? (Q93–Q97)
23. Scaling by Number of Users (Q98)
24. Requirements-Based System Design (Q99–Q101)
25. Advanced MLOps (Q107–Q117) *[files 2+3 overlap in topics]*
26. Network & Protocol Deep Dives (Q102–Q104)
27. Storage Systems (Q105–Q106)
28. Production AI Systems
29. Security for ML/AI Systems
30. Cost Engineering

### From system_design_4.md
31. Distributed Systems Theory (Q118–Q130)
32. Database Internals (Q131–Q140)
33. ML System Design Theory (Q141–Q152)
34. Data Engineering Concepts (Q153–Q162)
35. Reliability & Operations (Q163–Q170)
36. AI Product & Architecture (Q171–Q180)
37. Organizational & Process (Q181–Q188)
38. Emerging Patterns & Edge Cases (Q189–Q197)

*Note: Exact chapter boundaries should be parsed from the MD files directly.*

---

## 4. Core Features

### 4.1 Content Display
- All Q&A content rendered from Markdown with full formatting preserved
- Code blocks must be syntax-highlighted (multi-language: Python, JavaScript, SQL, YAML, Bash, TypeScript, Go, Dockerfile, etc.)
- Code blocks have a one-click "Copy" button
- Tables rendered correctly
- Inline code styled distinctly
- Answers expand/collapse for readability (accordion pattern optional)

### 4.2 Navigation
- **Home page:** Grid of chapter cards, grouped by source/difficulty level
- **Chapter page:** Hybrid layout with sidebar + main content
  - Left sidebar shows list of all questions in the chapter
  - Sidebar items check off when completed
  - Clicking sidebar item scrolls/jumps to that question
  - Active question highlighted in sidebar
- **Global header:** Logo, search bar, overall progress badge

### 4.3 Search
- Global search across all 197 questions (question titles and answer content)
- Fuzzy search (Fuse.js) — tolerates typos
- Results show question number, chapter, and a snippet
- Keyboard shortcut: `Cmd+K` or `Ctrl+K` opens search
- Results appear in a modal/overlay

### 4.4 Progress Tracking
- Each question has a "Mark Complete" toggle button
- Overall progress shown in header (e.g., "47 / 197 completed")
- Per-chapter progress shown on chapter cards and chapter page header
- Progress stored in `localStorage` — persists across sessions
- Progress bar with smooth fill animation
- "Completed" milestone celebrations (visual feedback)

### 4.5 Bookmarks
- Each question has a bookmark/star icon button
- Bookmarked questions saved to `localStorage`
- Home page has a "Bookmarks" section/tab showing all bookmarked questions
- Bookmark icon is visually distinct when active

---

## 5. Design Requirements

### 5.1 Theme
- **Light mode only** (no dark mode)
- Playful, interactive, and professional
- Clean and modern with personality

### 5.2 Visual Style
- Mix of "Clean + playful" (pastel accents, smooth animations, card-flip hover effects) and "Modern tech blog" (clean layout, good typography, subtle gradients)
- White and light gray backgrounds
- Each chapter gets a unique color accent (gradient)
- Rounded corners everywhere
- Subtle shadows on cards
- Generous whitespace

### 5.3 Typography
- Body: Inter or similar geometric sans-serif
- Code: JetBrains Mono or Fira Code (monospace)
- Large, readable font sizes (body: 16px min)
- Clear hierarchy between headings and body text

### 5.4 Animations
- Chapter card hover: lift + shadow deepen + border accent glow
- Page transitions: smooth fade/slide
- Progress bar: smooth animated fill
- Bookmark/complete buttons: satisfying micro-animations
- Search modal: smooth open/close
- Sidebar item active state: smooth transition
- Numbers counter animation on home hero (total questions, chapters, etc.)

### 5.5 Responsiveness
- Mobile, tablet, and desktop layouts
- Sidebar collapses to a drawer on mobile
- Chapter cards adapt from 4-col to 2-col to 1-col

---

## 6. Technical Constraints

- **No backend** — all data is static
- **No user accounts** — localStorage for persistence
- **Vercel compatible** — static export (`output: 'export'` in Next.js config)
- **No database** — content read from MD files at build time
- Fast load times — lazy load heavy content where possible
- SEO-friendly: proper `<title>` and meta tags per page

---

## 7. Non-Goals (Out of Scope)

- User authentication
- Comment system
- Quiz/flashcard mode
- Community features
- Mobile app
- Video content
