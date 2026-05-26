UPDATE public.games
SET status = 'cancelled',
    finished_at = now()
WHERE status IN ('waiting', 'active');