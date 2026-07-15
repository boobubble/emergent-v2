-- Mask linked_user_id for anonymous users on competition_competitors
REVOKE SELECT (linked_user_id) ON public.competition_competitors FROM anon;

-- Add topic-scoped INSERT policy on realtime.messages for broadcast/presence
DROP POLICY IF EXISTS "Authenticated can broadcast to allowed channels" ON realtime.messages;
CREATE POLICY "Authenticated can broadcast to allowed channels"
ON realtime.messages
FOR INSERT
TO authenticated
WITH CHECK (
  (realtime.topic() = ANY (ARRAY['lobby'::text, 'games'::text]))
  OR ((realtime.topic() LIKE 'dm:%') AND public.is_dm_channel_allowed(realtime.topic(), (SELECT auth.uid())))
  OR ((realtime.topic() LIKE 'trio:%') AND public.is_trio_channel_allowed(realtime.topic(), (SELECT auth.uid())))
  OR (realtime.topic() = ('notifications:' || ((SELECT auth.uid()))::text))
);