-- Social automation (Buffer) — Phase 1
-- Non-critical path: failures must never affect signup / internal feed.

-- ---------------------------------------------------------------------------
-- 1) Profile consent
-- ---------------------------------------------------------------------------
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS allow_social_feature boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN public.profiles.allow_social_feature IS
  'Opt-in: when true, Yaarzo may feature this public profile on external social channels. Default false; user must explicitly consent.';

-- ---------------------------------------------------------------------------
-- 2) Connected Buffer channels
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.social_channels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform text NOT NULL,
  buffer_channel_id text NOT NULL UNIQUE,
  channel_name text,
  display_name text,
  avatar_url text,
  enabled boolean NOT NULL DEFAULT false,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT social_channels_platform_check CHECK (
    platform = ANY (ARRAY[
      'facebook'::text,
      'x'::text,
      'twitter'::text,
      'tiktok'::text,
      'instagram'::text,
      'linkedin'::text,
      'threads'::text,
      'youtube'::text,
      'other'::text
    ])
  )
);

CREATE INDEX IF NOT EXISTS social_channels_platform_idx
  ON public.social_channels (platform);
CREATE INDEX IF NOT EXISTS social_channels_enabled_idx
  ON public.social_channels (enabled)
  WHERE enabled = true;

ALTER TABLE public.social_channels ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "social_channels admin all" ON public.social_channels;
CREATE POLICY "social_channels admin all"
  ON public.social_channels
  FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

GRANT SELECT, INSERT, UPDATE, DELETE ON public.social_channels TO authenticated;
GRANT ALL ON public.social_channels TO service_role;

-- ---------------------------------------------------------------------------
-- 3) Settings (singleton)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.social_automation_settings (
  id boolean PRIMARY KEY DEFAULT true CHECK (id = true),
  social_signup_enabled boolean NOT NULL DEFAULT false,
  daily_signup_post_limit integer NOT NULL DEFAULT 10,
  minimum_post_interval_minutes integer NOT NULL DEFAULT 30,
  publishing_mode text NOT NULL DEFAULT 'queue'
    CHECK (publishing_mode = ANY (ARRAY['queue'::text, 'immediate'::text])),
  buffer_organization_id text,
  buffer_organization_name text,
  default_media_url text,
  site_base_url text DEFAULT 'https://yaarzo.com',
  hook_secret text,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid
);

INSERT INTO public.social_automation_settings (id)
VALUES (true)
ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.social_automation_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "social_automation_settings admin all" ON public.social_automation_settings;
CREATE POLICY "social_automation_settings admin all"
  ON public.social_automation_settings
  FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

GRANT SELECT, INSERT, UPDATE ON public.social_automation_settings TO authenticated;
GRANT ALL ON public.social_automation_settings TO service_role;

-- ---------------------------------------------------------------------------
-- 4) Caption templates
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.social_caption_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform text NOT NULL UNIQUE,
  template text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.social_caption_templates (platform, template) VALUES
(
  'facebook',
  E'🎉 {{display_name}} just joined Yaarzo!\nSay hello to our newest community member 👋\n💬 Meet {{display_name}}:\n{{profile_url}}\n#Yaarzo #NewMember #Community #Chat'
),
(
  'x',
  E'🎉 {{display_name}} just joined Yaarzo!\nSay hello 👋\n{{profile_url}}\n#Yaarzo #NewMember'
),
(
  'tiktok',
  E'🎉 Welcome {{display_name}} to Yaarzo 👋\nMeet new people and start a conversation.\n{{profile_url}}\n#Yaarzo #NewMember #Chat #Community'
),
(
  'instagram',
  E'🎉 {{display_name}} just joined Yaarzo!\nSay hello to our newest community member 👋\n{{profile_url}}\n#Yaarzo #NewMember #Community'
)
ON CONFLICT (platform) DO NOTHING;

ALTER TABLE public.social_caption_templates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "social_caption_templates admin all" ON public.social_caption_templates;
CREATE POLICY "social_caption_templates admin all"
  ON public.social_caption_templates
  FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

GRANT SELECT, INSERT, UPDATE, DELETE ON public.social_caption_templates TO authenticated;
GRANT ALL ON public.social_caption_templates TO service_role;

-- ---------------------------------------------------------------------------
-- 5) Post logs
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.social_post_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  platform text NOT NULL,
  buffer_channel_id text,
  buffer_post_id text,
  caption text,
  media_url text,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status = ANY (ARRAY[
      'pending'::text,
      'queued'::text,
      'published'::text,
      'failed'::text,
      'skipped'::text
    ])),
  error_message text,
  queue_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  published_at timestamptz
);

CREATE INDEX IF NOT EXISTS social_post_logs_created_idx
  ON public.social_post_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS social_post_logs_status_idx
  ON public.social_post_logs (status);
CREATE INDEX IF NOT EXISTS social_post_logs_user_idx
  ON public.social_post_logs (user_id);

ALTER TABLE public.social_post_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "social_post_logs admin select" ON public.social_post_logs;
CREATE POLICY "social_post_logs admin select"
  ON public.social_post_logs
  FOR SELECT
  TO authenticated
  USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "social_post_logs admin write" ON public.social_post_logs;
CREATE POLICY "social_post_logs admin write"
  ON public.social_post_logs
  FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

GRANT SELECT, INSERT, UPDATE, DELETE ON public.social_post_logs TO authenticated;
GRANT ALL ON public.social_post_logs TO service_role;

-- ---------------------------------------------------------------------------
-- 6) Queue (dedupe per user + event)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.social_post_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status = ANY (ARRAY[
      'pending'::text,
      'processing'::text,
      'completed'::text,
      'failed'::text,
      'skipped'::text
    ])),
  attempts integer NOT NULL DEFAULT 0,
  next_attempt_at timestamptz,
  last_error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  processed_at timestamptz,
  CONSTRAINT social_post_queue_user_event_unique UNIQUE (user_id, event_type)
);

CREATE INDEX IF NOT EXISTS social_post_queue_pending_idx
  ON public.social_post_queue (status, next_attempt_at, created_at)
  WHERE status IN ('pending', 'failed');

ALTER TABLE public.social_post_queue ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "social_post_queue admin all" ON public.social_post_queue;
CREATE POLICY "social_post_queue admin all"
  ON public.social_post_queue
  FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

GRANT SELECT, INSERT, UPDATE, DELETE ON public.social_post_queue TO authenticated;
GRANT ALL ON public.social_post_queue TO service_role;

-- ---------------------------------------------------------------------------
-- 7) Enqueue helper (safe, never raises to caller signup path)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.social_enqueue_signup(_user_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _id uuid;
BEGIN
  INSERT INTO public.social_post_queue (event_type, user_id, status)
  VALUES ('new_signup', _user_id, 'pending')
  ON CONFLICT (user_id, event_type) DO NOTHING
  RETURNING id INTO _id;
  RETURN _id;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'social_enqueue_signup failed for %: %', _user_id, SQLERRM;
  RETURN NULL;
END;
$$;

CREATE OR REPLACE FUNCTION public.trg_social_enqueue_on_new_member()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Non-blocking: enqueue only. Publishing is gated by social_signup_enabled
  -- in the processor (default OFF). Internal feed / FeedBot unchanged.
  PERFORM public.social_enqueue_signup(NEW.id);
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'trg_social_enqueue_on_new_member failed: %', SQLERRM;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_social_enqueue_on_new_member ON public.profiles;
CREATE TRIGGER trg_social_enqueue_on_new_member
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_social_enqueue_on_new_member();

-- ---------------------------------------------------------------------------
-- 8) Public storage bucket for default social images
-- ---------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('social-media', 'social-media', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "social-media public read" ON storage.objects;
CREATE POLICY "social-media public read"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'social-media');

DROP POLICY IF EXISTS "social-media admin write" ON storage.objects;
CREATE POLICY "social-media admin write"
  ON storage.objects
  FOR ALL
  TO authenticated
  USING (bucket_id = 'social-media' AND public.is_admin(auth.uid()))
  WITH CHECK (bucket_id = 'social-media' AND public.is_admin(auth.uid()));

-- ---------------------------------------------------------------------------
-- 9) Hook secret (admin-only via settings table; also mirror exclusion pattern)
-- ---------------------------------------------------------------------------
UPDATE public.social_automation_settings
SET hook_secret = encode(gen_random_bytes(24), 'hex')
WHERE id = true AND (hook_secret IS NULL OR length(hook_secret) < 16);
