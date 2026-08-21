-- Privacy fix: allow_social_feature is opt-in (default false).
-- Existing users are not eligible for external social promotion unless they
-- explicitly opt in. Internal feed / FeedBot / Buffer wiring unchanged.
-- social_signup_enabled is intentionally left untouched (must stay OFF).

-- 1) New default for future inserts
ALTER TABLE public.profiles
  ALTER COLUMN allow_social_feature SET DEFAULT false;

COMMENT ON COLUMN public.profiles.allow_social_feature IS
  'Opt-in: when true, Yaarzo may feature this public profile on external social channels. Default false; user must explicitly consent.';

-- 2) Existing users: force false (column previously defaulted true without consent)
UPDATE public.profiles
SET allow_social_feature = false
WHERE allow_social_feature IS DISTINCT FROM false;

-- 3) Protect pending/failed queue rows for users without explicit consent
UPDATE public.social_post_queue q
SET
  status = 'skipped',
  last_error = 'social_feature_not_allowed',
  processed_at = COALESCE(q.processed_at, now())
FROM public.profiles p
WHERE q.user_id = p.id
  AND q.event_type = 'new_signup'
  AND q.status IN ('pending', 'failed', 'processing')
  AND COALESCE(p.allow_social_feature, false) = false;

-- 4) Log skips for audit (one system row per protected queue item)
INSERT INTO public.social_post_logs (
  event_type,
  user_id,
  platform,
  status,
  error_message,
  queue_id
)
SELECT
  q.event_type,
  q.user_id,
  'system',
  'skipped',
  'social_feature_not_allowed',
  q.id
FROM public.social_post_queue q
JOIN public.profiles p ON p.id = q.user_id
WHERE q.event_type = 'new_signup'
  AND q.status = 'skipped'
  AND q.last_error = 'social_feature_not_allowed'
  AND COALESCE(p.allow_social_feature, false) = false
  AND NOT EXISTS (
    SELECT 1
    FROM public.social_post_logs l
    WHERE l.queue_id = q.id
      AND l.status = 'skipped'
      AND l.error_message = 'social_feature_not_allowed'
  );
