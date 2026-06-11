ALTER TABLE public.assistant_user_prefs
  ADD COLUMN IF NOT EXISTS mission_daily_sent_on date,
  ADD COLUMN IF NOT EXISTS mission_weekly_sent_on date;