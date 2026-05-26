
DROP POLICY IF EXISTS "Read lobby or own DMs" ON public.messages;
DROP POLICY IF EXISTS "Send as self to lobby or own DMs" ON public.messages;

CREATE POLICY "Read lobby games or own DMs" ON public.messages
FOR SELECT TO authenticated
USING (
  channel_id = 'lobby'
  OR channel_id = 'games'
  OR channel_id ~ ('^dm:' || auth.uid()::text || ':[0-9a-f-]{36}$')
  OR channel_id ~ ('^dm:[0-9a-f-]{36}:' || auth.uid()::text || '$')
);

CREATE POLICY "Send as self to lobby games or own DMs" ON public.messages
FOR INSERT TO authenticated
WITH CHECK (
  auth.uid() = author_id
  AND (
    channel_id = 'lobby'
    OR channel_id = 'games'
    OR channel_id ~ ('^dm:' || auth.uid()::text || ':[0-9a-f-]{36}$')
    OR channel_id ~ ('^dm:[0-9a-f-]{36}:' || auth.uid()::text || '$')
  )
);
