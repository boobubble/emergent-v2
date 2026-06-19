
-- 1) Column-level revoke on confessions.author_id and confession_replies.author_id
REVOKE SELECT (author_id) ON public.confessions FROM anon, authenticated;
REVOKE SELECT (author_id) ON public.confession_replies FROM anon, authenticated;

-- service_role keeps full access (no change needed)

-- 2) Recreate posts_safe as security_invoker view to satisfy the
--    Supabase "Security Definer View" linter. RLS on public.posts is
--    enforced as the viewer; the view's own filter + column masking
--    preserves anonymity for owner_id.
DROP VIEW IF EXISTS public.posts_safe;

CREATE VIEW public.posts_safe
WITH (security_invoker = true)
AS
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

-- Note: posts_safe now relies on the underlying posts RLS to filter rows
-- and on column-level grants on posts.* to project columns. Re-grant
-- SELECT on every safe column (excluding owner_id) to anon/authenticated
-- to ensure the view stays readable after the security_invoker switch.
GRANT SELECT (
  id, author_id, kind, text, media_urls, poll, privacy, is_anonymous,
  hashtags, reaction_count, comment_count, trending_score, created_at,
  updated_at, slug
) ON public.posts TO anon, authenticated;
