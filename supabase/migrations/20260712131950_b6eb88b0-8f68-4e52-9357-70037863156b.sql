
-- 1) Remove sensitive tables from realtime publication
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'app_settings'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime DROP TABLE public.app_settings';
  END IF;
  IF EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'competition_votes'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime DROP TABLE public.competition_votes';
  END IF;
  IF EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'competition_competitor_votes'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime DROP TABLE public.competition_competitor_votes';
  END IF;
END $$;

-- 2) Revoke column-level SELECT on sensitive profile fields from anon/authenticated.
-- These remain accessible via the public.profiles_directory view (which honors show_* flags)
-- and via service_role for admin/server paths. Own-row reads still work because
-- authenticated users retain SELECT on all *other* columns; the sensitive columns
-- are read through the directory view or server functions.
REVOKE SELECT (birthday, gender, city, country_code) ON public.profiles FROM anon;
REVOKE SELECT (birthday, gender, city, country_code) ON public.profiles FROM authenticated;

-- Ensure the owner of profiles_directory view retains the ability to read these columns.
GRANT SELECT (birthday, gender, city, country_code) ON public.profiles TO postgres;
GRANT SELECT (birthday, gender, city, country_code) ON public.profiles TO service_role;
