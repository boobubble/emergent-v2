
-- ================================================================
-- Feed Moderation System
-- ================================================================

-- Post/comment moderation columns
ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS moderation_status text NOT NULL DEFAULT 'visible',
  ADD COLUMN IF NOT EXISTS moderation_reason text,
  ADD COLUMN IF NOT EXISTS hidden_at timestamptz,
  ADD COLUMN IF NOT EXISTS report_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS ai_flags jsonb NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE public.posts
  ADD CONSTRAINT posts_moderation_status_chk
  CHECK (moderation_status IN ('visible','pending_review','hidden','removed'));

CREATE INDEX IF NOT EXISTS posts_moderation_status_idx
  ON public.posts(moderation_status)
  WHERE moderation_status <> 'visible';

ALTER TABLE public.comments
  ADD COLUMN IF NOT EXISTS moderation_status text NOT NULL DEFAULT 'visible',
  ADD COLUMN IF NOT EXISTS moderation_reason text,
  ADD COLUMN IF NOT EXISTS hidden_at timestamptz,
  ADD COLUMN IF NOT EXISTS report_count integer NOT NULL DEFAULT 0;

ALTER TABLE public.comments
  ADD CONSTRAINT comments_moderation_status_chk
  CHECK (moderation_status IN ('visible','pending_review','hidden','removed'));

CREATE INDEX IF NOT EXISTS comments_moderation_status_idx
  ON public.comments(moderation_status)
  WHERE moderation_status <> 'visible';

-- ---------- Feed posting bans ----------
CREATE TABLE IF NOT EXISTS public.feed_posting_bans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  reason text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz,
  active boolean NOT NULL DEFAULT true
);
CREATE INDEX IF NOT EXISTS feed_posting_bans_active_idx
  ON public.feed_posting_bans(user_id) WHERE active = true;

GRANT SELECT ON public.feed_posting_bans TO authenticated;
GRANT ALL ON public.feed_posting_bans TO service_role;

ALTER TABLE public.feed_posting_bans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own bans" ON public.feed_posting_bans
  FOR SELECT TO authenticated
  USING (user_id = auth.uid()
      OR public.has_role(auth.uid(), 'feed_moderator')
      OR public.has_role(auth.uid(), 'moderator')
      OR public.has_role(auth.uid(), 'admin')
      OR public.has_role(auth.uid(), 'super_admin'));

-- ---------- Warnings ----------
CREATE TABLE IF NOT EXISTS public.feed_mod_warnings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  moderator_id uuid,
  severity text NOT NULL DEFAULT 'notice',
  reason text NOT NULL,
  target_type text,
  target_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  acknowledged_at timestamptz
);
CREATE INDEX IF NOT EXISTS feed_mod_warnings_user_idx
  ON public.feed_mod_warnings(user_id, created_at DESC);

GRANT SELECT, UPDATE ON public.feed_mod_warnings TO authenticated;
GRANT ALL ON public.feed_mod_warnings TO service_role;

ALTER TABLE public.feed_mod_warnings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own warnings" ON public.feed_mod_warnings
  FOR SELECT TO authenticated
  USING (user_id = auth.uid()
      OR public.has_role(auth.uid(), 'feed_moderator')
      OR public.has_role(auth.uid(), 'moderator')
      OR public.has_role(auth.uid(), 'admin')
      OR public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Users ack own warning" ON public.feed_mod_warnings
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ---------- Default settings ----------
INSERT INTO public.app_settings (key, value) VALUES (
  'feed_moderation',
  jsonb_build_object(
    'enabled', true,
    'auto_hide_report_threshold', 5,
    'auto_hide_ai_threshold', 0.8,
    'duplicate_window_minutes', 10,
    'max_posts_per_hour', 20,
    'max_comments_per_minute', 10,
    'ai_image_moderation_enabled', true,
    'ai_moderation_categories', jsonb_build_array('nudity','pornography','violence','gore','child_safety','drugs','weapons')
  )
) ON CONFLICT (key) DO NOTHING;

-- ---------- Auto-hide trigger on reports ----------
CREATE OR REPLACE FUNCTION public.feed_moderation_on_report()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  threshold integer;
  new_count integer;
  cfg jsonb;
BEGIN
  IF NEW.target_type NOT IN ('post','comment') THEN
    RETURN NEW;
  END IF;

  SELECT value INTO cfg FROM public.app_settings WHERE key = 'feed_moderation';
  threshold := COALESCE((cfg->>'auto_hide_report_threshold')::int, 5);

  IF NEW.target_type = 'post' THEN
    UPDATE public.posts
       SET report_count = report_count + 1
     WHERE id::text = NEW.target_id
     RETURNING report_count INTO new_count;

    IF new_count IS NOT NULL AND new_count >= threshold THEN
      UPDATE public.posts
         SET moderation_status = 'hidden',
             hidden_at = COALESCE(hidden_at, now()),
             moderation_reason = COALESCE(moderation_reason, 'Auto-hidden: report threshold reached')
       WHERE id::text = NEW.target_id
         AND moderation_status = 'visible';
    END IF;

  ELSIF NEW.target_type = 'comment' THEN
    UPDATE public.comments
       SET report_count = report_count + 1
     WHERE id::text = NEW.target_id
     RETURNING report_count INTO new_count;

    IF new_count IS NOT NULL AND new_count >= threshold THEN
      UPDATE public.comments
         SET moderation_status = 'hidden',
             hidden_at = COALESCE(hidden_at, now()),
             moderation_reason = COALESCE(moderation_reason, 'Auto-hidden: report threshold reached')
       WHERE id::text = NEW.target_id
         AND moderation_status = 'visible';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS reports_feed_moderation_trg ON public.reports;
CREATE TRIGGER reports_feed_moderation_trg
  AFTER INSERT ON public.reports
  FOR EACH ROW EXECUTE FUNCTION public.feed_moderation_on_report();

-- ---------- Posting ban + duplicate/spam gate on posts insert ----------
CREATE OR REPLACE FUNCTION public.feed_moderation_before_post()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  cfg jsonb;
  window_minutes int;
  max_per_hour int;
  dup_count int;
  hour_count int;
BEGIN
  IF NEW.author_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Active posting ban
  IF EXISTS (
    SELECT 1 FROM public.feed_posting_bans
     WHERE user_id = NEW.author_id
       AND active = true
       AND (expires_at IS NULL OR expires_at > now())
  ) THEN
    RAISE EXCEPTION 'FEED_POSTING_BAN: You are temporarily banned from posting to the feed.'
      USING ERRCODE = 'check_violation';
  END IF;

  SELECT value INTO cfg FROM public.app_settings WHERE key = 'feed_moderation';
  IF cfg IS NULL OR (cfg->>'enabled')::boolean IS DISTINCT FROM true THEN
    RETURN NEW;
  END IF;

  window_minutes := COALESCE((cfg->>'duplicate_window_minutes')::int, 10);
  max_per_hour := COALESCE((cfg->>'max_posts_per_hour')::int, 20);

  -- Rate-limit: posts per hour
  SELECT count(*) INTO hour_count
    FROM public.posts
   WHERE author_id = NEW.author_id
     AND created_at > now() - interval '1 hour';
  IF hour_count >= max_per_hour THEN
    RAISE EXCEPTION 'FEED_SPAM_RATE: Too many posts in the last hour.'
      USING ERRCODE = 'check_violation';
  END IF;

  -- Duplicate detection (identical text within window)
  IF length(coalesce(NEW.text,'')) > 8 THEN
    SELECT count(*) INTO dup_count
      FROM public.posts
     WHERE author_id = NEW.author_id
       AND text = NEW.text
       AND created_at > now() - make_interval(mins => window_minutes);
    IF dup_count > 0 THEN
      NEW.moderation_status := 'pending_review';
      NEW.moderation_reason := 'Duplicate content';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS posts_feed_moderation_before_trg ON public.posts;
CREATE TRIGGER posts_feed_moderation_before_trg
  BEFORE INSERT ON public.posts
  FOR EACH ROW EXECUTE FUNCTION public.feed_moderation_before_post();

-- ---------- Comment spam gate ----------
CREATE OR REPLACE FUNCTION public.feed_moderation_before_comment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  cfg jsonb;
  max_per_min int;
  minute_count int;
BEGIN
  IF NEW.author_id IS NULL THEN RETURN NEW; END IF;

  IF EXISTS (
    SELECT 1 FROM public.feed_posting_bans
     WHERE user_id = NEW.author_id
       AND active = true
       AND (expires_at IS NULL OR expires_at > now())
  ) THEN
    RAISE EXCEPTION 'FEED_POSTING_BAN: You are temporarily banned from commenting.'
      USING ERRCODE = 'check_violation';
  END IF;

  SELECT value INTO cfg FROM public.app_settings WHERE key = 'feed_moderation';
  IF cfg IS NULL OR (cfg->>'enabled')::boolean IS DISTINCT FROM true THEN
    RETURN NEW;
  END IF;

  max_per_min := COALESCE((cfg->>'max_comments_per_minute')::int, 10);

  SELECT count(*) INTO minute_count
    FROM public.comments
   WHERE author_id = NEW.author_id
     AND created_at > now() - interval '1 minute';
  IF minute_count >= max_per_min THEN
    RAISE EXCEPTION 'FEED_SPAM_RATE: Slow down — you are commenting too fast.'
      USING ERRCODE = 'check_violation';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS comments_feed_moderation_before_trg ON public.comments;
CREATE TRIGGER comments_feed_moderation_before_trg
  BEFORE INSERT ON public.comments
  FOR EACH ROW EXECUTE FUNCTION public.feed_moderation_before_comment();

-- ---------- posts_safe view: hide non-visible from anon/regular users ----------
DROP VIEW IF EXISTS public.posts_safe;
CREATE VIEW public.posts_safe
  WITH (security_invoker = on)
AS
SELECT
  p.id, p.owner_id, p.author_id, p.kind, p.text, p.media_urls, p.poll,
  p.privacy, p.is_anonymous, p.hashtags, p.reaction_count, p.comment_count,
  p.trending_score, p.created_at, p.updated_at, p.slug, p.community_id,
  p.category, p.competition_id, p.nominee_id,
  p.moderation_status, p.report_count
FROM public.posts p
WHERE
  p.moderation_status = 'visible'
  OR p.author_id = auth.uid()
  OR public.has_role(auth.uid(), 'feed_moderator')
  OR public.has_role(auth.uid(), 'moderator')
  OR public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'super_admin');

GRANT SELECT ON public.posts_safe TO anon, authenticated;
