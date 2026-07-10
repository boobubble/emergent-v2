
-- Replace insecure self-referencing WITH CHECK subqueries on profiles UPDATE policy
-- with a BEFORE UPDATE trigger that blocks protected-field changes for non-privileged callers.

CREATE OR REPLACE FUNCTION public.protect_profile_sensitive_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_privileged boolean := false;
BEGIN
  -- service_role bypass, and no auth context (server-side) bypass
  IF auth.uid() IS NULL OR current_setting('request.jwt.claim.role', true) = 'service_role' THEN
    RETURN NEW;
  END IF;

  -- Admin / moderator bypass via existing role helper
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

  -- Reject any change to protected fields from ordinary authenticated callers.
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
$$;

DROP TRIGGER IF EXISTS protect_profile_sensitive_fields_trg ON public.profiles;
CREATE TRIGGER protect_profile_sensitive_fields_trg
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.protect_profile_sensitive_fields();

-- Simplify the UPDATE policy: no more self-referencing subqueries.
DROP POLICY IF EXISTS "Users can update own profile display fields" ON public.profiles;
CREATE POLICY "Users can update own profile display fields"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);
