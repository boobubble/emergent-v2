-- Shared messages table for the lobby room and user-to-user DMs
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  channel_id TEXT NOT NULL,
  author_id UUID NOT NULL,
  text TEXT NOT NULL DEFAULT '',
  kind TEXT NOT NULL DEFAULT 'text',
  attachment JSONB,
  reply_to_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_messages_channel_created ON public.messages (channel_id, created_at);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Any authenticated user can read messages in lobby or in a DM they're part of
CREATE POLICY "Read lobby or own DMs"
  ON public.messages FOR SELECT
  TO authenticated
  USING (
    channel_id = 'lobby'
    OR (
      channel_id LIKE 'dm:%'
      AND POSITION(auth.uid()::text IN channel_id) > 0
    )
  );

-- Users can only insert as themselves, into lobby or a DM they're part of
CREATE POLICY "Send as self to lobby or own DMs"
  ON public.messages FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = author_id
    AND (
      channel_id = 'lobby'
      OR (
        channel_id LIKE 'dm:%'
        AND POSITION(auth.uid()::text IN channel_id) > 0
      )
    )
  );

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER TABLE public.messages REPLICA IDENTITY FULL;