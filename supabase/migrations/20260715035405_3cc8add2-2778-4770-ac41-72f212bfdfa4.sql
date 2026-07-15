DROP VIEW IF EXISTS public.posts_safe;

CREATE VIEW public.posts_safe AS
SELECT
  p.id,
  p.owner_id,
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
  p.slug,
  p.community_id
FROM public.posts p;

GRANT SELECT ON public.posts_safe TO anon, authenticated;