DROP POLICY IF EXISTS "participants readable" ON public.competition_participants;

CREATE POLICY "participants readable"
ON public.competition_participants
FOR SELECT
USING (
  status = 'approved'
  OR user_id = auth.uid()
  OR public.is_admin(auth.uid())
);