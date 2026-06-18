
-- 1. Fix mutable search_path on trio_channel_room
CREATE OR REPLACE FUNCTION public.trio_channel_room(_channel text)
RETURNS uuid
LANGUAGE sql
IMMUTABLE
SET search_path TO 'public'
AS $$
  SELECT CASE WHEN _channel ~ '^trio:[0-9a-f-]{36}$' THEN substring(_channel from 6)::uuid ELSE NULL END
$$;

-- 2. Explicit deny SELECT on dj_broadcast_credentials for non-admin roles
DROP POLICY IF EXISTS "Deny non-admin select on dj credentials" ON public.dj_broadcast_credentials;
CREATE POLICY "Deny non-admin select on dj credentials"
ON public.dj_broadcast_credentials
AS RESTRICTIVE
FOR SELECT
TO anon, authenticated
USING (public.is_admin(auth.uid()));

-- 3. Extend realtime.messages policy to cover trio channels
DROP POLICY IF EXISTS "Authenticated can subscribe to allowed channels" ON realtime.messages;
CREATE POLICY "Authenticated can subscribe to allowed channels"
ON realtime.messages
FOR SELECT
TO authenticated
USING (
  (realtime.topic() = ANY (ARRAY['lobby'::text, 'games'::text]))
  OR ((realtime.topic() LIKE 'dm:%') AND public.is_dm_channel_allowed(realtime.topic(), (SELECT auth.uid())))
  OR ((realtime.topic() LIKE 'trio:%') AND public.is_trio_channel_allowed(realtime.topic(), (SELECT auth.uid())))
  OR (realtime.topic() = ('notifications:' || ((SELECT auth.uid()))::text))
);
