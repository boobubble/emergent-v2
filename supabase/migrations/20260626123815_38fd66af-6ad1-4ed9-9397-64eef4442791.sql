
-- 1. confession_replies: public view that masks author_id when anonymous
CREATE OR REPLACE VIEW public.confession_replies_public
WITH (security_invoker = true) AS
SELECT
  id,
  confession_id,
  CASE WHEN is_anonymous THEN NULL ELSE author_id END AS author_id,
  text,
  is_anonymous,
  created_at
FROM public.confession_replies;

GRANT SELECT ON public.confession_replies_public TO authenticated, anon;

-- 2. message_highlights: allow buyer to insert own row
CREATE POLICY "Buyer inserts own highlight"
ON public.message_highlights
FOR INSERT TO authenticated
WITH CHECK (buyer_id = auth.uid());

-- 3. profile_views: allow viewer to insert own row
CREATE POLICY "Viewer inserts own view"
ON public.profile_views
FOR INSERT TO authenticated
WITH CHECK (viewer_id = auth.uid());

-- 4. room_loyalty: allow user to insert/update own row
CREATE POLICY "User inserts own room loyalty"
ON public.room_loyalty
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "User updates own room loyalty"
ON public.room_loyalty
FOR UPDATE TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 5. user_devices: allow user to insert own device
CREATE POLICY "Users insert own devices"
ON public.user_devices
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);
