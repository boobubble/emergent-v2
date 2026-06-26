
-- Installer support: lock flag stored in app_settings under key 'installer'
-- plus public RPCs that work only while not yet installed, and an admin reset.

CREATE OR REPLACE FUNCTION public.get_install_status()
RETURNS jsonb
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT value FROM public.app_settings WHERE key = 'installer'),
    '{"installed": false}'::jsonb
  );
$$;

GRANT EXECUTE ON FUNCTION public.get_install_status() TO anon, authenticated;

-- Bootstrap the very first admin: only works when installer not yet completed
-- AND no super_admin exists yet. Caller must be authenticated (just signed up).
CREATE OR REPLACE FUNCTION public.bootstrap_first_admin()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  done boolean;
  has_super boolean;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Not signed in'; END IF;

  SELECT COALESCE((value->>'installed')::boolean, false) INTO done
    FROM public.app_settings WHERE key = 'installer';
  IF done THEN RAISE EXCEPTION 'Installation already completed'; END IF;

  SELECT EXISTS(SELECT 1 FROM public.user_roles WHERE role = 'super_admin') INTO has_super;
  IF has_super THEN RAISE EXCEPTION 'A super admin already exists'; END IF;

  INSERT INTO public.user_roles (user_id, role) VALUES (uid, 'super_admin')
    ON CONFLICT DO NOTHING;
  INSERT INTO public.user_roles (user_id, role) VALUES (uid, 'admin')
    ON CONFLICT DO NOTHING;
END;
$$;

GRANT EXECUTE ON FUNCTION public.bootstrap_first_admin() TO authenticated;

-- Complete installation: stores the lock + license metadata. One-shot.
CREATE OR REPLACE FUNCTION public.complete_installation(_payload jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  done boolean;
  uid uuid := auth.uid();
  rec jsonb;
BEGIN
  SELECT COALESCE((value->>'installed')::boolean, false) INTO done
    FROM public.app_settings WHERE key = 'installer';
  IF done THEN RAISE EXCEPTION 'Installation already completed'; END IF;

  rec := jsonb_build_object(
    'installed', true,
    'installed_at', to_jsonb(now()),
    'installed_by', to_jsonb(uid),
    'license_type', COALESCE(_payload->>'license_type', 'offline'),
    'license_hash', encode(digest(COALESCE(_payload->>'license_key',''), 'sha256'), 'hex'),
    'site_name', _payload->>'site_name',
    'mode', COALESCE(_payload->>'mode', 'cloud'),
    'version', '1.0.0'
  );

  INSERT INTO public.app_settings (key, value, updated_by)
    VALUES ('installer', rec, uid)
    ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_by = uid, updated_at = now();

  RETURN rec;
END;
$$;

GRANT EXECUTE ON FUNCTION public.complete_installation(jsonb) TO anon, authenticated;

-- Admin-only reset: clears the lock so installer can run again.
CREATE OR REPLACE FUNCTION public.reset_installation()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN RAISE EXCEPTION 'Forbidden'; END IF;
  DELETE FROM public.app_settings WHERE key = 'installer';
END;
$$;

GRANT EXECUTE ON FUNCTION public.reset_installation() TO authenticated;

-- Ensure pgcrypto for digest()
CREATE EXTENSION IF NOT EXISTS pgcrypto;
