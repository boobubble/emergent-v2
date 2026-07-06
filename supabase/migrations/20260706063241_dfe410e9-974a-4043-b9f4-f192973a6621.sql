DROP POLICY IF EXISTS "Read reactions" ON public.reactions;

CREATE POLICY "Read own reactions"
ON public.reactions
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Read reactions on visible posts"
ON public.reactions
FOR SELECT
TO authenticated
USING (
  target_type = 'post'
  AND EXISTS (
    SELECT 1 FROM public.posts p
    WHERE p.id = reactions.target_id
      AND (
        p.owner_id = auth.uid()
        OR public.is_admin(auth.uid())
        OR (
          p.is_anonymous = false
          AND (
            p.privacy = 'public'::post_privacy
            OR (p.privacy = 'friends'::post_privacy AND public.has_friendship(auth.uid(), p.owner_id))
          )
        )
      )
  )
);

CREATE POLICY "Read reactions on non-post targets"
ON public.reactions
FOR SELECT
TO authenticated
USING (target_type <> 'post');