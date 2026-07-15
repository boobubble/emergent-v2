
-- =========================
-- Abuse protection: buckets, events, bans
-- =========================

CREATE TABLE IF NOT EXISTS public.rate_limit_buckets (
  id BIGSERIAL PRIMARY KEY,
  action TEXT NOT NULL,
  key TEXT NOT NULL,
  window_start TIMESTAMPTZ NOT NULL DEFAULT now(),
  hits INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (action, key)
);
CREATE INDEX IF NOT EXISTS idx_rate_limit_buckets_lookup ON public.rate_limit_buckets(action, key);
CREATE INDEX IF NOT EXISTS idx_rate_limit_buckets_updated ON public.rate_limit_buckets(updated_at);

GRANT SELECT ON public.rate_limit_buckets TO authenticated;
GRANT ALL ON public.rate_limit_buckets TO service_role;
ALTER TABLE public.rate_limit_buckets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view rate limit buckets"
  ON public.rate_limit_buckets FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

CREATE TABLE IF NOT EXISTS public.abuse_events (
  id BIGSERIAL PRIMARY KEY,
  action TEXT NOT NULL,
  key TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ip TEXT,
  severity TEXT NOT NULL DEFAULT 'warn',
  reason TEXT NOT NULL,
  meta JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_abuse_events_created ON public.abuse_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_abuse_events_key ON public.abuse_events(key, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_abuse_events_action ON public.abuse_events(action, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_abuse_events_user ON public.abuse_events(user_id, created_at DESC);

GRANT SELECT ON public.abuse_events TO authenticated;
GRANT ALL ON public.abuse_events TO service_role;
ALTER TABLE public.abuse_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view abuse events"
  ON public.abuse_events FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

CREATE TABLE IF NOT EXISTS public.rate_limit_bans (
  id BIGSERIAL PRIMARY KEY,
  key TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT,
  reason TEXT NOT NULL DEFAULT 'auto',
  offense_count INTEGER NOT NULL DEFAULT 1,
  banned_until TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (key, action)
);
CREATE INDEX IF NOT EXISTS idx_rate_limit_bans_key ON public.rate_limit_bans(key);
CREATE INDEX IF NOT EXISTS idx_rate_limit_bans_until ON public.rate_limit_bans(banned_until);

GRANT SELECT ON public.rate_limit_bans TO authenticated;
GRANT ALL ON public.rate_limit_bans TO service_role;
ALTER TABLE public.rate_limit_bans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view rate limit bans"
  ON public.rate_limit_bans FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

-- =========================
-- check_and_consume_rate_limit
-- =========================
-- Returns JSON: { allowed: bool, retry_after: int seconds, reason: text }
-- Admins bypass unless _force = true.

CREATE OR REPLACE FUNCTION public.check_and_consume_rate_limit(
  _action TEXT,
  _key TEXT,
  _limit INTEGER,
  _window_seconds INTEGER,
  _user_id UUID DEFAULT NULL,
  _ip TEXT DEFAULT NULL,
  _force BOOLEAN DEFAULT FALSE
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_now TIMESTAMPTZ := now();
  v_window_start TIMESTAMPTZ;
  v_hits INTEGER;
  v_banned RECORD;
  v_retry INTEGER;
  v_offenses INTEGER;
  v_ban_seconds INTEGER;
BEGIN
  -- Admin bypass
  IF NOT _force AND _user_id IS NOT NULL AND (
    public.has_role(_user_id, 'admin') OR public.has_role(_user_id, 'super_admin')
  ) THEN
    RETURN jsonb_build_object('allowed', true, 'retry_after', 0, 'reason', 'admin_bypass');
  END IF;

  -- Check existing ban
  SELECT * INTO v_banned FROM public.rate_limit_bans
    WHERE key = _key AND (action = _action OR action IS NULL)
      AND banned_until > v_now
    ORDER BY banned_until DESC LIMIT 1;

  IF FOUND THEN
    v_retry := GREATEST(1, EXTRACT(EPOCH FROM (v_banned.banned_until - v_now))::INTEGER);
    RETURN jsonb_build_object('allowed', false, 'retry_after', v_retry, 'reason', 'banned');
  END IF;

  -- Upsert bucket with sliding window
  INSERT INTO public.rate_limit_buckets(action, key, window_start, hits, updated_at)
    VALUES (_action, _key, v_now, 1, v_now)
  ON CONFLICT (action, key) DO UPDATE
    SET
      hits = CASE
        WHEN public.rate_limit_buckets.window_start < v_now - make_interval(secs => _window_seconds)
        THEN 1
        ELSE public.rate_limit_buckets.hits + 1
      END,
      window_start = CASE
        WHEN public.rate_limit_buckets.window_start < v_now - make_interval(secs => _window_seconds)
        THEN v_now
        ELSE public.rate_limit_buckets.window_start
      END,
      updated_at = v_now
    RETURNING hits, window_start INTO v_hits, v_window_start;

  IF v_hits <= _limit THEN
    RETURN jsonb_build_object('allowed', true, 'retry_after', 0, 'reason', 'ok');
  END IF;

  -- Over limit: log event, apply progressive ban
  INSERT INTO public.abuse_events(action, key, user_id, ip, severity, reason, meta)
    VALUES (_action, _key, _user_id, _ip, 'warn', 'rate_limit_exceeded',
      jsonb_build_object('hits', v_hits, 'limit', _limit, 'window', _window_seconds));

  -- Count recent offenses in last 24h for progressive penalty
  SELECT COUNT(*) INTO v_offenses FROM public.abuse_events
    WHERE key = _key AND action = _action
      AND created_at > v_now - interval '24 hours';

  -- Progressive: 1st: 60s, 2nd: 5min, 3rd: 30min, 4th+: 2h
  v_ban_seconds := CASE
    WHEN v_offenses <= 1 THEN 60
    WHEN v_offenses = 2 THEN 300
    WHEN v_offenses = 3 THEN 1800
    ELSE 7200
  END;

  INSERT INTO public.rate_limit_bans(key, user_id, action, reason, offense_count, banned_until)
    VALUES (_key, _user_id, _action, 'auto_rate_limit', v_offenses, v_now + make_interval(secs => v_ban_seconds))
  ON CONFLICT (key, action) DO UPDATE
    SET offense_count = public.rate_limit_bans.offense_count + 1,
        banned_until = v_now + make_interval(secs => v_ban_seconds),
        reason = 'auto_rate_limit';

  v_retry := v_ban_seconds;
  RETURN jsonb_build_object('allowed', false, 'retry_after', v_retry, 'reason', 'rate_limited');
END;
$$;

REVOKE ALL ON FUNCTION public.check_and_consume_rate_limit(TEXT, TEXT, INTEGER, INTEGER, UUID, TEXT, BOOLEAN) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.check_and_consume_rate_limit(TEXT, TEXT, INTEGER, INTEGER, UUID, TEXT, BOOLEAN) TO service_role;

-- =========================
-- Spam detector: repeated identical content
-- =========================
CREATE OR REPLACE FUNCTION public.detect_repeated_content(
  _action TEXT,
  _user_id UUID,
  _content_hash TEXT,
  _threshold INTEGER DEFAULT 3,
  _window_seconds INTEGER DEFAULT 300
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  IF _user_id IS NULL OR _content_hash IS NULL THEN RETURN FALSE; END IF;

  SELECT COUNT(*) INTO v_count FROM public.abuse_events
    WHERE user_id = _user_id
      AND action = _action || ':content'
      AND meta->>'hash' = _content_hash
      AND created_at > now() - make_interval(secs => _window_seconds);

  INSERT INTO public.abuse_events(action, key, user_id, severity, reason, meta)
    VALUES (_action || ':content', _user_id::text, _user_id, 'info', 'content_seen',
      jsonb_build_object('hash', _content_hash));

  RETURN v_count >= _threshold;
END;
$$;

REVOKE ALL ON FUNCTION public.detect_repeated_content(TEXT, UUID, TEXT, INTEGER, INTEGER) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.detect_repeated_content(TEXT, UUID, TEXT, INTEGER, INTEGER) TO service_role;

-- =========================
-- Admin unban helper
-- =========================
CREATE OR REPLACE FUNCTION public.admin_clear_rate_limit_ban(_key TEXT, _action TEXT DEFAULT NULL)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  IF NOT (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin')) THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;

  DELETE FROM public.rate_limit_bans WHERE key = _key AND (_action IS NULL OR action = _action);
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_clear_rate_limit_ban(TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_clear_rate_limit_ban(TEXT, TEXT) TO authenticated;
