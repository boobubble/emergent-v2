
-- 1) Defense-in-depth: hide visitors when the owner has disabled tracking.
CREATE OR REPLACE FUNCTION public.get_my_profile_visitors(_limit int DEFAULT 20)
RETURNS TABLE (
  id uuid,
  viewer_id uuid,
  viewed_at timestamptz,
  anonymous boolean,
  username text,
  avatar_url text,
  avatar_color text,
  locked boolean
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  enabled boolean;
  unlocked boolean;
  cap int;
  total int;
BEGIN
  IF uid IS NULL THEN RETURN; END IF;
  SELECT COALESCE(profile_views_enabled, true),
         COALESCE(profile_views_unlocked_full, false)
    INTO enabled, unlocked
    FROM public.profiles WHERE id = uid;
  IF NOT enabled THEN RETURN; END IF;

  cap := LEAST(GREATEST(COALESCE(_limit, 20), 1), 50);
  IF NOT unlocked THEN cap := LEAST(cap, 5); END IF;

  SELECT count(*) INTO total FROM public.profile_views WHERE profile_owner_id = uid;

  RETURN QUERY
  SELECT pv.id,
         CASE WHEN pv.anonymous THEN NULL ELSE pv.viewer_id END,
         pv.viewed_at,
         pv.anonymous,
         CASE WHEN pv.anonymous THEN NULL ELSE p.username END,
         CASE WHEN pv.anonymous THEN NULL ELSE p.avatar_url END,
         CASE WHEN pv.anonymous THEN NULL ELSE p.avatar_color END,
         (NOT unlocked AND total > 5) AS locked
  FROM public.profile_views pv
  LEFT JOIN public.profiles p ON p.id = pv.viewer_id
  WHERE pv.profile_owner_id = uid
  ORDER BY pv.viewed_at DESC
  LIMIT cap;
END;
$$;

-- 2) Restrict EXECUTE to authenticated only (linter WARN 0028).
REVOKE EXECUTE ON FUNCTION public.record_profile_view(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_my_profile_visitors(int) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.unlock_profile_visitor_history() FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.record_profile_view(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_my_profile_visitors(int) TO authenticated;
GRANT EXECUTE ON FUNCTION public.unlock_profile_visitor_history() TO authenticated;
