
-- =============== WALLET RULES ENGINE ===============
CREATE TABLE IF NOT EXISTS public.wallet_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  feature text NOT NULL UNIQUE,               -- e.g. 'wallpaper','gift','frame','trio_rooms','games'
  label text NOT NULL,
  enabled boolean NOT NULL DEFAULT true,
  coin_cost integer NOT NULL DEFAULT 0,
  coin_reward integer NOT NULL DEFAULT 0,
  premium_only boolean NOT NULL DEFAULT false,
  vip_only boolean NOT NULL DEFAULT false,
  daily_limit integer,
  weekly_limit integer,
  monthly_limit integer,
  cooldown_seconds integer,
  min_xp_level integer,
  min_account_age_days integer,
  min_reputation integer,
  required_plan_slug text,
  required_badge text,
  max_per_event integer,
  max_per_conversation integer,
  max_per_day integer,
  refund_window_seconds integer,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.wallet_rules TO authenticated;
GRANT ALL ON public.wallet_rules TO service_role;
ALTER TABLE public.wallet_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "wallet_rules_read_all" ON public.wallet_rules
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "wallet_rules_admin_write" ON public.wallet_rules
  FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

CREATE TRIGGER trg_wallet_rules_updated
  BEFORE UPDATE ON public.wallet_rules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============== BONUS / EVENT MULTIPLIERS ===============
CREATE TABLE IF NOT EXISTS public.wallet_bonus_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  feature text,                         -- NULL = applies to all features
  price_multiplier numeric(6,3) NOT NULL DEFAULT 1.000,  -- e.g. 0.7 = 30% discount
  reward_multiplier numeric(6,3) NOT NULL DEFAULT 1.000, -- e.g. 2.0 = double coins
  starts_at timestamptz NOT NULL DEFAULT now(),
  ends_at timestamptz,
  enabled boolean NOT NULL DEFAULT true,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.wallet_bonus_events TO authenticated;
GRANT ALL ON public.wallet_bonus_events TO service_role;
ALTER TABLE public.wallet_bonus_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "wallet_bonus_read_all" ON public.wallet_bonus_events
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "wallet_bonus_admin_write" ON public.wallet_bonus_events
  FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

CREATE TRIGGER trg_wallet_bonus_updated
  BEFORE UPDATE ON public.wallet_bonus_events
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============== SUSPICIOUS ACTIVITY LOG ===============
CREATE TABLE IF NOT EXISTS public.wallet_suspicious_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  category text NOT NULL,               -- 'rapid_spending','unusual_gain','duplicate_tx','repeated_refund','abnormal_frequency','abuse'
  severity int NOT NULL DEFAULT 1,      -- 1 low, 2 medium, 3 high
  detail jsonb NOT NULL DEFAULT '{}'::jsonb,
  reviewed boolean NOT NULL DEFAULT false,
  reviewed_by uuid,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, UPDATE ON public.wallet_suspicious_events TO authenticated;
GRANT ALL ON public.wallet_suspicious_events TO service_role;
ALTER TABLE public.wallet_suspicious_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "wallet_susp_admin_read" ON public.wallet_suspicious_events
  FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "wallet_susp_admin_write" ON public.wallet_suspicious_events
  FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

CREATE INDEX IF NOT EXISTS idx_wallet_susp_user ON public.wallet_suspicious_events(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_wallet_susp_created ON public.wallet_suspicious_events(created_at DESC);

-- Seed default rules for known features (idempotent)
INSERT INTO public.wallet_rules (feature, label, enabled, coin_cost)
VALUES
  ('wallpaper','DM Wallpapers', true, 0),
  ('premium_theme','Premium Themes', true, 0),
  ('frame','Profile Frames', true, 0),
  ('gift','Virtual Gifts', true, 0),
  ('bubble','Chat Bubble Styles', true, 0),
  ('username_effect','Username Effects', true, 0),
  ('competitions','Competitions', true, 0),
  ('trio_rooms','Trio Rooms', true, 100),
  ('profile_unlock','Profile Visitor Unlock', true, 300),
  ('games','Mini Games', true, 0)
ON CONFLICT (feature) DO NOTHING;

-- =============== HELPERS ===============
CREATE OR REPLACE FUNCTION public.wallet_effective_price(_feature text, _base_cost integer DEFAULT NULL)
RETURNS integer
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  rule public.wallet_rules;
  base int;
  mult numeric := 1.0;
BEGIN
  SELECT * INTO rule FROM public.wallet_rules WHERE feature = _feature;
  base := COALESCE(_base_cost, rule.coin_cost, 0);
  SELECT COALESCE(MIN(price_multiplier), 1.0) INTO mult
    FROM public.wallet_bonus_events
   WHERE enabled
     AND (feature IS NULL OR feature = _feature)
     AND now() >= starts_at
     AND (ends_at IS NULL OR now() < ends_at);
  RETURN GREATEST(0, floor(base * mult)::int);
END $$;

CREATE OR REPLACE FUNCTION public.wallet_effective_reward(_feature text, _base_reward integer DEFAULT NULL)
RETURNS integer
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  rule public.wallet_rules;
  base int;
  mult numeric := 1.0;
BEGIN
  SELECT * INTO rule FROM public.wallet_rules WHERE feature = _feature;
  base := COALESCE(_base_reward, rule.coin_reward, 0);
  SELECT COALESCE(MAX(reward_multiplier), 1.0) INTO mult
    FROM public.wallet_bonus_events
   WHERE enabled
     AND (feature IS NULL OR feature = _feature)
     AND now() >= starts_at
     AND (ends_at IS NULL OR now() < ends_at);
  RETURN GREATEST(0, floor(base * mult)::int);
END $$;

CREATE OR REPLACE FUNCTION public.wallet_validate(
  _user uuid,
  _feature text,
  _amount integer DEFAULT NULL,
  _direction text DEFAULT 'debit'
) RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  rule public.wallet_rules;
  prof record;
  used_today int := 0;
  used_week int := 0;
  used_month int := 0;
  last_tx timestamptz;
  plan_slug text;
  age_days int;
BEGIN
  IF _user IS NULL THEN RETURN jsonb_build_object('ok', false, 'error','user required'); END IF;
  SELECT * INTO rule FROM public.wallet_rules WHERE feature = _feature;
  IF rule IS NULL THEN RETURN jsonb_build_object('ok', true, 'note','no rule defined'); END IF;
  IF NOT rule.enabled THEN RETURN jsonb_build_object('ok', false, 'error','Feature is currently disabled'); END IF;

  SELECT coins, wallet_frozen, created_at,
         COALESCE((SELECT max(xp) FROM (SELECT 0 xp) x), 0) AS xp
    INTO prof
    FROM public.profiles WHERE id = _user;
  IF prof IS NULL THEN RETURN jsonb_build_object('ok', false, 'error','profile not found'); END IF;
  IF prof.wallet_frozen THEN RETURN jsonb_build_object('ok', false, 'error','Wallet is frozen'); END IF;

  IF _direction = 'debit' AND _amount IS NOT NULL AND prof.coins < _amount THEN
    RETURN jsonb_build_object('ok', false, 'error', format('Insufficient coins (have %s, need %s)', prof.coins, _amount));
  END IF;

  IF rule.min_account_age_days IS NOT NULL THEN
    age_days := EXTRACT(EPOCH FROM (now() - prof.created_at))::int / 86400;
    IF age_days < rule.min_account_age_days THEN
      RETURN jsonb_build_object('ok', false, 'error', format('Account must be at least %s days old', rule.min_account_age_days));
    END IF;
  END IF;

  IF rule.premium_only OR rule.vip_only OR rule.required_plan_slug IS NOT NULL THEN
    SELECT p.slug INTO plan_slug
      FROM public.user_subscriptions us
      JOIN public.subscription_plans p ON p.id = us.plan_id
     WHERE us.user_id = _user
       AND us.status IN ('active','trialing')
       AND (us.expiry_date IS NULL OR us.expiry_date > now())
     LIMIT 1;
    IF rule.required_plan_slug IS NOT NULL AND plan_slug IS DISTINCT FROM rule.required_plan_slug THEN
      RETURN jsonb_build_object('ok', false, 'error', format('Requires %s plan', rule.required_plan_slug));
    END IF;
    IF (rule.premium_only OR rule.vip_only) AND plan_slug IS NULL THEN
      RETURN jsonb_build_object('ok', false, 'error','Requires an active subscription');
    END IF;
  END IF;

  -- Usage limits (count debits of matching kind)
  IF rule.daily_limit IS NOT NULL OR rule.max_per_day IS NOT NULL THEN
    SELECT count(*) INTO used_today FROM public.coin_transactions
     WHERE user_id = _user AND direction = 'debit'
       AND reason = _feature
       AND created_at > date_trunc('day', now());
    IF rule.daily_limit IS NOT NULL AND used_today >= rule.daily_limit THEN
      RETURN jsonb_build_object('ok', false, 'error','Daily limit reached');
    END IF;
    IF rule.max_per_day IS NOT NULL AND used_today >= rule.max_per_day THEN
      RETURN jsonb_build_object('ok', false, 'error','Daily usage cap reached');
    END IF;
  END IF;

  IF rule.weekly_limit IS NOT NULL THEN
    SELECT count(*) INTO used_week FROM public.coin_transactions
     WHERE user_id = _user AND direction = 'debit' AND reason = _feature
       AND created_at > date_trunc('week', now());
    IF used_week >= rule.weekly_limit THEN
      RETURN jsonb_build_object('ok', false, 'error','Weekly limit reached');
    END IF;
  END IF;

  IF rule.monthly_limit IS NOT NULL THEN
    SELECT count(*) INTO used_month FROM public.coin_transactions
     WHERE user_id = _user AND direction = 'debit' AND reason = _feature
       AND created_at > date_trunc('month', now());
    IF used_month >= rule.monthly_limit THEN
      RETURN jsonb_build_object('ok', false, 'error','Monthly limit reached');
    END IF;
  END IF;

  IF rule.cooldown_seconds IS NOT NULL THEN
    SELECT max(created_at) INTO last_tx FROM public.coin_transactions
     WHERE user_id = _user AND direction = 'debit' AND reason = _feature;
    IF last_tx IS NOT NULL AND last_tx > now() - make_interval(secs => rule.cooldown_seconds) THEN
      RETURN jsonb_build_object('ok', false, 'error','Please wait before using this feature again');
    END IF;
  END IF;

  RETURN jsonb_build_object('ok', true);
END $$;

GRANT EXECUTE ON FUNCTION public.wallet_effective_price(text, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.wallet_effective_reward(text, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.wallet_validate(uuid, text, integer, text) TO authenticated;

-- =============== SUSPICIOUS LOGGER ===============
CREATE OR REPLACE FUNCTION public.wallet_log_suspicious(_user uuid, _category text, _severity int, _detail jsonb)
RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE eid uuid;
BEGIN
  INSERT INTO public.wallet_suspicious_events(user_id, category, severity, detail)
  VALUES (_user, _category, COALESCE(_severity,1), COALESCE(_detail,'{}'::jsonb))
  RETURNING id INTO eid;
  RETURN eid;
END $$;

-- =============== ANALYTICS ===============
CREATE OR REPLACE FUNCTION public.wallet_analytics_summary()
RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
DECLARE r jsonb;
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN RAISE EXCEPTION 'forbidden'; END IF;
  SELECT jsonb_build_object(
    'circulation', COALESCE((SELECT sum(coins) FROM public.profiles), 0),
    'earned_today', COALESCE((SELECT sum(amount) FROM public.coin_transactions WHERE direction='credit' AND created_at > date_trunc('day', now())), 0),
    'spent_today',  COALESCE((SELECT sum(-amount) FROM public.coin_transactions WHERE direction='debit'  AND created_at > date_trunc('day', now())), 0),
    'purchased_today', COALESCE((SELECT sum(amount) FROM public.coin_transactions WHERE direction='credit' AND reason='purchase' AND created_at > date_trunc('day', now())), 0),
    'rewarded_today',  COALESCE((SELECT sum(amount) FROM public.coin_transactions WHERE direction='credit' AND reason IN ('daily_login','streak_bonus','reward','game_reward','fish_reward','dig_reward','wine_reward','admin_bonus') AND created_at > date_trunc('day', now())), 0),
    'refunded_today', COALESCE((SELECT sum(amount) FROM public.coin_transactions WHERE direction='credit' AND reason='refund' AND created_at > date_trunc('day', now())), 0),
    'avg_balance', COALESCE((SELECT round(avg(coins))::int FROM public.profiles), 0),
    'max_balance', COALESCE((SELECT max(coins) FROM public.profiles), 0),
    'min_balance', COALESCE((SELECT min(coins) FROM public.profiles), 0),
    'total_users', (SELECT count(*) FROM public.profiles),
    'active_bonus_events', (SELECT count(*) FROM public.wallet_bonus_events WHERE enabled AND now() >= starts_at AND (ends_at IS NULL OR now() < ends_at)),
    'suspicious_open', (SELECT count(*) FROM public.wallet_suspicious_events WHERE NOT reviewed)
  ) INTO r;
  RETURN r;
END $$;

CREATE OR REPLACE FUNCTION public.wallet_analytics_timeseries(_days integer DEFAULT 30)
RETURNS TABLE(day date, earned bigint, spent bigint, purchased bigint, refunded bigint)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN RAISE EXCEPTION 'forbidden'; END IF;
  RETURN QUERY
  WITH days AS (
    SELECT generate_series(date_trunc('day', now()) - make_interval(days => GREATEST(_days,1)-1),
                           date_trunc('day', now()), interval '1 day')::date AS d
  )
  SELECT d,
    COALESCE(sum(CASE WHEN t.direction='credit' THEN t.amount END), 0)::bigint,
    COALESCE(sum(CASE WHEN t.direction='debit'  THEN -t.amount END), 0)::bigint,
    COALESCE(sum(CASE WHEN t.reason='purchase' AND t.direction='credit' THEN t.amount END), 0)::bigint,
    COALESCE(sum(CASE WHEN t.reason='refund' AND t.direction='credit' THEN t.amount END), 0)::bigint
  FROM days
  LEFT JOIN public.coin_transactions t
    ON date_trunc('day', t.created_at)::date = d
  GROUP BY d ORDER BY d;
END $$;

CREATE OR REPLACE FUNCTION public.wallet_analytics_leaderboards(_limit integer DEFAULT 10)
RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
DECLARE res jsonb;
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN RAISE EXCEPTION 'forbidden'; END IF;
  SELECT jsonb_build_object(
    'top_holders', (
      SELECT COALESCE(jsonb_agg(x), '[]'::jsonb) FROM (
        SELECT id AS user_id, username, coins
        FROM public.profiles ORDER BY coins DESC NULLS LAST LIMIT _limit
      ) x),
    'top_earners', (
      SELECT COALESCE(jsonb_agg(x), '[]'::jsonb) FROM (
        SELECT p.id AS user_id, p.username, sum(t.amount)::bigint AS total
        FROM public.coin_transactions t
        JOIN public.profiles p ON p.id = t.user_id
        WHERE t.direction='credit'
        GROUP BY p.id, p.username ORDER BY total DESC LIMIT _limit
      ) x),
    'top_spenders', (
      SELECT COALESCE(jsonb_agg(x), '[]'::jsonb) FROM (
        SELECT p.id AS user_id, p.username, sum(-t.amount)::bigint AS total
        FROM public.coin_transactions t
        JOIN public.profiles p ON p.id = t.user_id
        WHERE t.direction='debit'
        GROUP BY p.id, p.username ORDER BY total DESC LIMIT _limit
      ) x)
  ) INTO res;
  RETURN res;
END $$;

CREATE OR REPLACE FUNCTION public.wallet_analytics_top_kinds(_direction text DEFAULT 'debit', _limit integer DEFAULT 10)
RETURNS TABLE(kind text, total bigint, tx_count bigint, unique_users bigint)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN RAISE EXCEPTION 'forbidden'; END IF;
  RETURN QUERY
  SELECT reason,
         sum(CASE WHEN _direction='credit' THEN amount ELSE -amount END)::bigint,
         count(*)::bigint,
         count(DISTINCT user_id)::bigint
  FROM public.coin_transactions
  WHERE direction = _direction
  GROUP BY reason
  ORDER BY 2 DESC
  LIMIT _limit;
END $$;

CREATE OR REPLACE FUNCTION public.wallet_analytics_feature_stats()
RETURNS TABLE(
  feature text,
  label text,
  enabled boolean,
  coin_cost integer,
  total_tx bigint,
  total_revenue bigint,
  unique_users bigint,
  avg_cost numeric,
  last_used timestamptz
)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN RAISE EXCEPTION 'forbidden'; END IF;
  RETURN QUERY
  SELECT r.feature, r.label, r.enabled, r.coin_cost,
    COALESCE(count(t.id), 0)::bigint,
    COALESCE(sum(-t.amount), 0)::bigint,
    COALESCE(count(DISTINCT t.user_id), 0)::bigint,
    COALESCE(round(avg(-t.amount)::numeric, 2), 0),
    max(t.created_at)
  FROM public.wallet_rules r
  LEFT JOIN public.coin_transactions t
    ON t.reason = r.feature AND t.direction = 'debit'
  GROUP BY r.feature, r.label, r.enabled, r.coin_cost
  ORDER BY r.label;
END $$;

GRANT EXECUTE ON FUNCTION public.wallet_analytics_summary() TO authenticated;
GRANT EXECUTE ON FUNCTION public.wallet_analytics_timeseries(integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.wallet_analytics_leaderboards(integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.wallet_analytics_top_kinds(text, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.wallet_analytics_feature_stats() TO authenticated;
