
-- Phase 2 Mehfil: Poetry Battle support (reuses Competition Engine)

-- 1) Extend competitions to support type discriminator + battle metadata
ALTER TABLE public.competitions
  ADD COLUMN IF NOT EXISTS type text NOT NULL DEFAULT 'standard',
  ADD COLUMN IF NOT EXISTS mehfil_category_id uuid REFERENCES public.mehfil_categories(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS mehfil_theme text,
  ADD COLUMN IF NOT EXISTS max_entries int,
  ADD COLUMN IF NOT EXISTS auto_enroll_rules jsonb NOT NULL DEFAULT '{}'::jsonb;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'competitions_type_check') THEN
    ALTER TABLE public.competitions
      ADD CONSTRAINT competitions_type_check CHECK (type IN ('standard','poetry_battle'));
  END IF;
END $$;
CREATE INDEX IF NOT EXISTS competitions_type_idx ON public.competitions(type);
CREATE INDEX IF NOT EXISTS competitions_mehfil_cat_idx ON public.competitions(mehfil_category_id);

-- 2) Extend competition_participants so a battle entry can link to a poem
ALTER TABLE public.competition_participants
  ADD COLUMN IF NOT EXISTS mehfil_poem_id uuid REFERENCES public.mehfil_poems(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS competition_participants_poem_idx ON public.competition_participants(mehfil_poem_id);

-- 3) Poem opt-in flag
ALTER TABLE public.mehfil_poems
  ADD COLUMN IF NOT EXISTS opt_in_battle boolean NOT NULL DEFAULT false;

-- 4) Auto-enroll trigger: when a poem is published with opt_in_battle=true,
--    look up an active/live/upcoming poetry_battle for its category and enroll it.
CREATE OR REPLACE FUNCTION public.mehfil_auto_enroll_battle()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_battle_id uuid;
BEGIN
  IF NEW.status <> 'published' OR NEW.opt_in_battle IS NOT TRUE OR NEW.category_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Only enroll if not already enrolled
  IF NEW.competition_id IS NOT NULL THEN
    RETURN NEW;
  END IF;

  SELECT c.id INTO v_battle_id
    FROM public.competitions c
    WHERE c.type = 'poetry_battle'
      AND c.mehfil_category_id = NEW.category_id
      AND c.status IN ('upcoming','live')
      AND now() < c.end_at
      AND (c.max_entries IS NULL OR (
        SELECT count(*) FROM public.competition_participants p
          WHERE p.competition_id = c.id AND p.status = 'approved'
      ) < c.max_entries)
    ORDER BY c.start_at ASC
    LIMIT 1;

  IF v_battle_id IS NULL THEN
    RETURN NEW;
  END IF;

  INSERT INTO public.competition_participants (competition_id, user_id, mehfil_poem_id, status)
  VALUES (v_battle_id, NEW.author_id, NEW.id, 'approved')
  ON CONFLICT (competition_id, user_id) DO NOTHING;

  UPDATE public.mehfil_poems SET competition_id = v_battle_id WHERE id = NEW.id;

  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS mehfil_auto_enroll_battle_ins ON public.mehfil_poems;
CREATE TRIGGER mehfil_auto_enroll_battle_ins
  AFTER INSERT ON public.mehfil_poems
  FOR EACH ROW EXECUTE FUNCTION public.mehfil_auto_enroll_battle();

DROP TRIGGER IF EXISTS mehfil_auto_enroll_battle_upd ON public.mehfil_poems;
CREATE TRIGGER mehfil_auto_enroll_battle_upd
  AFTER UPDATE OF status, opt_in_battle ON public.mehfil_poems
  FOR EACH ROW
  WHEN (NEW.status = 'published' AND NEW.opt_in_battle IS TRUE AND NEW.competition_id IS NULL)
  EXECUTE FUNCTION public.mehfil_auto_enroll_battle();

-- 5) When a poetry battle completes, record winners to Hall of Fame and bump stats.
CREATE OR REPLACE FUNCTION public.mehfil_finalize_battle()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  r record;
BEGIN
  IF NEW.type <> 'poetry_battle' THEN RETURN NEW; END IF;
  IF NEW.status <> 'completed' OR OLD.status = 'completed' THEN RETURN NEW; END IF;

  FOR r IN
    SELECT cp.user_id, cp.mehfil_poem_id, cp.rank
    FROM public.competition_participants cp
    WHERE cp.competition_id = NEW.id
      AND cp.status = 'approved'
      AND cp.rank IS NOT NULL
      AND cp.rank <= COALESCE(NEW.winner_count, 1)
  LOOP
    INSERT INTO public.mehfil_hall_of_fame (poem_id, user_id, period, awarded_at, rank, competition_id)
    VALUES (r.mehfil_poem_id, r.user_id, 'weekly', now(), r.rank, NEW.id)
    ON CONFLICT DO NOTHING;

    -- Bump writer stats
    INSERT INTO public.mehfil_writer_stats (user_id, battle_wins)
    VALUES (r.user_id, 1)
    ON CONFLICT (user_id) DO UPDATE SET battle_wins = mehfil_writer_stats.battle_wins + 1;
  END LOOP;

  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS mehfil_finalize_battle_trg ON public.competitions;
CREATE TRIGGER mehfil_finalize_battle_trg
  AFTER UPDATE OF status ON public.competitions
  FOR EACH ROW
  WHEN (NEW.type = 'poetry_battle' AND NEW.status = 'completed')
  EXECUTE FUNCTION public.mehfil_finalize_battle();
