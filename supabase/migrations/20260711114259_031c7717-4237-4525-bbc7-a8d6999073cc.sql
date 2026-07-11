
-- Add license plan (trial / monthly / yearly / lifetime) to unified licensing.
DO $$ BEGIN
  CREATE TYPE public.license_plan AS ENUM ('trial','monthly','yearly','lifetime');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE public.licenses
  ADD COLUMN IF NOT EXISTS license_plan public.license_plan NOT NULL DEFAULT 'monthly';

-- For any existing row without expiry date, treat as lifetime by default.
UPDATE public.licenses
  SET license_plan = 'lifetime'
  WHERE expiry_date IS NULL AND license_plan = 'monthly';

-- Ensure lifetime rows have NULL expiry_date.
CREATE OR REPLACE FUNCTION public.enforce_lifetime_expiry()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $fn$
BEGIN
  IF NEW.license_plan = 'lifetime' THEN
    NEW.expiry_date := NULL;
  END IF;
  RETURN NEW;
END;
$fn$;

DROP TRIGGER IF EXISTS licenses_enforce_lifetime_expiry ON public.licenses;
CREATE TRIGGER licenses_enforce_lifetime_expiry
  BEFORE INSERT OR UPDATE ON public.licenses
  FOR EACH ROW EXECUTE FUNCTION public.enforce_lifetime_expiry();

-- Rebuild the statistics view with per-plan counts + a lifetime shortcut.
DROP VIEW IF EXISTS public.license_statistics;
CREATE VIEW public.license_statistics AS
SELECT
  (SELECT count(*) FROM licenses) AS total,
  (SELECT count(*) FROM licenses WHERE status = 'active') AS active,
  (SELECT count(*) FROM licenses WHERE status = 'suspended') AS suspended,
  (SELECT count(*) FROM licenses WHERE status = 'revoked') AS revoked,
  (SELECT count(*) FROM licenses WHERE status = 'expired') AS expired,
  (SELECT count(*) FROM licenses WHERE status = 'pending') AS pending,
  (SELECT count(*) FROM licenses WHERE status = 'disabled') AS disabled,
  (SELECT count(*) FROM licenses WHERE license_plan = 'trial') AS trial,
  (SELECT count(*) FROM licenses WHERE license_plan = 'monthly') AS monthly,
  (SELECT count(*) FROM licenses WHERE license_plan = 'yearly') AS yearly,
  (SELECT count(*) FROM licenses WHERE license_plan = 'lifetime') AS lifetime,
  (SELECT jsonb_object_agg(s.source_id, s.cnt)
     FROM (SELECT source_id, count(*) AS cnt FROM licenses GROUP BY source_id) s) AS by_source,
  (SELECT jsonb_object_agg(p.license_plan::text, p.cnt)
     FROM (SELECT license_plan, count(*) AS cnt FROM licenses GROUP BY license_plan) p) AS by_plan,
  (SELECT jsonb_object_agg(COALESCE(v.product_version, 'unknown'), v.cnt)
     FROM (SELECT product_version, count(*) AS cnt FROM licenses GROUP BY product_version) v) AS by_version;

GRANT SELECT ON public.license_statistics TO authenticated, service_role;
