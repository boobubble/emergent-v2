ALTER TABLE public.feedback_reports
  ADD COLUMN IF NOT EXISTS is_showcased boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_feedback_reports_showcased
  ON public.feedback_reports (is_showcased, created_at DESC)
  WHERE is_showcased = true;