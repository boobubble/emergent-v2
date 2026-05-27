
-- Coin/XP ledger (audit + history)
CREATE TABLE public.coin_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('xp','coins')),
  amount INTEGER NOT NULL,
  reason TEXT NOT NULL,
  ref_type TEXT,
  ref_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_coin_tx_user_created ON public.coin_transactions(user_id, created_at DESC);
CREATE INDEX idx_coin_tx_user_reason ON public.coin_transactions(user_id, reason, created_at DESC);

GRANT SELECT ON public.coin_transactions TO authenticated;
GRANT ALL ON public.coin_transactions TO service_role;

ALTER TABLE public.coin_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Read own transactions"
  ON public.coin_transactions FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- (no INSERT/UPDATE/DELETE policies = blocked from clients; only service_role writes)

-- Shop inventory
CREATE TABLE public.user_inventory (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  item_id TEXT NOT NULL,
  category TEXT NOT NULL,
  equipped BOOLEAN NOT NULL DEFAULT false,
  acquired_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, item_id)
);
CREATE INDEX idx_inventory_user ON public.user_inventory(user_id);
CREATE INDEX idx_inventory_equipped ON public.user_inventory(user_id, category) WHERE equipped = true;

GRANT SELECT ON public.user_inventory TO authenticated;
GRANT ALL ON public.user_inventory TO service_role;

ALTER TABLE public.user_inventory ENABLE ROW LEVEL SECURITY;

-- Everyone authenticated can read inventory (needed to render equipped cosmetics on others' profiles/posts)
CREATE POLICY "Read all inventory"
  ON public.user_inventory FOR SELECT TO authenticated
  USING (true);

-- Users can toggle their own equipped flag
CREATE POLICY "Update own inventory equip"
  ON public.user_inventory FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
