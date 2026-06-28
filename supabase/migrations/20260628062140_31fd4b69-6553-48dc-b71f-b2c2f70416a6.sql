
-- 1) Confessions: remove direct-table SELECT for everyone; reads go through confessions_public view.
DROP POLICY IF EXISTS "Read approved confessions via view" ON public.confessions;

-- Authors can still read their own (existing "Read own confessions" policy stays).
-- Admins still have full access via existing "Admins manage confessions" policy.

-- 2) Profiles: hide phone / phone_verified from general selects via column-level grants.
REVOKE SELECT ON public.profiles FROM authenticated;
REVOKE SELECT ON public.profiles FROM anon;

GRANT SELECT (
  id, username, bio, avatar_url, avatar_color, xp, level, coins, status,
  last_seen, created_at, updated_at, cover_url, streak, longest_streak,
  last_active_day, is_private, gender, birthday, hide_birth_year,
  country_code, show_country_flag, show_guest_badge, sound_prefs,
  is_official, is_bot, active_feed_theme, active_chat_theme,
  profile_views_enabled, profile_views_anonymous, profile_views_friends_only,
  profile_views_unlocked_full, about_me, show_birthday, show_gender,
  city, interests, display_name, profile_completed
) ON public.profiles TO authenticated;

-- Owner-only RPC to read own phone.
CREATE OR REPLACE FUNCTION public.get_my_phone()
RETURNS TABLE(phone text, phone_verified boolean)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT phone, phone_verified FROM public.profiles WHERE id = auth.uid();
$$;

REVOKE ALL ON FUNCTION public.get_my_phone() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_my_phone() TO authenticated;

-- 3) profile_views: explicit hardening — ensure no policy can leak viewer_id for
-- anonymous rows or when owner hasn't unlocked full history. Recreate the owner
-- read policy to be defensive (matches existing intent).
DROP POLICY IF EXISTS "Owners can view non-anonymous profile views" ON public.profile_views;
CREATE POLICY "Owners read unlocked non-anonymous views"
ON public.profile_views
FOR SELECT
TO authenticated
USING (
  profile_owner_id = auth.uid()
  AND anonymous = false
  AND EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid()
      AND COALESCE(p.profile_views_unlocked_full, false) = true
  )
);
