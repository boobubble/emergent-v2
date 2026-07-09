-- 1) profiles: pin trust/financial fields at the WITH CHECK level
DROP POLICY IF EXISTS "Users can update own profile display fields" ON public.profiles;
CREATE POLICY "Users can update own profile display fields"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id
  AND xp                    = (SELECT p.xp                    FROM public.profiles p WHERE p.id = auth.uid())
  AND coins                 = (SELECT p.coins                 FROM public.profiles p WHERE p.id = auth.uid())
  AND level                 = (SELECT p.level                 FROM public.profiles p WHERE p.id = auth.uid())
  AND streak                = (SELECT p.streak                FROM public.profiles p WHERE p.id = auth.uid())
  AND longest_streak        = (SELECT p.longest_streak        FROM public.profiles p WHERE p.id = auth.uid())
  AND is_verified           IS NOT DISTINCT FROM (SELECT p.is_verified           FROM public.profiles p WHERE p.id = auth.uid())
  AND is_official           IS NOT DISTINCT FROM (SELECT p.is_official           FROM public.profiles p WHERE p.id = auth.uid())
  AND is_bot                IS NOT DISTINCT FROM (SELECT p.is_bot                FROM public.profiles p WHERE p.id = auth.uid())
  AND wallet_frozen         IS NOT DISTINCT FROM (SELECT p.wallet_frozen         FROM public.profiles p WHERE p.id = auth.uid())
  AND coins_lifetime_earned IS NOT DISTINCT FROM (SELECT p.coins_lifetime_earned FROM public.profiles p WHERE p.id = auth.uid())
  AND coins_lifetime_spent  IS NOT DISTINCT FROM (SELECT p.coins_lifetime_spent  FROM public.profiles p WHERE p.id = auth.uid())
  AND coins_purchased_total IS NOT DISTINCT FROM (SELECT p.coins_purchased_total FROM public.profiles p WHERE p.id = auth.uid())
  AND coins_bonus_total     IS NOT DISTINCT FROM (SELECT p.coins_bonus_total     FROM public.profiles p WHERE p.id = auth.uid())
);

-- 2) user_subscriptions: users may only cancel / disable auto-renew on their own row
DROP POLICY IF EXISTS "Users cancel own subscription" ON public.user_subscriptions;
CREATE POLICY "Users cancel own subscription"
ON public.user_subscriptions
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id
  AND plan_id         IS NOT DISTINCT FROM (SELECT s.plan_id         FROM public.user_subscriptions s WHERE s.id = user_subscriptions.id)
  AND expiry_date     IS NOT DISTINCT FROM (SELECT s.expiry_date     FROM public.user_subscriptions s WHERE s.id = user_subscriptions.id)
  AND start_date      IS NOT DISTINCT FROM (SELECT s.start_date      FROM public.user_subscriptions s WHERE s.id = user_subscriptions.id)
  AND billing_cycle   IS NOT DISTINCT FROM (SELECT s.billing_cycle   FROM public.user_subscriptions s WHERE s.id = user_subscriptions.id)
  AND last_payment_id IS NOT DISTINCT FROM (SELECT s.last_payment_id FROM public.user_subscriptions s WHERE s.id = user_subscriptions.id)
  AND (
    status = (SELECT s.status FROM public.user_subscriptions s WHERE s.id = user_subscriptions.id)
    OR status = 'cancelled'
  )
  AND (
    auto_renew = (SELECT s.auto_renew FROM public.user_subscriptions s WHERE s.id = user_subscriptions.id)
    OR auto_renew = false
  )
);

-- 3) competition_participants: force status='pending' when the competition requires approval
DROP POLICY IF EXISTS "user can self-join" ON public.competition_participants;
CREATE POLICY "user can self-join"
ON public.competition_participants
FOR INSERT
WITH CHECK (
  user_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.competitions c
    WHERE c.id = competition_participants.competition_id
      AND c.status = ANY (ARRAY['upcoming'::text, 'live'::text])
      AND (c.max_participants IS NULL OR c.total_participants < c.max_participants)
      AND (
        COALESCE(c.require_approval, false) = false
        OR competition_participants.status = 'pending'
      )
  )
);