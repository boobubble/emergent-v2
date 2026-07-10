
-- Tighten coin_payment_orders INSERT: users can only create orders in initial state
DROP POLICY IF EXISTS "orders owner insert" ON public.coin_payment_orders;
CREATE POLICY "orders owner insert"
ON public.coin_payment_orders
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid()
  AND status IN ('created', 'awaiting_review')
  AND provider_payment_id IS NULL
  AND admin_note IS NULL
);

-- Tighten user_subscriptions INSERT/UPDATE: users cannot self-activate paid status
DROP POLICY IF EXISTS "Users insert own subscription row" ON public.user_subscriptions;
CREATE POLICY "Users insert own subscription row"
ON public.user_subscriptions
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND status IN ('free', 'pending', 'cancelled')
  AND expiry_date IS NULL
);

DROP POLICY IF EXISTS "Users update own subscription" ON public.user_subscriptions;
CREATE POLICY "Users update own subscription"
ON public.user_subscriptions
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id
  AND status IN ('free', 'pending', 'cancelled')
  AND expiry_date IS NULL
);
