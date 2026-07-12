ALTER TABLE public.competition_competitors
  ADD CONSTRAINT competition_competitors_linked_user_id_fkey
  FOREIGN KEY (linked_user_id) REFERENCES public.profiles(id) ON DELETE SET NULL;
NOTIFY pgrst, 'reload schema';