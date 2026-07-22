
-- Competition Engine 2.0 — Smart Auto Qualification (backward compatible)

-- 1. Extend competitions
ALTER TABLE public.competitions
  ADD COLUMN IF NOT EXISTS entry_mode text NOT NULL DEFAULT 'manual',
  ADD COLUMN IF NOT EXISTS qualification_method text,
  ADD COLUMN IF NOT EXISTS qualification_config jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS auto_approve boolean NOT NULL DEFAULT true;

ALTER TABLE public.competitions
  DROP CONSTRAINT IF EXISTS competitions_entry_mode_check;
ALTER TABLE public.competitions
  ADD CONSTRAINT competitions_entry_mode_check
  CHECK (entry_mode IN ('manual','smart','hybrid'));

ALTER TABLE public.competitions
  DROP CONSTRAINT IF EXISTS competitions_qualification_method_check;
ALTER TABLE public.competitions
  ADD CONSTRAINT competitions_qualification_method_check
  CHECK (qualification_method IS NULL OR qualification_method IN
    ('fixed','top_n_week','top_n_month','top_percent','approval'));

CREATE INDEX IF NOT EXISTS competitions_entry_mode_idx
  ON public.competitions(entry_mode) WHERE entry_mode <> 'manual';

-- 2. Extend competition_competitors
ALTER TABLE public.competition_competitors
  ADD COLUMN IF NOT EXISTS origin text NOT NULL DEFAULT 'manual',
  ADD COLUMN IF NOT EXISTS qualification_reason jsonb,
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS post_id uuid REFERENCES public.posts(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS poem_id uuid REFERENCES public.mehfil_poems(id) ON DELETE SET NULL;

ALTER TABLE public.competition_competitors
  DROP CONSTRAINT IF EXISTS competition_competitors_origin_check;
ALTER TABLE public.competition_competitors
  ADD CONSTRAINT competition_competitors_origin_check
  CHECK (origin IN ('manual','auto'));

ALTER TABLE public.competition_competitors
  DROP CONSTRAINT IF EXISTS competition_competitors_status_check;
ALTER TABLE public.competition_competitors
  ADD CONSTRAINT competition_competitors_status_check
  CHECK (status IN ('active','pending_approval','rejected','disqualified'));

CREATE UNIQUE INDEX IF NOT EXISTS competition_competitors_auto_post_uniq
  ON public.competition_competitors(competition_id, post_id)
  WHERE post_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS competition_competitors_auto_poem_uniq
  ON public.competition_competitors(competition_id, poem_id)
  WHERE poem_id IS NOT NULL;

-- 3. Eligibility flag on source content
ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS eligible_for_competitions boolean NOT NULL DEFAULT true;

ALTER TABLE public.mehfil_poems
  ADD COLUMN IF NOT EXISTS eligible_for_competitions boolean NOT NULL DEFAULT true;

-- 4. Qualification log (dedupe + audit)
CREATE TABLE IF NOT EXISTS public.competition_qualification_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id uuid NOT NULL REFERENCES public.competitions(id) ON DELETE CASCADE,
  content_type text NOT NULL CHECK (content_type IN ('post','poem')),
  content_id uuid NOT NULL,
  user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  score numeric NOT NULL DEFAULT 0,
  method text,
  snapshot jsonb NOT NULL DEFAULT '{}'::jsonb,
  qualified_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (competition_id, content_type, content_id)
);

GRANT SELECT ON public.competition_qualification_log TO authenticated;
GRANT ALL ON public.competition_qualification_log TO service_role;
ALTER TABLE public.competition_qualification_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "qlog own read" ON public.competition_qualification_log
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR is_admin(auth.uid()));

-- 5. Event queue (lightweight)
CREATE TABLE IF NOT EXISTS public.competition_qualification_events (
  id bigserial PRIMARY KEY,
  content_type text NOT NULL CHECK (content_type IN ('post','poem')),
  content_id uuid NOT NULL,
  enqueued_at timestamptz NOT NULL DEFAULT now(),
  processed_at timestamptz
);

CREATE INDEX IF NOT EXISTS cqe_pending_idx
  ON public.competition_qualification_events(enqueued_at)
  WHERE processed_at IS NULL;

CREATE INDEX IF NOT EXISTS cqe_content_recent_idx
  ON public.competition_qualification_events(content_type, content_id, enqueued_at DESC);

GRANT SELECT ON public.competition_qualification_events TO authenticated;
GRANT ALL ON public.competition_qualification_events TO service_role;
ALTER TABLE public.competition_qualification_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cqe admin read" ON public.competition_qualification_events
  FOR SELECT TO authenticated
  USING (is_admin(auth.uid()));

-- 6. Enqueue helper: dedupe within 60s window
CREATE OR REPLACE FUNCTION public.enqueue_qualification_event(_type text, _id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF _id IS NULL THEN RETURN; END IF;
  IF EXISTS (
    SELECT 1 FROM public.competition_qualification_events
    WHERE content_type = _type AND content_id = _id
      AND enqueued_at > now() - interval '60 seconds'
      AND processed_at IS NULL
  ) THEN
    RETURN;
  END IF;
  INSERT INTO public.competition_qualification_events(content_type, content_id)
  VALUES (_type, _id);
END $$;

-- 7. Triggers on engagement columns
CREATE OR REPLACE FUNCTION public.trg_post_engagement_enqueue()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT'
     OR NEW.reaction_count IS DISTINCT FROM OLD.reaction_count
     OR NEW.comment_count  IS DISTINCT FROM OLD.comment_count
     OR NEW.trending_score IS DISTINCT FROM OLD.trending_score THEN
    PERFORM public.enqueue_qualification_event('post', NEW.id);
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS posts_qualification_enqueue ON public.posts;
CREATE TRIGGER posts_qualification_enqueue
AFTER INSERT OR UPDATE OF reaction_count, comment_count, trending_score
ON public.posts
FOR EACH ROW EXECUTE FUNCTION public.trg_post_engagement_enqueue();

CREATE OR REPLACE FUNCTION public.trg_poem_engagement_enqueue()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT'
     OR NEW.upvote_count   IS DISTINCT FROM OLD.upvote_count
     OR NEW.read_count     IS DISTINCT FROM OLD.read_count
     OR NEW.comment_count  IS DISTINCT FROM OLD.comment_count
     OR NEW.bookmark_count IS DISTINCT FROM OLD.bookmark_count
     OR NEW.share_count    IS DISTINCT FROM OLD.share_count THEN
    PERFORM public.enqueue_qualification_event('poem', NEW.id);
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS poems_qualification_enqueue ON public.mehfil_poems;
CREATE TRIGGER poems_qualification_enqueue
AFTER INSERT OR UPDATE OF upvote_count, read_count, comment_count, bookmark_count, share_count
ON public.mehfil_poems
FOR EACH ROW EXECUTE FUNCTION public.trg_poem_engagement_enqueue();

-- 8. Generic engagement score
CREATE OR REPLACE FUNCTION public.engagement_score(_type text, _id uuid, _weights jsonb)
RETURNS numeric
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  w jsonb := COALESCE(_weights, '{}'::jsonb);
  wl numeric := COALESCE((w->>'likes')::numeric, 1);
  wc numeric := COALESCE((w->>'comments')::numeric, 3);
  ws numeric := COALESCE((w->>'shares')::numeric, 2);
  wv numeric := COALESCE((w->>'views')::numeric, 0.01);
  wr numeric := COALESCE((w->>'reads')::numeric, 0.05);
  wb numeric := COALESCE((w->>'bookmarks')::numeric, 2);
  score numeric := 0;
  p record;
  m record;
BEGIN
  IF _type = 'post' THEN
    SELECT reaction_count, comment_count, trending_score INTO p
      FROM public.posts WHERE id = _id;
    IF p IS NULL THEN RETURN 0; END IF;
    score := COALESCE(p.reaction_count,0) * wl
           + COALESCE(p.comment_count,0)  * wc
           + COALESCE(p.trending_score,0) * wv;
  ELSIF _type = 'poem' THEN
    SELECT upvote_count, comment_count, share_count, read_count, bookmark_count INTO m
      FROM public.mehfil_poems WHERE id = _id;
    IF m IS NULL THEN RETURN 0; END IF;
    score := COALESCE(m.upvote_count,0)   * wl
           + COALESCE(m.comment_count,0)  * wc
           + COALESCE(m.share_count,0)    * ws
           + COALESCE(m.read_count,0)     * wr
           + COALESCE(m.bookmark_count,0) * wb;
  END IF;
  RETURN score;
END $$;

GRANT EXECUTE ON FUNCTION public.engagement_score(text,uuid,jsonb) TO authenticated, anon;
