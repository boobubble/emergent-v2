REVOKE SELECT (author_id) ON public.confessions FROM authenticated;
REVOKE SELECT (author_id) ON public.confessions FROM anon;
REVOKE SELECT (author_id) ON public.confession_replies FROM authenticated;
REVOKE SELECT (author_id) ON public.confession_replies FROM anon;

DROP POLICY IF EXISTS "Anyone authenticated reads reports" ON public.feedback_reports;
CREATE POLICY "Read own or showcased reports"
  ON public.feedback_reports
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = author_id
    OR is_showcased = true
    OR public.is_admin(auth.uid())
  );

DROP POLICY IF EXISTS "Users manage own devices" ON public.user_devices;
CREATE POLICY "Users read own devices"
  ON public.user_devices
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "Users delete own devices"
  ON public.user_devices
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);