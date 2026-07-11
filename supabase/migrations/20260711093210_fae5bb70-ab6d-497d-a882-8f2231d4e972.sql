
-- Fix 1: dm_shared_themes weak substring check -> exact participant check
DROP POLICY IF EXISTS "DM participants view shared theme" ON public.dm_shared_themes;
CREATE POLICY "DM participants view shared theme"
ON public.dm_shared_themes
FOR SELECT
TO authenticated
USING (public.is_dm_channel_allowed(channel_id, auth.uid()));

-- Fix 2: reactions on non-post targets - require visibility of underlying target
DROP POLICY IF EXISTS "Read reactions on non-post targets" ON public.reactions;
CREATE POLICY "Read reactions on visible non-post targets"
ON public.reactions
FOR SELECT
TO authenticated
USING (
  target_type <> 'post' AND (
    (target_type = 'confession' AND EXISTS (
      SELECT 1 FROM public.confessions c
      WHERE c.id = reactions.target_id
        AND (c.status = 'approved' OR c.author_id = auth.uid() OR public.is_admin(auth.uid()))
    ))
    OR (target_type = 'confession_reply' AND EXISTS (
      SELECT 1 FROM public.confession_replies r
      JOIN public.confessions c ON c.id = r.confession_id
      WHERE r.id = reactions.target_id
        AND (c.status = 'approved' OR c.author_id = auth.uid() OR r.author_id = auth.uid() OR public.is_admin(auth.uid()))
    ))
    OR (target_type = 'comment' AND EXISTS (
      SELECT 1 FROM public.comments cm
      JOIN public.posts p ON p.id = cm.post_id
      WHERE cm.id = reactions.target_id
        AND (
          cm.author_id = auth.uid()
          OR p.owner_id = auth.uid()
          OR public.is_admin(auth.uid())
          OR (p.is_anonymous = false AND (
            p.privacy = 'public'::post_privacy
            OR (p.privacy = 'friends'::post_privacy AND public.has_friendship(auth.uid(), p.owner_id))
          ))
        )
    ))
  )
);
