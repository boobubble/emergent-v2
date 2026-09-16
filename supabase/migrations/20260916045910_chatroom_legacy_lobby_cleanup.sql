-- Chatroom legacy cleanup: migrate Supabase message archive off channel_id = 'lobby'.
-- IRC #yaarzo-global and #games remain authoritative for live public rooms.

UPDATE public.messages
SET channel_id = 'yaarzo-global'
WHERE channel_id = 'lobby';

DROP POLICY IF EXISTS "Public read lobby messages" ON public.messages;

CREATE POLICY "Public read yaarzo-global messages"
  ON public.messages
  FOR SELECT
  TO anon
  USING (channel_id = 'yaarzo-global');

DROP POLICY IF EXISTS "Read lobby games friend DMs or trio" ON public.messages;

CREATE POLICY "Read yaarzo-global games friend DMs or trio"
  ON public.messages
  FOR SELECT
  TO authenticated
  USING (
    NOT public.is_user_banned(auth.uid())
    AND (
      channel_id = 'yaarzo-global'
      OR channel_id = 'games'
      OR (channel_id LIKE 'dm:%' AND public.is_dm_channel_allowed(channel_id, auth.uid()))
      OR (channel_id LIKE 'trio:%' AND public.is_trio_channel_allowed(channel_id, auth.uid()))
    )
  );

DROP POLICY IF EXISTS "Send as self to lobby games friend DMs or trio" ON public.messages;

CREATE POLICY "Send as self to yaarzo-global games friend DMs or trio"
  ON public.messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = author_id
    AND NOT public.is_user_banned(auth.uid())
    AND NOT public.is_user_muted(auth.uid(), channel_id)
    AND (
      channel_id = 'yaarzo-global'
      OR channel_id = 'games'
      OR (channel_id LIKE 'dm:%' AND public.is_dm_channel_allowed(channel_id, auth.uid()))
      OR (channel_id LIKE 'trio:%' AND public.is_trio_channel_allowed(channel_id, auth.uid()))
    )
  );
