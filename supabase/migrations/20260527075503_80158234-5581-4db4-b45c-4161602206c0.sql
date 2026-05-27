DROP POLICY IF EXISTS "Receiver can respond" ON public.game_invites;

CREATE POLICY "Receiver can respond"
ON public.game_invites
FOR UPDATE
TO authenticated
USING (auth.uid() = receiver_id)
WITH CHECK (auth.uid() = receiver_id);