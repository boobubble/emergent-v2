
-- 1) Nominee (competition_competitors) enrichment
ALTER TABLE public.competition_competitors
  ADD COLUMN IF NOT EXISTS country text,
  ADD COLUMN IF NOT EXISTS social_links jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS website text,
  ADD COLUMN IF NOT EXISTS is_featured boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_pinned boolean NOT NULL DEFAULT false;

-- 2) competition_follows table
CREATE TABLE IF NOT EXISTS public.competition_follows (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  competition_id uuid NOT NULL REFERENCES public.competitions(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, competition_id)
);

GRANT SELECT, INSERT, DELETE ON public.competition_follows TO authenticated;
GRANT ALL ON public.competition_follows TO service_role;

ALTER TABLE public.competition_follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "follows readable to authenticated"
  ON public.competition_follows FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "users manage own follows insert"
  ON public.competition_follows FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "users manage own follows delete"
  ON public.competition_follows FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

CREATE INDEX IF NOT EXISTS competition_follows_competition_idx
  ON public.competition_follows(competition_id);

-- 3) Notify followers on status transitions (upcoming->live, live->completed)
CREATE OR REPLACE FUNCTION public.notify_competition_followers()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  kind_val text;
BEGIN
  IF NEW.status = OLD.status THEN
    RETURN NEW;
  END IF;

  IF OLD.status = 'upcoming' AND NEW.status = 'live' THEN
    kind_val := 'competition_started';
  ELSIF OLD.status = 'live' AND NEW.status = 'completed' THEN
    kind_val := 'competition_ended';
  ELSE
    RETURN NEW;
  END IF;

  INSERT INTO public.notifications (user_id, actor_id, kind, target_type, target_id, payload)
  SELECT f.user_id, NULL, kind_val, 'competition', NEW.id,
         jsonb_build_object('name', NEW.name, 'slug', NEW.slug, 'status', NEW.status)
  FROM public.competition_follows f
  WHERE f.competition_id = NEW.id;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS competitions_notify_followers ON public.competitions;
CREATE TRIGGER competitions_notify_followers
AFTER UPDATE OF status ON public.competitions
FOR EACH ROW
EXECUTE FUNCTION public.notify_competition_followers();
