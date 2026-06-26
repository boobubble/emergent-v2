
REVOKE SELECT (author_id) ON public.confession_replies FROM authenticated;
REVOKE SELECT (author_id) ON public.confession_replies FROM anon;

DROP VIEW IF EXISTS public.confession_replies_public;
CREATE VIEW public.confession_replies_public
WITH (security_invoker = true) AS
SELECT
  id,
  confession_id,
  CASE WHEN is_anonymous THEN NULL::uuid ELSE author_id END AS author_id,
  alias,
  avatar_emoji,
  text,
  is_anonymous,
  created_at
FROM public.confession_replies;
GRANT SELECT ON public.confession_replies_public TO authenticated;

REVOKE SELECT (password) ON public.trio_rooms FROM authenticated;
REVOKE SELECT (password) ON public.trio_rooms FROM anon;

ALTER TABLE public.posts
  DROP CONSTRAINT IF EXISTS posts_anonymous_author_null;
UPDATE public.posts SET author_id = NULL
 WHERE is_anonymous = true AND author_id IS NOT NULL;
ALTER TABLE public.posts
  ADD CONSTRAINT posts_anonymous_author_null
  CHECK (NOT is_anonymous OR author_id IS NULL);

DROP POLICY IF EXISTS "Viewers read their own visits" ON public.profile_views;
