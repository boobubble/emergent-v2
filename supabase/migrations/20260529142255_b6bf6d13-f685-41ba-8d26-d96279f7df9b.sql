-- 1. room_loyalty: per-user per-room engagement
CREATE TABLE public.room_loyalty (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  channel_id TEXT NOT NULL,
  streak_days INT NOT NULL DEFAULT 0,
  last_active_day DATE,
  total_messages INT NOT NULL DEFAULT 0,
  weekly_messages INT NOT NULL DEFAULT 0,
  week_start DATE,
  loyalty_level INT NOT NULL DEFAULT 1,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, channel_id)
);
CREATE INDEX idx_room_loyalty_channel ON public.room_loyalty(channel_id, weekly_messages DESC);
CREATE INDEX idx_room_loyalty_user ON public.room_loyalty(user_id);

GRANT SELECT ON public.room_loyalty TO authenticated;
GRANT ALL ON public.room_loyalty TO service_role;

ALTER TABLE public.room_loyalty ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Read all room loyalty"
  ON public.room_loyalty FOR SELECT TO authenticated
  USING (true);

-- 2. daily_missions: progress + claimed per user per UTC day
CREATE TABLE public.daily_missions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  day DATE NOT NULL,
  progress JSONB NOT NULL DEFAULT '{}'::jsonb,
  claimed TEXT[] NOT NULL DEFAULT '{}'::text[],
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, day)
);
CREATE INDEX idx_daily_missions_user_day ON public.daily_missions(user_id, day DESC);

GRANT SELECT ON public.daily_missions TO authenticated;
GRANT ALL ON public.daily_missions TO service_role;

ALTER TABLE public.daily_missions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Read own missions"
  ON public.daily_missions FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- 3. message_highlights: purchased highlight effect
CREATE TABLE public.message_highlights (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id UUID NOT NULL,
  channel_id TEXT NOT NULL,
  buyer_id UUID NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_message_highlights_msg ON public.message_highlights(message_id);
CREATE INDEX idx_message_highlights_channel ON public.message_highlights(channel_id, expires_at);

GRANT SELECT ON public.message_highlights TO authenticated;
GRANT ALL ON public.message_highlights TO service_role;

ALTER TABLE public.message_highlights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Read active highlights"
  ON public.message_highlights FOR SELECT TO authenticated
  USING (expires_at > now());

-- 4. post_boosts: purchased boost on a post
CREATE TABLE public.post_boosts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL,
  booster_id UUID NOT NULL,
  coins_spent INT NOT NULL,
  score_delta DOUBLE PRECISION NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_post_boosts_post ON public.post_boosts(post_id);
CREATE INDEX idx_post_boosts_booster ON public.post_boosts(booster_id, created_at DESC);

GRANT SELECT ON public.post_boosts TO authenticated;
GRANT ALL ON public.post_boosts TO service_role;

ALTER TABLE public.post_boosts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Read all boosts"
  ON public.post_boosts FOR SELECT TO authenticated
  USING (true);