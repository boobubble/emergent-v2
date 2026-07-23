
-- Hide detection heuristics in trust_violations from end users; keep server/mod access via admin client.
DROP POLICY IF EXISTS "read own violations" ON public.trust_violations;
CREATE POLICY "moderators read violations"
  ON public.trust_violations
  FOR SELECT
  TO authenticated
  USING (public.is_moderator(auth.uid()));

-- Validate device fingerprint/user_agent shape at insert time to prevent pollution of fraud data.
DROP POLICY IF EXISTS "Users insert own devices" ON public.user_devices;
CREATE POLICY "Users insert own devices"
  ON public.user_devices
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND fingerprint ~ '^[a-f0-9]{64}$'
    AND (user_agent IS NULL OR length(user_agent) <= 500)
  );
