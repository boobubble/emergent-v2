
-- Recreate posts_safe as a definer-style view so column-level revokes on
-- public.posts don't block the view from masking owner_id. We re-implement
-- the SELECT policy logic in the WHERE clause.
DROP VIEW IF EXISTS public.posts_safe;

CREATE VIEW public.posts_safe AS
SELECT
  p.id,
  CASE
    WHEN p.is_anonymous
      AND (auth.uid() IS NULL OR auth.uid() <> p.owner_id)
      AND NOT public.is_admin(auth.uid())
    THEN NULL
    ELSE p.owner_id
  END AS owner_id,
  p.author_id,
  p.kind,
  p.text,
  p.media_urls,
  p.poll,
  p.privacy,
  p.is_anonymous,
  p.hashtags,
  p.reaction_count,
  p.comment_count,
  p.trending_score,
  p.created_at,
  p.updated_at,
  p.slug
FROM public.posts p
WHERE
  p.privacy = 'public'::post_privacy
  OR p.owner_id = auth.uid()
  OR (p.privacy = 'friends'::post_privacy AND public.has_friendship(auth.uid(), p.owner_id));

GRANT SELECT ON public.posts_safe TO authenticated, anon;
