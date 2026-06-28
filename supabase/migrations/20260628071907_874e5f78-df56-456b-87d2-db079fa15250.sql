
-- 1) chatrooms: column-level grants to hide password from non-owners
REVOKE SELECT ON public.chatrooms FROM authenticated, anon;
GRANT SELECT (
  id, owner_id, slug, name, description, category, cover_image_url, avatar_url,
  rules, welcome_message, theme_color, background_image_url, visibility,
  age_restricted, member_count, featured, archived_at, created_at, updated_at
) ON public.chatrooms TO authenticated, anon;
GRANT SELECT ON public.chatrooms TO service_role;

-- Owner/admin password access via RPC
CREATE OR REPLACE FUNCTION public.get_chatroom_password(_room uuid)
RETURNS text
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE pwd text;
BEGIN
  IF auth.uid() IS NULL THEN RETURN NULL; END IF;
  SELECT password INTO pwd FROM public.chatrooms
    WHERE id = _room AND (owner_id = auth.uid() OR public.is_admin(auth.uid()));
  RETURN pwd;
END;
$$;
REVOKE ALL ON FUNCTION public.get_chatroom_password(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_chatroom_password(uuid) TO authenticated;

-- Verify password without disclosing it
CREATE OR REPLACE FUNCTION public.verify_chatroom_password(_room uuid, _password text)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE stored text;
BEGIN
  IF auth.uid() IS NULL THEN RETURN false; END IF;
  SELECT password INTO stored FROM public.chatrooms WHERE id = _room;
  IF stored IS NULL OR stored = '' THEN RETURN true; END IF;
  RETURN COALESCE(_password,'') = stored;
END;
$$;
REVOKE ALL ON FUNCTION public.verify_chatroom_password(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.verify_chatroom_password(uuid, text) TO authenticated;

-- 2) feedback_reports: attach trigger that nulls device_info on showcased rows
DROP TRIGGER IF EXISTS scrub_feedback_device_info_on_showcase_trg ON public.feedback_reports;
CREATE TRIGGER scrub_feedback_device_info_on_showcase_trg
BEFORE INSERT OR UPDATE ON public.feedback_reports
FOR EACH ROW EXECUTE FUNCTION public.scrub_feedback_device_info_on_showcase();

-- Backfill: clear device_info on any currently showcased rows
UPDATE public.feedback_reports SET device_info = NULL
 WHERE is_showcased IS TRUE AND device_info IS NOT NULL;

-- 3) profile_views: remove direct INSERT policy; all writes must use record_profile_view RPC
DROP POLICY IF EXISTS "Viewer inserts own view" ON public.profile_views;
-- The SECURITY DEFINER function public.record_profile_view bypasses RLS and
-- already deduplicates (30-min window) plus honors privacy settings.
