
-- 1. Enum for content types the engine can moderate
DO $$ BEGIN
  CREATE TYPE public.moderatable_content_type AS ENUM (
    'feed_post','poetry_poem','comment','competition_submission','meme','image','video'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 2. Per-item moderation state
CREATE TABLE IF NOT EXISTS public.content_moderation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type public.moderatable_content_type NOT NULL,
  content_id UUID NOT NULL,
  owner_id UUID,
  status TEXT NOT NULL DEFAULT 'visible' CHECK (status IN ('visible','pending_review','hidden','removed')),
  reason TEXT,
  report_count INT NOT NULL DEFAULT 0,
  ai_flags JSONB,
  hidden_at TIMESTAMPTZ,
  last_actor_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (content_type, content_id)
);
GRANT SELECT ON public.content_moderation TO authenticated;
GRANT ALL ON public.content_moderation TO service_role;
ALTER TABLE public.content_moderation ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cm_admin_all" ON public.content_moderation FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'moderator') OR public.has_role(auth.uid(),'feed_moderator'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'moderator') OR public.has_role(auth.uid(),'feed_moderator'));
CREATE POLICY "cm_owner_read" ON public.content_moderation FOR SELECT TO authenticated
  USING (owner_id = auth.uid());
CREATE INDEX IF NOT EXISTS idx_cm_type_status ON public.content_moderation(content_type, status);
CREATE INDEX IF NOT EXISTS idx_cm_owner ON public.content_moderation(owner_id);

-- 3. Unified moderator action log
CREATE TABLE IF NOT EXISTS public.content_moderation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type public.moderatable_content_type,
  content_id UUID,
  action_taken TEXT NOT NULL,
  reason TEXT,
  moderator_id UUID,
  target_user_id UUID,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.content_moderation_logs TO authenticated;
GRANT ALL ON public.content_moderation_logs TO service_role;
ALTER TABLE public.content_moderation_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cml_admin_read" ON public.content_moderation_logs FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'moderator') OR public.has_role(auth.uid(),'feed_moderator'));
CREATE INDEX IF NOT EXISTS idx_cml_content ON public.content_moderation_logs(content_type, content_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cml_target_user ON public.content_moderation_logs(target_user_id, created_at DESC);

-- 4. Add scope to existing feed ban/warning tables so they can cover all modules
ALTER TABLE public.feed_posting_bans ADD COLUMN IF NOT EXISTS scope TEXT NOT NULL DEFAULT 'all';
ALTER TABLE public.feed_mod_warnings ADD COLUMN IF NOT EXISTS scope TEXT NOT NULL DEFAULT 'all';

-- 5. Auto-hide trigger — when report_count crosses threshold, hide + log
CREATE OR REPLACE FUNCTION public.content_moderation_autohide()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  threshold INT;
BEGIN
  IF NEW.report_count IS DISTINCT FROM OLD.report_count
     AND NEW.status = 'visible'
     AND NEW.report_count > 0 THEN
    SELECT COALESCE((value->>'auto_hide_report_threshold')::int, 5)
      INTO threshold
      FROM public.app_settings
      WHERE key = 'feed_moderation'
      LIMIT 1;
    IF NEW.report_count >= COALESCE(threshold, 5) THEN
      NEW.status := 'pending_review';
      NEW.reason := COALESCE(NEW.reason, 'Auto-flagged by reports');
      NEW.hidden_at := now();
      INSERT INTO public.content_moderation_logs
        (content_type, content_id, action_taken, reason, target_user_id, metadata)
      VALUES
        (NEW.content_type, NEW.content_id, 'auto_flag_reports',
         'Report threshold reached', NEW.owner_id,
         jsonb_build_object('report_count', NEW.report_count, 'threshold', threshold));
    END IF;
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_cm_autohide ON public.content_moderation;
CREATE TRIGGER trg_cm_autohide
  BEFORE UPDATE ON public.content_moderation
  FOR EACH ROW EXECUTE FUNCTION public.content_moderation_autohide();

-- 6. Helper RPC to atomically bump report count + upsert row
CREATE OR REPLACE FUNCTION public.content_moderation_bump_report(
  _content_type public.moderatable_content_type,
  _content_id UUID,
  _owner_id UUID DEFAULT NULL
) RETURNS public.content_moderation
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  row public.content_moderation;
BEGIN
  INSERT INTO public.content_moderation (content_type, content_id, owner_id, report_count)
  VALUES (_content_type, _content_id, _owner_id, 1)
  ON CONFLICT (content_type, content_id)
  DO UPDATE SET report_count = public.content_moderation.report_count + 1,
                owner_id = COALESCE(public.content_moderation.owner_id, EXCLUDED.owner_id),
                updated_at = now()
  RETURNING * INTO row;
  RETURN row;
END;
$$;

REVOKE ALL ON FUNCTION public.content_moderation_bump_report(public.moderatable_content_type, UUID, UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.content_moderation_bump_report(public.moderatable_content_type, UUID, UUID) TO authenticated, service_role;
