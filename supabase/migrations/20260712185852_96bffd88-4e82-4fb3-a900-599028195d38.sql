-- Allow wallet_apply (SECURITY DEFINER) to update protected coin columns on profiles.
-- Trigger currently blocks all authenticated callers, which breaks paid chat-theme unlocks.

CREATE OR REPLACE FUNCTION public.wallet_apply(
  _user uuid, _amount integer, _direction text, _kind text,
  _status text DEFAULT 'completed', _provider text DEFAULT 'system',
  _reference text DEFAULT NULL, _metadata jsonb DEFAULT '{}'::jsonb,
  _bonus_portion integer DEFAULT 0
)
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

  -- Mark this transaction as trusted so profile protection triggers allow the update.
  PERFORM set_config('app.wallet_apply', '1', true);

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

CREATE OR REPLACE FUNCTION public.protect_profile_sensitive_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  is_privileged boolean := false;
BEGIN
  -- Trusted server code paths bypass this check.
  IF auth.uid() IS NULL
     OR current_setting('request.jwt.claim.role', true) = 'service_role'
     OR current_setting('app.wallet_apply', true) = '1' THEN
    RETURN NEW;
  END IF;

  BEGIN
    IF public.has_role(auth.uid(), 'admin'::app_role)
       OR public.has_role(auth.uid(), 'moderator'::app_role) THEN
      is_privileged := true;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    is_privileged := false;
  END;

  IF is_privileged THEN
    RETURN NEW;
  END IF;

  IF NEW.xp IS DISTINCT FROM OLD.xp
     OR NEW.coins IS DISTINCT FROM OLD.coins
     OR NEW.level IS DISTINCT FROM OLD.level
     OR NEW.streak IS DISTINCT FROM OLD.streak
     OR NEW.longest_streak IS DISTINCT FROM OLD.longest_streak
     OR NEW.is_verified IS DISTINCT FROM OLD.is_verified
     OR NEW.is_official IS DISTINCT FROM OLD.is_official
     OR NEW.is_bot IS DISTINCT FROM OLD.is_bot
     OR NEW.wallet_frozen IS DISTINCT FROM OLD.wallet_frozen
     OR NEW.coins_lifetime_earned IS DISTINCT FROM OLD.coins_lifetime_earned
     OR NEW.coins_lifetime_spent IS DISTINCT FROM OLD.coins_lifetime_spent
     OR NEW.coins_purchased_total IS DISTINCT FROM OLD.coins_purchased_total
     OR NEW.coins_bonus_total IS DISTINCT FROM OLD.coins_bonus_total
  THEN
    RAISE EXCEPTION 'Modification of protected profile fields is not allowed'
      USING ERRCODE = '42501';
  END IF;

  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.prevent_gamification_field_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF current_setting('request.jwt.claim.role', true) = 'service_role'
     OR auth.role() = 'service_role'
     OR current_user IN ('postgres', 'supabase_admin')
     OR current_setting('app.wallet_apply', true) = '1' THEN
    RETURN NEW;
  END IF;

  IF NEW.xp IS DISTINCT FROM OLD.xp
     OR NEW.coins IS DISTINCT FROM OLD.coins
     OR NEW.level IS DISTINCT FROM OLD.level
     OR NEW.streak IS DISTINCT FROM OLD.streak
     OR NEW.longest_streak IS DISTINCT FROM OLD.longest_streak
     OR NEW.is_verified IS DISTINCT FROM OLD.is_verified
     OR NEW.is_official IS DISTINCT FROM OLD.is_official
     OR NEW.is_bot IS DISTINCT FROM OLD.is_bot
     OR NEW.wallet_frozen IS DISTINCT FROM OLD.wallet_frozen
     OR NEW.coins_bonus_total IS DISTINCT FROM OLD.coins_bonus_total
     OR NEW.coins_purchased_total IS DISTINCT FROM OLD.coins_purchased_total
     OR NEW.coins_lifetime_earned IS DISTINCT FROM OLD.coins_lifetime_earned
     OR NEW.coins_lifetime_spent IS DISTINCT FROM OLD.coins_lifetime_spent THEN
    RAISE EXCEPTION 'Protected profile fields can only be modified by trusted server code';
  END IF;

  RETURN NEW;
END;
$function$;