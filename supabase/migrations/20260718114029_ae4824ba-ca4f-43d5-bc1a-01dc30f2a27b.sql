
-- =========================================================================
-- MEHFIL (Poetry Community) — Foundation Schema
-- =========================================================================

-- 1. CATEGORIES ------------------------------------------------------------
CREATE TABLE public.mehfil_categories (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug         TEXT NOT NULL UNIQUE,
  name         TEXT NOT NULL,
  description  TEXT,
  icon         TEXT,
  color        TEXT,
  sort_order   INTEGER NOT NULL DEFAULT 0,
  is_active    BOOLEAN NOT NULL DEFAULT true,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.mehfil_categories TO anon, authenticated;
GRANT ALL    ON public.mehfil_categories TO service_role;
ALTER TABLE public.mehfil_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "mehfil_categories public read"
  ON public.mehfil_categories FOR SELECT
  USING (is_active = true OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));

CREATE POLICY "mehfil_categories admin manage"
  ON public.mehfil_categories FOR ALL
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));

-- 2. POEMS -----------------------------------------------------------------
CREATE TABLE public.mehfil_poems (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug            TEXT NOT NULL UNIQUE,
  title           TEXT NOT NULL,
  body            TEXT NOT NULL,
  category_id     UUID REFERENCES public.mehfil_categories(id) ON DELETE SET NULL,
  author_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cover_url       TEXT,
  theme           TEXT,
  language        TEXT NOT NULL DEFAULT 'en',
  tags            TEXT[] NOT NULL DEFAULT '{}',
  status          TEXT NOT NULL DEFAULT 'published'
                    CHECK (status IN ('draft','pending','published','archived','rejected')),
  view_count      INTEGER NOT NULL DEFAULT 0,
  read_count      INTEGER NOT NULL DEFAULT 0,
  upvote_count    INTEGER NOT NULL DEFAULT 0,
  comment_count   INTEGER NOT NULL DEFAULT 0,
  share_count     INTEGER NOT NULL DEFAULT 0,
  bookmark_count  INTEGER NOT NULL DEFAULT 0,
  is_featured     BOOLEAN NOT NULL DEFAULT false,
  is_editors_pick BOOLEAN NOT NULL DEFAULT false,
  competition_id  UUID,
  seo_title       TEXT,
  seo_description TEXT,
  published_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX mehfil_poems_status_pub_idx ON public.mehfil_poems (status, published_at DESC NULLS LAST);
CREATE INDEX mehfil_poems_category_idx   ON public.mehfil_poems (category_id, status, published_at DESC NULLS LAST);
CREATE INDEX mehfil_poems_author_idx     ON public.mehfil_poems (author_id, created_at DESC);
CREATE INDEX mehfil_poems_featured_idx   ON public.mehfil_poems (is_featured, published_at DESC) WHERE is_featured;
CREATE INDEX mehfil_poems_pick_idx       ON public.mehfil_poems (is_editors_pick, published_at DESC) WHERE is_editors_pick;
CREATE INDEX mehfil_poems_upvote_idx     ON public.mehfil_poems (upvote_count DESC, published_at DESC) WHERE status = 'published';
CREATE INDEX mehfil_poems_reads_idx      ON public.mehfil_poems (read_count DESC, published_at DESC) WHERE status = 'published';
CREATE INDEX mehfil_poems_competition_idx ON public.mehfil_poems (competition_id) WHERE competition_id IS NOT NULL;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.mehfil_poems TO authenticated;
GRANT SELECT ON public.mehfil_poems TO anon;
GRANT ALL    ON public.mehfil_poems TO service_role;
ALTER TABLE public.mehfil_poems ENABLE ROW LEVEL SECURITY;

CREATE POLICY "mehfil_poems public read published"
  ON public.mehfil_poems FOR SELECT
  USING (status = 'published');

CREATE POLICY "mehfil_poems author read own"
  ON public.mehfil_poems FOR SELECT
  TO authenticated
  USING (author_id = auth.uid());

CREATE POLICY "mehfil_poems staff read all"
  ON public.mehfil_poems FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));

CREATE POLICY "mehfil_poems author insert"
  ON public.mehfil_poems FOR INSERT
  TO authenticated
  WITH CHECK (author_id = auth.uid());

CREATE POLICY "mehfil_poems author update"
  ON public.mehfil_poems FOR UPDATE
  TO authenticated
  USING (author_id = auth.uid())
  WITH CHECK (author_id = auth.uid());

CREATE POLICY "mehfil_poems author delete"
  ON public.mehfil_poems FOR DELETE
  TO authenticated
  USING (author_id = auth.uid());

CREATE POLICY "mehfil_poems staff manage"
  ON public.mehfil_poems FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));

-- 3. BOOKMARKS -------------------------------------------------------------
CREATE TABLE public.mehfil_bookmarks (
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  poem_id    UUID NOT NULL REFERENCES public.mehfil_poems(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, poem_id)
);

GRANT SELECT, INSERT, DELETE ON public.mehfil_bookmarks TO authenticated;
GRANT ALL ON public.mehfil_bookmarks TO service_role;
ALTER TABLE public.mehfil_bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "mehfil_bookmarks own manage"
  ON public.mehfil_bookmarks FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- 4. READS -----------------------------------------------------------------
CREATE TABLE public.mehfil_poem_reads (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poem_id     UUID NOT NULL REFERENCES public.mehfil_poems(id) ON DELETE CASCADE,
  user_id     UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_key TEXT,
  read_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  read_day    DATE GENERATED ALWAYS AS ((read_at AT TIME ZONE 'UTC')::date) STORED
);

CREATE INDEX mehfil_poem_reads_poem_idx ON public.mehfil_poem_reads (poem_id, read_at DESC);
CREATE UNIQUE INDEX mehfil_poem_reads_dedup_user_idx
  ON public.mehfil_poem_reads (poem_id, user_id, read_day)
  WHERE user_id IS NOT NULL;

GRANT SELECT, INSERT ON public.mehfil_poem_reads TO authenticated;
GRANT INSERT ON public.mehfil_poem_reads TO anon;
GRANT ALL ON public.mehfil_poem_reads TO service_role;
ALTER TABLE public.mehfil_poem_reads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "mehfil_poem_reads insert any"
  ON public.mehfil_poem_reads FOR INSERT
  TO anon, authenticated
  WITH CHECK (user_id IS NULL OR user_id = auth.uid());

CREATE POLICY "mehfil_poem_reads staff read"
  ON public.mehfil_poem_reads FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));

-- 5. HALL OF FAME ----------------------------------------------------------
CREATE TABLE public.mehfil_hall_of_fame (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poem_id       UUID REFERENCES public.mehfil_poems(id) ON DELETE SET NULL,
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  period        TEXT NOT NULL CHECK (period IN ('weekly','monthly','yearly','all_time')),
  period_start  DATE,
  period_end    DATE,
  rank          INTEGER NOT NULL DEFAULT 1,
  category_id   UUID REFERENCES public.mehfil_categories(id) ON DELETE SET NULL,
  awarded_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX mehfil_hof_period_idx ON public.mehfil_hall_of_fame (period, period_start DESC, rank);
CREATE INDEX mehfil_hof_user_idx   ON public.mehfil_hall_of_fame (user_id, awarded_at DESC);

GRANT SELECT ON public.mehfil_hall_of_fame TO anon, authenticated;
GRANT ALL    ON public.mehfil_hall_of_fame TO service_role;
ALTER TABLE public.mehfil_hall_of_fame ENABLE ROW LEVEL SECURITY;

CREATE POLICY "mehfil_hof public read"
  ON public.mehfil_hall_of_fame FOR SELECT
  USING (true);

CREATE POLICY "mehfil_hof admin manage"
  ON public.mehfil_hall_of_fame FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));

-- 6. WRITER STATS ----------------------------------------------------------
CREATE TABLE public.mehfil_writer_stats (
  user_id           UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  poems_published   INTEGER NOT NULL DEFAULT 0,
  total_upvotes     INTEGER NOT NULL DEFAULT 0,
  total_reads       INTEGER NOT NULL DEFAULT 0,
  total_comments    INTEGER NOT NULL DEFAULT 0,
  battle_wins       INTEGER NOT NULL DEFAULT 0,
  featured_count    INTEGER NOT NULL DEFAULT 0,
  hof_count         INTEGER NOT NULL DEFAULT 0,
  writer_rank       TEXT NOT NULL DEFAULT 'fresh_writer'
                     CHECK (writer_rank IN ('fresh_writer','rising_poet','poet','master_poet','legend_poet','hall_of_fame')),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX mehfil_writer_stats_rank_idx    ON public.mehfil_writer_stats (writer_rank);
CREATE INDEX mehfil_writer_stats_upvotes_idx ON public.mehfil_writer_stats (total_upvotes DESC);

GRANT SELECT ON public.mehfil_writer_stats TO anon, authenticated;
GRANT ALL    ON public.mehfil_writer_stats TO service_role;
ALTER TABLE public.mehfil_writer_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "mehfil_writer_stats public read"
  ON public.mehfil_writer_stats FOR SELECT
  USING (true);

-- =========================================================================
-- HELPERS
-- =========================================================================

CREATE OR REPLACE FUNCTION public.mehfil_touch_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER mehfil_categories_touch  BEFORE UPDATE ON public.mehfil_categories
  FOR EACH ROW EXECUTE FUNCTION public.mehfil_touch_updated_at();
CREATE TRIGGER mehfil_poems_touch       BEFORE UPDATE ON public.mehfil_poems
  FOR EACH ROW EXECUTE FUNCTION public.mehfil_touch_updated_at();
CREATE TRIGGER mehfil_writer_stats_touch BEFORE UPDATE ON public.mehfil_writer_stats
  FOR EACH ROW EXECUTE FUNCTION public.mehfil_touch_updated_at();

CREATE OR REPLACE FUNCTION public.mehfil_compute_writer_rank(
  poems INT, upvotes INT, wins INT, featured INT, hof INT
) RETURNS TEXT LANGUAGE sql IMMUTABLE AS $$
  SELECT CASE
    WHEN hof >= 1 OR wins >= 10 THEN 'hall_of_fame'
    WHEN wins >= 3 OR upvotes >= 5000 OR featured >= 10 THEN 'legend_poet'
    WHEN wins >= 1 OR upvotes >= 1500 OR poems >= 50 OR featured >= 3 THEN 'master_poet'
    WHEN upvotes >= 300 OR poems >= 15 THEN 'poet'
    WHEN upvotes >= 30 OR poems >= 3 THEN 'rising_poet'
    ELSE 'fresh_writer'
  END;
$$;

CREATE OR REPLACE FUNCTION public.mehfil_refresh_writer_stats(target_user UUID)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_poems INT; v_up INT; v_reads INT; v_comments INT;
  v_wins INT; v_feat INT; v_hof INT;
BEGIN
  SELECT COUNT(*), COALESCE(SUM(upvote_count),0), COALESCE(SUM(read_count),0),
         COALESCE(SUM(comment_count),0), COALESCE(SUM(CASE WHEN is_featured THEN 1 ELSE 0 END),0)
    INTO v_poems, v_up, v_reads, v_comments, v_feat
    FROM public.mehfil_poems
   WHERE author_id = target_user AND status = 'published';

  SELECT COUNT(*) INTO v_hof
    FROM public.mehfil_hall_of_fame WHERE user_id = target_user;

  v_wins := 0;

  INSERT INTO public.mehfil_writer_stats(user_id, poems_published, total_upvotes, total_reads,
    total_comments, battle_wins, featured_count, hof_count, writer_rank, updated_at)
  VALUES (target_user, v_poems, v_up, v_reads, v_comments, v_wins, v_feat, v_hof,
          public.mehfil_compute_writer_rank(v_poems, v_up, v_wins, v_feat, v_hof), now())
  ON CONFLICT (user_id) DO UPDATE
    SET poems_published = EXCLUDED.poems_published,
        total_upvotes   = EXCLUDED.total_upvotes,
        total_reads     = EXCLUDED.total_reads,
        total_comments  = EXCLUDED.total_comments,
        battle_wins     = EXCLUDED.battle_wins,
        featured_count  = EXCLUDED.featured_count,
        hof_count       = EXCLUDED.hof_count,
        writer_rank     = EXCLUDED.writer_rank,
        updated_at      = now();
END;
$$;

CREATE OR REPLACE FUNCTION public.mehfil_poems_before_change()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    IF NEW.status = 'published' AND NEW.published_at IS NULL THEN
      NEW.published_at := now();
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER mehfil_poems_bi BEFORE INSERT OR UPDATE ON public.mehfil_poems
  FOR EACH ROW EXECUTE FUNCTION public.mehfil_poems_before_change();

CREATE OR REPLACE FUNCTION public.mehfil_poems_after_ins_upd_del()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    PERFORM public.mehfil_refresh_writer_stats(OLD.author_id);
  ELSE
    PERFORM public.mehfil_refresh_writer_stats(NEW.author_id);
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER mehfil_poems_ai AFTER INSERT OR UPDATE OR DELETE ON public.mehfil_poems
  FOR EACH ROW EXECUTE FUNCTION public.mehfil_poems_after_ins_upd_del();

CREATE OR REPLACE FUNCTION public.mehfil_increment_view(p_poem_id UUID)
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  UPDATE public.mehfil_poems SET view_count = view_count + 1 WHERE id = p_poem_id;
$$;

CREATE OR REPLACE FUNCTION public.mehfil_record_read(p_poem_id UUID, p_session TEXT DEFAULT NULL)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE inserted INT;
BEGIN
  INSERT INTO public.mehfil_poem_reads(poem_id, user_id, session_key)
  VALUES (p_poem_id, auth.uid(), p_session)
  ON CONFLICT DO NOTHING;
  GET DIAGNOSTICS inserted = ROW_COUNT;
  IF inserted > 0 THEN
    UPDATE public.mehfil_poems SET read_count = read_count + 1 WHERE id = p_poem_id;
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.mehfil_increment_view(UUID)                    TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.mehfil_record_read(UUID, TEXT)                 TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.mehfil_compute_writer_rank(INT,INT,INT,INT,INT) TO anon, authenticated;

-- =========================================================================
-- SEED CATEGORIES
-- =========================================================================
INSERT INTO public.mehfil_categories (slug, name, description, icon, color, sort_order) VALUES
  ('love',           'Love',            'Poems of romance and devotion',    'Heart',         '#ef4444',  1),
  ('breakup',        'Breakup',         'Heartache and healing',            'HeartCrack',    '#f43f5e',  2),
  ('sad',            'Sad',             'Melancholy and longing',           'CloudRain',     '#64748b',  3),
  ('friendship',     'Friendship',      'Bonds that carry us',              'Users',         '#f59e0b',  4),
  ('motivation',     'Motivation',      'Words to rise by',                 'Flame',         '#f97316',  5),
  ('life',           'Life',            'Everyday reflections',             'Sun',           '#22c55e',  6),
  ('family',         'Family',          'Blood, roots and home',            'Home',          '#14b8a6',  7),
  ('spiritual',      'Spiritual',       'Faith, soul and the divine',       'Sparkles',      '#a855f7',  8),
  ('funny',          'Funny',           'Wit and laughter in verse',        'Smile',         '#eab308',  9),
  ('patriotism',     'Patriotism',      'Land, pride and legacy',           'Flag',          '#0ea5e9', 10),
  ('quotes',         'Quotes',          'Short thoughts, sharp truths',     'Quote',         '#6366f1', 11),
  ('original-poetry','Original Poetry', 'Freeform original works',          'PenLine',       '#ec4899', 12);

INSERT INTO public.app_settings (key, value)
VALUES ('mehfil', jsonb_build_object(
  'enabled', true,
  'battles_enabled', true,
  'upvotes_enabled', true,
  'comments_enabled', true,
  'reactions_enabled', true,
  'shares_enabled', true,
  'ai_assist_enabled', true,
  'auto_publish_winners', true,
  'trending_widget_frequency', 5,
  'battle_auto_enroll', false,
  'default_language', 'en'
))
ON CONFLICT (key) DO NOTHING;

ALTER PUBLICATION supabase_realtime ADD TABLE public.mehfil_poems;
ALTER PUBLICATION supabase_realtime ADD TABLE public.mehfil_writer_stats;
