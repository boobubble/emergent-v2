
-- ============ subscription_plans ============
CREATE TABLE public.subscription_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  badge text,
  tier text NOT NULL DEFAULT 'free', -- 'free' | 'vip' | 'creator' | custom
  currency_code text NOT NULL DEFAULT 'INR',
  currency_symbol text NOT NULL DEFAULT '₹',
  monthly_price numeric(10,2) NOT NULL DEFAULT 0,
  yearly_price numeric(10,2) NOT NULL DEFAULT 0,
  trial_days int NOT NULL DEFAULT 0,
  features jsonb NOT NULL DEFAULT '[]'::jsonb,        -- ["No ads", "VIP badge", ...]
  perks jsonb NOT NULL DEFAULT '{}'::jsonb,           -- { no_ads, premium_themes, premium_games, creator_tools, vip_badge, custom_username_effects, premium_radio_requests, upload_mb, private_rooms_extra }
  max_personal_chatrooms int NOT NULL DEFAULT 0,
  sort_order int NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  is_default boolean NOT NULL DEFAULT false,          -- the free default
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.subscription_plans TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.subscription_plans TO authenticated;
GRANT ALL ON public.subscription_plans TO service_role;
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active plans"
  ON public.subscription_plans FOR SELECT
  USING (active OR public.is_admin(auth.uid()));

CREATE POLICY "Admins manage plans"
  ON public.subscription_plans FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

CREATE TRIGGER trg_subscription_plans_updated_at
  BEFORE UPDATE ON public.subscription_plans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ user_subscriptions ============
CREATE TABLE public.user_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id uuid REFERENCES public.subscription_plans(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'free',                -- free | pending | active | expired | cancelled | trialing
  billing_cycle text NOT NULL DEFAULT 'monthly',      -- monthly | yearly | lifetime
  start_date timestamptz,
  expiry_date timestamptz,
  cancelled_at timestamptz,
  auto_renew boolean NOT NULL DEFAULT false,
  last_payment_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.user_subscriptions TO authenticated;
GRANT ALL ON public.user_subscriptions TO service_role;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read their own subscription"
  ON public.user_subscriptions FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

CREATE POLICY "Users insert own subscription row"
  ON public.user_subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins update any subscription"
  ON public.user_subscriptions FOR UPDATE
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Users cancel own subscription"
  ON public.user_subscriptions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER trg_user_subscriptions_updated_at
  BEFORE UPDATE ON public.user_subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ subscription_payments ============
CREATE TABLE public.subscription_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id uuid NOT NULL REFERENCES public.subscription_plans(id) ON DELETE RESTRICT,
  billing_cycle text NOT NULL DEFAULT 'monthly',
  amount numeric(10,2) NOT NULL,
  currency_code text NOT NULL DEFAULT 'INR',
  provider text NOT NULL DEFAULT 'manual',            -- manual | razorpay | stripe
  provider_payment_id text,                           -- future: gateway id
  proof_reference text,                               -- user-submitted: UTR / txn id / note
  status text NOT NULL DEFAULT 'pending',             -- pending | approved | rejected | refunded
  admin_note text,
  approved_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  approved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.subscription_payments TO authenticated;
GRANT UPDATE ON public.subscription_payments TO authenticated;
GRANT ALL ON public.subscription_payments TO service_role;
ALTER TABLE public.subscription_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own payments"
  ON public.subscription_payments FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

CREATE POLICY "Users create own payment"
  ON public.subscription_payments FOR INSERT
  WITH CHECK (auth.uid() = user_id AND status = 'pending');

CREATE POLICY "Admins update payments"
  ON public.subscription_payments FOR UPDATE
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

CREATE INDEX idx_subscription_payments_user ON public.subscription_payments(user_id, created_at DESC);
CREATE INDEX idx_subscription_payments_status ON public.subscription_payments(status, created_at DESC);

CREATE TRIGGER trg_subscription_payments_updated_at
  BEFORE UPDATE ON public.subscription_payments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ chatrooms (premium personal rooms) ============
CREATE TABLE public.chatrooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  category text,
  cover_image_url text,
  avatar_url text,
  rules text,
  welcome_message text,
  theme_color text,
  background_image_url text,
  visibility text NOT NULL DEFAULT 'public',          -- public | private | invite
  password text,
  age_restricted boolean NOT NULL DEFAULT false,
  member_count int NOT NULL DEFAULT 1,
  featured boolean NOT NULL DEFAULT false,
  archived_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.chatrooms TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.chatrooms TO authenticated;
GRANT ALL ON public.chatrooms TO service_role;
ALTER TABLE public.chatrooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read non-private chatrooms"
  ON public.chatrooms FOR SELECT
  USING (visibility <> 'private' OR auth.uid() = owner_id OR public.is_admin(auth.uid()));

CREATE POLICY "Premium users create own chatrooms"
  ON public.chatrooms FOR INSERT
  WITH CHECK (
    auth.uid() = owner_id
    AND EXISTS (
      SELECT 1 FROM public.user_subscriptions us
      JOIN public.subscription_plans p ON p.id = us.plan_id
      WHERE us.user_id = auth.uid()
        AND us.status IN ('active','trialing')
        AND (us.expiry_date IS NULL OR us.expiry_date > now())
        AND p.max_personal_chatrooms > 0
        AND (
          SELECT count(*) FROM public.chatrooms c
          WHERE c.owner_id = auth.uid() AND c.archived_at IS NULL
        ) < p.max_personal_chatrooms
    )
  );

CREATE POLICY "Owner or admin updates chatroom"
  ON public.chatrooms FOR UPDATE
  USING (auth.uid() = owner_id OR public.is_admin(auth.uid()))
  WITH CHECK (auth.uid() = owner_id OR public.is_admin(auth.uid()));

CREATE POLICY "Owner or admin deletes chatroom"
  ON public.chatrooms FOR DELETE
  USING (auth.uid() = owner_id OR public.is_admin(auth.uid()));

CREATE INDEX idx_chatrooms_owner ON public.chatrooms(owner_id);
CREATE INDEX idx_chatrooms_visibility ON public.chatrooms(visibility, created_at DESC);

CREATE TRIGGER trg_chatrooms_updated_at
  BEFORE UPDATE ON public.chatrooms
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ helper: my_active_plan ============
CREATE OR REPLACE FUNCTION public.my_active_plan()
RETURNS TABLE (
  plan_id uuid, slug text, name text, tier text,
  perks jsonb, max_personal_chatrooms int,
  status text, expiry_date timestamptz, billing_cycle text
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT p.id, p.slug, p.name, p.tier, p.perks, p.max_personal_chatrooms,
         us.status, us.expiry_date, us.billing_cycle
    FROM public.user_subscriptions us
    JOIN public.subscription_plans p ON p.id = us.plan_id
   WHERE us.user_id = auth.uid()
     AND us.status IN ('active','trialing')
     AND (us.expiry_date IS NULL OR us.expiry_date > now())
   LIMIT 1;
$$;

-- ============ default plans ============
INSERT INTO public.subscription_plans
  (slug, name, description, badge, tier, currency_code, currency_symbol,
   monthly_price, yearly_price, features, perks, max_personal_chatrooms,
   sort_order, active, is_default)
VALUES
  ('free', 'Free', 'Basic community access', NULL, 'free', 'INR', '₹',
   0, 0,
   '["Browse public chatrooms","Post on the feed","Earn coins and XP"]'::jsonb,
   '{"no_ads":false,"premium_themes":false,"premium_games":false,"creator_tools":false,"vip_badge":false,"custom_username_effects":false,"premium_radio_requests":false}'::jsonb,
   0, 0, true, true),
  ('vip', 'VIP', 'Premium experience with no ads and exclusive themes', 'VIP', 'vip', 'INR', '₹',
   99, 999,
   '["No ads","VIP badge","Exclusive chatrooms","Premium themes","Larger upload limits"]'::jsonb,
   '{"no_ads":true,"premium_themes":true,"premium_games":true,"creator_tools":false,"vip_badge":true,"custom_username_effects":true,"premium_radio_requests":true,"upload_mb":50}'::jsonb,
   1, 10, true, false),
  ('creator', 'Creator', 'Advanced creator privileges, RJ / DJ perks, exclusive access', 'CREATOR', 'creator', 'INR', '₹',
   299, 2999,
   '["Everything in VIP","Creator tools","DJ / RJ perks","Up to 5 personal chatrooms","Featured room placement"]'::jsonb,
   '{"no_ads":true,"premium_themes":true,"premium_games":true,"creator_tools":true,"vip_badge":true,"custom_username_effects":true,"premium_radio_requests":true,"upload_mb":200,"dj_perks":true,"featured_room":true}'::jsonb,
   5, 20, true, false);

-- ============ default app_settings ============
INSERT INTO public.app_settings (key, value)
VALUES ('subscription',
  '{"mode":"optional","default_currency":"INR","default_currency_symbol":"₹","payment_instructions":"Send payment to UPI: example@upi and submit your transaction reference for admin approval.","providers":{"manual":true,"razorpay":false,"stripe":false}}'::jsonb)
ON CONFLICT (key) DO NOTHING;
