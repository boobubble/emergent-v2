
-- =========================================================================
-- Unified License Manager — data layer (M1)
-- =========================================================================

-- Reuse existing updated_at trigger function; create only if missing.
CREATE OR REPLACE FUNCTION public.set_updated_at_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- -------------------------------------------------------------------------
-- Enum: license status
-- -------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'license_status') THEN
    CREATE TYPE public.license_status AS ENUM (
      'active',
      'suspended',
      'revoked',
      'expired',
      'pending',
      'disabled',
      'development',
      'localhost',
      'unlimited'
    );
  END IF;
END$$;

-- -------------------------------------------------------------------------
-- license_sources — catalog of purchase sources (extensible)
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.license_sources (
  id          TEXT PRIMARY KEY,                       -- e.g. 'self', 'envato', 'codester'
  label       TEXT NOT NULL,
  provider    TEXT NOT NULL,                          -- provider class key
  enabled     BOOLEAN NOT NULL DEFAULT true,
  config      JSONB NOT NULL DEFAULT '{}'::jsonb,
  sort_order  INTEGER NOT NULL DEFAULT 100,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.license_sources TO anon, authenticated;
GRANT ALL ON public.license_sources TO service_role;

ALTER TABLE public.license_sources ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "license_sources_read_all" ON public.license_sources;
CREATE POLICY "license_sources_read_all"
  ON public.license_sources FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "license_sources_admin_write" ON public.license_sources;
CREATE POLICY "license_sources_admin_write"
  ON public.license_sources FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

DROP TRIGGER IF EXISTS trg_license_sources_updated_at ON public.license_sources;
CREATE TRIGGER trg_license_sources_updated_at
  BEFORE UPDATE ON public.license_sources
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_timestamp();

-- Seed built-in sources
INSERT INTO public.license_sources (id, label, provider, enabled, sort_order)
VALUES
  ('self',     'Self Website',        'self',     true, 10),
  ('envato',   'CodeCanyon (Envato)', 'envato',   true, 20),
  ('codester', 'Codester',            'codester', true, 30)
ON CONFLICT (id) DO NOTHING;

-- -------------------------------------------------------------------------
-- licenses — one row per issued/imported license
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.licenses (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  license_key           TEXT NOT NULL UNIQUE,
  purchase_code         TEXT,
  source_id             TEXT NOT NULL REFERENCES public.license_sources(id),
  customer_email        TEXT,
  customer_name         TEXT,
  product               TEXT NOT NULL DEFAULT 'boobubble',
  product_version       TEXT,
  activation_date       TIMESTAMPTZ,
  expiry_date           TIMESTAMPTZ,
  max_activations       INTEGER NOT NULL DEFAULT 1,
  current_activations   INTEGER NOT NULL DEFAULT 0,
  current_domain        TEXT,
  server_ip             TEXT,
  installation_id       TEXT,
  last_validation_at    TIMESTAMPTZ,
  last_validation_ok    BOOLEAN,
  status                public.license_status NOT NULL DEFAULT 'pending',
  metadata              JSONB NOT NULL DEFAULT '{}'::jsonb,
  notes                 TEXT,
  owner_user_id         UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_licenses_status         ON public.licenses(status);
CREATE INDEX IF NOT EXISTS idx_licenses_source         ON public.licenses(source_id);
CREATE INDEX IF NOT EXISTS idx_licenses_customer_email ON public.licenses(customer_email);
CREATE INDEX IF NOT EXISTS idx_licenses_purchase_code  ON public.licenses(purchase_code);
CREATE INDEX IF NOT EXISTS idx_licenses_domain         ON public.licenses(current_domain);

GRANT SELECT ON public.licenses TO authenticated;
GRANT ALL ON public.licenses TO service_role;

ALTER TABLE public.licenses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "licenses_owner_read" ON public.licenses;
CREATE POLICY "licenses_owner_read"
  ON public.licenses FOR SELECT
  TO authenticated
  USING (
    owner_user_id = auth.uid()
    OR public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'super_admin')
  );

DROP POLICY IF EXISTS "licenses_admin_write" ON public.licenses;
CREATE POLICY "licenses_admin_write"
  ON public.licenses FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

DROP TRIGGER IF EXISTS trg_licenses_updated_at ON public.licenses;
CREATE TRIGGER trg_licenses_updated_at
  BEFORE UPDATE ON public.licenses
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_timestamp();

-- -------------------------------------------------------------------------
-- license_activations — per-domain activation records
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.license_activations (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  license_id       UUID NOT NULL REFERENCES public.licenses(id) ON DELETE CASCADE,
  domain           TEXT NOT NULL,
  server_ip        TEXT,
  installation_id  TEXT,
  runtime          TEXT,          -- e.g. 'node/22', 'workerd'
  product_version  TEXT,
  active           BOOLEAN NOT NULL DEFAULT true,
  activated_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  deactivated_at   TIMESTAMPTZ,
  last_seen_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata         JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_license_activations_license ON public.license_activations(license_id);
CREATE INDEX IF NOT EXISTS idx_license_activations_active  ON public.license_activations(license_id, active);
CREATE UNIQUE INDEX IF NOT EXISTS ux_license_activations_active_domain
  ON public.license_activations(license_id, domain)
  WHERE active = true;

GRANT SELECT ON public.license_activations TO authenticated;
GRANT ALL ON public.license_activations TO service_role;

ALTER TABLE public.license_activations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "license_activations_owner_read" ON public.license_activations;
CREATE POLICY "license_activations_owner_read"
  ON public.license_activations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.licenses l
      WHERE l.id = license_activations.license_id
        AND (
          l.owner_user_id = auth.uid()
          OR public.has_role(auth.uid(), 'admin')
          OR public.has_role(auth.uid(), 'super_admin')
        )
    )
  );

DROP POLICY IF EXISTS "license_activations_admin_write" ON public.license_activations;
CREATE POLICY "license_activations_admin_write"
  ON public.license_activations FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

DROP TRIGGER IF EXISTS trg_license_activations_updated_at ON public.license_activations;
CREATE TRIGGER trg_license_activations_updated_at
  BEFORE UPDATE ON public.license_activations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_timestamp();

-- -------------------------------------------------------------------------
-- license_logs — audit trail
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.license_logs (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  license_id   UUID REFERENCES public.licenses(id) ON DELETE SET NULL,
  action       TEXT NOT NULL,   -- verify | activate | check | deactivate | reset | suspend | revoke | extend | import | generate | domain_change
  outcome      TEXT NOT NULL,   -- ok | fail | warn
  message      TEXT,
  actor_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ip_address   TEXT,
  user_agent   TEXT,
  context      JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_license_logs_license ON public.license_logs(license_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_license_logs_action  ON public.license_logs(action, created_at DESC);

GRANT SELECT ON public.license_logs TO authenticated;
GRANT ALL ON public.license_logs TO service_role;

ALTER TABLE public.license_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "license_logs_admin_read" ON public.license_logs;
CREATE POLICY "license_logs_admin_read"
  ON public.license_logs FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

DROP POLICY IF EXISTS "license_logs_admin_write" ON public.license_logs;
CREATE POLICY "license_logs_admin_write"
  ON public.license_logs FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

-- -------------------------------------------------------------------------
-- license_statistics — view for admin dashboard
-- -------------------------------------------------------------------------
CREATE OR REPLACE VIEW public.license_statistics AS
SELECT
  (SELECT COUNT(*) FROM public.licenses)                                                            AS total,
  (SELECT COUNT(*) FROM public.licenses WHERE status = 'active')                                    AS active,
  (SELECT COUNT(*) FROM public.licenses WHERE status = 'suspended')                                 AS suspended,
  (SELECT COUNT(*) FROM public.licenses WHERE status = 'revoked')                                   AS revoked,
  (SELECT COUNT(*) FROM public.licenses WHERE status = 'expired')                                   AS expired,
  (SELECT COUNT(*) FROM public.licenses WHERE status = 'pending')                                   AS pending,
  (SELECT COUNT(*) FROM public.licenses WHERE status = 'disabled')                                  AS disabled,
  (SELECT jsonb_object_agg(source_id, cnt)
     FROM (SELECT source_id, COUNT(*) AS cnt FROM public.licenses GROUP BY source_id) s)            AS by_source,
  (SELECT jsonb_object_agg(coalesce(product_version, 'unknown'), cnt)
     FROM (SELECT product_version, COUNT(*) AS cnt FROM public.licenses GROUP BY product_version) v) AS by_version;

GRANT SELECT ON public.license_statistics TO authenticated, service_role;
