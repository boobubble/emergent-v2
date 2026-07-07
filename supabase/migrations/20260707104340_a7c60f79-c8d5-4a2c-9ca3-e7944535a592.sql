
-- =========================================================
-- WALLET & COINS STORE
-- =========================================================

-- ---- profiles: wallet stats ----
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS coins_lifetime_earned int NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS coins_lifetime_spent  int NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS coins_purchased_total int NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS coins_bonus_total     int NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS wallet_frozen         boolean NOT NULL DEFAULT false;

-- ---- coin_transactions: richer ledger ----
ALTER TABLE public.coin_transactions
  ADD COLUMN IF NOT EXISTS wallet_kind    text,
  ADD COLUMN IF NOT EXISTS direction      text CHECK (direction IN ('credit','debit')),
  ADD COLUMN IF NOT EXISTS status         text NOT NULL DEFAULT 'completed'
                            CHECK (status IN ('pending','completed','failed','refunded')),
  ADD COLUMN IF NOT EXISTS reference_id   text,
  ADD COLUMN IF NOT EXISTS provider       text NOT NULL DEFAULT 'system'
                            CHECK (provider IN ('manual','razorpay','stripe','system')),
  ADD COLUMN IF NOT EXISTS metadata       jsonb NOT NULL DEFAULT '{}'::jsonb;

CREATE UNIQUE INDEX IF NOT EXISTS coin_transactions_provider_reference_uniq
  ON public.coin_transactions(provider, reference_id)
  WHERE reference_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS coin_transactions_user_created_idx
  ON public.coin_transactions(user_id, created_at DESC);

-- ---- coin_packages ----
CREATE TABLE IF NOT EXISTS public.coin_packages (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name          text NOT NULL,
  coins         int  NOT NULL CHECK (coins > 0),
  bonus_coins   int  NOT NULL DEFAULT 0 CHECK (bonus_coins >= 0),
  price_inr     int,           -- rupees (whole)
  price_usd_cents int,
  currency      text NOT NULL DEFAULT 'INR',
  badge         text,
  sort_order    int  NOT NULL DEFAULT 0,
  is_active     boolean NOT NULL DEFAULT true,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.coin_packages TO anon, authenticated;
GRANT ALL    ON public.coin_packages TO service_role;
ALTER TABLE public.coin_packages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "coin_packages public read active"
  ON public.coin_packages FOR SELECT
  USING (is_active OR public.is_admin(auth.uid()));

CREATE POLICY "coin_packages admin write"
  ON public.coin_packages FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

CREATE TRIGGER coin_packages_updated
  BEFORE UPDATE ON public.coin_packages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ---- coin_payment_orders ----
CREATE TABLE IF NOT EXISTS public.coin_payment_orders (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  package_id         uuid REFERENCES public.coin_packages(id),
  provider           text NOT NULL CHECK (provider IN ('manual','razorpay','stripe')),
  provider_order_id  text,
  provider_payment_id text,
  amount             int  NOT NULL,
  currency           text NOT NULL DEFAULT 'INR',
  coins              int  NOT NULL,
  bonus_coins        int  NOT NULL DEFAULT 0,
  status             text NOT NULL DEFAULT 'created'
                       CHECK (status IN ('created','awaiting_review','paid','failed','refunded','cancelled')),
  receipt_url        text,
  admin_note         text,
  metadata           jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.coin_payment_orders TO authenticated;
GRANT ALL ON public.coin_payment_orders TO service_role;
ALTER TABLE public.coin_payment_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "orders owner read" ON public.coin_payment_orders
  FOR SELECT USING (user_id = auth.uid() OR public.is_admin(auth.uid()));

CREATE POLICY "orders owner insert" ON public.coin_payment_orders
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "orders admin update" ON public.coin_payment_orders
  FOR UPDATE USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

CREATE INDEX IF NOT EXISTS coin_orders_user_idx ON public.coin_payment_orders(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS coin_orders_status_idx ON public.coin_payment_orders(status);
CREATE UNIQUE INDEX IF NOT EXISTS coin_orders_provider_order_uniq
  ON public.coin_payment_orders(provider, provider_order_id)
  WHERE provider_order_id IS NOT NULL;

CREATE TRIGGER coin_orders_updated
  BEFORE UPDATE ON public.coin_payment_orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ---- payment_providers ----
CREATE TABLE IF NOT EXISTS public.payment_providers (
  key        text PRIMARY KEY CHECK (key IN ('manual','razorpay','stripe')),
  enabled    boolean NOT NULL DEFAULT false,
  config     jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.payment_providers TO authenticated;
GRANT ALL ON public.payment_providers TO service_role;
ALTER TABLE public.payment_providers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "providers read enabled" ON public.payment_providers
  FOR SELECT USING (enabled OR public.is_admin(auth.uid()));

CREATE POLICY "providers admin write" ON public.payment_providers
  FOR ALL USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

INSERT INTO public.payment_providers(key, enabled) VALUES
  ('manual', true), ('razorpay', false), ('stripe', false)
ON CONFLICT (key) DO NOTHING;

-- ---- coin_feature_flags ----
CREATE TABLE IF NOT EXISTS public.coin_feature_flags (
  feature    text PRIMARY KEY,
  enabled    boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.coin_feature_flags TO authenticated, anon;
GRANT ALL ON public.coin_feature_flags TO service_role;
ALTER TABLE public.coin_feature_flags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "flags public read" ON public.coin_feature_flags FOR SELECT USING (true);
CREATE POLICY "flags admin write" ON public.coin_feature_flags FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

INSERT INTO public.coin_feature_flags(feature) VALUES
  ('wallpaper'),('gift'),('game'),('competition'),
  ('username_fx'),('profile_frame'),('bubble'),('emoji'),
  ('room_decor'),('premium_theme')
ON CONFLICT (feature) DO NOTHING;

-- ---- daily rewards ----
CREATE TABLE IF NOT EXISTS public.daily_reward_config (
  day_number int PRIMARY KEY CHECK (day_number >= 1),
  coins      int NOT NULL CHECK (coins > 0),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.daily_reward_config TO authenticated, anon;
GRANT ALL ON public.daily_reward_config TO service_role;
ALTER TABLE public.daily_reward_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "daily_cfg read" ON public.daily_reward_config FOR SELECT USING (true);
CREATE POLICY "daily_cfg admin write" ON public.daily_reward_config FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

INSERT INTO public.daily_reward_config(day_number, coins) VALUES
  (1,10),(2,15),(3,20),(4,25),(5,30),(6,40),(7,100),
  (14,150),(21,200),(30,500)
ON CONFLICT (day_number) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.user_daily_claims (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  claim_date date NOT NULL DEFAULT (now() AT TIME ZONE 'UTC')::date,
  streak     int  NOT NULL DEFAULT 1,
  coins      int  NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, claim_date)
);

GRANT SELECT ON public.user_daily_claims TO authenticated;
GRANT ALL ON public.user_daily_claims TO service_role;
ALTER TABLE public.user_daily_claims ENABLE ROW LEVEL SECURITY;

CREATE POLICY "daily_claims owner read" ON public.user_daily_claims
  FOR SELECT USING (user_id = auth.uid() OR public.is_admin(auth.uid()));

-- ---- subscription_coin_grants ----
CREATE TABLE IF NOT EXISTS public.subscription_coin_grants (
  plan_id       uuid PRIMARY KEY REFERENCES public.subscription_plans(id) ON DELETE CASCADE,
  monthly_coins int NOT NULL DEFAULT 0 CHECK (monthly_coins >= 0),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.subscription_coin_grants TO authenticated, anon;
GRANT ALL ON public.subscription_coin_grants TO service_role;
ALTER TABLE public.subscription_coin_grants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sub_grants read" ON public.subscription_coin_grants FOR SELECT USING (true);
CREATE POLICY "sub_grants admin write" ON public.subscription_coin_grants FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- =========================================================
-- wallet_apply: the ONLY function that mutates coin balance
-- =========================================================
CREATE OR REPLACE FUNCTION public.wallet_apply(
  _user       uuid,
  _amount     int,
  _direction  text,      -- 'credit' | 'debit'
  _kind       text,      -- purchase|reward|competition|gift_in|gift_out|wallpaper|premium_theme|game_reward|admin_bonus|refund|transfer_in|transfer_out|daily_login|streak_bonus|subscription_grant|spend_other
  _status     text DEFAULT 'completed',
  _provider   text DEFAULT 'system',
  _reference  text DEFAULT NULL,
  _metadata   jsonb DEFAULT '{}'::jsonb,
  _bonus_portion int DEFAULT 0    -- of _amount, how much is bonus vs purchased (for credits)
) RETURNS public.coin_transactions
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  frozen boolean;
  bal    int;
  delta  int;
  tx     public.coin_transactions;
BEGIN
  IF _user IS NULL THEN RAISE EXCEPTION 'user required'; END IF;
  IF _amount IS NULL OR _amount <= 0 THEN RAISE EXCEPTION 'amount must be positive'; END IF;
  IF _direction NOT IN ('credit','debit') THEN RAISE EXCEPTION 'invalid direction'; END IF;

  -- Dedupe by (provider, reference) — prevents replayed webhooks
  IF _reference IS NOT NULL THEN
    SELECT * INTO tx FROM public.coin_transactions
     WHERE provider = _provider AND reference_id = _reference
     LIMIT 1;
    IF FOUND THEN RETURN tx; END IF;
  END IF;

  SELECT coins, wallet_frozen INTO bal, frozen
    FROM public.profiles WHERE id = _user FOR UPDATE;
  IF bal IS NULL THEN RAISE EXCEPTION 'profile not found'; END IF;
  IF frozen THEN RAISE EXCEPTION 'wallet is frozen'; END IF;

  delta := CASE WHEN _direction = 'credit' THEN _amount ELSE -_amount END;

  IF bal + delta < 0 THEN
    RAISE EXCEPTION 'insufficient coins (have %, need %)', bal, _amount;
  END IF;

  IF _status = 'completed' THEN
    UPDATE public.profiles
       SET coins = coins + delta,
           coins_lifetime_earned = coins_lifetime_earned + GREATEST(delta,0),
           coins_lifetime_spent  = coins_lifetime_spent  + GREATEST(-delta,0),
           coins_purchased_total = coins_purchased_total + CASE WHEN _kind = 'purchase' THEN GREATEST(_amount - COALESCE(_bonus_portion,0),0) ELSE 0 END,
           coins_bonus_total     = coins_bonus_total     + CASE WHEN _direction = 'credit' AND _kind IN ('purchase','subscription_grant','daily_login','streak_bonus','admin_bonus','reward','game_reward') THEN COALESCE(_bonus_portion,0) ELSE 0 END
     WHERE id = _user;
  END IF;

  INSERT INTO public.coin_transactions(
    user_id, kind, amount, reason, ref_type, ref_id,
    wallet_kind, direction, status, provider, reference_id, metadata
  ) VALUES (
    _user, 'coins', delta, _kind, _kind, NULL,
    _kind, _direction, _status, _provider, _reference, COALESCE(_metadata,'{}'::jsonb)
  ) RETURNING * INTO tx;

  RETURN tx;
END;
$$;

REVOKE ALL ON FUNCTION public.wallet_apply(uuid,int,text,text,text,text,text,jsonb,int) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.wallet_apply(uuid,int,text,text,text,text,text,jsonb,int) TO authenticated, service_role;

-- =========================================================
-- claim_daily_reward
-- =========================================================
CREATE OR REPLACE FUNCTION public.claim_daily_reward()
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  today date := (now() AT TIME ZONE 'UTC')::date;
  last  public.user_daily_claims;
  new_streak int;
  reward int;
  ref text;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'not signed in'; END IF;

  SELECT * INTO last FROM public.user_daily_claims
   WHERE user_id = uid ORDER BY claim_date DESC LIMIT 1;

  IF FOUND AND last.claim_date = today THEN
    RAISE EXCEPTION 'already claimed today';
  END IF;

  IF FOUND AND last.claim_date = today - 1 THEN
    new_streak := last.streak + 1;
  ELSE
    new_streak := 1;
  END IF;

  SELECT coins INTO reward FROM public.daily_reward_config
   WHERE day_number <= new_streak ORDER BY day_number DESC LIMIT 1;
  IF reward IS NULL THEN reward := 10; END IF;

  ref := 'daily:' || uid::text || ':' || today::text;

  PERFORM public.wallet_apply(
    uid, reward, 'credit',
    CASE WHEN new_streak > 1 THEN 'streak_bonus' ELSE 'daily_login' END,
    'completed','system', ref,
    jsonb_build_object('streak', new_streak, 'date', today),
    reward
  );

  INSERT INTO public.user_daily_claims(user_id, claim_date, streak, coins)
  VALUES (uid, today, new_streak, reward);

  RETURN jsonb_build_object('coins', reward, 'streak', new_streak, 'date', today);
END;
$$;

REVOKE ALL ON FUNCTION public.claim_daily_reward() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.claim_daily_reward() TO authenticated;

-- =========================================================
-- Purchase coins: manual + provider stub
-- =========================================================
CREATE OR REPLACE FUNCTION public.create_coin_order(
  _package_id uuid,
  _provider   text
) RETURNS public.coin_payment_orders
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  pkg public.coin_packages;
  enabled boolean;
  order_row public.coin_payment_orders;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'not signed in'; END IF;
  IF _provider NOT IN ('manual','razorpay','stripe') THEN RAISE EXCEPTION 'invalid provider'; END IF;

  SELECT p.enabled INTO enabled FROM public.payment_providers p WHERE p.key = _provider;
  IF NOT COALESCE(enabled,false) THEN RAISE EXCEPTION 'provider disabled'; END IF;

  SELECT * INTO pkg FROM public.coin_packages WHERE id = _package_id AND is_active;
  IF NOT FOUND THEN RAISE EXCEPTION 'package not available'; END IF;

  INSERT INTO public.coin_payment_orders(
    user_id, package_id, provider, amount, currency, coins, bonus_coins, status
  ) VALUES (
    uid, pkg.id, _provider,
    CASE WHEN _provider = 'stripe' THEN COALESCE(pkg.price_usd_cents, pkg.price_inr * 100) ELSE COALESCE(pkg.price_inr, 0) END,
    CASE WHEN _provider = 'stripe' THEN 'USD' ELSE pkg.currency END,
    pkg.coins, pkg.bonus_coins,
    CASE WHEN _provider = 'manual' THEN 'awaiting_review' ELSE 'created' END
  ) RETURNING * INTO order_row;

  RETURN order_row;
END;
$$;

REVOKE ALL ON FUNCTION public.create_coin_order(uuid,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_coin_order(uuid,text) TO authenticated;

-- =========================================================
-- Admin approve/reject manual + provider webhook credit
-- =========================================================
CREATE OR REPLACE FUNCTION public.admin_approve_coin_order(_order_id uuid, _payment_ref text DEFAULT NULL)
RETURNS public.coin_payment_orders
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  o public.coin_payment_orders;
  ref text;
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN RAISE EXCEPTION 'forbidden'; END IF;

  SELECT * INTO o FROM public.coin_payment_orders WHERE id = _order_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'order not found'; END IF;
  IF o.status = 'paid' THEN RETURN o; END IF;

  ref := COALESCE(_payment_ref, 'order:' || o.id::text);

  PERFORM public.wallet_apply(
    o.user_id, o.coins + o.bonus_coins, 'credit', 'purchase',
    'completed', o.provider, ref,
    jsonb_build_object('order_id', o.id, 'package_id', o.package_id),
    o.bonus_coins
  );

  UPDATE public.coin_payment_orders
     SET status = 'paid', provider_payment_id = COALESCE(provider_payment_id, _payment_ref)
   WHERE id = _order_id
   RETURNING * INTO o;

  RETURN o;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_approve_coin_order(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_approve_coin_order(uuid, text) TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_reject_coin_order(_order_id uuid, _note text DEFAULT NULL)
RETURNS public.coin_payment_orders
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE o public.coin_payment_orders;
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN RAISE EXCEPTION 'forbidden'; END IF;
  UPDATE public.coin_payment_orders
     SET status = 'failed', admin_note = COALESCE(_note, admin_note)
   WHERE id = _order_id RETURNING * INTO o;
  RETURN o;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_reject_coin_order(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_reject_coin_order(uuid, text) TO authenticated;

-- =========================================================
-- Admin wallet operations
-- =========================================================
CREATE OR REPLACE FUNCTION public.admin_adjust_coins(
  _user uuid, _amount int, _direction text, _reason text DEFAULT 'admin_bonus'
) RETURNS public.coin_transactions
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN RAISE EXCEPTION 'forbidden'; END IF;
  RETURN public.wallet_apply(
    _user, _amount, _direction,
    CASE WHEN _direction = 'credit' THEN 'admin_bonus' ELSE 'refund' END,
    'completed', 'system',
    'admin:' || gen_random_uuid()::text,
    jsonb_build_object('by', auth.uid(), 'note', _reason),
    _amount
  );
END;
$$;

REVOKE ALL ON FUNCTION public.admin_adjust_coins(uuid,int,text,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_adjust_coins(uuid,int,text,text) TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_set_wallet_frozen(_user uuid, _frozen boolean)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN RAISE EXCEPTION 'forbidden'; END IF;
  UPDATE public.profiles SET wallet_frozen = _frozen WHERE id = _user;
  RETURN _frozen;
END;
$$;
REVOKE ALL ON FUNCTION public.admin_set_wallet_frozen(uuid, boolean) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_set_wallet_frozen(uuid, boolean) TO authenticated;

-- =========================================================
-- Refactor purchase_dm_wallpaper → route through wallet_apply
-- =========================================================
CREATE OR REPLACE FUNCTION public.purchase_dm_wallpaper(_wallpaper_key text, _purchase_type text, _channel_id text DEFAULT NULL::text)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  wp public.dm_wallpapers;
  already_owned boolean;
  spent int := 0;
  notice text;
  flag_enabled boolean;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Not signed in'; END IF;
  IF _purchase_type NOT IN ('self','shared') THEN RAISE EXCEPTION 'Invalid purchase type'; END IF;

  SELECT enabled INTO flag_enabled FROM public.coin_feature_flags WHERE feature = 'wallpaper';
  IF NOT COALESCE(flag_enabled, true) THEN RAISE EXCEPTION 'wallpapers disabled'; END IF;

  IF _purchase_type = 'shared' THEN
    IF _channel_id IS NULL OR _channel_id NOT LIKE 'dm:%' OR position(uid::text in _channel_id) = 0 THEN
      RAISE EXCEPTION 'Shared theme requires a DM channel you belong to';
    END IF;
  END IF;

  SELECT * INTO wp FROM public.dm_wallpapers WHERE wallpaper_key = _wallpaper_key AND enabled;
  IF NOT FOUND THEN RAISE EXCEPTION 'Wallpaper not available'; END IF;

  SELECT EXISTS(SELECT 1 FROM public.user_dm_wallpapers WHERE user_id = uid AND wallpaper_key = _wallpaper_key)
    INTO already_owned;

  IF wp.price_coins > 0 AND NOT already_owned THEN
    PERFORM public.wallet_apply(
      uid, wp.price_coins, 'debit', 'wallpaper',
      'completed','system',
      'wallpaper:' || uid::text || ':' || wp.wallpaper_key || ':' || gen_random_uuid()::text,
      jsonb_build_object('wallpaper_key', wp.wallpaper_key, 'channel', _channel_id)
    );
    spent := wp.price_coins;
  END IF;

  IF NOT already_owned THEN
    INSERT INTO public.user_dm_wallpapers (user_id, wallpaper_key, source)
    VALUES (uid, _wallpaper_key, CASE WHEN wp.price_coins = 0 THEN 'free' ELSE 'purchase' END)
    ON CONFLICT (user_id, wallpaper_key) DO NOTHING;
  END IF;

  INSERT INTO public.dm_wallpaper_purchases (user_id, wallpaper_key, coins_spent, purchase_type, dm_channel_id)
  VALUES (uid, _wallpaper_key, spent, _purchase_type, _channel_id);

  IF _purchase_type = 'shared' THEN
    INSERT INTO public.dm_shared_themes (channel_id, wallpaper_key, applied_by, updated_at)
    VALUES (_channel_id, _wallpaper_key, uid, now())
    ON CONFLICT (channel_id) DO UPDATE
      SET wallpaper_key = EXCLUDED.wallpaper_key,
          applied_by    = EXCLUDED.applied_by,
          updated_at    = now();

    notice := '🎨 ' || COALESCE((SELECT username FROM public.profiles WHERE id = uid), 'Someone')
              || ' applied the "' || wp.name || '" conversation theme.';
    INSERT INTO public.messages (channel_id, author_id, text, created_at)
    VALUES (_channel_id, uid, notice, now());
  END IF;

  RETURN jsonb_build_object('ok', true, 'already_owned', already_owned, 'coins_spent', spent, 'wallpaper_key', _wallpaper_key);
END;
$$;

-- =========================================================
-- Seed default coin packages
-- =========================================================
INSERT INTO public.coin_packages (name, coins, bonus_coins, price_inr, price_usd_cents, sort_order, badge)
VALUES
  ('Starter',   100,   0,   49,   99, 1, NULL),
  ('Basic',     250,  25,   99,  199, 2, NULL),
  ('Popular',   600, 100,  199,  399, 3, 'Popular'),
  ('Value',    1500, 300,  399,  799, 4, 'Best value'),
  ('Mega',     5000,1200,  999, 1999, 5, 'Biggest bonus')
ON CONFLICT DO NOTHING;
