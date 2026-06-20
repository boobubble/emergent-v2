DROP POLICY IF EXISTS "Read all boosts" ON public.post_boosts;
CREATE POLICY "Read own boosts" ON public.post_boosts
  FOR SELECT TO authenticated
  USING (auth.uid() = booster_id);