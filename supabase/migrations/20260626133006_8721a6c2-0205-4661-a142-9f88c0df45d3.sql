
-- 1) profile_views: add explicit SELECT policy for the profile owner so the
-- intent (owners can see who viewed their profile) is encoded in RLS, not
-- only inside the get_my_profile_visitors SECURITY DEFINER RPC.
DROP POLICY IF EXISTS "Owners can view their profile views" ON public.profile_views;
CREATE POLICY "Owners can view their profile views"
  ON public.profile_views
  FOR SELECT
  TO authenticated
  USING (profile_owner_id = auth.uid());

-- 2) profiles: stop broadly exposing sensitive demographic fields
-- (birthday, gender, country_code) to all authenticated users.
-- Add opt-in visibility flags (default TRUE to preserve current UX) and
-- expose a directory view that masks these columns when the viewer is
-- not the owner and the user hasn't opted in.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS show_birthday boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS show_gender   boolean NOT NULL DEFAULT true;

-- Security-invoker view (respects underlying RLS) that masks sensitive
-- demographic fields for non-owners who haven't opted in.
DROP VIEW IF EXISTS public.profiles_directory CASCADE;
CREATE VIEW public.profiles_directory
WITH (security_invoker = true) AS
SELECT
  p.id,
  p.username,
  p.bio,
  p.about_me,
  p.avatar_url,
  p.avatar_color,
  p.xp,
  p.level,
  p.streak,
  p.longest_streak,
  p.status,
  p.last_seen,
  CASE WHEN p.id = auth.uid() OR COALESCE(p.show_gender, true)
       THEN p.gender ELSE NULL END AS gender,
  CASE WHEN p.id = auth.uid() OR COALESCE(p.show_country_flag, true)
       THEN p.country_code ELSE NULL END AS country_code,
  p.show_country_flag,
  p.show_guest_badge,
  CASE WHEN p.id = auth.uid() OR COALESCE(p.show_birthday, true)
       THEN p.birthday ELSE NULL END AS birthday,
  p.hide_birth_year,
  p.is_bot,
  p.is_official
FROM public.profiles p;

GRANT SELECT ON public.profiles_directory TO authenticated, anon;
