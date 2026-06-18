
-- 1) MESSAGES: replace strict policies to cover lobby + games + DM (friend-checked) + trio (member-checked),
-- then drop the loose duplicates that bypassed the friendship check.

DROP POLICY IF EXISTS "Read lobby games or friend DMs" ON public.messages;
DROP POLICY IF EXISTS "Send as self to lobby games or friend DMs" ON public.messages;

CREATE POLICY "Read lobby games friend DMs or trio"
ON public.messages
FOR SELECT
TO authenticated
USING (
  NOT public.is_user_banned(auth.uid())
  AND (
    channel_id = 'lobby'
    OR channel_id = 'games'
    OR (channel_id LIKE 'dm:%' AND public.is_dm_channel_allowed(channel_id, auth.uid()))
    OR (channel_id LIKE 'trio:%' AND public.is_trio_channel_allowed(channel_id, auth.uid()))
  )
);

CREATE POLICY "Send as self to lobby games friend DMs or trio"
ON public.messages
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = author_id
  AND NOT public.is_user_banned(auth.uid())
  AND NOT public.is_user_muted(auth.uid(), channel_id)
  AND (
    channel_id = 'lobby'
    OR channel_id = 'games'
    OR (channel_id LIKE 'dm:%' AND public.is_dm_channel_allowed(channel_id, auth.uid()))
    OR (channel_id LIKE 'trio:%' AND public.is_trio_channel_allowed(channel_id, auth.uid()))
  )
);

DROP POLICY IF EXISTS "Read lobby games dms or trio" ON public.messages;
DROP POLICY IF EXISTS "Send to lobby games dms or trio" ON public.messages;

-- 2) ROOM_LOYALTY: restrict reads to the owner.
DROP POLICY IF EXISTS "Read all room loyalty" ON public.room_loyalty;

CREATE POLICY "Read own room loyalty"
ON public.room_loyalty
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 3) USER_BANS: hide ip_address from authenticated callers (column-level).
-- Existing RLS policies still control row visibility; this just blocks the column projection.
REVOKE SELECT (ip_address) ON public.user_bans FROM authenticated;
-- service_role retains full access via GRANT ALL.
