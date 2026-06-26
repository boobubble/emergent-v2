
-- Installer helper RPCs: cron job count + post-install stats
CREATE OR REPLACE FUNCTION public.installer_get_extras()
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public, cron
AS $$
DECLARE
  done boolean;
  cron_count int := 0;
  user_count int := 0;
  bucket_count int := 0;
BEGIN
  SELECT COALESCE((value->>'installed')::boolean, false) INTO done
    FROM public.app_settings WHERE key = 'installer';

  -- Only callable pre-install OR by an admin post-install
  IF done AND NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;

  BEGIN
    SELECT count(*) INTO cron_count FROM cron.job;
  EXCEPTION WHEN OTHERS THEN cron_count := 0;
  END;

  SELECT count(*) INTO user_count FROM auth.users;
  SELECT count(*) INTO bucket_count FROM storage.buckets;

  RETURN jsonb_build_object(
    'cron_jobs', cron_count,
    'users', user_count,
    'storage_buckets', bucket_count
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.installer_get_extras() TO anon, authenticated;
