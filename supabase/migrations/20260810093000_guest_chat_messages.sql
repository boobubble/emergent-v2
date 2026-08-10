-- Ephemeral Lobby-only guest chat.
-- Does NOT create auth.users or profiles. Writes go through service-role server fns.
-- Registered-user messages RLS is unchanged except additive anon SELECT on lobby (read-only).

CREATE TABLE IF NOT EXISTS public.guest_chat_sessions (
  visitor_id text PRIMARY KEY,
  nickname text NOT NULL,
  display_name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  last_message_at timestamptz,
  last_message_hash text
);

CREATE INDEX IF NOT EXISTS idx_guest_chat_sessions_expires
  ON public.guest_chat_sessions (expires_at);

CREATE TABLE IF NOT EXISTS public.guest_chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id text NOT NULL DEFAULT 'lobby'
    CHECK (channel_id = 'lobby'),
  visitor_id text NOT NULL,
  display_name text NOT NULL,
  text text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_guest_chat_messages_lobby_created
  ON public.guest_chat_messages (channel_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_guest_chat_messages_expires
  ON public.guest_chat_messages (expires_at);

ALTER TABLE public.guest_chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guest_chat_messages ENABLE ROW LEVEL SECURITY;

-- No direct client writes. Service role bypasses RLS.
DROP POLICY IF EXISTS "Read non-expired guest lobby messages" ON public.guest_chat_messages;
CREATE POLICY "Read non-expired guest lobby messages"
  ON public.guest_chat_messages
  FOR SELECT
  TO anon, authenticated
  USING (channel_id = 'lobby' AND expires_at > now());

-- Sessions are never readable/writable from the client.
-- (service role only)

-- Public read-only lobby messages for logged-out visitors (SELECT only).
-- Does not alter INSERT/UPDATE/DELETE policies for registered users.
DROP POLICY IF EXISTS "Public read lobby messages" ON public.messages;
CREATE POLICY "Public read lobby messages"
  ON public.messages
  FOR SELECT
  TO anon
  USING (channel_id = 'lobby');

-- Realtime for guest messages
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.guest_chat_messages;
  EXCEPTION WHEN duplicate_object THEN
    NULL;
  END;
END $$;

-- Default setting (OFF)
INSERT INTO public.app_settings (key, value, updated_at)
VALUES (
  'guest_chat',
  '{"enabled":false,"namePrefix":"Guest-","nicknameMinLength":2,"nicknameMaxLength":16,"messageCooldownSec":3,"maxMessageLength":280,"messageTtlMinutes":120,"sessionTtlHours":12}'::jsonb,
  now()
)
ON CONFLICT (key) DO NOTHING;