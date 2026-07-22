-- Competition Meme Integration: add category + competition_id + nominee_id to posts
ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS category text,
  ADD COLUMN IF NOT EXISTS competition_id uuid REFERENCES public.competitions(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS nominee_id uuid REFERENCES public.competition_competitors(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS posts_category_idx ON public.posts (category) WHERE category IS NOT NULL;
CREATE INDEX IF NOT EXISTS posts_competition_id_idx ON public.posts (competition_id) WHERE competition_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS posts_nominee_id_idx ON public.posts (nominee_id) WHERE nominee_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS posts_competition_meme_rank_idx
  ON public.posts (competition_id, reaction_count DESC, comment_count DESC, created_at DESC)
  WHERE category = 'meme' AND competition_id IS NOT NULL;

-- Rebuild posts_safe view to expose new columns (security_invoker preserved)
DROP VIEW IF EXISTS public.posts_safe;

CREATE VIEW public.posts_safe
  WITH (security_invoker = on)
AS
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
  p.community_id,
  p.category,
  p.competition_id,
  p.nominee_id
FROM public.posts p;

GRANT SELECT ON public.posts_safe TO anon, authenticated;