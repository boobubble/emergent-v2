CREATE OR REPLACE FUNCTION public.cleanup_ended_competitions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.competitions
  SET status = 'live'
  WHERE status IN ('upcoming','draft')
    AND start_at <= now()
    AND end_at > now();

  UPDATE public.competitions
  SET status = 'upcoming'
  WHERE status = 'draft'
    AND start_at > now();

  UPDATE public.competitions
  SET status = 'completed'
  WHERE status IN ('live','upcoming','draft')
    AND end_at <= now();

  DELETE FROM public.competitions
  WHERE status = 'completed'
    AND end_at < (now() - interval '24 hours');
END;
$$;

SELECT public.cleanup_ended_competitions();