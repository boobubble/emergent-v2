
-- Phase 4: Lives, Hints, Ghost/Replay for Path Escape

-- Per-user lives
CREATE TABLE public.pathescape_lives (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  lives integer NOT NULL DEFAULT 5,
  max_lives integer NOT NULL DEFAULT 5,
  next_regen_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.pathescape_lives TO authenticated;
GRANT ALL ON public.pathescape_lives TO service_role;
ALTER TABLE public.pathescape_lives ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own lives" ON public.pathescape_lives FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Hint usage log (analytics + anti-cheat)
CREATE TABLE public.pathescape_hint_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  level_id uuid NOT NULL REFERENCES public.pathescape_levels(id) ON DELETE CASCADE,
  hint_type text NOT NULL,           -- 'reveal_piece' | 'reveal_all' | 'undo'
  coins_spent integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.pathescape_hint_log TO authenticated;
GRANT ALL ON public.pathescape_hint_log TO service_role;
ALTER TABLE public.pathescape_hint_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own hint log read" ON public.pathescape_hint_log FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "own hint log insert" ON public.pathescape_hint_log FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Constants
CREATE OR REPLACE FUNCTION public.pathescape_regen_minutes() RETURNS integer LANGUAGE sql IMMUTABLE AS $$ SELECT 8 $$;

-- Get / regenerate lives
CREATE OR REPLACE FUNCTION public.pathescape_get_lives()
RETURNS TABLE(lives integer, max_lives integer, next_regen_at timestamptz)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _uid uuid := auth.uid(); _row public.pathescape_lives%ROWTYPE; _mins integer; _regen integer;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'auth required'; END IF;
  SELECT * INTO _row FROM public.pathescape_lives WHERE user_id = _uid;
  IF NOT FOUND THEN
    INSERT INTO public.pathescape_lives(user_id) VALUES (_uid) RETURNING * INTO _row;
  END IF;
  IF _row.lives < _row.max_lives AND now() >= _row.next_regen_at THEN
    _mins := public.pathescape_regen_minutes();
    _regen := LEAST(_row.max_lives - _row.lives,
              1 + FLOOR(EXTRACT(EPOCH FROM (now() - _row.next_regen_at)) / (_mins * 60))::int);
    _row.lives := LEAST(_row.max_lives, _row.lives + _regen);
    _row.next_regen_at := CASE WHEN _row.lives >= _row.max_lives
                               THEN now()
                               ELSE now() + make_interval(mins => _mins) END;
    UPDATE public.pathescape_lives
      SET lives = _row.lives, next_regen_at = _row.next_regen_at, updated_at = now()
      WHERE user_id = _uid;
  END IF;
  RETURN QUERY SELECT _row.lives, _row.max_lives, _row.next_regen_at;
END;$$;

-- Consume one life
CREATE OR REPLACE FUNCTION public.pathescape_consume_life()
RETURNS TABLE(lives integer, max_lives integer, next_regen_at timestamptz)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _uid uuid := auth.uid(); _row public.pathescape_lives%ROWTYPE; _mins integer;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'auth required'; END IF;
  PERFORM public.pathescape_get_lives();
  SELECT * INTO _row FROM public.pathescape_lives WHERE user_id = _uid FOR UPDATE;
  IF _row.lives <= 0 THEN RAISE EXCEPTION 'no lives remaining'; END IF;
  _mins := public.pathescape_regen_minutes();
  UPDATE public.pathescape_lives
    SET lives = _row.lives - 1,
        next_regen_at = CASE WHEN _row.lives - 1 < _row.max_lives AND _row.lives = _row.max_lives
                             THEN now() + make_interval(mins => _mins)
                             ELSE _row.next_regen_at END,
        updated_at = now()
    WHERE user_id = _uid RETURNING * INTO _row;
  RETURN QUERY SELECT _row.lives, _row.max_lives, _row.next_regen_at;
END;$$;

-- Refill lives via coins
CREATE OR REPLACE FUNCTION public.pathescape_refill_lives(_cost integer DEFAULT 50)
RETURNS TABLE(lives integer, max_lives integer, next_regen_at timestamptz)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _uid uuid := auth.uid(); _row public.pathescape_lives%ROWTYPE;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'auth required'; END IF;
  PERFORM public.pathescape_get_lives();
  SELECT * INTO _row FROM public.pathescape_lives WHERE user_id = _uid FOR UPDATE;
  IF _row.lives >= _row.max_lives THEN RAISE EXCEPTION 'lives already full'; END IF;
  PERFORM public.wallet_apply(_uid, _cost, 'debit', 'pathescape_refill', 'purchase', 'system', NULL, NULL);
  UPDATE public.pathescape_lives
    SET lives = _row.max_lives, next_regen_at = now(), updated_at = now()
    WHERE user_id = _uid RETURNING * INTO _row;
  RETURN QUERY SELECT _row.lives, _row.max_lives, _row.next_regen_at;
END;$$;

-- Buy a hint (charges coins, logs it, returns solution snippet)
CREATE OR REPLACE FUNCTION public.pathescape_buy_hint(
  _level_id uuid, _hint_type text DEFAULT 'reveal_piece', _cost integer DEFAULT 10
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _uid uuid := auth.uid(); _lvl public.pathescape_levels%ROWTYPE;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'auth required'; END IF;
  IF _hint_type NOT IN ('reveal_piece','reveal_all','undo') THEN RAISE EXCEPTION 'invalid hint type'; END IF;
  SELECT * INTO _lvl FROM public.pathescape_levels WHERE id = _level_id AND enabled = true;
  IF NOT FOUND THEN RAISE EXCEPTION 'level not found'; END IF;
  PERFORM public.wallet_apply(_uid, _cost, 'debit', 'pathescape_hint', _hint_type, 'system', NULL, NULL);
  INSERT INTO public.pathescape_hint_log(user_id, level_id, hint_type, coins_spent)
    VALUES (_uid, _level_id, _hint_type, _cost);
  RETURN jsonb_build_object('solution', _lvl.solution, 'hint_type', _hint_type, 'cost', _cost);
END;$$;

-- Fetch replay (own scores or leaderboard top for spectating)
CREATE OR REPLACE FUNCTION public.pathescape_get_replay(_score_id uuid)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _r jsonb; _lvl_id uuid;
BEGIN
  SELECT replay_log, level_id INTO _r, _lvl_id FROM public.pathescape_scores WHERE id = _score_id;
  IF _r IS NULL THEN RETURN NULL; END IF;
  RETURN jsonb_build_object('log', _r, 'level_id', _lvl_id);
END;$$;

GRANT EXECUTE ON FUNCTION public.pathescape_get_lives() TO authenticated;
GRANT EXECUTE ON FUNCTION public.pathescape_consume_life() TO authenticated;
GRANT EXECUTE ON FUNCTION public.pathescape_refill_lives(integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.pathescape_buy_hint(uuid, text, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.pathescape_get_replay(uuid) TO anon, authenticated;
