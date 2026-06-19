
-- ============ PROFILES: hide coins from other users ============
REVOKE SELECT (coins) ON public.profiles FROM authenticated;
REVOKE SELECT (coins) ON public.profiles FROM anon;

-- Function to fetch the signed-in user's own coin balance
CREATE OR REPLACE FUNCTION public.my_coin_balance()
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT coins FROM public.profiles WHERE id = auth.uid()
$$;
REVOKE EXECUTE ON FUNCTION public.my_coin_balance() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.my_coin_balance() TO authenticated;

-- ============ POSTS: mask owner_id for anonymous posts ============
REVOKE SELECT (owner_id) ON public.posts FROM authenticated;
REVOKE SELECT (owner_id) ON public.posts FROM anon;

CREATE OR REPLACE VIEW public.posts_safe
WITH (security_invoker = on) AS
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
FROM public.posts p;

GRANT SELECT ON public.posts_safe TO authenticated, anon;
