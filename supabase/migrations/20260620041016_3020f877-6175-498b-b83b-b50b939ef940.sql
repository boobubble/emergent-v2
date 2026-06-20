DROP POLICY IF EXISTS "Read visible confessions" ON public.confessions;
CREATE POLICY "Read own confessions"
  ON public.confessions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = author_id);

REVOKE SELECT (ip_address) ON public.user_bans FROM authenticated;
REVOKE SELECT (ip_address) ON public.user_bans FROM anon;