DROP POLICY IF EXISTS "Read reactions" ON public.confession_reactions;
CREATE POLICY "Read own reactions" ON public.confession_reactions
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);