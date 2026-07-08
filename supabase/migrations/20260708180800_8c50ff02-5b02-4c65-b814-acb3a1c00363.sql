-- 1) Visibility flags
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS show_city      boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS show_interests boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS show_about_me  boolean NOT NULL DEFAULT true;

-- 2) Directory view with all sensitive fields gated the same way as birthday
DROP VIEW IF EXISTS public.profiles_directory;
CREATE VIEW public.profiles_directory
WITH (security_invoker = true)
AS
SELECT
  id, username,
  CASE WHEN id = auth.uid() OR COALESCE(show_about_me, true) THEN bio       ELSE NULL END AS bio,
  CASE WHEN id = auth.uid() OR COALESCE(show_about_me, true) THEN about_me  ELSE NULL END AS about_me,
  avatar_url, avatar_color,
  xp, level, streak, longest_streak,
  status, last_seen,
  CASE WHEN id = auth.uid() OR COALESCE(show_gender, true)       THEN gender       ELSE NULL END AS gender,
  CASE WHEN id = auth.uid() OR COALESCE(show_country_flag, true) THEN country_code ELSE NULL END AS country_code,
  show_country_flag, show_guest_badge,
  CASE WHEN id = auth.uid() OR COALESCE(show_birthday, true)  THEN birthday  ELSE NULL END AS birthday,
  hide_birth_year,
  CASE WHEN id = auth.uid() OR COALESCE(show_city, true)      THEN city      ELSE NULL END AS city,
  CASE WHEN id = auth.uid() OR COALESCE(show_interests, true) THEN interests ELSE NULL END AS interests,
  show_city, show_interests, show_about_me,
  is_bot, is_official
FROM public.profiles p;

GRANT SELECT ON public.profiles_directory TO anon, authenticated;

-- 3) DM wallpapers storage: replace overly-broad SELECT with owner-scoped rule
DROP POLICY IF EXISTS "dm-wallpapers read for authed" ON storage.objects;

CREATE POLICY "dm-wallpapers read own custom"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'dm-wallpapers'
  AND (
    -- Curated (non-user-uploaded) wallpapers remain readable by any signed-in user.
    (storage.foldername(name))[1] <> 'custom'
    -- Custom uploads: only the uploading user can read.
    OR ((storage.foldername(name))[1] = 'custom'
        AND (storage.foldername(name))[2] = auth.uid()::text)
    -- Admins can view everything.
    OR public.is_admin(auth.uid())
  )
);