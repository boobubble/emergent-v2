
-- Allow unauthenticated visitors to read public feed content (posts, comments,
-- reactions, hashtags). Mirrors the existing authenticated visibility rules
-- but restricted strictly to public, non-anonymous, non-hidden content.
-- Write permissions remain unchanged: all INSERT/UPDATE/DELETE policies
-- continue to require an authenticated user.

CREATE POLICY "Anon can read public non-anonymous posts"
ON public.posts FOR SELECT
TO anon
USING (is_anonymous = false AND privacy = 'public'::post_privacy);

CREATE POLICY "Anon can read comments on public posts"
ON public.comments FOR SELECT
TO anon
USING (EXISTS (
  SELECT 1 FROM public.posts p
  WHERE p.id = comments.post_id
    AND p.is_anonymous = false
    AND p.privacy = 'public'::post_privacy
));

CREATE POLICY "Anon can read reactions on public posts"
ON public.reactions FOR SELECT
TO anon
USING (
  target_type = 'post' AND EXISTS (
    SELECT 1 FROM public.posts p
    WHERE p.id = reactions.target_id
      AND p.is_anonymous = false
      AND p.privacy = 'public'::post_privacy
  )
);

CREATE POLICY "Anon can read reactions on comments of public posts"
ON public.reactions FOR SELECT
TO anon
USING (
  target_type = 'comment' AND EXISTS (
    SELECT 1 FROM public.comments cm
    JOIN public.posts p ON p.id = cm.post_id
    WHERE cm.id = reactions.target_id
      AND p.is_anonymous = false
      AND p.privacy = 'public'::post_privacy
  )
);

CREATE POLICY "Anon can read hashtags"
ON public.hashtags FOR SELECT
TO anon
USING (true);
