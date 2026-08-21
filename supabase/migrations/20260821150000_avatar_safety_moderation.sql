-- Avatar Safety / Profile Image Moderation
-- DO NOT apply via `supabase db push` if migration history is mismatched.
-- Apply carefully via Supabase SQL Editor (or controlled migration apply) after review.
-- Does NOT change social_signup_enabled or Buffer channel config.

-- ---------------------------------------------------------------------------
-- 1) Profile moderation columns
-- ---------------------------------------------------------------------------
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS avatar_moderation_status text NOT NULL DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS avatar_moderation_reason text,
  ADD COLUMN IF NOT EXISTS avatar_moderated_at timestamptz,
  ADD COLUMN IF NOT EXISTS avatar_moderated_by uuid,
  ADD COLUMN IF NOT EXISTS avatar_quarantine_url text;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'profiles_avatar_moderation_status_check'
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_avatar_moderation_status_check
      CHECK (
        avatar_moderation_status = ANY (ARRAY[
          'none'::text,
          'pending'::text,
          'approved'::text,
          'needs_review'::text,
          'rejected'::text
        ])
      );
  END IF;
END $$;

COMMENT ON COLUMN public.profiles.avatar_moderation_status IS
  'Avatar safety: none|pending|approved|needs_review|rejected. Only approved may be sent to Buffer.';
COMMENT ON COLUMN public.profiles.avatar_quarantine_url IS
  'Hidden/quarantined avatar URL for admin review (not shown publicly).';

-- Existing avatars: pending (never auto-approved). No avatar: none.
UPDATE public.profiles
SET
  avatar_moderation_status = CASE
    WHEN avatar_url IS NOT NULL AND btrim(avatar_url) <> '' THEN 'pending'
    ELSE 'none'
  END,
  avatar_moderation_reason = CASE
    WHEN avatar_url IS NOT NULL AND btrim(avatar_url) <> '' THEN 'awaiting_review_existing_avatar'
    ELSE NULL
  END
WHERE avatar_moderation_status = 'none'
   OR avatar_moderation_status IS NULL;

CREATE INDEX IF NOT EXISTS profiles_avatar_moderation_status_idx
  ON public.profiles (avatar_moderation_status, updated_at DESC);

-- ---------------------------------------------------------------------------
-- 2) Audit log
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profile_image_moderation_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  avatar_url text,
  action text NOT NULL,
  reason text,
  moderator_id uuid,
  source text NOT NULL DEFAULT 'automatic'
    CHECK (source = ANY (ARRAY['automatic'::text, 'admin'::text])),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS profile_image_moderation_logs_user_idx
  ON public.profile_image_moderation_logs (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS profile_image_moderation_logs_created_idx
  ON public.profile_image_moderation_logs (created_at DESC);

ALTER TABLE public.profile_image_moderation_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profile_image_moderation_logs admin all" ON public.profile_image_moderation_logs;
CREATE POLICY "profile_image_moderation_logs admin all"
  ON public.profile_image_moderation_logs
  FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

GRANT SELECT, INSERT ON public.profile_image_moderation_logs TO authenticated;
GRANT ALL ON public.profile_image_moderation_logs TO service_role;

-- Users can read their own moderation status fields via existing profiles RLS
-- (no change required if they already can select own profile).
