
CREATE OR REPLACE FUNCTION public.prevent_privileged_profile_field_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_admin_user boolean := false;
BEGIN
  -- Allow service_role and postgres to bypass
  IF current_setting('role', true) IN ('service_role','postgres') THEN
    RETURN NEW;
  END IF;

  -- Check if caller has admin role (best-effort)
  BEGIN
    is_admin_user := public.has_role(auth.uid(), 'admin'::app_role);
  EXCEPTION WHEN OTHERS THEN
    is_admin_user := false;
  END;

  IF is_admin_user THEN
    RETURN NEW;
  END IF;

  IF NEW.is_verified IS DISTINCT FROM OLD.is_verified
     OR NEW.is_official IS DISTINCT FROM OLD.is_official
     OR NEW.wallet_frozen IS DISTINCT FROM OLD.wallet_frozen
     OR NEW.profile_views_unlocked_full IS DISTINCT FROM OLD.profile_views_unlocked_full
     OR NEW.coins_purchased_total IS DISTINCT FROM OLD.coins_purchased_total
     OR NEW.coins_bonus_total IS DISTINCT FROM OLD.coins_bonus_total
     OR NEW.coins_lifetime_earned IS DISTINCT FROM OLD.coins_lifetime_earned
     OR NEW.coins_lifetime_spent IS DISTINCT FROM OLD.coins_lifetime_spent
  THEN
    RAISE EXCEPTION 'Modification of privileged profile fields is not allowed';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS prevent_privileged_profile_field_changes_trg ON public.profiles;
CREATE TRIGGER prevent_privileged_profile_field_changes_trg
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.prevent_privileged_profile_field_changes();
