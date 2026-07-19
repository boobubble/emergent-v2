ALTER TABLE public.mehfil_hall_of_fame
  ADD COLUMN IF NOT EXISTS competition_id uuid REFERENCES public.competitions(id) ON DELETE SET NULL;

CREATE UNIQUE INDEX IF NOT EXISTS mehfil_hall_of_fame_comp_rank_uniq
  ON public.mehfil_hall_of_fame (competition_id, rank)
  WHERE competition_id IS NOT NULL;