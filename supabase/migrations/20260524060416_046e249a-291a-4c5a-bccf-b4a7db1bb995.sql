DROP POLICY IF EXISTS "Read comments on visible posts" ON public.comments;

CREATE POLICY "Read comments on visible posts"
ON public.comments
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.posts p
    WHERE p.id = comments.post_id
      AND (
        p.privacy = 'public'
        OR p.author_id = auth.uid()
        OR (p.privacy = 'friends' AND public.has_friendship(auth.uid(), p.author_id))
      )
  )
);