-- Ephemeral guest → registered-user private messages.
-- Guests never get auth.users rows. Writes are service-role only via server fns.
-- Channel namespace: gdm:{conversation_uuid}; pseudo-peer: guest:{visitor_id}

CREATE TABLE IF NOT EXISTS public.guest_dm_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id text NOT NULL,
  recipient_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  guest_display_name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  last_message_at timestamptz,
  recipient_last_read_at timestamptz,
  last_message_hash text,
  CONSTRAINT guest_dm_conversations_visitor_recipient_unique UNIQUE (visitor_id, recipient_id)
);

CREATE INDEX IF NOT EXISTS idx_guest_dm_conversations_recipient
  ON public.guest_dm_conversations (recipient_id, last_message_at DESC NULLS LAST);

CREATE INDEX IF NOT EXISTS idx_guest_dm_conversations_visitor
  ON public.guest_dm_conversations (visitor_id, expires_at);

CREATE INDEX IF NOT EXISTS idx_guest_dm_conversations_expires
  ON public.guest_dm_conversations (expires_at);

CREATE TABLE IF NOT EXISTS public.guest_dm_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.guest_dm_conversations(id) ON DELETE CASCADE,
  sender_kind text NOT NULL CHECK (sender_kind IN ('guest', 'registered')),
  text text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_guest_dm_messages_conversation_created
  ON public.guest_dm_messages (conversation_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_guest_dm_messages_expires
  ON public.guest_dm_messages (expires_at);

ALTER TABLE public.guest_dm_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guest_dm_messages ENABLE ROW LEVEL SECURITY;

-- Registered recipients may read their own non-expired conversations.
DROP POLICY IF EXISTS "Recipient reads guest dm conversations" ON public.guest_dm_conversations;
CREATE POLICY "Recipient reads guest dm conversations"
  ON public.guest_dm_conversations
  FOR SELECT
  TO authenticated
  USING (recipient_id = auth.uid() AND expires_at > now());

-- Recipients read messages in their conversations; anon may read via conversation_id
-- filter on realtime subscriptions (UUID is unguessable; guest session validated server-side).
DROP POLICY IF EXISTS "Read non-expired guest dm messages" ON public.guest_dm_messages;
CREATE POLICY "Read non-expired guest dm messages"
  ON public.guest_dm_messages
  FOR SELECT
  TO anon, authenticated
  USING (
    expires_at > now()
    AND EXISTS (
      SELECT 1
      FROM public.guest_dm_conversations c
      WHERE c.id = conversation_id
        AND c.expires_at > now()
    )
  );

-- No direct client writes (service role bypasses RLS).

-- Realtime
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.guest_dm_conversations;
  EXCEPTION WHEN duplicate_object THEN
    NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.guest_dm_messages;
  EXCEPTION WHEN duplicate_object THEN
    NULL;
  END;
END $$;

-- Feature flag (OFF by default, separate from guest_chat)
INSERT INTO public.app_settings (key, value, updated_at)
VALUES (
  'guest_dm',
  jsonb_build_object(
    'enabled', false,
    'messageCooldownSec', 3,
    'maxMessageLength', 280,
    'messageTtlMinutes', 120,
    'sessionTtlHours', 12
  ),
  now()
)
ON CONFLICT (key) DO NOTHING;
