-- Run this in Supabase SQL editor at: https://app.supabase.com

-- 1. PROFILES — 1:1 with auth.users, auto-created via trigger
CREATE TABLE public.profiles (
  id           UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email        TEXT,
  display_name TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (NEW.id, NEW.email, split_part(NEW.email, '@', 1));
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. PROGRESS — replaces sdm-progress localStorage key
CREATE TABLE public.progress (
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id  INTEGER NOT NULL,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, question_id)
);

-- 3. BOOKMARKS — replaces sdm-bookmarks localStorage key
CREATE TABLE public.bookmarks (
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id   INTEGER NOT NULL,
  bookmarked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, question_id)
);

-- 4. FLASHCARD_REVIEWS — SM-2 state per (user, question), upserted on each review
CREATE TABLE public.flashcard_reviews (
  user_id          UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id      INTEGER NOT NULL,
  ease_factor      NUMERIC(4,2) NOT NULL DEFAULT 2.50,
  interval_days    INTEGER NOT NULL DEFAULT 1,
  repetitions      INTEGER NOT NULL DEFAULT 0,
  next_review_date DATE NOT NULL DEFAULT CURRENT_DATE,
  last_reviewed_at TIMESTAMPTZ,
  total_reviews    INTEGER NOT NULL DEFAULT 0,
  correct_reviews  INTEGER NOT NULL DEFAULT 0,
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, question_id)
);

CREATE INDEX idx_flashcard_due
  ON public.flashcard_reviews (user_id, next_review_date);

-- 5. FLASHCARD_REVIEW_LOG — append-only history for streaks and retention
CREATE TABLE public.flashcard_review_log (
  id               BIGSERIAL PRIMARY KEY,
  user_id          UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id      INTEGER NOT NULL,
  quality          SMALLINT NOT NULL CHECK (quality BETWEEN 1 AND 5),
  ease_factor      NUMERIC(4,2) NOT NULL,
  interval_days    INTEGER NOT NULL,
  next_review_date DATE NOT NULL,
  reviewed_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_review_log_user_date
  ON public.flashcard_review_log (user_id, reviewed_at DESC);

-- ROW LEVEL SECURITY
ALTER TABLE public.profiles           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flashcard_reviews  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flashcard_review_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own profile"        ON public.profiles           FOR ALL USING (auth.uid() = id);
CREATE POLICY "own progress"       ON public.progress           FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own bookmarks"      ON public.bookmarks          FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own flashcard state" ON public.flashcard_reviews FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own review log insert" ON public.flashcard_review_log FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own review log read"   ON public.flashcard_review_log FOR SELECT USING (auth.uid() = user_id);
