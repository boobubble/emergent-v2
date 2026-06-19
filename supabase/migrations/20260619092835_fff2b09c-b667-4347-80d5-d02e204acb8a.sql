
-- 1) confession_replies: revoke broad SELECT, grant only safe columns
REVOKE SELECT ON public.confession_replies FROM anon, authenticated;
GRANT SELECT (id, confession_id, alias, avatar_emoji, is_anonymous, text, created_at)
  ON public.confession_replies TO anon, authenticated;
-- service_role keeps full access via prior ALL grant; admin/owner reads go through SECURITY DEFINER RPCs.

-- 2) profiles: enforce is_private at RLS, keep self + mod/admin visibility
DROP POLICY IF EXISTS "Authenticated users can view all profiles" ON public.profiles;

CREATE POLICY "Profiles visible to self or when public"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = id
    OR COALESCE(is_private, false) = false
    OR public.is_moderator(auth.uid())
  );
