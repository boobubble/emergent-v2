-- profile_views: remove owner direct-read; keep only viewer self-read.
DROP POLICY IF EXISTS "Owner reads own visitors" ON public.profile_views;
CREATE POLICY "Viewers read their own visits" ON public.profile_views
  FOR SELECT TO authenticated
  USING (viewer_id = auth.uid());

-- message_highlights: restrict read to buyer or moderators.
DROP POLICY IF EXISTS "Read active highlights" ON public.message_highlights;
CREATE POLICY "Buyer or mod reads highlights" ON public.message_highlights
  FOR SELECT TO authenticated
  USING (buyer_id = auth.uid() OR public.is_moderator(auth.uid()));