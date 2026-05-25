# Deployment Guide — AI Engineering

This guide covers deploying the site to Vercel with Supabase for auth, cloud progress sync, and flashcard spaced-repetition. Read top to bottom — each section depends on the previous.

---

## 1. Prerequisites

| Tool | Required version | Check |
|------|-----------------|-------|
| Node.js | 18+ | `node -v` |
| npm | 9+ | `npm -v` |
| Git | any | `git --version` |
| Vercel CLI (optional) | latest | `npm i -g vercel` |

---

## 2. Supabase Setup

Everything auth-related lives in Supabase. You need to do this **before** deploying — the app won't build correctly in production without valid env vars.

### 2.1 Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and sign in.
2. Click **New project**.
3. Choose a name (e.g. `ai-engineering`), a strong database password (save it somewhere), and a region close to your users.
4. Wait ~2 minutes for the project to provision.

### 2.2 Get your API credentials

1. In your Supabase project, go to **Project Settings → API**.
2. Copy two values — you'll need them in every environment:
   - **Project URL** — looks like `https://abcdefghij.supabase.co`
   - **anon / public key** — a long JWT string starting with `eyJ...`

### 2.3 Run the database schema

1. In Supabase, go to **SQL Editor → New query**.
2. Open `supabase/schema.sql` from this repo.
3. Paste the entire contents into the editor and click **Run**.

This creates 5 tables:

| Table | Purpose |
|-------|---------|
| `profiles` | Auto-created on signup via trigger. Stores email + display name. |
| `progress` | Which question IDs each user has marked complete. |
| `bookmarks` | Which question IDs each user has bookmarked. |
| `flashcard_reviews` | SM-2 spaced repetition state per (user, question). |
| `flashcard_review_log` | Append-only history used for streak and retention calculations. |

All tables have **Row Level Security (RLS)** enabled — users can only read and write their own rows. This is enforced at the database level, not just the application layer.

### 2.4 Configure the auth redirect URL

This is the step most people miss. Without it, email confirmation links will fail in production.

1. In Supabase, go to **Authentication → URL Configuration**.
2. Set **Site URL** to your production domain, e.g. `https://your-site.vercel.app`.
3. Under **Redirect URLs**, add:
   - `https://your-site.vercel.app/auth/callback`
   - `http://localhost:3000/auth/callback` (for local development)
4. Click **Save**.

### 2.5 (Optional) Configure email templates

By default Supabase sends a plain confirmation email. To customise:

1. Go to **Authentication → Email Templates**.
2. Edit the **Confirm signup** template — update the brand name from "Supabase" to "AI Engineering".
3. The confirmation link uses `{{ .ConfirmationURL }}` — keep that token in the link.

### 2.6 (Optional) Disable email confirmation for faster testing

During development you may want to skip email confirmation:

1. Go to **Authentication → Providers → Email**.
2. Turn off **Confirm email**.
3. Re-enable before going to production.

---

## 3. Local Development

```bash
# Clone and install
git clone <your-repo-url>
cd system-design-website
npm install

# Create env file
cp .env.local.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

These two are the **only** required env vars. There is no secret server-side key needed — `@supabase/ssr` uses the anon key with cookie-based sessions. The anon key is safe to expose publicly; RLS policies enforce access control.

```bash
npm run dev
# Open http://localhost:3000
```

### Verify auth works locally

1. Go to `http://localhost:3000/auth`.
2. Sign up with a real email (or a test email if you disabled confirmation).
3. Click the confirmation link in your email.
4. You should be redirected to `/` and see your initials in the header.
5. Go to `/account` — you should see your email and 0 questions completed.

---

## 4. Deploy to Vercel

### 4.1 Push to GitHub

```bash
git add .
git commit -m "feat: AI Engineering rebranding + auth + flashcards"
git push origin main
```

### 4.2 Import to Vercel

1. Go to [vercel.com/new](https://vercel.com/new).
2. Import your GitHub repository.
3. Vercel auto-detects Next.js — no framework config needed.
4. **Do not deploy yet** — add environment variables first.

### 4.3 Add environment variables in Vercel

In the Vercel import flow (or later in **Project Settings → Environment Variables**), add:

| Variable | Value | Environments |
|----------|-------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://your-project-id.supabase.co` | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJ...` (your anon key) | Production, Preview, Development |

Both variables are prefixed `NEXT_PUBLIC_` so they are available in the browser. They are intentionally public — Supabase's security model uses RLS, not secret keys, for data access control.

### 4.4 Deploy

Click **Deploy**. Vercel runs `next build` and deploys. The build takes ~2–3 minutes.

### 4.5 Update Supabase redirect URL

After your first deploy, Vercel gives you a URL like `https://your-site.vercel.app`.

1. Go back to Supabase **Authentication → URL Configuration**.
2. Update **Site URL** to your actual Vercel URL.
3. Add `https://your-site.vercel.app/auth/callback` to **Redirect URLs** if you haven't already.

---

## 5. What Each Route Does

Understanding this helps when things go wrong.

| Route | Type | Auth required | What it does |
|-------|------|--------------|-------------|
| `/` | Dynamic (SSR) | No | Home page — fetches auth user to show login state in header |
| `/chapter/[slug]` | SSG + SSR | No | Chapter pages — statically generated at build time, user fetched server-side for header |
| `/auth` | Static | No | Email/password login and signup. On login, migrates localStorage progress → Supabase |
| `/auth/callback` | API Route | No | Exchanges Supabase OAuth code for session cookie |
| `/account` | Dynamic (SSR) | **Yes** | User profile + stats. Middleware redirects to `/auth` if not logged in |
| `/bookmarks` | Dynamic (SSR) | No | Bookmarks page — works anonymous, shows more detail when logged in |
| `/flashcards` | Dynamic (SSR) | No | Flashcard dashboard — anonymous mode works, full features require login |
| `/flashcards/study` | Client | No | Study session — anonymous uses localStorage, authenticated uses Supabase |
| `/api/flashcards/due` | API Route | No (optional) | Returns due cards. Anonymous: 15 random. Authenticated: due + new cards |
| `/api/flashcards/review` | API Route | **Yes** | Records a flashcard rating, updates SM-2 state |
| `/api/flashcards/stats` | API Route | No (optional) | Streak, retention rate, total reviews |
| `/api/data/migrate` | API Route | **Yes** | Bulk migrates localStorage progress+bookmarks into Supabase on first login |

---

## 6. How Authentication Works

The app uses **anonymous-first progressive enhancement**:

1. **Before signing in**: All progress and bookmarks are stored in `localStorage`. Keys: `sdm-progress`, `sdm-bookmarks`. Flashcard SM-2 state: `sdm-sm2`. Everything works without an account.

2. **On sign up / sign in** (`/auth` page):
   - Supabase creates a session and sets an HTTP-only cookie via `/auth/callback`.
   - The app reads `sdm-progress` and `sdm-bookmarks` from localStorage.
   - POSTs them to `/api/data/migrate` — bulk-inserts into Supabase `progress` and `bookmarks` tables.
   - Shows a "Progress synced" toast.

3. **While signed in**:
   - `useProgress` and `useBookmarks` hooks fetch from Supabase on mount.
   - Every toggle writes to both localStorage (immediate, optimistic) and Supabase (async).
   - The header shows user initials with a dropdown (Account, Flashcards, Log out).

4. **Server-side auth** (for SSR pages):
   - `src/lib/supabase-server.ts` reads the session cookie using `@supabase/ssr`.
   - Pages call `supabase.auth.getUser()` — this verifies the JWT against Supabase servers (never trusts the local cookie value alone).
   - `src/middleware.ts` refreshes the session cookie on every request and protects `/account`.

5. **On sign out**:
   - `supabase.auth.signOut()` clears the session cookie.
   - `router.refresh()` triggers a server re-render — header reverts to "Log in" state.
   - localStorage data is kept (so if they sign out and back in, their local progress is re-migrated).

---

## 7. Supabase Tables Quick Reference

### `progress`
```sql
(user_id UUID, question_id INTEGER) PRIMARY KEY
```
Stores which questions a user has marked complete. Written by `useProgress` hook and `/api/data/migrate`.

### `bookmarks`
```sql
(user_id UUID, question_id INTEGER) PRIMARY KEY
```
Same structure. Written by `useBookmarks` hook and `/api/data/migrate`.

### `flashcard_reviews`
```sql
(user_id UUID, question_id INTEGER) PRIMARY KEY
-- SM-2 state columns:
ease_factor NUMERIC(4,2)   -- default 2.5, minimum 1.3
interval_days INTEGER      -- days until next review
repetitions INTEGER        -- consecutive correct reviews
next_review_date DATE      -- when this card is next due
```
Upserted by `/api/flashcards/review` after each rating. Queried by `/api/flashcards/due`.

### `flashcard_review_log`
Append-only. Never updated, only inserted. Used to calculate:
- **Streak**: walk backwards from today counting days with at least one review.
- **Retention rate**: `correct_reviews / total_reviews` across all cards.

---

## 8. Troubleshooting

### "Invalid Refresh Token" errors in production
The session cookie expired or was tampered with. The middleware auto-refreshes tokens on every request — this usually self-heals on the next page load. If it persists, the user should sign out and back in.

### Auth redirect goes to localhost in production
You added `http://localhost:3000/auth/callback` to Supabase redirect URLs but forgot to add the production URL. Add `https://your-site.vercel.app/auth/callback` in Supabase → Authentication → URL Configuration.

### "Row-level security violation" errors
A logged-in user is trying to access another user's data — this should never happen in normal use. Check that the `user_id` being passed to Supabase queries matches `auth.uid()`. The RLS policy blocks this at the DB level.

### `/account` redirects to `/auth` even when logged in
The session cookie isn't being sent. Check that your `NEXT_PUBLIC_SUPABASE_URL` in Vercel matches exactly the URL in your Supabase project (no trailing slash). Also verify the middleware in `src/middleware.ts` is present and running.

### Flashcard study page shows no cards
For anonymous users, the `/api/flashcards/due` route returns 15 random questions. If it returns empty, `getAllQuestions()` in `src/lib/content.ts` is failing to read the markdown files in the Vercel serverless environment. The `outputFileTracingIncludes` config in `next.config.ts` handles this — verify it's present.

### Progress not syncing after login
The `/api/data/migrate` POST in `/src/app/auth/page.tsx` runs after successful login. Check the browser network tab — if it's returning 401, the session cookie wasn't set before the migrate call. The callback route (`/auth/callback`) must complete before migration. Check for timing issues.

---

## 9. Environment Variables Summary

| Variable | Where to get it | Required |
|----------|----------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API → Project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API → anon/public key | Yes |

That's it. No other env vars are needed. The app has no other external services.

---

## 10. Post-Deployment Checklist

- [ ] Supabase project created and schema SQL run
- [ ] `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` added to Vercel
- [ ] Supabase **Site URL** set to production Vercel URL
- [ ] `https://your-site.vercel.app/auth/callback` added to Supabase redirect URLs
- [ ] Sign up with a real email — receive confirmation email, click link, land on home page
- [ ] Header shows user initials after login
- [ ] `/account` shows correct email and 0 counts (or migrated counts if you had localStorage data)
- [ ] Mark a question complete → refresh → still marked (Supabase persisted it)
- [ ] Bookmark a question → go to `/bookmarks` → it appears
- [ ] `/flashcards/study` shows cards and rating buttons work
- [ ] Log out → header shows "Log in" → `/account` redirects to `/auth`
- [ ] Log back in → progress is still there (cloud synced)
