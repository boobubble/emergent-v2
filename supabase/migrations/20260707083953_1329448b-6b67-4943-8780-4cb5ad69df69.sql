
-- Version management & update system
CREATE TABLE IF NOT EXISTS public.app_updates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  version text NOT NULL UNIQUE,
  build_number int NOT NULL DEFAULT 1,
  release_date timestamptz NOT NULL DEFAULT now(),
  channel text NOT NULL DEFAULT 'stable',
  manifest jsonb NOT NULL DEFAULT '{}'::jsonb,
  release_notes jsonb NOT NULL DEFAULT '{}'::jsonb,
  migrations jsonb NOT NULL DEFAULT '[]'::jsonb,
  min_from_version text,
  package_size bigint,
  package_sha256 text,
  uploaded_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  is_current boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.app_updates TO authenticated;
GRANT ALL ON public.app_updates TO service_role;
ALTER TABLE public.app_updates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins manage updates" ON public.app_updates FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "authenticated read updates" ON public.app_updates FOR SELECT TO authenticated USING (true);

CREATE TABLE IF NOT EXISTS public.app_update_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_version text,
  to_version text NOT NULL,
  build_number int,
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  duration_ms int,
  status text NOT NULL DEFAULT 'running',
  installed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  backup_id uuid,
  backup_created boolean NOT NULL DEFAULT false,
  rollback_available boolean NOT NULL DEFAULT false,
  report jsonb NOT NULL DEFAULT '{}'::jsonb,
  error text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.app_update_history TO authenticated;
GRANT ALL ON public.app_update_history TO service_role;
ALTER TABLE public.app_update_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins manage update history" ON public.app_update_history FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE IF NOT EXISTS public.applied_update_migrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  migration_id text NOT NULL UNIQUE,
  version text NOT NULL,
  applied_at timestamptz NOT NULL DEFAULT now(),
  applied_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  duration_ms int,
  checksum text,
  status text NOT NULL DEFAULT 'ok'
);
GRANT SELECT ON public.applied_update_migrations TO authenticated;
GRANT ALL ON public.applied_update_migrations TO service_role;
ALTER TABLE public.applied_update_migrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins manage applied migrations" ON public.applied_update_migrations FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE INDEX IF NOT EXISTS app_updates_current_idx ON public.app_updates(is_current) WHERE is_current;
CREATE INDEX IF NOT EXISTS app_update_history_started_idx ON public.app_update_history(started_at DESC);

-- Helper: current installed version (from app_settings or fallback)
CREATE OR REPLACE FUNCTION public.get_system_version()
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_current text;
  v_build int;
  v_installed_at timestamptz;
  v_latest record;
BEGIN
  SELECT (value #>> '{}')::text INTO v_current FROM public.app_settings WHERE key = 'app_version';
  IF v_current IS NULL THEN v_current := '1.0.0'; END IF;
  SELECT (value #>> '{}')::int INTO v_build FROM public.app_settings WHERE key = 'app_build_number';
  IF v_build IS NULL THEN v_build := 1; END IF;
  SELECT (value #>> '{}')::timestamptz INTO v_installed_at FROM public.app_settings WHERE key = 'installed_at';

  SELECT version, build_number, release_date INTO v_latest
    FROM public.app_updates ORDER BY release_date DESC LIMIT 1;

  RETURN jsonb_build_object(
    'current_version', v_current,
    'current_build', v_build,
    'installed_at', v_installed_at,
    'latest_version', COALESCE(v_latest.version, v_current),
    'latest_build', COALESCE(v_latest.build_number, v_build),
    'latest_release_date', v_latest.release_date,
    'update_available', v_latest.version IS NOT NULL AND v_latest.version <> v_current
  );
END;
$$;
GRANT EXECUTE ON FUNCTION public.get_system_version() TO authenticated, anon;
