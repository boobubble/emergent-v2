
-- ============================================================
-- Wallet-First Architecture: centralize all coin mutations
-- ============================================================

-- 1. wallet_apply with centralized feature-flag gating
CREATE OR REPLACE FUNCTION public.wallet_apply(
  _user uuid,
  _amount integer,
  _direction text,
  _kind text,
  _status text DEFAULT 'completed',
  _provider text DEFAULT 'system',
  _reference text DEFAULT NULL,
  _metadata jsonb DEFAULT '{}'::jsonb,
  _bonus_portion integer DEFAULT 0
)
RETURNS public.coin_transactions
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  frozen boolean;
  bal    int;
  delta  int;
  tx     public.coin_transactions;
  feature text;
  flag_enabled boolean;
BEGIN
  IF _user IS NULL THEN RAISE EXCEPTION 'user required'; END IF;
  IF _amount IS NULL OR _amount <= 0 THEN RAISE EXCEPTION 'amount must be positive'; END IF;
  IF _direction NOT IN ('credit','debit') THEN RAISE EXCEPTION 'invalid direction'; END IF;

  -- Feature-flag gate (debits only). Missing rows default to enabled.
  IF _direction = 'debit' THEN
    feature := CASE _kind
      WHEN 'wallpaper'          THEN 'wallpaper'
      WHEN 'premium_theme'      THEN 'premium_theme'
      WHEN 'frame'              THEN 'frame'
      WHEN 'gift'               THEN 'gift'
      WHEN 'bubble'             THEN 'bubble'
      WHEN 'username_effect'    THEN 'username_effect'
      WHEN 'competition_entry'  THEN 'competitions'
      WHEN 'trio_create_room'   THEN 'trio_rooms'
      WHEN 'trio_join_room'     THEN 'trio_rooms'
      WHEN 'profile_unlock'     THEN 'profile_unlock'
      WHEN 'fish_reward'        THEN 'games'
      WHEN 'dig_reward'         THEN 'games'
      WHEN 'wine_reward'        THEN 'games'
      WHEN 'game_reward'        THEN 'games'
      ELSE NULL
    END;
    IF feature IS NOT NULL THEN
      SELECT enabled INTO flag_enabled FROM public.coin_feature_flags WHERE public.coin_feature_flags.feature = feature;
      IF flag_enabled IS NOT NULL AND flag_enabled = false THEN
        RAISE EXCEPTION 'feature % is currently disabled', feature;
      END IF;
    END IF;
  END IF;

  -- Dedupe by (provider, reference) — prevents replayed webhooks / double-clicks
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
$function$;

-- 2. Seed feature flags for all gated kinds (idempotent, default enabled)
INSERT INTO public.coin_feature_flags (feature, enabled)
VALUES
  ('wallpaper', true),
  ('premium_theme', true),
  ('frame', true),
  ('gift', true),
  ('bubble', true),
  ('username_effect', true),
  ('competitions', true),
  ('trio_rooms', true),
  ('profile_unlock', true),
  ('games', true)
ON CONFLICT (feature) DO NOTHING;

-- 3. Migrate coin-spending RPCs to delegate to wallet_apply
-- ------------------------------------------------------------

-- create_trio_room: spend 100 coins
CREATE OR REPLACE FUNCTION public.create_trio_room(_name text, _password text DEFAULT NULL::text, _hidden boolean DEFAULT false)
RETURNS public.trio_rooms
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  uid uuid := auth.uid();
  cost int := 100;
  new_room public.trio_rooms;
  clean_name text;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Not signed in'; END IF;

  clean_name := LEFT(COALESCE(TRIM(_name), ''), 60);
  IF clean_name = '' THEN RAISE EXCEPTION 'Room name required'; END IF;

  INSERT INTO public.trio_rooms (name, password, hidden, owner_id)
  VALUES (clean_name, NULLIF(TRIM(COALESCE(_password,'')), ''), COALESCE(_hidden,false), uid)
  RETURNING * INTO new_room;

  PERFORM public.wallet_apply(
    uid, cost, 'debit', 'trio_create_room',
    'completed', 'system',
    'trio_create:' || new_room.id::text,
    jsonb_build_object('room_id', new_room.id, 'name', clean_name)
  );

  INSERT INTO public.trio_room_members (room_id, user_id, status, invited_by, joined_at)
  VALUES (new_room.id, uid, 'accepted', uid, now());

  RETURN new_room;
END;
$function$;

-- accept_trio_invite: spend 50 coins
CREATE OR REPLACE FUNCTION public.accept_trio_invite(_room uuid, _password text DEFAULT NULL::text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  uid uuid := auth.uid();
  cost int := 50;
  r public.trio_rooms;
  mem public.trio_room_members;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Not signed in'; END IF;

  SELECT * INTO r FROM public.trio_rooms WHERE id = _room;
  IF NOT FOUND OR r.closed_at IS NOT NULL THEN
    RAISE EXCEPTION 'Room not available';
  END IF;
  IF r.password IS NOT NULL AND r.password <> '' AND COALESCE(_password,'') <> r.password THEN
    RAISE EXCEPTION 'Wrong password';
  END IF;

  SELECT * INTO mem FROM public.trio_room_members
   WHERE room_id = _room AND user_id = uid AND status = 'invited';
  IF NOT FOUND THEN
    RAISE EXCEPTION 'No pending invitation';
  END IF;

  IF mem.expires_at IS NOT NULL AND mem.expires_at <= now() THEN
    RAISE EXCEPTION 'Invitation expired';
  END IF;

  PERFORM public.wallet_apply(
    uid, cost, 'debit', 'trio_join_room',
    'completed', 'system',
    'trio_join:' || _room::text || ':' || uid::text,
    jsonb_build_object('room_id', _room)
  );

  UPDATE public.trio_room_members
     SET status = 'accepted', joined_at = now(), expires_at = NULL
   WHERE room_id = _room AND user_id = uid AND status = 'invited';
END;
$function$;

-- unlock_chat_theme
CREATE OR REPLACE FUNCTION public.unlock_chat_theme(_theme_key text)
RETURNS public.user_chat_themes
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  uid uuid := auth.uid();
  t public.chat_themes;
  exp timestamptz;
  result public.user_chat_themes;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Not signed in'; END IF;

  SELECT * INTO t FROM public.chat_themes WHERE theme_key = _theme_key AND enabled;
  IF NOT FOUND THEN RAISE EXCEPTION 'Theme not available'; END IF;

  IF t.is_default OR t.price_coins = 0 THEN
    INSERT INTO public.user_chat_themes (user_id, theme_key, source)
    VALUES (uid, t.theme_key, 'free')
    ON CONFLICT (user_id, theme_key) DO UPDATE SET expires_at = NULL
    RETURNING * INTO result;
    RETURN result;
  END IF;

  SELECT * INTO result FROM public.user_chat_themes
   WHERE user_id = uid AND theme_key = t.theme_key
     AND (expires_at IS NULL OR expires_at > now());
  IF FOUND THEN RETURN result; END IF;

  PERFORM public.wallet_apply(
    uid, t.price_coins, 'debit', 'premium_theme',
    'completed', 'system',
    'chat_theme:' || uid::text || ':' || t.theme_key,
    jsonb_build_object('theme_key', t.theme_key, 'surface', 'chat')
  );

  exp := CASE t.unlock_mode
    WHEN 'days_30' THEN now() + interval '30 days'
    WHEN 'days_7'  THEN now() +  interval '7 days'
    ELSE NULL
  END;

  INSERT INTO public.user_chat_themes (user_id, theme_key, expires_at, source)
  VALUES (uid, t.theme_key, exp, 'purchase')
  ON CONFLICT (user_id, theme_key) DO UPDATE
    SET expires_at = EXCLUDED.expires_at, unlocked_at = now(), source = 'purchase'
  RETURNING * INTO result;

  RETURN result;
END;
$function$;

-- unlock_feed_theme
CREATE OR REPLACE FUNCTION public.unlock_feed_theme(_theme_key text)
RETURNS public.user_feed_themes
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  uid uuid := auth.uid();
  t public.feed_themes;
  exp timestamptz;
  result public.user_feed_themes;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Not signed in'; END IF;

  SELECT * INTO t FROM public.feed_themes WHERE theme_key = _theme_key AND enabled;
  IF NOT FOUND THEN RAISE EXCEPTION 'Theme not available'; END IF;

  IF t.is_default OR t.price_coins = 0 THEN
    INSERT INTO public.user_feed_themes (user_id, theme_key, source)
    VALUES (uid, t.theme_key, 'free')
    ON CONFLICT (user_id, theme_key) DO UPDATE SET expires_at = NULL
    RETURNING * INTO result;
    RETURN result;
  END IF;

  SELECT * INTO result FROM public.user_feed_themes
   WHERE user_id = uid AND theme_key = t.theme_key
     AND (expires_at IS NULL OR expires_at > now());
  IF FOUND THEN RETURN result; END IF;

  PERFORM public.wallet_apply(
    uid, t.price_coins, 'debit', 'premium_theme',
    'completed', 'system',
    'feed_theme:' || uid::text || ':' || t.theme_key,
    jsonb_build_object('theme_key', t.theme_key, 'surface', 'feed')
  );

  exp := CASE t.unlock_mode
    WHEN 'days_30' THEN now() + interval '30 days'
    WHEN 'days_7'  THEN now() +  interval '7 days'
    ELSE NULL
  END;

  INSERT INTO public.user_feed_themes (user_id, theme_key, expires_at, source)
  VALUES (uid, t.theme_key, exp, 'purchase')
  ON CONFLICT (user_id, theme_key) DO UPDATE
    SET expires_at = EXCLUDED.expires_at, unlocked_at = now(), source = 'purchase'
  RETURNING * INTO result;

  RETURN result;
END;
$function$;

-- unlock_profile_visitor_history: spend 300 coins
CREATE OR REPLACE FUNCTION public.unlock_profile_visitor_history()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  uid uuid := auth.uid();
  cost int := 300;
  already boolean;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Not signed in'; END IF;
  SELECT profile_views_unlocked_full INTO already
    FROM public.profiles WHERE id = uid;
  IF already THEN RETURN true; END IF;

  PERFORM public.wallet_apply(
    uid, cost, 'debit', 'profile_unlock',
    'completed', 'system',
    'profile_visitors:' || uid::text,
    jsonb_build_object('feature', 'visitor_history')
  );

  UPDATE public.profiles
    SET profile_views_unlocked_full = true
    WHERE id = uid;

  RETURN true;
END;
$function$;
