-- Per-writer permission: edit already-existing blog posts and custom pages.
-- Only meaningful on user_roles rows where role = 'writer'. Ignored for other roles.

ALTER TABLE public.user_roles
  ADD COLUMN IF NOT EXISTS can_edit_existing_content boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN public.user_roles.can_edit_existing_content IS
  'When role is writer, allow editing existing blog posts and custom pages. Ignored for other roles.';

CREATE OR REPLACE FUNCTION public.is_writer_existing_editor()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role = 'writer'::public.app_role
      AND can_edit_existing_content
  );
$$;

REVOKE ALL ON FUNCTION public.is_writer_existing_editor() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_writer_existing_editor() TO authenticated;

DROP POLICY IF EXISTS "Writers read all posts" ON public.blog_posts;
CREATE POLICY "Writers read all posts"
  ON public.blog_posts
  FOR SELECT
  TO authenticated
  USING (public.is_writer_existing_editor());

DROP POLICY IF EXISTS "Writers update all posts" ON public.blog_posts;
CREATE POLICY "Writers update all posts"
  ON public.blog_posts
  FOR UPDATE
  TO authenticated
  USING (public.is_writer_existing_editor())
  WITH CHECK (public.is_writer_existing_editor());
