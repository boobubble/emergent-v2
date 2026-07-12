CREATE OR REPLACE FUNCTION public.wallet_apply(_user uuid, _amount integer, _direction text, _kind text, _status text DEFAULT 'completed'::text, _provider text DEFAULT 'system'::text, _reference text DEFAULT NULL::text, _metadata jsonb DEFAULT '{}'::jsonb, _bonus_portion integer DEFAULT 0)
 RETURNS coin_transactions
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  frozen boolean;
  bal    int;
  delta  int;
  tx     public.coin_transactions;
  _feature text;
  flag_enabled boolean;
BEGIN
  IF _user IS NULL THEN RAISE EXCEPTION 'user required'; END IF;
  IF _amount IS NULL OR _amount <= 0 THEN RAISE EXCEPTION 'amount must be positive'; END IF;
  IF _direction NOT IN ('credit','debit') THEN RAISE EXCEPTION 'invalid direction'; END IF;

  IF _direction = 'debit' THEN
    _feature := CASE _kind
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
    IF _feature IS NOT NULL THEN
      SELECT cff.enabled INTO flag_enabled FROM public.coin_feature_flags cff WHERE cff.feature = _feature;
      IF flag_enabled IS NOT NULL AND flag_enabled = false THEN
        RAISE EXCEPTION 'feature % is currently disabled', _feature;
      END IF;
    END IF;
  END IF;

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