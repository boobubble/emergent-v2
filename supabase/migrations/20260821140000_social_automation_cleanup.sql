-- Social automation admin cleanup / retention.
-- Does NOT touch profiles, users, Buffer config, or social_signup_enabled.

CREATE OR REPLACE FUNCTION public.social_automation_cleanup()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $fn$
DECLARE
  _logs_deleted integer := 0;
  _queue_deleted integer := 0;
BEGIN
  -- Successful logs older than 7 days (keep failed/pending)
  DELETE FROM public.social_post_logs
  WHERE status IN ('queued', 'published')
    AND created_at < (now() - interval '7 days');
  GET DIAGNOSTICS _logs_deleted = ROW_COUNT;

  -- Finished queue rows older than 7 days (keep pending/processing/failed)
  DELETE FROM public.social_post_queue
  WHERE status IN ('completed', 'skipped')
    AND COALESCE(processed_at, created_at) < (now() - interval '7 days');
  GET DIAGNOSTICS _queue_deleted = ROW_COUNT;

  RETURN jsonb_build_object(
    'ok', true,
    'logs_deleted', _logs_deleted,
    'queue_deleted', _queue_deleted,
    'ran_at', now()
  );
END;
$fn$;

REVOKE ALL ON FUNCTION public.social_automation_cleanup() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.social_automation_cleanup() TO service_role;

-- Daily retention job (idempotent)
DO $do$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'social-automation-cleanup') THEN
    PERFORM cron.unschedule('social-automation-cleanup');
  END IF;
EXCEPTION WHEN OTHERS THEN
  NULL;
END
$do$;

DO $do$
BEGIN
  PERFORM cron.schedule(
    'social-automation-cleanup',
    '15 3 * * *',
    $cron$SELECT public.social_automation_cleanup();$cron$
  );
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'social-automation-cleanup cron not scheduled: %', SQLERRM;
END
$do$;
