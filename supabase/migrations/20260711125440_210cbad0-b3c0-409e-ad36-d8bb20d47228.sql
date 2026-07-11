
-- Views + report counters
ALTER TABLE public.competitions
  ADD COLUMN IF NOT EXISTS views_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS report_count integer NOT NULL DEFAULT 0;

-- ============ competition_competitors ============
CREATE TABLE IF NOT EXISTS public.competition_competitors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id uuid NOT NULL REFERENCES public.competitions(id) ON DELETE CASCADE,
  linked_user_id uuid,
  name text NOT NULL,
  photo_url text,
  description text,
  sort_order integer NOT NULL DEFAULT 0,
  vote_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.competition_competitors TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.competition_competitors TO authenticated;
GRANT ALL ON public.competition_competitors TO service_role;

ALTER TABLE public.competition_competitors ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "competitors public read" ON public.competition_competitors;
CREATE POLICY "competitors public read" ON public.competition_competitors
  FOR SELECT TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.competitions c
      WHERE c.id = competition_id
        AND (c.is_published = true OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'))
    )
  );

DROP POLICY IF EXISTS "competitors admin write" ON public.competition_competitors;
CREATE POLICY "competitors admin write" ON public.competition_competitors
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

CREATE INDEX IF NOT EXISTS competition_competitors_comp_idx
  ON public.competition_competitors(competition_id, sort_order);

DROP TRIGGER IF EXISTS competition_competitors_touch ON public.competition_competitors;
CREATE TRIGGER competition_competitors_touch
  BEFORE UPDATE ON public.competition_competitors
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ competition_competitor_votes ============
CREATE TABLE IF NOT EXISTS public.competition_competitor_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id uuid NOT NULL REFERENCES public.competitions(id) ON DELETE CASCADE,
  competitor_id uuid NOT NULL REFERENCES public.competition_competitors(id) ON DELETE CASCADE,
  voter_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (competition_id, voter_id)
);

GRANT SELECT, INSERT, DELETE ON public.competition_competitor_votes TO authenticated;
GRANT ALL ON public.competition_competitor_votes TO service_role;

ALTER TABLE public.competition_competitor_votes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "competitor votes self read" ON public.competition_competitor_votes;
CREATE POLICY "competitor votes self read" ON public.competition_competitor_votes
  FOR SELECT TO authenticated
  USING (auth.uid() = voter_id);

DROP POLICY IF EXISTS "competitor votes self insert" ON public.competition_competitor_votes;
CREATE POLICY "competitor votes self insert" ON public.competition_competitor_votes
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = voter_id
    AND EXISTS (
      SELECT 1 FROM public.competitions c
      WHERE c.id = competition_id AND c.status = 'live' AND c.is_published = true
    )
  );

DROP POLICY IF EXISTS "competitor votes self delete" ON public.competition_competitor_votes;
CREATE POLICY "competitor votes self delete" ON public.competition_competitor_votes
  FOR DELETE TO authenticated
  USING (auth.uid() = voter_id);

-- Keep vote_count in sync
CREATE OR REPLACE FUNCTION public.competition_competitor_votes_sync()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.competition_competitors SET vote_count = vote_count + 1 WHERE id = NEW.competitor_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.competition_competitors SET vote_count = GREATEST(vote_count - 1, 0) WHERE id = OLD.competitor_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS competition_competitor_votes_sync_trg ON public.competition_competitor_votes;
CREATE TRIGGER competition_competitor_votes_sync_trg
  AFTER INSERT OR DELETE ON public.competition_competitor_votes
  FOR EACH ROW EXECUTE FUNCTION public.competition_competitor_votes_sync();

-- Increment views helper (public)
CREATE OR REPLACE FUNCTION public.increment_competition_views(_competition uuid)
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  UPDATE public.competitions SET views_count = views_count + 1 WHERE id = _competition;
$$;

GRANT EXECUTE ON FUNCTION public.increment_competition_views(uuid) TO anon, authenticated;
