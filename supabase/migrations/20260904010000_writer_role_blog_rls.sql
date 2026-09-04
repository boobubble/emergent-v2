-- Writer blog RLS. Does not change is_admin_or_moderator() or other admin helpers.

CREATE OR REPLACE FUNCTION public.is_content_editor()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role IN ('admin'::public.app_role, 'super_admin'::public.app_role, 'writer'::public.app_role)
  );
$$;

REVOKE ALL ON FUNCTION public.is_content_editor() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_content_editor() TO authenticated;

-- Writers can open any post in the editor (including other authors / automation).
DROP POLICY IF EXISTS "Writers read all posts" ON public.blog_posts;
CREATE POLICY "Writers read all posts"
  ON public.blog_posts
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'writer'::public.app_role));

-- Writers can update any post. Status/slug are not changed by /blog/write.
-- Delete and approve/reject stay on the admin-only ALL policy.
DROP POLICY IF EXISTS "Writers update all posts" ON public.blog_posts;
CREATE POLICY "Writers update all posts"
  ON public.blog_posts
  FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'writer'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'writer'::public.app_role));
