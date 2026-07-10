
-- Drop insecure self-referencing UPDATE policy
DROP POLICY IF EXISTS "Users cancel own subscription" ON public.user_subscriptions;

-- Trigger to protect sensitive fields from user updates
CREATE OR REPLACE FUNCTION public.protect_user_subscription_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_privileged boolean;
BEGIN
  -- Allow service_role, no-auth (definer/webhook), or admin/moderator
  IF auth.uid() IS NULL
     OR current_setting('role', true) = 'service_role'
     OR public.has_role(auth.uid(), 'admin')
     OR public.has_role(auth.uid(), 'super_admin')
  THEN
    RETURN NEW;
  END IF;

  -- Immutable for regular users
  IF NEW.user_id IS DISTINCT FROM OLD.user_id THEN
    RAISE EXCEPTION 'Not allowed to change user_id';
  END IF;
  IF NEW.plan_id IS DISTINCT FROM OLD.plan_id THEN
    RAISE EXCEPTION 'Not allowed to change plan_id';
  END IF;
  IF NEW.billing_cycle IS DISTINCT FROM OLD.billing_cycle THEN
    RAISE EXCEPTION 'Not allowed to change billing_cycle';
  END IF;
  IF NEW.start_date IS DISTINCT FROM OLD.start_date THEN
    RAISE EXCEPTION 'Not allowed to change start_date';
  END IF;
  IF NEW.expiry_date IS DISTINCT FROM OLD.expiry_date THEN
    RAISE EXCEPTION 'Not allowed to change expiry_date';
  END IF;
  IF NEW.last_payment_id IS DISTINCT FROM OLD.last_payment_id THEN
    RAISE EXCEPTION 'Not allowed to change last_payment_id';
  END IF;

  -- status: only allow transition to 'cancelled'
  IF NEW.status IS DISTINCT FROM OLD.status AND NEW.status <> 'cancelled' THEN
    RAISE EXCEPTION 'Users may only cancel their subscription';
  END IF;

  -- auto_renew: only allow disabling
  IF NEW.auto_renew IS DISTINCT FROM OLD.auto_renew AND NEW.auto_renew <> false THEN
    RAISE EXCEPTION 'Users may only disable auto_renew';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_user_subscription_fields_trg ON public.user_subscriptions;
CREATE TRIGGER protect_user_subscription_fields_trg
BEFORE UPDATE ON public.user_subscriptions
FOR EACH ROW EXECUTE FUNCTION public.protect_user_subscription_fields();

-- Simple UPDATE policy scoped by ownership; field-level enforcement is in the trigger
CREATE POLICY "Users update own subscription"
ON public.user_subscriptions
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
