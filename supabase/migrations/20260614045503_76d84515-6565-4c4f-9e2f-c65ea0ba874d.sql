
-- 1. app_settings: hide updated_by from anon, restrict sensitive keys
REVOKE SELECT (updated_by) ON public.app_settings FROM anon;

DROP POLICY IF EXISTS "Anyone can read settings" ON public.app_settings;
CREATE POLICY "Anon read non-sensitive settings"
  ON public.app_settings FOR SELECT TO anon
  USING (key NOT IN (
    'bots','automation','fake_activity','moderation','security',
    'word_filters','ai_chatbots','admin_modules','staff_permissions',
    'admin_roles','filters'
  ));
CREATE POLICY "Authenticated read settings"
  ON public.app_settings FOR SELECT TO authenticated
  USING (true);

-- 2. user_bans: hide ip_address column
REVOKE SELECT (ip_address) ON public.user_bans FROM anon, authenticated;

-- 3. brand-assets bucket: explicit admin-only SELECT
CREATE POLICY "Admins can read brand assets"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'brand-assets' AND public.is_admin(auth.uid()));

-- 4. feedback_comments: scope reads
DROP POLICY IF EXISTS "Read comments" ON public.feedback_comments;
CREATE POLICY "Read comments scoped"
  ON public.feedback_comments FOR SELECT TO authenticated
  USING (
    auth.uid() = author_id
    OR public.is_admin(auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.feedback_reports r
      WHERE r.id = feedback_comments.report_id
        AND (r.author_id = auth.uid() OR r.is_showcased = true)
    )
  );

-- 5. feedback_votes: scope reads
DROP POLICY IF EXISTS "Read votes" ON public.feedback_votes;
CREATE POLICY "Read votes scoped"
  ON public.feedback_votes FOR SELECT TO authenticated
  USING (
    auth.uid() = user_id
    OR public.is_admin(auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.feedback_reports r
      WHERE r.id = feedback_votes.report_id
        AND (r.author_id = auth.uid() OR r.is_showcased = true)
    )
  );

-- 6. internal_link_clicks: tighten INSERT
DROP POLICY IF EXISTS "Anyone can log clicks" ON public.internal_link_clicks;
CREATE POLICY "Log own clicks"
  ON public.internal_link_clicks FOR INSERT TO anon, authenticated
  WITH CHECK (user_id IS NULL OR user_id = auth.uid());
