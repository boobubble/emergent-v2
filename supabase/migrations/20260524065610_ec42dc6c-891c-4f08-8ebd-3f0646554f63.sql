-- Messages: restrict UPDATE/DELETE to message authors
CREATE POLICY "Update own messages"
ON public.messages
FOR UPDATE
TO authenticated
USING (auth.uid() = author_id)
WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Delete own messages"
ON public.messages
FOR DELETE
TO authenticated
USING (auth.uid() = author_id);

-- Hashtags: block all client writes. The register_hashtags() SECURITY DEFINER
-- trigger (fired by posts insert) handles all writes via elevated privileges.
CREATE POLICY "Block client inserts to hashtags"
ON public.hashtags
FOR INSERT
TO authenticated
WITH CHECK (false);

CREATE POLICY "Block client updates to hashtags"
ON public.hashtags
FOR UPDATE
TO authenticated
USING (false)
WITH CHECK (false);

CREATE POLICY "Block client deletes from hashtags"
ON public.hashtags
FOR DELETE
TO authenticated
USING (false);