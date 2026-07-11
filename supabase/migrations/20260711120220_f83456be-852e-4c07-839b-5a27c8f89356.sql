CREATE OR REPLACE FUNCTION public.cleanup_ended_competitions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Promote upcoming -> live when start_at has passed
  UPDATE public.competitions
  SET status = 'live'
  WHERE status = 'upcoming'
    AND start_at <= now()
    AND end_at > now();

  -- Mark past competitions as completed
  UPDATE public.competitions
  SET status = 'completed'
  WHERE status IN ('live','upcoming')
    AND end_at <= now();

  -- Delete competitions that ended more than 24 hours ago
  DELETE FROM public.competitions
  WHERE status = 'completed'
    AND end_at < (now() - interval '24 hours');
END;
$$;

-- Run once now to backfill current rows
SELECT public.cleanup_ended_competitions();