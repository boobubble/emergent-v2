-- Phase 1F-B: durable IRC public message reactions (gateway-mediated, not IRC PRIVMSG).

CREATE TABLE IF NOT EXISTS public.irc_message_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL,
  room_key TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  reaction_type TEXT NOT NULL CHECK (reaction_type IN ('heart', 'laugh', 'fire', 'like')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (message_id, user_id, reaction_type)
);

CREATE INDEX IF NOT EXISTS irc_message_reactions_room_message_idx
  ON public.irc_message_reactions (room_key, message_id);

CREATE INDEX IF NOT EXISTS irc_message_reactions_message_idx
  ON public.irc_message_reactions (message_id);

CREATE INDEX IF NOT EXISTS irc_message_reactions_created_at_idx
  ON public.irc_message_reactions (created_at);

ALTER TABLE public.irc_message_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "irc message reactions read authenticated"
  ON public.irc_message_reactions
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "irc message reactions insert own"
  ON public.irc_message_reactions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "irc message reactions delete own"
  ON public.irc_message_reactions
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

GRANT SELECT, INSERT, DELETE ON public.irc_message_reactions TO authenticated;
GRANT ALL ON public.irc_message_reactions TO service_role;
