
-- Fix: user_subscriptions_self_escalation
-- Prevent users from granting themselves paid subscription perks by editing their own row.
-- Users may only insert a self-row limited to a free plan/status, and may only update to cancel.
-- All privileged changes (activation, plan assignment, expiry) must go through admin/service_role.

CREATE OR REPLACE FUNCTION public.guard_user_subscriptions_self_write()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  uid uuid := auth.uid();
  is_priv boolean := false;
BEGIN
  -- Service role and admins bypass all restrictions.
  IF uid IS NULL THEN
    -- No JWT (service role / server). Allow.
    RETURN COALESCE(NEW, OLD);
  END IF;
  IF public.is_admin(uid) THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  IF TG_OP = 'INSERT' THEN
    -- Only allow inserting one's own row, restricted to a free/pending baseline.
    IF NEW.user_id <> uid THEN
      RAISE EXCEPTION 'Cannot create subscription for another user';
    END IF;
    IF NEW.status NOT IN ('free','cancelled','pending') THEN
      RAISE EXCEPTION 'Cannot self-assign subscription status %', NEW.status;
    END IF;
    IF NEW.expiry_date IS NOT NULL THEN
      RAISE EXCEPTION 'Cannot self-assign subscription expiry';
    END IF;
    IF NEW.auto_renew IS TRUE THEN
      RAISE EXCEPTION 'Cannot self-enable auto renew';
    END IF;
    IF NEW.last_payment_id IS NOT NULL THEN
      RAISE EXCEPTION 'Cannot self-assign payment reference';
    END IF;
    -- If a plan is set, it must be a free-tier plan.
    IF NEW.plan_id IS NOT NULL AND NOT EXISTS (
      SELECT 1 FROM public.subscription_plans
      WHERE id = NEW.plan_id AND tier = 'free'
    ) THEN
      RAISE EXCEPTION 'Cannot self-assign a paid plan';
    END IF;
    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE' THEN
    IF OLD.user_id <> uid THEN
      RAISE EXCEPTION 'Cannot modify another user''s subscription';
    END IF;
    -- Immutable fields for the owner: plan_id, expiry_date, auto_renew (on),
    -- billing_cycle, start_date, last_payment_id.
    IF NEW.plan_id IS DISTINCT FROM OLD.plan_id THEN
      RAISE EXCEPTION 'Cannot change subscription plan directly';
    END IF;
    IF NEW.expiry_date IS DISTINCT FROM OLD.expiry_date THEN
      RAISE EXCEPTION 'Cannot change subscription expiry directly';
    END IF;
    IF NEW.start_date IS DISTINCT FROM OLD.start_date THEN
      RAISE EXCEPTION 'Cannot change subscription start date directly';
    END IF;
    IF NEW.billing_cycle IS DISTINCT FROM OLD.billing_cycle THEN
      RAISE EXCEPTION 'Cannot change billing cycle directly';
    END IF;
    IF NEW.last_payment_id IS DISTINCT FROM OLD.last_payment_id THEN
      RAISE EXCEPTION 'Cannot change payment reference directly';
    END IF;
    -- auto_renew: owner may only turn it OFF, never on.
    IF NEW.auto_renew IS DISTINCT FROM OLD.auto_renew AND NEW.auto_renew IS TRUE THEN
      RAISE EXCEPTION 'Cannot self-enable auto renew';
    END IF;
    -- status: owner may only move to 'cancelled' (or leave unchanged).
    IF NEW.status IS DISTINCT FROM OLD.status AND NEW.status <> 'cancelled' THEN
      RAISE EXCEPTION 'Cannot self-assign subscription status %', NEW.status;
    END IF;
    RETURN NEW;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trg_guard_user_subscriptions_self_write ON public.user_subscriptions;
CREATE TRIGGER trg_guard_user_subscriptions_self_write
BEFORE INSERT OR UPDATE ON public.user_subscriptions
FOR EACH ROW EXECUTE FUNCTION public.guard_user_subscriptions_self_write();


-- Fix: competition_participants_approval_bypass
-- Force status='pending' on self-join when the competition requires approval,
-- so users cannot self-approve their own entry. Admins are unaffected.

CREATE OR REPLACE FUNCTION public.guard_competition_participant_self_join()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  uid uuid := auth.uid();
  needs_approval boolean;
BEGIN
  IF uid IS NULL OR public.is_admin(uid) THEN
    RETURN NEW;
  END IF;
  IF NEW.user_id <> uid THEN
    -- Non-self insert is only possible via the admin policy; leave that path alone.
    RETURN NEW;
  END IF;

  SELECT require_approval INTO needs_approval
    FROM public.competitions WHERE id = NEW.competition_id;

  IF COALESCE(needs_approval, false) THEN
    NEW.status := 'pending';
  ELSIF NEW.status NOT IN ('approved','pending') THEN
    -- Prevent self-granting exotic statuses like 'winner'.
    NEW.status := 'approved';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_guard_competition_participant_self_join ON public.competition_participants;
CREATE TRIGGER trg_guard_competition_participant_self_join
BEFORE INSERT ON public.competition_participants
FOR EACH ROW EXECUTE FUNCTION public.guard_competition_participant_self_join();
