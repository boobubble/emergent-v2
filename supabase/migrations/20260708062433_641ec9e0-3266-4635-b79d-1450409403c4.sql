
-- Difficulty enum
DO $$ BEGIN
  CREATE TYPE public.pathescape_difficulty AS ENUM ('easy','normal','hard','expert','master','nightmare');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Levels
CREATE TABLE public.pathescape_levels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  number integer NOT NULL UNIQUE,
  name text NOT NULL DEFAULT '',
  difficulty public.pathescape_difficulty NOT NULL DEFAULT 'easy',
  grid_w integer NOT NULL CHECK (grid_w BETWEEN 2 AND 20),
  grid_h integer NOT NULL CHECK (grid_h BETWEEN 2 AND 20),
  layout jsonb NOT NULL,
  solution jsonb NOT NULL,
  par_moves integer NOT NULL DEFAULT 10,
  par_time integer NOT NULL DEFAULT 60,
  coin_reward integer NOT NULL DEFAULT 10,
  xp_reward integer NOT NULL DEFAULT 10,
  lives integer NOT NULL DEFAULT 0,
  enabled boolean NOT NULL DEFAULT false,
  featured boolean NOT NULL DEFAULT false,
  season text,
  version integer NOT NULL DEFAULT 1,
  admin_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.pathescape_levels TO anon, authenticated;
GRANT ALL ON public.pathescape_levels TO service_role;
ALTER TABLE public.pathescape_levels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "levels public read enabled"
  ON public.pathescape_levels FOR SELECT
  USING (enabled = true OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "levels admin write"
  ON public.pathescape_levels FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Progress
CREATE TABLE public.pathescape_progress (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  highest_level integer NOT NULL DEFAULT 0,
  current_level integer NOT NULL DEFAULT 1,
  stars integer NOT NULL DEFAULT 0,
  perfect_solves integer NOT NULL DEFAULT 0,
  lifetime_coins integer NOT NULL DEFAULT 0,
  lifetime_xp integer NOT NULL DEFAULT 0,
  saved_state jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.pathescape_progress TO authenticated;
GRANT ALL ON public.pathescape_progress TO service_role;
ALTER TABLE public.pathescape_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "progress self"
  ON public.pathescape_progress FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Scores
CREATE TABLE public.pathescape_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  level_id uuid NOT NULL REFERENCES public.pathescape_levels(id) ON DELETE CASCADE,
  mode text NOT NULL DEFAULT 'story',
  time_ms integer NOT NULL,
  moves integer NOT NULL,
  hints_used integer NOT NULL DEFAULT 0,
  stars smallint NOT NULL DEFAULT 1,
  perfect boolean NOT NULL DEFAULT false,
  coins_awarded integer NOT NULL DEFAULT 0,
  xp_awarded integer NOT NULL DEFAULT 0,
  replay_log jsonb,
  room_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.pathescape_scores TO authenticated;
GRANT ALL ON public.pathescape_scores TO service_role;
ALTER TABLE public.pathescape_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "scores read own or public leaderboard"
  ON public.pathescape_scores FOR SELECT
  USING (true);
CREATE POLICY "scores insert self"
  ON public.pathescape_scores FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE INDEX pathescape_scores_level_time_idx
  ON public.pathescape_scores(level_id, time_ms ASC);
CREATE INDEX pathescape_scores_user_idx
  ON public.pathescape_scores(user_id, created_at DESC);

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.pathescape_touch_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;
CREATE TRIGGER pathescape_levels_touch BEFORE UPDATE ON public.pathescape_levels
  FOR EACH ROW EXECUTE FUNCTION public.pathescape_touch_updated_at();
CREATE TRIGGER pathescape_progress_touch BEFORE UPDATE ON public.pathescape_progress
  FOR EACH ROW EXECUTE FUNCTION public.pathescape_touch_updated_at();

-- Submit score RPC — server-authoritative rewards
CREATE OR REPLACE FUNCTION public.pathescape_submit_score(
  _level_id uuid,
  _time_ms integer,
  _moves integer,
  _hints_used integer DEFAULT 0,
  _mode text DEFAULT 'story',
  _room_id text DEFAULT NULL,
  _replay_log jsonb DEFAULT NULL
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
  _lvl record;
  _perfect boolean;
  _stars smallint;
  _coins integer;
  _xp integer;
  _best integer;
  _record boolean := false;
  _first_clear boolean := false;
BEGIN
  IF _uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  IF _time_ms < 500 OR _time_ms > 3600000 THEN
    RAISE EXCEPTION 'Invalid time';
  END IF;
  IF _moves < 1 OR _moves > 10000 THEN
    RAISE EXCEPTION 'Invalid moves';
  END IF;

  SELECT * INTO _lvl FROM public.pathescape_levels WHERE id = _level_id AND enabled = true;
  IF NOT FOUND THEN RAISE EXCEPTION 'Level not found'; END IF;

  _perfect := (_hints_used = 0 AND _moves <= _lvl.par_moves AND _time_ms <= _lvl.par_time * 1000);
  IF _perfect THEN _stars := 3;
  ELSIF (_moves <= _lvl.par_moves OR _time_ms <= _lvl.par_time * 1000) AND _hints_used <= 2 THEN _stars := 2;
  ELSE _stars := 1;
  END IF;

  SELECT NOT EXISTS(SELECT 1 FROM public.pathescape_scores WHERE user_id = _uid AND level_id = _level_id) INTO _first_clear;

  _coins := CASE WHEN _first_clear THEN _lvl.coin_reward ELSE 0 END
          + CASE WHEN _perfect THEN _lvl.coin_reward / 2 ELSE 0 END;
  _xp := CASE WHEN _first_clear THEN _lvl.xp_reward ELSE 0 END
       + CASE WHEN _perfect THEN _lvl.xp_reward / 2 ELSE 0 END;

  SELECT MIN(time_ms) INTO _best FROM public.pathescape_scores
   WHERE level_id = _level_id AND user_id = _uid;
  IF _best IS NULL OR _time_ms < _best THEN _record := true; END IF;

  INSERT INTO public.pathescape_scores(user_id, level_id, mode, time_ms, moves, hints_used, stars, perfect, coins_awarded, xp_awarded, replay_log, room_id)
  VALUES (_uid, _level_id, _mode, _time_ms, _moves, _hints_used, _stars, _perfect, _coins, _xp, _replay_log, _room_id);

  IF _coins > 0 THEN
    PERFORM public.wallet_apply(_uid, _coins, 'credit', 'pathescape_reward', 'completed', 'system',
      _level_id::text, jsonb_build_object('level', _lvl.number, 'perfect', _perfect));
  END IF;

  INSERT INTO public.pathescape_progress(user_id, highest_level, current_level, stars, perfect_solves, lifetime_coins, lifetime_xp)
  VALUES (_uid, _lvl.number, _lvl.number + 1, _stars, CASE WHEN _perfect THEN 1 ELSE 0 END, _coins, _xp)
  ON CONFLICT (user_id) DO UPDATE SET
    highest_level = GREATEST(public.pathescape_progress.highest_level, EXCLUDED.highest_level),
    current_level = GREATEST(public.pathescape_progress.current_level, EXCLUDED.current_level),
    stars = public.pathescape_progress.stars + EXCLUDED.stars,
    perfect_solves = public.pathescape_progress.perfect_solves + EXCLUDED.perfect_solves,
    lifetime_coins = public.pathescape_progress.lifetime_coins + EXCLUDED.lifetime_coins,
    lifetime_xp = public.pathescape_progress.lifetime_xp + EXCLUDED.lifetime_xp;

  INSERT INTO public.gam_event_log(user_id, event_type, amount, metadata)
  VALUES (_uid, 'pathescape.completed', 1, jsonb_build_object('level', _lvl.number, 'stars', _stars, 'mode', _mode));
  IF _perfect THEN
    INSERT INTO public.gam_event_log(user_id, event_type, amount, metadata)
    VALUES (_uid, 'pathescape.perfect', 1, jsonb_build_object('level', _lvl.number));
  END IF;
  IF _record THEN
    INSERT INTO public.gam_event_log(user_id, event_type, amount, metadata)
    VALUES (_uid, 'pathescape.record', 1, jsonb_build_object('level', _lvl.number, 'time_ms', _time_ms));
  END IF;

  RETURN jsonb_build_object(
    'stars', _stars, 'perfect', _perfect, 'coins', _coins, 'xp', _xp,
    'record_broken', _record, 'first_clear', _first_clear
  );
END $$;

REVOKE ALL ON FUNCTION public.pathescape_submit_score(uuid, integer, integer, integer, text, text, jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.pathescape_submit_score(uuid, integer, integer, integer, text, text, jsonb) TO authenticated;
