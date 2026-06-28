
-- API keys + outbound webhooks (super-admin managed)

CREATE TABLE IF NOT EXISTS public.api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  key_prefix text NOT NULL,
  key_hash text NOT NULL UNIQUE,
  scopes text[] NOT NULL DEFAULT ARRAY['read']::text[],
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  last_used_at timestamptz,
  revoked_at timestamptz
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.api_keys TO authenticated;
GRANT ALL ON public.api_keys TO service_role;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admins manage api keys"
  ON public.api_keys FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));


CREATE TABLE IF NOT EXISTS public.webhook_endpoints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  url text NOT NULL,
  secret text NOT NULL,
  events text[] NOT NULL DEFAULT ARRAY[]::text[],
  active boolean NOT NULL DEFAULT true,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  last_delivery_at timestamptz,
  last_status int,
  failure_count int NOT NULL DEFAULT 0
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.webhook_endpoints TO authenticated;
GRANT ALL ON public.webhook_endpoints TO service_role;
ALTER TABLE public.webhook_endpoints ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admins manage webhooks"
  ON public.webhook_endpoints FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

CREATE TRIGGER trg_webhook_endpoints_updated_at
  BEFORE UPDATE ON public.webhook_endpoints
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


CREATE TABLE IF NOT EXISTS public.webhook_deliveries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  endpoint_id uuid NOT NULL REFERENCES public.webhook_endpoints(id) ON DELETE CASCADE,
  event text NOT NULL,
  status_code int,
  ok boolean NOT NULL DEFAULT false,
  error text,
  payload jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_endpoint_created
  ON public.webhook_deliveries(endpoint_id, created_at DESC);

GRANT SELECT, INSERT, DELETE ON public.webhook_deliveries TO authenticated;
GRANT ALL ON public.webhook_deliveries TO service_role;
ALTER TABLE public.webhook_deliveries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admins read deliveries"
  ON public.webhook_deliveries FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid()));
CREATE POLICY "admins delete deliveries"
  ON public.webhook_deliveries FOR DELETE TO authenticated
  USING (public.is_admin(auth.uid()));
