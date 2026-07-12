
-- 1) Profiles: prevent direct client reads of sensitive columns.
REVOKE SELECT (city, about_me, interests) ON public.profiles FROM anon, authenticated;

-- Owner accessor for private fields.
CREATE OR REPLACE FUNCTION public.get_my_profile_extras()
RETURNS TABLE(city text, about_me text, interests text[])
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT p.city, p.about_me, p.interests
  FROM public.profiles p
  WHERE p.id = auth.uid();
$$;
REVOKE ALL ON FUNCTION public.get_my_profile_extras() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_my_profile_extras() TO authenticated;

-- 2) feedback_reports: remove showcased-branch from base-table SELECT policy.
DROP POLICY IF EXISTS "Read own or showcased reports" ON public.feedback_reports;
CREATE POLICY "Read own reports"
  ON public.feedback_reports FOR SELECT
  TO authenticated
  USING (auth.uid() = author_id OR public.is_admin(auth.uid()));
