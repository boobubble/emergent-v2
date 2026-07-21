
-- 1) communities_slug_history_public_read: remove public SELECT
DROP POLICY IF EXISTS "Slug history is public" ON public.community_slug_history;

-- 2) internal_link_clicks: explicit admin-only UPDATE/DELETE + URL length validation
CREATE POLICY "Admins update clicks" ON public.internal_link_clicks
  FOR UPDATE TO authenticated
  USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));
CREATE POLICY "Admins delete clicks" ON public.internal_link_clicks
  FOR DELETE TO authenticated
  USING (is_admin(auth.uid()));
ALTER TABLE public.internal_link_clicks
  DROP CONSTRAINT IF EXISTS internal_link_clicks_url_length_chk;
ALTER TABLE public.internal_link_clicks
  ADD CONSTRAINT internal_link_clicks_url_length_chk
  CHECK (
    (target_url IS NULL OR length(target_url) <= 2048)
    AND (source_url IS NULL OR length(source_url) <= 2048)
    AND (anchor_text IS NULL OR length(anchor_text) <= 512)
  );

-- 3) profile_views_viewer_id_column_exposure: revoke direct column read on viewer_id;
--    clients must use security-definer RPC get_my_profile_visitors which honors anonymous flag.
REVOKE SELECT (viewer_id) ON public.profile_views FROM authenticated;
REVOKE SELECT (viewer_id) ON public.profile_views FROM anon;

-- 4) trio_room_members_expires_at_race: consistently ignore expired invites everywhere.

-- 4a) Hide expired invited rows from member SELECT
DROP POLICY IF EXISTS "View own memberships" ON public.trio_room_members;
CREATE POLICY "View own memberships" ON public.trio_room_members
  FOR SELECT TO authenticated
  USING (
    (
      (user_id = auth.uid())
      OR is_trio_room_owner(room_id, auth.uid())
      OR is_admin(auth.uid())
    )
    AND NOT (
      status = 'invited'
      AND expires_at IS NOT NULL
      AND expires_at <= now()
    )
  );

-- 4b) Don't let expired invites count toward the 3-member limit
DROP POLICY IF EXISTS "Owner invites members" ON public.trio_room_members;
CREATE POLICY "Owner invites members" ON public.trio_room_members
  FOR INSERT TO authenticated
  WITH CHECK (
    invited_by = auth.uid()
    AND is_trio_room_owner(room_id, auth.uid())
    AND (
      SELECT count(*) FROM public.trio_room_members m
      WHERE m.room_id = trio_room_members.room_id
        AND (
          m.status = 'accepted'
          OR (m.status = 'invited' AND (m.expires_at IS NULL OR m.expires_at > now()))
        )
    ) < 3
  );

-- 4c) Update trio_rooms SELECT to require the invite still be unexpired (was already there
-- but re-assert with explicit expires_at revalidation for clarity/consistency)
DROP POLICY IF EXISTS "View own trio rooms" ON public.trio_rooms;
CREATE POLICY "View own trio rooms" ON public.trio_rooms
  FOR SELECT TO authenticated
  USING (
    owner_id = auth.uid()
    OR is_trio_member(id, auth.uid())
    OR is_admin(auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.trio_room_members m
      WHERE m.room_id = trio_rooms.id
        AND m.user_id = auth.uid()
        AND m.status = 'invited'
        AND m.expires_at IS NOT NULL
        AND m.expires_at > now()
    )
  );

-- 4d) Cleanup helper — callable by any authenticated user or by cron; marks expired
-- invited rows as 'rejected' so they no longer grant read access. Idempotent.
CREATE OR REPLACE FUNCTION public.cleanup_expired_trio_invites()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  n integer;
BEGIN
  UPDATE public.trio_room_members
     SET status = 'rejected'
   WHERE status = 'invited'
     AND expires_at IS NOT NULL
     AND expires_at <= now();
  GET DIAGNOSTICS n = ROW_COUNT;
  RETURN n;
END;
$$;
REVOKE ALL ON FUNCTION public.cleanup_expired_trio_invites() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.cleanup_expired_trio_invites() TO authenticated, service_role;
