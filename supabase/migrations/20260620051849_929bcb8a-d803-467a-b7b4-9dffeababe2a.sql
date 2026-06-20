-- 1) Mask author_id on anonymous confession replies via trigger.
CREATE OR REPLACE FUNCTION public.enforce_reply_anonymity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.is_anonymous THEN
    NEW.author_id := NULL;
  END IF;
  RETURN NEW;
END
$$;

DROP TRIGGER IF EXISTS enforce_reply_anonymity_trg ON public.confession_replies;
CREATE TRIGGER enforce_reply_anonymity_trg
  BEFORE INSERT OR UPDATE ON public.confession_replies
  FOR EACH ROW EXECUTE FUNCTION public.enforce_reply_anonymity();

-- Backfill: mask author_id on existing anonymous replies.
UPDATE public.confession_replies
SET author_id = NULL
WHERE is_anonymous AND author_id IS NOT NULL;

-- 2) Restrict games SELECT to participants, creators, or public games.
DROP POLICY IF EXISTS "Authenticated can read games" ON public.games;
CREATE POLICY "Read participating or public games"
  ON public.games
  FOR SELECT
  TO authenticated
  USING (
    visibility = 'public'
    OR created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.game_players gp
      WHERE gp.game_id = games.id AND gp.user_id = auth.uid()
    )
    OR is_moderator(auth.uid())
  );