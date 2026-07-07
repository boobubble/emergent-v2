-- =========================================================
-- Arrow Flow — levels
-- =========================================================
CREATE TABLE public.arrowflow_levels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  level_number INT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy','normal','hard','expert','master')),
  grid_size INT NOT NULL CHECK (grid_size BETWEEN 3 AND 12),
  layout JSONB NOT NULL,
  solution JSONB NOT NULL,
  par_moves INT NOT NULL DEFAULT 20,
  par_time_ms INT NOT NULL DEFAULT 60000,
  coin_reward INT NOT NULL DEFAULT 10,
  xp_reward INT NOT NULL DEFAULT 25,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  version INT NOT NULL DEFAULT 1,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (level_number)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.arrowflow_levels TO authenticated;
GRANT ALL ON public.arrowflow_levels TO service_role;

ALTER TABLE public.arrowflow_levels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone signed in can read enabled levels"
ON public.arrowflow_levels FOR SELECT
TO authenticated
USING (is_enabled = true OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage levels"
ON public.arrowflow_levels FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE INDEX arrowflow_levels_difficulty_idx ON public.arrowflow_levels (difficulty, level_number);
CREATE INDEX arrowflow_levels_enabled_idx ON public.arrowflow_levels (is_enabled) WHERE is_enabled;

-- =========================================================
-- Arrow Flow — scores
-- =========================================================
CREATE TABLE public.arrowflow_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  level_id UUID NOT NULL REFERENCES public.arrowflow_levels(id) ON DELETE CASCADE,
  room_id TEXT,
  time_ms INT NOT NULL,
  moves INT NOT NULL,
  hints_used INT NOT NULL DEFAULT 0,
  score INT NOT NULL,
  stars SMALLINT NOT NULL DEFAULT 1 CHECK (stars BETWEEN 1 AND 3),
  perfect BOOLEAN NOT NULL DEFAULT false,
  mode TEXT NOT NULL DEFAULT 'story' CHECK (mode IN ('story','daily','practice','tournament')),
  move_log JSONB,
  client_signature TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, level_id, mode)
);

GRANT SELECT ON public.arrowflow_scores TO authenticated;
GRANT ALL ON public.arrowflow_scores TO service_role;

ALTER TABLE public.arrowflow_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone signed in can read scores"
ON public.arrowflow_scores FOR SELECT
TO authenticated
USING (true);

-- No client-side INSERT/UPDATE/DELETE policy — scores are written by
-- the server via the service role after anti-cheat validation.

CREATE INDEX arrowflow_scores_level_score_idx
  ON public.arrowflow_scores (level_id, score DESC, time_ms ASC);
CREATE INDEX arrowflow_scores_level_time_idx
  ON public.arrowflow_scores (level_id, time_ms ASC);
CREATE INDEX arrowflow_scores_level_moves_idx
  ON public.arrowflow_scores (level_id, moves ASC);
CREATE INDEX arrowflow_scores_room_idx
  ON public.arrowflow_scores (room_id, score DESC) WHERE room_id IS NOT NULL;
CREATE INDEX arrowflow_scores_created_idx
  ON public.arrowflow_scores (created_at DESC);

-- =========================================================
-- Arrow Flow — daily challenges
-- =========================================================
CREATE TABLE public.arrowflow_daily (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  challenge_date DATE NOT NULL UNIQUE,
  level_id UUID NOT NULL REFERENCES public.arrowflow_levels(id) ON DELETE CASCADE,
  bonus_coins INT NOT NULL DEFAULT 25,
  bonus_xp INT NOT NULL DEFAULT 50,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.arrowflow_daily TO authenticated;
GRANT ALL ON public.arrowflow_daily TO service_role;

ALTER TABLE public.arrowflow_daily ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone signed in can read daily challenges"
ON public.arrowflow_daily FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins manage daily challenges"
ON public.arrowflow_daily FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- =========================================================
-- updated_at trigger
-- =========================================================
CREATE TRIGGER arrowflow_levels_set_updated_at
BEFORE UPDATE ON public.arrowflow_levels
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();