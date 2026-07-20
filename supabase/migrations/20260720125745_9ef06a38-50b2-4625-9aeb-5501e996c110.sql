
-- =============================================================
-- Poetry Hub — Phase 3B.1: writer follows, drafts/scheduling,
-- prompts, collections, writer-stats extras.
-- Additive only. No breaking changes.
-- =============================================================

-- ---------- 1. Writer follows -------------------------------------------

CREATE TABLE IF NOT EXISTS public.poetry_writer_follows (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id  UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  writer_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (follower_id, writer_id),
  CHECK (follower_id <> writer_id)
);
CREATE INDEX IF NOT EXISTS poetry_writer_follows_writer_idx   ON public.poetry_writer_follows(writer_id);
CREATE INDEX IF NOT EXISTS poetry_writer_follows_follower_idx ON public.poetry_writer_follows(follower_id);

GRANT SELECT, INSERT, DELETE ON public.poetry_writer_follows TO authenticated;
GRANT SELECT ON public.poetry_writer_follows TO anon;
GRANT ALL ON public.poetry_writer_follows TO service_role;

ALTER TABLE public.poetry_writer_follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "poetry_writer_follows read" ON public.poetry_writer_follows
  FOR SELECT USING (true);
CREATE POLICY "poetry_writer_follows insert own" ON public.poetry_writer_follows
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "poetry_writer_follows delete own" ON public.poetry_writer_follows
  FOR DELETE TO authenticated
  USING (auth.uid() = follower_id);

-- Notification trigger — reuses existing notifications table.
CREATE OR REPLACE FUNCTION public.notify_writer_follow()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.notifications (user_id, actor_id, kind, target_type, target_id, payload)
  VALUES (NEW.writer_id, NEW.follower_id, 'writer_follow', 'user', NEW.follower_id, jsonb_build_object('follow_id', NEW.id));
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_writer_follow ON public.poetry_writer_follows;
CREATE TRIGGER trg_notify_writer_follow
AFTER INSERT ON public.poetry_writer_follows
FOR EACH ROW EXECUTE FUNCTION public.notify_writer_follow();

-- ---------- 2. Daily writing prompts ------------------------------------

CREATE TABLE IF NOT EXISTS public.poetry_prompts (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title          TEXT NOT NULL,
  body           TEXT,
  category_id    UUID REFERENCES public.mehfil_categories(id) ON DELETE SET NULL,
  scheduled_for  DATE,
  active_from    TIMESTAMPTZ,
  active_until   TIMESTAMPTZ,
  is_active      BOOLEAN NOT NULL DEFAULT true,
  created_by     UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS poetry_prompts_active_idx   ON public.poetry_prompts(is_active, scheduled_for);
CREATE INDEX IF NOT EXISTS poetry_prompts_schedule_idx ON public.poetry_prompts(scheduled_for);

GRANT SELECT ON public.poetry_prompts TO authenticated, anon;
GRANT ALL ON public.poetry_prompts TO service_role;

ALTER TABLE public.poetry_prompts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "poetry_prompts public read active" ON public.poetry_prompts
  FOR SELECT USING (is_active = true);
CREATE POLICY "poetry_prompts admin all" ON public.poetry_prompts
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ---------- 3. Collections ----------------------------------------------

CREATE TABLE IF NOT EXISTS public.poetry_collections (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  slug         TEXT NOT NULL,
  description  TEXT,
  cover_url    TEXT,
  is_public    BOOLEAN NOT NULL DEFAULT true,
  poem_count   INTEGER NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, slug)
);
CREATE INDEX IF NOT EXISTS poetry_collections_user_idx ON public.poetry_collections(user_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.poetry_collections TO authenticated;
GRANT SELECT ON public.poetry_collections TO anon;
GRANT ALL ON public.poetry_collections TO service_role;

ALTER TABLE public.poetry_collections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "poetry_collections read public or owner" ON public.poetry_collections
  FOR SELECT USING (is_public = true OR user_id = auth.uid());
CREATE POLICY "poetry_collections write own" ON public.poetry_collections
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "poetry_collections update own" ON public.poetry_collections
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "poetry_collections delete own" ON public.poetry_collections
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.poetry_collection_items (
  collection_id UUID NOT NULL REFERENCES public.poetry_collections(id) ON DELETE CASCADE,
  poem_id       UUID NOT NULL REFERENCES public.mehfil_poems(id) ON DELETE CASCADE,
  added_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (collection_id, poem_id)
);
CREATE INDEX IF NOT EXISTS poetry_collection_items_poem_idx ON public.poetry_collection_items(poem_id);

GRANT SELECT, INSERT, DELETE ON public.poetry_collection_items TO authenticated;
GRANT SELECT ON public.poetry_collection_items TO anon;
GRANT ALL ON public.poetry_collection_items TO service_role;

ALTER TABLE public.poetry_collection_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "poetry_collection_items read via collection" ON public.poetry_collection_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.poetry_collections c
      WHERE c.id = collection_id
        AND (c.is_public = true OR c.user_id = auth.uid())
    )
  );
CREATE POLICY "poetry_collection_items write via owner" ON public.poetry_collection_items
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM public.poetry_collections c WHERE c.id = collection_id AND c.user_id = auth.uid())
  );
CREATE POLICY "poetry_collection_items delete via owner" ON public.poetry_collection_items
  FOR DELETE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.poetry_collections c WHERE c.id = collection_id AND c.user_id = auth.uid())
  );

-- Keep poem_count fresh
CREATE OR REPLACE FUNCTION public.poetry_collection_items_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.poetry_collections SET poem_count = poem_count + 1, updated_at = now()
      WHERE id = NEW.collection_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.poetry_collections SET poem_count = GREATEST(poem_count - 1, 0), updated_at = now()
      WHERE id = OLD.collection_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_poetry_collection_items_count ON public.poetry_collection_items;
CREATE TRIGGER trg_poetry_collection_items_count
AFTER INSERT OR DELETE ON public.poetry_collection_items
FOR EACH ROW EXECUTE FUNCTION public.poetry_collection_items_count();

-- ---------- 4. Scheduled poems -----------------------------------------

ALTER TABLE public.mehfil_poems
  ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS mehfil_poems_scheduled_idx
  ON public.mehfil_poems(scheduled_at)
  WHERE status = 'draft' AND scheduled_at IS NOT NULL;

-- Publisher used by cron. Only touches drafts whose scheduled_at has passed.
CREATE OR REPLACE FUNCTION public.poetry_publish_scheduled()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  n INTEGER;
BEGIN
  UPDATE public.mehfil_poems
     SET status = 'published',
         published_at = COALESCE(published_at, scheduled_at, now()),
         updated_at = now()
   WHERE status = 'draft'
     AND scheduled_at IS NOT NULL
     AND scheduled_at <= now();
  GET DIAGNOSTICS n = ROW_COUNT;
  RETURN n;
END;
$$;

REVOKE ALL ON FUNCTION public.poetry_publish_scheduled() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.poetry_publish_scheduled() TO service_role;

-- ---------- 5. Writer stats extras -------------------------------------

ALTER TABLE public.mehfil_writer_stats
  ADD COLUMN IF NOT EXISTS followers_count INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS following_count INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS streak_days     INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS member_since    TIMESTAMPTZ;

-- Refresh helper — safe to call for any user; no side effects beyond stats.
CREATE OR REPLACE FUNCTION public.poetry_refresh_writer_stats(_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_followers INTEGER;
  v_following INTEGER;
  v_member    TIMESTAMPTZ;
  v_streak    INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_followers FROM public.poetry_writer_follows WHERE writer_id   = _user_id;
  SELECT COUNT(*) INTO v_following FROM public.poetry_writer_follows WHERE follower_id = _user_id;
  SELECT created_at INTO v_member FROM auth.users WHERE id = _user_id;

  -- streak: count consecutive days ending today with at least one published poem
  WITH days AS (
    SELECT DISTINCT date_trunc('day', COALESCE(published_at, created_at))::date AS d
    FROM public.mehfil_poems
    WHERE author_id = _user_id AND status = 'published'
  ),
  ranked AS (
    SELECT d, row_number() OVER (ORDER BY d DESC) AS rn FROM days
  )
  SELECT COUNT(*) INTO v_streak
  FROM ranked
  WHERE d = current_date - (rn - 1);

  INSERT INTO public.mehfil_writer_stats (user_id, followers_count, following_count, member_since, streak_days)
  VALUES (_user_id, v_followers, v_following, v_member, COALESCE(v_streak, 0))
  ON CONFLICT (user_id) DO UPDATE
     SET followers_count = EXCLUDED.followers_count,
         following_count = EXCLUDED.following_count,
         member_since    = COALESCE(public.mehfil_writer_stats.member_since, EXCLUDED.member_since),
         streak_days     = EXCLUDED.streak_days;
END;
$$;

GRANT EXECUTE ON FUNCTION public.poetry_refresh_writer_stats(UUID) TO authenticated, service_role;

-- Auto-refresh on follow/unfollow
CREATE OR REPLACE FUNCTION public.poetry_writer_follows_after_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.poetry_refresh_writer_stats(NEW.writer_id);
    PERFORM public.poetry_refresh_writer_stats(NEW.follower_id);
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM public.poetry_refresh_writer_stats(OLD.writer_id);
    PERFORM public.poetry_refresh_writer_stats(OLD.follower_id);
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_poetry_writer_follows_stats ON public.poetry_writer_follows;
CREATE TRIGGER trg_poetry_writer_follows_stats
AFTER INSERT OR DELETE ON public.poetry_writer_follows
FOR EACH ROW EXECUTE FUNCTION public.poetry_writer_follows_after_change();

-- ---------- 6. updated_at maintenance ----------------------------------

CREATE OR REPLACE FUNCTION public.poetry_touch_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

DROP TRIGGER IF EXISTS trg_poetry_prompts_touch ON public.poetry_prompts;
CREATE TRIGGER trg_poetry_prompts_touch
BEFORE UPDATE ON public.poetry_prompts
FOR EACH ROW EXECUTE FUNCTION public.poetry_touch_updated_at();

DROP TRIGGER IF EXISTS trg_poetry_collections_touch ON public.poetry_collections;
CREATE TRIGGER trg_poetry_collections_touch
BEFORE UPDATE ON public.poetry_collections
FOR EACH ROW EXECUTE FUNCTION public.poetry_touch_updated_at();
