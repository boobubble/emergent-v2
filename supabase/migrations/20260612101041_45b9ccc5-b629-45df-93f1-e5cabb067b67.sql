ALTER TABLE public.assistant_user_prefs
  ADD COLUMN IF NOT EXISTS reward_daily_sent_on date,
  ADD COLUMN IF NOT EXISTS event_announced_id text,
  ADD COLUMN IF NOT EXISTS security_checked_at timestamptz;