ALTER TYPE feedback_category ADD VALUE IF NOT EXISTS 'improvement';

ALTER TABLE public.feedback_reports
  ADD COLUMN IF NOT EXISTS is_anonymous boolean NOT NULL DEFAULT false;

ALTER PUBLICATION supabase_realtime ADD TABLE public.feedback_reports;
ALTER PUBLICATION supabase_realtime ADD TABLE public.feedback_comments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.feedback_votes;