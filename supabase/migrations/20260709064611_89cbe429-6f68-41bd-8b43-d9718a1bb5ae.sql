
-- Backup history table
CREATE TABLE IF NOT EXISTS public.backup_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename TEXT NOT NULL,
  backup_type TEXT NOT NULL DEFAULT 'full',
  size_bytes BIGINT NOT NULL DEFAULT 0,
  sha256 TEXT,
  md5 TEXT,
  verified BOOLEAN NOT NULL DEFAULT false,
  encrypted BOOLEAN NOT NULL DEFAULT false,
  app_version TEXT,
  total_tables INTEGER,
  total_rows INTEGER,
  media_files INTEGER,
  notes TEXT,
  generated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,
  last_restore_test_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.backup_history TO authenticated;
GRANT ALL ON public.backup_history TO service_role;

ALTER TABLE public.backup_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view backup history"
  ON public.backup_history FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can insert backup history"
  ON public.backup_history FOR INSERT TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update backup history"
  ON public.backup_history FOR UPDATE TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete backup history"
  ON public.backup_history FOR DELETE TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE INDEX IF NOT EXISTS backup_history_generated_at_idx
  ON public.backup_history (generated_at DESC);

-- Admin: exec arbitrary SQL (for one-click restore). Admin-only.
CREATE OR REPLACE FUNCTION public.admin_exec_sql(_sql text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'forbidden';
  END IF;
  IF _sql IS NULL OR length(trim(_sql)) = 0 THEN
    RETURN;
  END IF;
  EXECUTE _sql;
END $$;

REVOKE ALL ON FUNCTION public.admin_exec_sql(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_exec_sql(text) TO authenticated, service_role;

-- Admin: database size in bytes
CREATE OR REPLACE FUNCTION public.admin_db_size()
RETURNS BIGINT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  sz BIGINT;
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN RAISE EXCEPTION 'forbidden'; END IF;
  SELECT pg_database_size(current_database()) INTO sz;
  RETURN sz;
END $$;

REVOKE ALL ON FUNCTION public.admin_db_size() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_db_size() TO authenticated, service_role;

-- Purge expired backup history rows
CREATE OR REPLACE FUNCTION public.backup_history_purge_expired()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  n integer;
BEGIN
  DELETE FROM public.backup_history
   WHERE expires_at IS NOT NULL AND expires_at < now();
  GET DIAGNOSTICS n = ROW_COUNT;
  RETURN n;
END $$;

REVOKE ALL ON FUNCTION public.backup_history_purge_expired() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.backup_history_purge_expired() TO authenticated, service_role;

-- Seed default retention
INSERT INTO public.app_settings (key, value)
VALUES ('backup_retention', '"30d"'::jsonb)
ON CONFLICT (key) DO NOTHING;
