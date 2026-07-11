ALTER TABLE public.competitions ADD COLUMN IF NOT EXISTS is_published boolean NOT NULL DEFAULT true;

CREATE OR REPLACE FUNCTION public.cleanup_ended_competitions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.competitions
  WHERE status = 'completed'
    AND end_at < (now() - interval '24 hours');
  UPDATE public.competitions
  SET status = 'completed'
  WHERE status IN ('live','upcoming')
    AND end_at < now();
END;
$$;

CREATE EXTENSION IF NOT EXISTS pg_cron;

DO $$
BEGIN
  PERFORM cron.unschedule('cleanup-ended-competitions');
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

SELECT cron.schedule(
  'cleanup-ended-competitions',
  '0 * * * *',
  $$SELECT public.cleanup_ended_competitions();$$
);