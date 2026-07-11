
-- Per-competition setting flags
ALTER TABLE public.competitions
  ADD COLUMN IF NOT EXISTS enable_voting boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS enable_reactions boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS enable_comments boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS enable_sharing boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS enable_join boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS hide_results_until_end boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS auto_close_voting boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS is_featured boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_pinned boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS allow_multiple_votes boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS max_votes_per_user integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS allow_guest_voting boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS allow_anonymous_voting boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS competitions_featured_idx ON public.competitions (is_featured) WHERE is_featured;
CREATE INDEX IF NOT EXISTS competitions_pinned_idx ON public.competitions (is_pinned) WHERE is_pinned;

-- Competitor moderation flags
ALTER TABLE public.competition_competitors
  ADD COLUMN IF NOT EXISTS is_hidden boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_disqualified boolean NOT NULL DEFAULT false;

-- RPC: reset all votes on a competition (admin)
CREATE OR REPLACE FUNCTION public.admin_reset_competition_votes(_competition uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin')) THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;
  DELETE FROM public.competition_competitor_votes WHERE competition_id = _competition;
  DELETE FROM public.competition_votes WHERE competition_id = _competition;
  UPDATE public.competition_competitors SET vote_count = 0 WHERE competition_id = _competition;
  UPDATE public.competition_participants SET vote_count = 0 WHERE competition_id = _competition;
  UPDATE public.competitions SET total_votes = 0 WHERE id = _competition;
END; $$;

-- RPC: reset votes for a single competitor (admin)
CREATE OR REPLACE FUNCTION public.admin_reset_competitor_votes(_competitor uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE _comp uuid;
BEGIN
  IF NOT (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin')) THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;
  SELECT competition_id INTO _comp FROM public.competition_competitors WHERE id = _competitor;
  DELETE FROM public.competition_competitor_votes WHERE competitor_id = _competitor;
  UPDATE public.competition_competitors SET vote_count = 0 WHERE id = _competitor;
  IF _comp IS NOT NULL THEN
    UPDATE public.competitions c
      SET total_votes = COALESCE((SELECT SUM(vote_count) FROM public.competition_competitors WHERE competition_id = _comp), 0)
      WHERE c.id = _comp;
  END IF;
END; $$;

-- RPC: analytics summary
CREATE OR REPLACE FUNCTION public.competition_analytics(_competition uuid)
RETURNS TABLE (
  total_views integer,
  total_participants integer,
  total_competitors integer,
  total_votes integer,
  unique_voters integer,
  leading_competitor_id uuid,
  leading_competitor_name text,
  leading_competitor_votes integer
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    COALESCE(c.views_count, 0),
    COALESCE(c.total_participants, 0),
    (SELECT COUNT(*)::int FROM public.competition_competitors WHERE competition_id = _competition),
    COALESCE(c.total_votes, 0),
    (SELECT COUNT(DISTINCT voter_id)::int FROM public.competition_competitor_votes WHERE competition_id = _competition),
    (SELECT id FROM public.competition_competitors WHERE competition_id = _competition ORDER BY vote_count DESC LIMIT 1),
    (SELECT name FROM public.competition_competitors WHERE competition_id = _competition ORDER BY vote_count DESC LIMIT 1),
    (SELECT vote_count FROM public.competition_competitors WHERE competition_id = _competition ORDER BY vote_count DESC LIMIT 1)
  FROM public.competitions c WHERE c.id = _competition;
$$;

GRANT EXECUTE ON FUNCTION public.admin_reset_competition_votes(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_reset_competitor_votes(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.competition_analytics(uuid) TO authenticated, anon;
