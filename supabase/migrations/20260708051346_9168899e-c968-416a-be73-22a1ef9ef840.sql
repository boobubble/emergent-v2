
-- ============ pathflow_levels ============
CREATE TABLE public.pathflow_levels (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  number        int  NOT NULL UNIQUE,
  difficulty    text NOT NULL DEFAULT 'normal' CHECK (difficulty IN ('easy','normal','hard','expert','master')),
  grid_w        int  NOT NULL CHECK (grid_w BETWEEN 3 AND 20),
  grid_h        int  NOT NULL CHECK (grid_h BETWEEN 3 AND 20),
  layout        jsonb NOT NULL,           -- { pieces: [{id, cells:[{r,c,dir}], startR, startC}] }
  solution      jsonb NOT NULL,           -- { pieces: [{id, r, c}] }
  par_moves     int  NOT NULL DEFAULT 10,
  par_time      int  NOT NULL DEFAULT 60, -- seconds
  coin_reward   int  NOT NULL DEFAULT 5,
  xp_reward     int  NOT NULL DEFAULT 10,
  enabled       boolean NOT NULL DEFAULT true,
  featured      boolean NOT NULL DEFAULT false,
  version       int  NOT NULL DEFAULT 1,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.pathflow_levels TO anon, authenticated;
GRANT ALL    ON public.pathflow_levels TO service_role;
ALTER TABLE public.pathflow_levels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pf_levels_read_enabled" ON public.pathflow_levels
  FOR SELECT USING (enabled = true OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "pf_levels_admin_all" ON public.pathflow_levels
  FOR ALL USING (public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin'));

-- ============ pathflow_progress ============
CREATE TABLE public.pathflow_progress (
  user_id         uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  highest_level   int  NOT NULL DEFAULT 0,
  stars_total     int  NOT NULL DEFAULT 0,
  perfect_solves  int  NOT NULL DEFAULT 0,
  completions     int  NOT NULL DEFAULT 0,
  best_times      jsonb NOT NULL DEFAULT '{}'::jsonb,  -- { "<level_number>": seconds }
  best_moves      jsonb NOT NULL DEFAULT '{}'::jsonb,
  stars_by_level  jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at      timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.pathflow_progress TO authenticated;
GRANT ALL ON public.pathflow_progress TO service_role;
ALTER TABLE public.pathflow_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pf_progress_own" ON public.pathflow_progress
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "pf_progress_read_all" ON public.pathflow_progress
  FOR SELECT USING (true);

-- ============ pathflow_scores ============
CREATE TABLE public.pathflow_scores (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  level_id     uuid NOT NULL REFERENCES public.pathflow_levels(id) ON DELETE CASCADE,
  level_number int  NOT NULL,
  kind         text NOT NULL DEFAULT 'level' CHECK (kind IN ('level','daily')),
  day_key      date NOT NULL DEFAULT (now() AT TIME ZONE 'utc')::date,
  time_ms      int  NOT NULL,
  moves        int  NOT NULL,
  hints_used   int  NOT NULL DEFAULT 0,
  stars        int  NOT NULL DEFAULT 1,
  perfect      boolean NOT NULL DEFAULT false,
  room_id      text,
  created_at   timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX pf_scores_level_time ON public.pathflow_scores (level_id, time_ms);
CREATE INDEX pf_scores_daily      ON public.pathflow_scores (kind, day_key, time_ms);
CREATE INDEX pf_scores_user       ON public.pathflow_scores (user_id, created_at DESC);
GRANT SELECT, INSERT ON public.pathflow_scores TO authenticated;
GRANT SELECT ON public.pathflow_scores TO anon;
GRANT ALL ON public.pathflow_scores TO service_role;
ALTER TABLE public.pathflow_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pf_scores_read_all" ON public.pathflow_scores FOR SELECT USING (true);
CREATE POLICY "pf_scores_insert_own" ON public.pathflow_scores
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============ pathflow_daily ============
CREATE TABLE public.pathflow_daily (
  day_key         date PRIMARY KEY,
  level_id        uuid NOT NULL REFERENCES public.pathflow_levels(id),
  participants    int  NOT NULL DEFAULT 0,
  fastest_time_ms int,
  least_moves     int,
  created_at      timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.pathflow_daily TO anon, authenticated;
GRANT ALL ON public.pathflow_daily TO service_role;
ALTER TABLE public.pathflow_daily ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pf_daily_read_all" ON public.pathflow_daily FOR SELECT USING (true);
CREATE POLICY "pf_daily_admin" ON public.pathflow_daily
  FOR ALL USING (public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin'));

-- ============ updated_at trigger ============
CREATE OR REPLACE FUNCTION public.pathflow_touch_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;
CREATE TRIGGER pf_levels_touch BEFORE UPDATE ON public.pathflow_levels
  FOR EACH ROW EXECUTE FUNCTION public.pathflow_touch_updated_at();
CREATE TRIGGER pf_progress_touch BEFORE UPDATE ON public.pathflow_progress
  FOR EACH ROW EXECUTE FUNCTION public.pathflow_touch_updated_at();

-- ============ pathflow_current_daily ============
CREATE OR REPLACE FUNCTION public.pathflow_current_daily()
RETURNS TABLE (
  day_key date, level_id uuid, level_number int, difficulty text,
  grid_w int, grid_h int, layout jsonb, solution jsonb, par_moves int, par_time int,
  coin_reward int, xp_reward int,
  participants int, fastest_time_ms int, least_moves int
)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _today date := (now() AT TIME ZONE 'utc')::date;
  _row public.pathflow_daily;
  _picked uuid;
BEGIN
  SELECT * INTO _row FROM public.pathflow_daily WHERE day_key = _today;
  IF _row.day_key IS NULL THEN
    SELECT id INTO _picked FROM public.pathflow_levels
      WHERE enabled = true AND featured = true
      ORDER BY md5(_today::text || id::text) LIMIT 1;
    IF _picked IS NULL THEN
      SELECT id INTO _picked FROM public.pathflow_levels
        WHERE enabled = true ORDER BY md5(_today::text || id::text) LIMIT 1;
    END IF;
    IF _picked IS NULL THEN RETURN; END IF;
    INSERT INTO public.pathflow_daily (day_key, level_id) VALUES (_today, _picked)
      ON CONFLICT (day_key) DO NOTHING;
    SELECT * INTO _row FROM public.pathflow_daily WHERE day_key = _today;
  END IF;
  RETURN QUERY
  SELECT _row.day_key, l.id, l.number, l.difficulty, l.grid_w, l.grid_h,
         l.layout, l.solution, l.par_moves, l.par_time, l.coin_reward, l.xp_reward,
         _row.participants, _row.fastest_time_ms, _row.least_moves
  FROM public.pathflow_levels l WHERE l.id = _row.level_id;
END $$;
GRANT EXECUTE ON FUNCTION public.pathflow_current_daily() TO anon, authenticated;

-- ============ pathflow_buy_hint ============
CREATE OR REPLACE FUNCTION public.pathflow_buy_hint(_cost int)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _uid uuid := auth.uid(); _bal int;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;
  IF _cost < 0 OR _cost > 500 THEN RAISE EXCEPTION 'invalid hint cost'; END IF;
  IF _cost = 0 THEN RETURN jsonb_build_object('ok', true, 'cost', 0); END IF;
  PERFORM public.wallet_apply(
    _user := _uid, _amount := _cost, _direction := 'debit',
    _kind := 'pathflow_hint', _reason := 'pathflow_hint',
    _provider := 'pathflow', _reference := NULL, _metadata := '{}'::jsonb
  );
  SELECT coins INTO _bal FROM public.profiles WHERE id = _uid;
  RETURN jsonb_build_object('ok', true, 'cost', _cost, 'balance', _bal);
END $$;
GRANT EXECUTE ON FUNCTION public.pathflow_buy_hint(int) TO authenticated;

-- ============ pathflow_submit_score ============
CREATE OR REPLACE FUNCTION public.pathflow_submit_score(
  _level_id uuid, _time_ms int, _moves int, _hints_used int,
  _kind text DEFAULT 'level', _room_id text DEFAULT NULL
)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _uid uuid := auth.uid();
  _lvl public.pathflow_levels;
  _today date := (now() AT TIME ZONE 'utc')::date;
  _piece_count int;
  _stars int := 1;
  _perfect boolean := false;
  _prev_best_time int;
  _prev_best_moves int;
  _prev_stars int := 0;
  _existing_kind_today int;
  _coin_award int := 0;
  _xp_award int := 0;
  _record_broken boolean := false;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;
  IF _kind NOT IN ('level','daily') THEN RAISE EXCEPTION 'invalid kind'; END IF;
  SELECT * INTO _lvl FROM public.pathflow_levels WHERE id = _level_id AND enabled = true;
  IF _lvl.id IS NULL THEN RAISE EXCEPTION 'level not found'; END IF;

  _piece_count := coalesce(jsonb_array_length(_lvl.solution->'pieces'), 0);

  -- ANTI-CHEAT
  IF _time_ms < 500 THEN RAISE EXCEPTION 'impossible time'; END IF;
  IF _time_ms > 6*60*60*1000 THEN RAISE EXCEPTION 'stale submit'; END IF;
  IF _moves < _piece_count THEN
    PERFORM public.wallet_log_suspicious(_uid, 1, 'pathflow_low_moves',
      jsonb_build_object('level', _lvl.number, 'moves', _moves, 'pieces', _piece_count));
    RAISE EXCEPTION 'impossible move count';
  END IF;
  IF _moves > 10000 OR _hints_used < 0 OR _hints_used > 100 THEN
    RAISE EXCEPTION 'invalid submission';
  END IF;

  -- Dedupe daily challenge per user per day
  IF _kind = 'daily' THEN
    SELECT count(*) INTO _existing_kind_today
      FROM public.pathflow_scores
      WHERE user_id = _uid AND kind = 'daily' AND day_key = _today;
    IF _existing_kind_today > 0 THEN
      RAISE EXCEPTION 'already submitted daily';
    END IF;
  END IF;

  -- Star calc
  _perfect := (_hints_used = 0 AND _moves <= _lvl.par_moves AND _time_ms <= _lvl.par_time*1000);
  IF _perfect THEN _stars := 3;
  ELSIF (_moves <= _lvl.par_moves OR _time_ms <= _lvl.par_time*1000) AND _hints_used <= 2 THEN _stars := 2;
  ELSE _stars := 1; END IF;

  INSERT INTO public.pathflow_scores
    (user_id, level_id, level_number, kind, day_key, time_ms, moves, hints_used, stars, perfect, room_id)
    VALUES (_uid, _lvl.id, _lvl.number, _kind, _today, _time_ms, _moves, _hints_used, _stars, _perfect, _room_id);

  -- Progress
  INSERT INTO public.pathflow_progress (user_id, highest_level, stars_total, perfect_solves, completions,
                                        best_times, best_moves, stars_by_level)
  VALUES (_uid, _lvl.number, _stars, CASE WHEN _perfect THEN 1 ELSE 0 END, 1,
          jsonb_build_object(_lvl.number::text, _time_ms),
          jsonb_build_object(_lvl.number::text, _moves),
          jsonb_build_object(_lvl.number::text, _stars))
  ON CONFLICT (user_id) DO UPDATE SET
    highest_level  = GREATEST(public.pathflow_progress.highest_level, _lvl.number),
    completions    = public.pathflow_progress.completions + 1,
    perfect_solves = public.pathflow_progress.perfect_solves + CASE WHEN _perfect THEN 1 ELSE 0 END,
    stars_total    = public.pathflow_progress.stars_total
                     + GREATEST(0, _stars - COALESCE((public.pathflow_progress.stars_by_level->>_lvl.number::text)::int, 0)),
    best_times     = public.pathflow_progress.best_times ||
                     jsonb_build_object(_lvl.number::text,
                       LEAST(_time_ms, COALESCE((public.pathflow_progress.best_times->>_lvl.number::text)::int, _time_ms))),
    best_moves     = public.pathflow_progress.best_moves ||
                     jsonb_build_object(_lvl.number::text,
                       LEAST(_moves, COALESCE((public.pathflow_progress.best_moves->>_lvl.number::text)::int, _moves))),
    stars_by_level = public.pathflow_progress.stars_by_level ||
                     jsonb_build_object(_lvl.number::text,
                       GREATEST(_stars, COALESCE((public.pathflow_progress.stars_by_level->>_lvl.number::text)::int, 0))),
    updated_at     = now();

  -- Room record check (global fastest for this level)
  SELECT MIN(time_ms) INTO _prev_best_time
    FROM public.pathflow_scores WHERE level_id = _lvl.id AND user_id <> _uid;
  IF _prev_best_time IS NULL OR _time_ms < _prev_best_time THEN
    _record_broken := true;
  END IF;

  -- Update daily aggregates
  IF _kind = 'daily' THEN
    UPDATE public.pathflow_daily SET
      participants    = participants + 1,
      fastest_time_ms = LEAST(COALESCE(fastest_time_ms, _time_ms), _time_ms),
      least_moves     = LEAST(COALESCE(least_moves, _moves), _moves)
    WHERE day_key = _today;
  END IF;

  -- Rewards (via wallet_apply)
  _coin_award := GREATEST(0, _lvl.coin_reward + CASE _stars WHEN 3 THEN _lvl.coin_reward ELSE 0 END);
  _xp_award   := GREATEST(0, _lvl.xp_reward);
  IF _coin_award > 0 THEN
    PERFORM public.wallet_apply(
      _user := _uid, _amount := _coin_award, _direction := 'credit',
      _kind := CASE WHEN _kind = 'daily' THEN 'pathflow_daily' ELSE 'pathflow_level' END,
      _reason := 'pathflow_reward', _provider := 'pathflow',
      _reference := _lvl.id::text, _metadata := jsonb_build_object('level', _lvl.number, 'stars', _stars)
    );
  END IF;

  RETURN jsonb_build_object(
    'ok', true, 'stars', _stars, 'perfect', _perfect,
    'coins', _coin_award, 'xp', _xp_award,
    'record_broken', _record_broken,
    'time_ms', _time_ms, 'moves', _moves
  );
END $$;
GRANT EXECUTE ON FUNCTION public.pathflow_submit_score(uuid,int,int,int,text,text) TO authenticated;
