CREATE TABLE public.ai_chatbots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  description text NOT NULL DEFAULT '',
  persona text NOT NULL DEFAULT 'You are a friendly community member. Keep replies short, casual, and human.',
  allowed_rooms text[] NOT NULL DEFAULT '{}',
  enabled boolean NOT NULL DEFAULT true,
  reply_chance numeric NOT NULL DEFAULT 0.6 CHECK (reply_chance >= 0 AND reply_chance <= 1),
  cooldown_sec integer NOT NULL DEFAULT 20,
  last_reply_at timestamptz,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.ai_chatbots TO authenticated;
GRANT ALL ON public.ai_chatbots TO service_role;

ALTER TABLE public.ai_chatbots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ai_chatbots readable by authenticated"
  ON public.ai_chatbots FOR SELECT TO authenticated USING (true);

CREATE POLICY "ai_chatbots managed by moderators"
  ON public.ai_chatbots FOR ALL TO authenticated
  USING (public.is_moderator(auth.uid()))
  WITH CHECK (public.is_moderator(auth.uid()));

CREATE TRIGGER ai_chatbots_set_updated_at
  BEFORE UPDATE ON public.ai_chatbots
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
