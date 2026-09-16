-- Guest chat messages: support dynamic IRC room slugs (yaarzo-global, games, …).
-- Replaces obsolete CHECK (channel_id = 'lobby') from initial guest_chat_messages migration.

CREATE OR REPLACE FUNCTION public.is_valid_irc_channel_slug(slug text)
RETURNS boolean
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT
    slug IS NOT NULL
    AND length(slug) BETWEEN 1 AND 64
    AND slug ~ '^[a-z][a-z0-9-]*$'
    AND slug !~ '--'
    AND slug !~ '-$'
$$;

COMMENT ON FUNCTION public.is_valid_irc_channel_slug(text) IS
  'True for safe IRC public room slugs returned by gateway /rooms (not a fixed room list).';

ALTER TABLE public.guest_chat_messages
  DROP CONSTRAINT IF EXISTS guest_chat_messages_channel_id_check;

-- Normalize legacy lobby rows before adding slug CHECK.
UPDATE public.guest_chat_messages
SET channel_id = 'yaarzo-global'
WHERE channel_id = 'lobby';

ALTER TABLE public.guest_chat_messages
  ALTER COLUMN channel_id SET DEFAULT 'yaarzo-global';

ALTER TABLE public.guest_chat_messages
  ADD CONSTRAINT guest_chat_messages_channel_id_check
  CHECK (public.is_valid_irc_channel_slug(channel_id));

DROP POLICY IF EXISTS "Read non-expired guest lobby messages" ON public.guest_chat_messages;

CREATE POLICY "Read non-expired guest lobby messages"
  ON public.guest_chat_messages
  FOR SELECT
  TO anon, authenticated
  USING (
    public.is_valid_irc_channel_slug(channel_id)
    AND expires_at > now()
  );
