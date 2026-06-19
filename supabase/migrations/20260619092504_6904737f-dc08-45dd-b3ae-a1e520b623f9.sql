
-- Fix coin_transactions column names in RPCs: target_type/target_id -> ref_type/ref_id

CREATE OR REPLACE FUNCTION public.unlock_chat_theme(_theme_key text)
RETURNS user_chat_themes
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  uid uuid := auth.uid();
  t public.chat_themes;
  bal int;
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

  SELECT coins INTO bal FROM public.profiles WHERE id = uid FOR UPDATE;
  IF bal IS NULL THEN RAISE EXCEPTION 'Profile not found'; END IF;
  IF bal < t.price_coins THEN
    RAISE EXCEPTION 'Not enough coins (need %, have %)', t.price_coins, bal;
  END IF;

  UPDATE public.profiles SET coins = coins - t.price_coins WHERE id = uid;

  INSERT INTO public.coin_transactions (user_id, kind, amount, reason, ref_type, ref_id)
  VALUES (uid, 'coins', -t.price_coins, 'chat_theme_unlock:' || t.theme_key, 'chat_theme', NULL);

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

CREATE OR REPLACE FUNCTION public.unlock_feed_theme(_theme_key text)
RETURNS user_feed_themes
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  uid uuid := auth.uid();
  t public.feed_themes;
  bal int;
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

  SELECT coins INTO bal FROM public.profiles WHERE id = uid FOR UPDATE;
  IF bal IS NULL THEN RAISE EXCEPTION 'Profile not found'; END IF;
  IF bal < t.price_coins THEN
    RAISE EXCEPTION 'Not enough coins (need %, have %)', t.price_coins, bal;
  END IF;

  UPDATE public.profiles SET coins = coins - t.price_coins WHERE id = uid;

  INSERT INTO public.coin_transactions (user_id, kind, amount, reason, ref_type, ref_id)
  VALUES (uid, 'coins', -t.price_coins, 'feed_theme_unlock:' || t.theme_key, 'feed_theme', NULL);

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

CREATE OR REPLACE FUNCTION public.create_trio_room(_name text, _password text DEFAULT NULL::text, _hidden boolean DEFAULT false)
RETURNS trio_rooms
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  uid uuid := auth.uid();
  cost int := 100;
  bal int;
  new_room public.trio_rooms;
  clean_name text;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Not signed in'; END IF;

  clean_name := LEFT(COALESCE(TRIM(_name), ''), 60);
  IF clean_name = '' THEN RAISE EXCEPTION 'Room name required'; END IF;

  SELECT coins INTO bal FROM public.profiles WHERE id = uid FOR UPDATE;
  IF bal IS NULL THEN RAISE EXCEPTION 'Profile not found'; END IF;
  IF bal < cost THEN
    RAISE EXCEPTION 'Not enough coins (need %, have %)', cost, bal;
  END IF;

  UPDATE public.profiles SET coins = coins - cost WHERE id = uid;

  INSERT INTO public.coin_transactions (user_id, kind, amount, reason, ref_type, ref_id)
  VALUES (uid, 'coins', -cost, 'trio_create_room', 'trio_room', NULL);

  INSERT INTO public.trio_rooms (name, password, hidden, owner_id)
  VALUES (clean_name, NULLIF(TRIM(COALESCE(_password,'')), ''), COALESCE(_hidden,false), uid)
  RETURNING * INTO new_room;

  INSERT INTO public.trio_room_members (room_id, user_id, status, invited_by, joined_at)
  VALUES (new_room.id, uid, 'accepted', uid, now());

  RETURN new_room;
END;
$function$;

CREATE OR REPLACE FUNCTION public.accept_trio_invite(_room uuid, _password text DEFAULT NULL::text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  uid uuid := auth.uid();
  cost int := 50;
  bal int;
  r public.trio_rooms;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Not signed in'; END IF;

  SELECT * INTO r FROM public.trio_rooms WHERE id = _room;
  IF NOT FOUND OR r.closed_at IS NOT NULL THEN
    RAISE EXCEPTION 'Room not available';
  END IF;
  IF r.password IS NOT NULL AND r.password <> '' AND COALESCE(_password,'') <> r.password THEN
    RAISE EXCEPTION 'Wrong password';
  END IF;

  PERFORM 1 FROM public.trio_room_members
   WHERE room_id = _room AND user_id = uid AND status = 'invited';
  IF NOT FOUND THEN
    RAISE EXCEPTION 'No pending invitation';
  END IF;

  SELECT coins INTO bal FROM public.profiles WHERE id = uid FOR UPDATE;
  IF bal IS NULL THEN RAISE EXCEPTION 'Profile not found'; END IF;
  IF bal < cost THEN
    RAISE EXCEPTION 'Not enough coins (need %, have %)', cost, bal;
  END IF;

  UPDATE public.profiles SET coins = coins - cost WHERE id = uid;

  INSERT INTO public.coin_transactions (user_id, kind, amount, reason, ref_type, ref_id)
  VALUES (uid, 'coins', -cost, 'trio_join_room', 'trio_room', _room);

  UPDATE public.trio_room_members
     SET status = 'accepted', joined_at = now()
   WHERE room_id = _room AND user_id = uid AND status = 'invited';
END;
$function$;
