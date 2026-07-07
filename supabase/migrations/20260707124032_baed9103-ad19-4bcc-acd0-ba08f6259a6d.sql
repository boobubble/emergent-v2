-- 1) Extend prevent_gamification_field_changes trigger to protect trust/financial fields
CREATE OR REPLACE FUNCTION public.prevent_gamification_field_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF current_setting('request.jwt.claim.role', true) = 'service_role' THEN
    RETURN NEW;
  END IF;
  IF auth.role() = 'service_role' THEN
    RETURN NEW;
  END IF;
  IF current_user IN ('postgres', 'supabase_admin') THEN
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
$$;

-- 2) Set fixed search_path on gam_period_key
ALTER FUNCTION public.gam_period_key(text, timestamptz) SET search_path = public;