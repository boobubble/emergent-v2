
CREATE EXTENSION IF NOT EXISTS pg_cron;

CREATE OR REPLACE FUNCTION public.close_inactive_trio_rooms()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.trio_rooms r
     SET closed_at = now(),
         closed_reason = COALESCE(closed_reason, 'Inactive for 1 minute')
   WHERE r.closed_at IS NULL
     AND r.created_at < now() - interval '1 minute'
     AND NOT EXISTS (
       SELECT 1 FROM public.messages m
       WHERE m.channel_id = 'trio:' || r.id::text
         AND m.created_at > now() - interval '1 minute'
     );
END;
$$;

-- Unschedule prior version if present, then (re)schedule
DO $$
BEGIN
  PERFORM cron.unschedule('close-inactive-trio-rooms');
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

SELECT cron.schedule(
  'close-inactive-trio-rooms',
  '* * * * *',
  $$SELECT public.close_inactive_trio_rooms();$$
);

-- Backfill: close currently-inactive rooms now
SELECT public.close_inactive_trio_rooms();
