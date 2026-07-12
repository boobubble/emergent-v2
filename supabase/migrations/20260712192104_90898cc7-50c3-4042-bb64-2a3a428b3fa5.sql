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
     OR NEW.profile_views_unlocked_full IS DISTINCT FROM OLD.profile_views_unlocked_full
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