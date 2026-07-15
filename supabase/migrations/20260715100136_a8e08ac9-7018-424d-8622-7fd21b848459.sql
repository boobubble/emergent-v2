
-- ============================================================
-- SECURITY DEFINER hardening pass
-- ============================================================

-- 1) provision_community_for_user: require caller = self OR admin.
--    Previously anyone could call it with an arbitrary target user id.
CREATE OR REPLACE FUNCTION public.provision_community_for_user(_user uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  existing UUID;
  new_id UUID;
  uname TEXT;
  new_slug TEXT;
  caller uuid := auth.uid();
BEGIN
  -- Caller must be the target user, an admin, or the internal role (trigger context)
  IF caller IS NOT NULL
     AND caller <> _user
     AND NOT public.is_admin(caller) THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;

  SELECT id INTO existing FROM public.communities WHERE owner_id = _user LIMIT 1;
  IF existing IS NOT NULL THEN RETURN existing; END IF;

  SELECT COALESCE(username, 'creator') INTO uname FROM public.profiles WHERE id = _user;
  new_slug := public.generate_community_slug(uname);

  INSERT INTO public.communities (owner_id, slug, name, description, privacy_mode)
  VALUES (_user, new_slug, COALESCE(uname,'Creator') || '''s Community', 'Welcome to my community!', 'public')
  RETURNING id INTO new_id;

  INSERT INTO public.community_members (community_id, user_id, role, status)
  VALUES (new_id, _user, 'owner', 'active')
  ON CONFLICT (community_id, user_id) DO NOTHING;

  RETURN new_id;
END $function$;

-- 2) wallet_log_suspicious: internal telemetry helper. Should only be
--    callable from server code (service_role) or DB triggers.
REVOKE EXECUTE ON FUNCTION public.wallet_log_suspicious(uuid, text, integer, jsonb) FROM PUBLIC, anon, authenticated;
GRANT  EXECUTE ON FUNCTION public.wallet_log_suspicious(uuid, text, integer, jsonb) TO service_role;

-- 3) Feedbot enqueue helpers — trigger-only. Triggers bypass EXECUTE checks
--    because they run under the trigger owner, so revoking direct RPC access
--    does not break trigger-based enqueuing.
REVOKE EXECUTE ON FUNCTION public.feedbot_enqueue(text, text, uuid, jsonb, text, text, text) FROM PUBLIC, anon, authenticated;
GRANT  EXECUTE ON FUNCTION public.feedbot_enqueue(text, text, uuid, jsonb, text, text, text) TO service_role;

REVOKE EXECUTE ON FUNCTION public.feedbot_enqueue_persona(text, text, uuid, jsonb, text, text, text, uuid) FROM PUBLIC, anon, authenticated;
GRANT  EXECUTE ON FUNCTION public.feedbot_enqueue_persona(text, text, uuid, jsonb, text, text, text, uuid) TO service_role;

-- 4) Cron dispatchers — invoked by pg_cron under postgres/service_role.
--    Direct callability from users would let anyone trigger outbound HTTP
--    requests using the feedbot hook secret.
REVOKE EXECUTE ON FUNCTION public.feedbot_dispatch_run() FROM PUBLIC, anon, authenticated;
GRANT  EXECUTE ON FUNCTION public.feedbot_dispatch_run() TO service_role;

REVOKE EXECUTE ON FUNCTION public.feedbot_summary_run() FROM PUBLIC, anon, authenticated;
GRANT  EXECUTE ON FUNCTION public.feedbot_summary_run() TO service_role;

-- 5) Trigger-only helpers — safe defense-in-depth revoke.
REVOKE EXECUTE ON FUNCTION public.hash_room_password() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.create_radio_widget_state() FROM PUBLIC, anon, authenticated;
