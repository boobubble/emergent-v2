
-- 1. user_devices: revoke sensitive columns from authenticated
REVOKE SELECT (ip_address, fingerprint) ON public.user_devices FROM authenticated;

-- 2. app_settings: restrict sensitive keys to admins only
DROP POLICY IF EXISTS "Authenticated read settings" ON public.app_settings;
CREATE POLICY "Authenticated read non-sensitive settings"
ON public.app_settings
FOR SELECT
TO authenticated
USING (
  key <> ALL (ARRAY['bots','automation','fake_activity','moderation','security','word_filters','ai_chatbots','admin_modules','staff_permissions','admin_roles','filters'])
  OR public.is_admin(auth.uid())
);

-- 3. messages: block banned users from reading lobby/games
DROP POLICY IF EXISTS "Read lobby games or friend DMs" ON public.messages;
CREATE POLICY "Read lobby games or friend DMs"
ON public.messages
FOR SELECT
TO authenticated
USING (
  NOT public.is_user_banned(auth.uid())
  AND (
    channel_id = 'lobby'
    OR channel_id = 'games'
    OR (channel_id LIKE 'dm:%' AND public.is_dm_channel_allowed(channel_id, auth.uid()))
  )
);

-- 4. realtime.messages: scope channel subscriptions
DROP POLICY IF EXISTS "Authenticated can subscribe to allowed channels" ON realtime.messages;
CREATE POLICY "Authenticated can subscribe to allowed channels"
ON realtime.messages
FOR SELECT
TO authenticated
USING (
  (realtime.topic() IN ('lobby','games'))
  OR (realtime.topic() LIKE 'dm:%' AND public.is_dm_channel_allowed(realtime.topic(), (SELECT auth.uid())))
  OR (realtime.topic() = 'notifications:' || (SELECT auth.uid())::text)
);
