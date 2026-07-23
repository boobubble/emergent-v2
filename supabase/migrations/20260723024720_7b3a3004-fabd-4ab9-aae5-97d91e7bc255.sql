
-- 1. Extend word_filters (backward compatible)
ALTER TABLE public.word_filters
  ADD COLUMN IF NOT EXISTS category text NOT NULL DEFAULT 'general',
  ADD COLUMN IF NOT EXISTS actions text[] NOT NULL DEFAULT ARRAY['replace']::text[],
  ADD COLUMN IF NOT EXISTS violation_points int NOT NULL DEFAULT 1;

-- 2. DM privacy per user
CREATE TABLE IF NOT EXISTS public.user_dm_privacy (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  who_can_dm text NOT NULL DEFAULT 'everyone' CHECK (who_can_dm IN ('everyone','friends','nobody')),
  allow_message_requests boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.user_dm_privacy TO authenticated;
GRANT ALL ON public.user_dm_privacy TO service_role;
ALTER TABLE public.user_dm_privacy ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read own dm privacy" ON public.user_dm_privacy
  FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.is_moderator(auth.uid()));
CREATE POLICY "manage own dm privacy" ON public.user_dm_privacy
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 3. Trust scores
CREATE TABLE IF NOT EXISTS public.user_trust_scores (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  points int NOT NULL DEFAULT 0,
  lifetime_points int NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.user_trust_scores TO authenticated;
GRANT ALL ON public.user_trust_scores TO service_role;
ALTER TABLE public.user_trust_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read own trust score" ON public.user_trust_scores
  FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.is_moderator(auth.uid()));

-- 4. Violations
CREATE TABLE IF NOT EXISTS public.trust_violations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL,
  points int NOT NULL DEFAULT 0,
  reason text,
  ref_type text,
  ref_id text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_trust_violations_user_time ON public.trust_violations(user_id, created_at DESC);
GRANT SELECT ON public.trust_violations TO authenticated;
GRANT ALL ON public.trust_violations TO service_role;
ALTER TABLE public.trust_violations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read own violations" ON public.trust_violations
  FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.is_moderator(auth.uid()));

-- 5. DM message requests inbox
CREATE TABLE IF NOT EXISTS public.dm_message_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  preview text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','declined','blocked')),
  created_at timestamptz NOT NULL DEFAULT now(),
  responded_at timestamptz,
  UNIQUE (sender_id, receiver_id)
);
CREATE INDEX IF NOT EXISTS idx_dm_msg_requests_recv ON public.dm_message_requests(receiver_id, status);
GRANT SELECT, INSERT, UPDATE ON public.dm_message_requests TO authenticated;
GRANT ALL ON public.dm_message_requests TO service_role;
ALTER TABLE public.dm_message_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read own dm requests" ON public.dm_message_requests
  FOR SELECT TO authenticated USING (auth.uid() = sender_id OR auth.uid() = receiver_id OR public.is_moderator(auth.uid()));
CREATE POLICY "sender creates dm request" ON public.dm_message_requests
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "receiver responds dm request" ON public.dm_message_requests
  FOR UPDATE TO authenticated USING (auth.uid() = receiver_id) WITH CHECK (auth.uid() = receiver_id);

-- 6. Trust & Safety settings (single JSON row) — seed defaults
INSERT INTO public.app_settings (key, value)
VALUES ('trust_safety', jsonb_build_object(
  'enabled', true,
  'feature_unlocks', jsonb_build_object(
    'dm_privacy', 5,
    'message_requests', 10,
    'advanced_safety', 15
  ),
  'unlock_mode', 'level',
  'min_account_age_days', 0,
  'require_verified', false,
  'public_url_action', 'replace',
  'default_word_action', 'replace',
  'penalty_thresholds', jsonb_build_array(
    jsonb_build_object('points', 5,   'action', 'warn',        'duration_minutes', 0),
    jsonb_build_object('points', 10,  'action', 'temp_mute',   'duration_minutes', 30),
    jsonb_build_object('points', 20,  'action', 'temp_mute',   'duration_minutes', 1440),
    jsonb_build_object('points', 40,  'action', 'temp_mute',   'duration_minutes', 10080),
    jsonb_build_object('points', 100, 'action', 'permanent_ban', 'duration_minutes', 0)
  ),
  'violation_points', jsonb_build_object(
    'bad_word', 1,
    'blocked_url_public', 2,
    'blocked_url_dm', 1,
    'spam', 3,
    'mass_report', 5,
    'ai_flag', 2
  )
))
ON CONFLICT (key) DO NOTHING;

-- 7. RPC to apply auto-penalty (invoked by trigger below)
CREATE OR REPLACE FUNCTION public.apply_trust_penalty(_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  s jsonb;
  th jsonb;
  pts int;
  chosen jsonb := NULL;
  action_text text;
  duration_min int;
BEGIN
  SELECT value INTO s FROM public.app_settings WHERE key = 'trust_safety';
  IF s IS NULL THEN RETURN; END IF;
  SELECT points INTO pts FROM public.user_trust_scores WHERE user_id = _user_id;
  IF pts IS NULL THEN RETURN; END IF;

  -- pick highest threshold that current score meets
  FOR th IN SELECT * FROM jsonb_array_elements(s->'penalty_thresholds') LOOP
    IF pts >= (th->>'points')::int THEN
      IF chosen IS NULL OR (th->>'points')::int > (chosen->>'points')::int THEN
        chosen := th;
      END IF;
    END IF;
  END LOOP;
  IF chosen IS NULL THEN RETURN; END IF;

  action_text := chosen->>'action';
  duration_min := COALESCE((chosen->>'duration_minutes')::int, 0);

  IF action_text IN ('temp_mute','permanent_mute') THEN
    INSERT INTO public.user_mutes (user_id, scope, reason, created_by, expires_at, active)
    VALUES (
      _user_id, 'global',
      'Auto-penalty: ' || pts::text || ' trust points',
      _user_id,
      CASE WHEN action_text='temp_mute' AND duration_min > 0
           THEN now() + make_interval(mins => duration_min) ELSE NULL END,
      true
    )
    ON CONFLICT DO NOTHING;
  ELSIF action_text = 'permanent_ban' THEN
    INSERT INTO public.user_bans (user_id, reason, created_by, expires_at, active)
    VALUES (_user_id, 'Auto-penalty: '||pts::text||' trust points', _user_id, NULL, true);
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.apply_trust_penalty(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.apply_trust_penalty(uuid) TO service_role;

-- 8. Trigger: bump trust score on violation insert + evaluate penalties
CREATE OR REPLACE FUNCTION public.trust_violations_after_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.points IS NULL OR NEW.points = 0 THEN
    RETURN NEW;
  END IF;
  INSERT INTO public.user_trust_scores (user_id, points, lifetime_points, updated_at)
  VALUES (NEW.user_id, NEW.points, NEW.points, now())
  ON CONFLICT (user_id) DO UPDATE
    SET points = public.user_trust_scores.points + EXCLUDED.points,
        lifetime_points = public.user_trust_scores.lifetime_points + EXCLUDED.points,
        updated_at = now();
  PERFORM public.apply_trust_penalty(NEW.user_id);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trust_violations_after_insert ON public.trust_violations;
CREATE TRIGGER trust_violations_after_insert
AFTER INSERT ON public.trust_violations
FOR EACH ROW EXECUTE FUNCTION public.trust_violations_after_insert();

-- 9. Helper function: check unlock eligibility (level / age / verified)
CREATE OR REPLACE FUNCTION public.trust_feature_unlocked(_user_id uuid, _feature text)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  s jsonb;
  needed_level int;
  needed_age int;
  age_days int;
  ulevel int;
  verified boolean;
  mode text;
BEGIN
  SELECT value INTO s FROM public.app_settings WHERE key = 'trust_safety';
  IF s IS NULL OR NOT COALESCE((s->>'enabled')::boolean, true) THEN
    RETURN true; -- system disabled: default open
  END IF;
  mode := COALESCE(s->>'unlock_mode', 'level');
  needed_level := COALESCE((s->'feature_unlocks'->>_feature)::int, 0);
  needed_age := COALESCE((s->>'min_account_age_days')::int, 0);

  SELECT p.level, p.is_verified,
         EXTRACT(EPOCH FROM (now() - p.created_at))::int / 86400
  INTO ulevel, verified, age_days
  FROM public.profiles p WHERE p.id = _user_id;
  IF ulevel IS NULL THEN RETURN false; END IF;

  IF COALESCE((s->>'require_verified')::boolean, false) AND NOT COALESCE(verified,false) THEN
    RETURN false;
  END IF;

  IF mode = 'age' THEN
    RETURN age_days >= needed_age;
  ELSIF mode = 'verified' THEN
    RETURN COALESCE(verified,false);
  ELSE
    RETURN ulevel >= needed_level;
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.trust_feature_unlocked(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.trust_feature_unlocked(uuid, text) TO authenticated, service_role;
