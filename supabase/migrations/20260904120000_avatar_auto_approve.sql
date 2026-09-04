-- Remove avatar approval requirement: auto-approve pending/quarantined avatars.
-- Profile pictures go live immediately on upload; this migrates existing rows.

UPDATE public.profiles
SET
  avatar_url = COALESCE(NULLIF(btrim(avatar_url), ''), avatar_quarantine_url),
  avatar_quarantine_url = NULL,
  avatar_moderation_status = 'approved',
  avatar_moderation_reason = 'migrated_auto_approved',
  avatar_moderated_at = COALESCE(avatar_moderated_at, now())
WHERE avatar_moderation_status IN ('pending', 'needs_review')
   OR (avatar_quarantine_url IS NOT NULL AND btrim(avatar_quarantine_url) <> '');

COMMENT ON COLUMN public.profiles.avatar_moderation_status IS
  'Avatar safety: none|pending|approved|needs_review|rejected. Uploads are auto-approved; rejected is admin-only.';
