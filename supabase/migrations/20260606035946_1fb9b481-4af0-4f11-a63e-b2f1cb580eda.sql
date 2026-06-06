
-- 1. Restrict ai_chatbots SELECT to moderators/admins only
DROP POLICY IF EXISTS "ai_chatbots readable by authenticated" ON public.ai_chatbots;
CREATE POLICY "ai_chatbots readable by moderators" ON public.ai_chatbots
  FOR SELECT TO authenticated
  USING (public.is_moderator(auth.uid()));

-- 2. Hide device_info column on feedback_reports from non-admin roles
REVOKE SELECT (device_info) ON public.feedback_reports FROM anon, authenticated;

-- 3. Hide ip_address column on user_bans from non-admin roles
REVOKE SELECT (ip_address) ON public.user_bans FROM anon, authenticated;

-- 4. Add explicit admin-only SELECT policy on word_filters (defense in depth)
DROP POLICY IF EXISTS "Admins read word filters" ON public.word_filters;
CREATE POLICY "Admins read word filters" ON public.word_filters
  FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid()));
