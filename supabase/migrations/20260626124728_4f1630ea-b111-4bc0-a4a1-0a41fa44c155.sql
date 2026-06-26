
DROP POLICY IF EXISTS "Buyer or mod reads highlights" ON public.message_highlights;

CREATE POLICY "Buyer or mod reads highlights"
ON public.message_highlights
FOR SELECT TO authenticated
USING (
  buyer_id = auth.uid()
  OR (
    is_moderator(auth.uid())
    AND channel_id NOT LIKE 'dm:%'
    AND channel_id NOT LIKE 'trio:%'
  )
);
