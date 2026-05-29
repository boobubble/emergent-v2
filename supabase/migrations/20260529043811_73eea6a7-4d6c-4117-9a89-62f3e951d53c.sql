
-- =========================================
-- Roles
-- =========================================
CREATE TYPE public.app_role AS ENUM ('super_admin', 'admin', 'moderator', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role IN ('super_admin','admin')
  );
$$;

CREATE POLICY "Read own roles" ON public.user_roles FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

-- Seed JD as super_admin
INSERT INTO public.user_roles (user_id, role)
VALUES ('ba8965f8-944b-4fbb-815d-7e76d954558f', 'super_admin')
ON CONFLICT DO NOTHING;

-- =========================================
-- App settings (key/value)
-- =========================================
CREATE TABLE public.app_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid
);

GRANT SELECT ON public.app_settings TO authenticated, anon;
GRANT ALL ON public.app_settings TO service_role;

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read settings" ON public.app_settings FOR SELECT TO authenticated, anon USING (true);

-- Seed defaults
INSERT INTO public.app_settings (key, value) VALUES
  ('layout_priority', '"chatrooms_first"'::jsonb),
  ('modules', '{
    "wallet": true,
    "gif": true,
    "badges": true,
    "games": true,
    "feed": true,
    "reactions": true,
    "voice": false,
    "ai": true,
    "emojis": true,
    "streaks": true,
    "referrals": false,
    "notifications": true
  }'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- =========================================
-- SEO settings per page
-- =========================================
CREATE TABLE public.seo_settings (
  page_key text PRIMARY KEY,
  title text,
  description text,
  keywords text,
  og_title text,
  og_description text,
  og_image text,
  twitter_card text DEFAULT 'summary_large_image',
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid
);

GRANT SELECT ON public.seo_settings TO authenticated, anon;
GRANT ALL ON public.seo_settings TO service_role;

ALTER TABLE public.seo_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read seo" ON public.seo_settings FOR SELECT TO authenticated, anon USING (true);

INSERT INTO public.seo_settings (page_key, title, description) VALUES
  ('home', 'Palrgo — Chat rooms & community', 'Realtime chatrooms, social feed, games and rewards.'),
  ('feed', 'Social Feed — Palrgo', 'See posts from friends and the community.'),
  ('games', 'Games — Palrgo', 'Play live multiplayer games with friends.'),
  ('find-friends', 'Find Friends — Palrgo', 'Discover and connect with new people.'),
  ('leaderboard', 'Leaderboard — Palrgo', 'Top players by XP and streaks.')
ON CONFLICT DO NOTHING;
