-- Fix infinite RLS recursion on mehfil_poem_comments INSERT.
-- INSERT WITH CHECK must not SELECT from the same table (re-triggers RLS).
-- Pattern: SECURITY DEFINER helper, same as has_role / bump_mehfil_poem_comment_count.

CREATE OR REPLACE FUNCTION public.mehfil_poem_comment_parent_valid(
  p_parent_id uuid,
  p_poem_id uuid
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.mehfil_poem_comments c
    WHERE c.id = p_parent_id AND c.poem_id = p_poem_id
  );
$$;

GRANT EXECUTE ON FUNCTION public.mehfil_poem_comment_parent_valid(uuid, uuid) TO authenticated;

DROP POLICY IF EXISTS "mehfil_poem_comments insert own" ON public.mehfil_poem_comments;
CREATE POLICY "mehfil_poem_comments insert own"
  ON public.mehfil_poem_comments FOR INSERT
  TO authenticated
  WITH CHECK (
    author_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.mehfil_poems p
      WHERE p.id = poem_id AND p.status = 'published'
    )
    AND (
      parent_comment_id IS NULL
      OR public.mehfil_poem_comment_parent_valid(parent_comment_id, poem_id)
    )
  );
