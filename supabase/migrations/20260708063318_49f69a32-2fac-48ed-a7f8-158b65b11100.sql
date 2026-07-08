
-- Path Escape Phase 3: Daily / Weekly / Endless modes

-- 1) Daily challenge assignments (one level pinned per calendar day, UTC)
CREATE TABLE public.pathescape_daily (
  day date PRIMARY KEY,
  level_id uuid NOT NULL REFERENCES public.pathescape_levels(id) ON DELETE CASCADE,
  seed integer NOT NULL DEFAULT 0,
  coin_reward integer NOT NULL DEFAULT 25,
  xp_reward integer NOT NULL DEFAULT 50,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.pathescape_daily TO anon, authenticated;
GRANT ALL ON public.pathescape_daily TO service_role;
ALTER TABLE public.pathescape_daily ENABLE ROW LEVEL SECURITY;
CREATE POLICY "daily readable by anyone"
  ON public.pathescape_daily FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "daily manage by admins"
  ON public.pathescape_daily FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

-- 2) Weekly tournaments (a level pinned Mon->Sun UTC with bigger rewards)
CREATE TABLE public.pathescape_weekly (
  week_start date PRIMARY KEY,
  level_id uuid NOT NULL REFERENCES public.pathescape_levels(id) ON DELETE CASCADE,
  coin_reward integer NOT NULL DEFAULT 100,
  xp_reward integer NOT NULL DEFAULT 200,
  top_prize_coins integer NOT NULL DEFAULT 500,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.pathescape_weekly TO anon, authenticated;
GRANT ALL ON public.pathescape_weekly TO service_role;
ALTER TABLE public.pathescape_weekly ENABLE ROW LEVEL SECURITY;
CREATE POLICY "weekly readable by anyone"
  ON public.pathescape_weekly FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "weekly manage by admins"
  ON public.pathescape_weekly FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

-- 3) Rotation helper: assigns a level for a given day using a deterministic hash
CREATE OR REPLACE FUNCTION public.pathescape_current_daily()
RETURNS TABLE (day date, level_id uuid, seed integer, coin_reward integer, xp_reward integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _today date := (now() at time zone 'utc')::date;
  _level_id uuid;
  _count integer;
BEGIN
  SELECT d.day, d.level_id, d.seed, d.coin_reward, d.xp_reward
    INTO day, level_id, seed, coin_reward, xp_reward
    FROM public.pathescape_daily d WHERE d.day = _today;
  IF FOUND THEN RETURN NEXT; RETURN; END IF;

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

  SELECT d.day, d.level_id, d.seed, d.coin_reward, d.xp_reward
    INTO day, level_id, seed, coin_reward, xp_reward
    FROM public.pathescape_daily d WHERE d.day = _today;
  RETURN NEXT;
END;
$$;
GRANT EXECUTE ON FUNCTION public.pathescape_current_daily() TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.pathescape_current_weekly()
RETURNS TABLE (week_start date, level_id uuid, coin_reward integer, xp_reward integer, top_prize_coins integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _wk date := (date_trunc('week', now() at time zone 'utc'))::date;
  _level_id uuid;
  _count integer;
BEGIN
  SELECT w.week_start, w.level_id, w.coin_reward, w.xp_reward, w.top_prize_coins
    INTO week_start, level_id, coin_reward, xp_reward, top_prize_coins
    FROM public.pathescape_weekly w WHERE w.week_start = _wk;
  IF FOUND THEN RETURN NEXT; RETURN; END IF;

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

  SELECT w.week_start, w.level_id, w.coin_reward, w.xp_reward, w.top_prize_coins
    INTO week_start, level_id, coin_reward, xp_reward, top_prize_coins
    FROM public.pathescape_weekly w WHERE w.week_start = _wk;
  RETURN NEXT;
END;
$$;
GRANT EXECUTE ON FUNCTION public.pathescape_current_weekly() TO anon, authenticated;

-- 4) Random endless level (excludes already-solved-perfect if user provided)
CREATE OR REPLACE FUNCTION public.pathescape_endless_level(_exclude_solved_by uuid DEFAULT NULL)
RETURNS TABLE (
  id uuid, number int, name text,
  difficulty pathescape_difficulty, grid_w int, grid_h int,
  layout jsonb, solution jsonb,
  par_moves int, par_time int, coin_reward int, xp_reward int
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT l.id, l.number, l.name, l.difficulty, l.grid_w, l.grid_h,
         l.layout::jsonb, l.solution::jsonb,
         l.par_moves, l.par_time, l.coin_reward, l.xp_reward
    FROM public.pathescape_levels l
   WHERE l.enabled = true
     AND (_exclude_solved_by IS NULL OR NOT EXISTS (
       SELECT 1 FROM public.pathescape_scores s
        WHERE s.user_id = _exclude_solved_by AND s.level_id = l.id AND s.perfect
     ))
   ORDER BY random()
   LIMIT 1;
END;
$$;
GRANT EXECUTE ON FUNCTION public.pathescape_endless_level(uuid) TO anon, authenticated;

-- 5) Leaderboards
CREATE OR REPLACE FUNCTION public.pathescape_leaderboard(_level_id uuid, _limit int DEFAULT 25)
RETURNS TABLE (rank int, user_id uuid, username text, avatar_url text, stars int, moves int, time_ms int, created_at timestamptz)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  WITH best AS (
    SELECT DISTINCT ON (s.user_id) s.user_id, s.stars, s.moves, s.time_ms, s.created_at
      FROM public.pathescape_scores s
     WHERE s.level_id = _level_id
     ORDER BY s.user_id, s.stars DESC, s.moves ASC, s.time_ms ASC
  )
  SELECT (row_number() OVER (ORDER BY b.stars DESC, b.moves ASC, b.time_ms ASC))::int AS rank,
         b.user_id, p.username, p.avatar_url, b.stars, b.moves, b.time_ms, b.created_at
    FROM best b
    LEFT JOIN public.profiles p ON p.id = b.user_id
   ORDER BY rank
   LIMIT _limit;
$$;
GRANT EXECUTE ON FUNCTION public.pathescape_leaderboard(uuid, int) TO anon, authenticated;
