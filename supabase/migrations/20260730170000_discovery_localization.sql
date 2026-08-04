-- Yaarzo platform-wide discovery & localization

-- Admin-managed interest taxonomy (maps to profiles.interests slugs/labels)
CREATE TABLE IF NOT EXISTS public.interest_tags (
  slug text PRIMARY KEY,
  label text NOT NULL,
  emoji text,
  sort_order int NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.interest_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone reads active interest tags"
  ON public.interest_tags FOR SELECT
  USING (active = true OR public.is_admin(auth.uid()));

CREATE POLICY "Admins manage interest tags"
  ON public.interest_tags FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

INSERT INTO public.interest_tags (slug, label, emoji, sort_order) VALUES
  ('friendship', 'Friendship', '🤝', 10),
  ('music', 'Music', '🎵', 20),
  ('gaming', 'Gaming', '🎮', 30),
  ('poetry', 'Poetry', '✍️', 40),
  ('memes', 'Memes', '😂', 50),
  ('movies', 'Movies', '🎬', 60),
  ('sports', 'Sports', '⚽', 70),
  ('technology', 'Technology', '💻', 80),
  ('dating', 'Dating', '💕', 90),
  ('general-chat', 'General Chat', '💬', 100)
ON CONFLICT (slug) DO NOTHING;

-- Per-user discovery preferences (extends profiles, does not replace)
CREATE TABLE IF NOT EXISTS public.user_discovery_prefs (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  discovery_country_code text,
  preferred_languages text[] NOT NULL DEFAULT '{}',
  interests text[] NOT NULL DEFAULT '{}',
  selected_channel_ids text[] NOT NULL DEFAULT '{}',
  content_scope text NOT NULL DEFAULT 'for_you',
  detected_country_code text,
  discovery_onboarding_completed_at timestamptz,
  personalize_prompt_dismissed_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_discovery_prefs_country
  ON public.user_discovery_prefs (discovery_country_code);

ALTER TABLE public.user_discovery_prefs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own discovery prefs"
  ON public.user_discovery_prefs FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR public.is_admin(auth.uid()));

CREATE POLICY "Users upsert own discovery prefs"
  ON public.user_discovery_prefs FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users update own discovery prefs"
  ON public.user_discovery_prefs FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins manage discovery prefs"
  ON public.user_discovery_prefs FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

CREATE TRIGGER trg_user_discovery_prefs_updated
  BEFORE UPDATE ON public.user_discovery_prefs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Chatroom audience metadata (community DB rooms)
ALTER TABLE public.chatrooms
  ADD COLUMN IF NOT EXISTS audience_scope text NOT NULL DEFAULT 'global',
  ADD COLUMN IF NOT EXISTS country_code text,
  ADD COLUMN IF NOT EXISTS allowed_country_codes text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS language_codes text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS interest_slugs text[] NOT NULL DEFAULT '{}';

CREATE INDEX IF NOT EXISTS idx_chatrooms_audience_country
  ON public.chatrooms (audience_scope, country_code)
  WHERE archived_at IS NULL;

COMMENT ON COLUMN public.chatrooms.audience_scope IS 'global | single_country | multi_country | private';

GRANT SELECT ON public.interest_tags TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_discovery_prefs TO authenticated;
GRANT ALL ON public.interest_tags TO service_role;
GRANT ALL ON public.user_discovery_prefs TO service_role;
