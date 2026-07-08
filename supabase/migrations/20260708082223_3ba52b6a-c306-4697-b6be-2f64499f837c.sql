
DROP FUNCTION IF EXISTS public.pathescape_current_daily();
DROP FUNCTION IF EXISTS public.pathescape_current_weekly();

CREATE OR REPLACE FUNCTION public.pathescape_current_daily()
RETURNS TABLE (day date, level_id uuid, seed integer, coin_reward integer, xp_reward integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
#variable_conflict use_column
DECLARE
  _today date := (now() at time zone 'utc')::date;
  _level_id uuid;
  _count integer;
BEGIN
  RETURN QUERY
    SELECT d.day, d.level_id, d.seed, d.coin_reward, d.xp_reward
      FROM public.pathescape_daily d WHERE d.day = _today;
  IF FOUND THEN RETURN; END IF;

  SELECT count(*) INTO _count FROM public.pathescape_levels WHERE enabled = true;
  IF _count = 0 THEN RETURN; END IF;

  SELECT l.id INTO _level_id
    FROM public.pathescape_levels l
   WHERE l.enabled = true
   ORDER BY l.number
   OFFSET (abs(hashtext(_today::text)) % _count) LIMIT 1;

  INSERT INTO public.pathescape_daily(day, level_id, seed, coin_reward, xp_reward)
    VALUES (_today, _level_id, abs(hashtext(_today::text))::int, 25, 50)
    ON CONFLICT (day) DO NOTHING;

  RETURN QUERY
    SELECT d.day, d.level_id, d.seed, d.coin_reward, d.xp_reward
      FROM public.pathescape_daily d WHERE d.day = _today;
END;
$$;
GRANT EXECUTE ON FUNCTION public.pathescape_current_daily() TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.pathescape_current_weekly()
RETURNS TABLE (week_start date, level_id uuid, coin_reward integer, xp_reward integer, top_prize_coins integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
#variable_conflict use_column
DECLARE
  _wk date := (date_trunc('week', now() at time zone 'utc'))::date;
  _level_id uuid;
  _count integer;
BEGIN
  RETURN QUERY
    SELECT w.week_start, w.level_id, w.coin_reward, w.xp_reward, w.top_prize_coins
      FROM public.pathescape_weekly w WHERE w.week_start = _wk;
  IF FOUND THEN RETURN; END IF;

  SELECT count(*) INTO _count FROM public.pathescape_levels
   WHERE enabled = true AND difficulty IN ('hard','expert','master','nightmare');
  IF _count = 0 THEN
    SELECT count(*) INTO _count FROM public.pathescape_levels WHERE enabled = true;
    IF _count = 0 THEN RETURN; END IF;
    SELECT l.id INTO _level_id FROM public.pathescape_levels l
      WHERE l.enabled = true ORDER BY l.number
      OFFSET (abs(hashtext(_wk::text || 'w')) % _count) LIMIT 1;
  ELSE
    SELECT l.id INTO _level_id FROM public.pathescape_levels l
      WHERE l.enabled = true AND l.difficulty IN ('hard','expert','master','nightmare')
      ORDER BY l.number
      OFFSET (abs(hashtext(_wk::text || 'w')) % _count) LIMIT 1;
  END IF;

  INSERT INTO public.pathescape_weekly(week_start, level_id)
    VALUES (_wk, _level_id) ON CONFLICT (week_start) DO NOTHING;

  RETURN QUERY
    SELECT w.week_start, w.level_id, w.coin_reward, w.xp_reward, w.top_prize_coins
      FROM public.pathescape_weekly w WHERE w.week_start = _wk;
END;
$$;
GRANT EXECUTE ON FUNCTION public.pathescape_current_weekly() TO anon, authenticated;
