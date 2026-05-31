
-- Enums
CREATE TYPE public.feedback_category AS ENUM ('bug','feature','ui','performance','security','other');
CREATE TYPE public.feedback_status AS ENUM ('open','investigating','planned','in_progress','fixed','closed','rejected');
CREATE TYPE public.feedback_priority AS ENUM ('low','normal','high','critical');

-- Reports
CREATE TABLE public.feedback_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid NOT NULL,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  category public.feedback_category NOT NULL DEFAULT 'bug',
  status public.feedback_status NOT NULL DEFAULT 'open',
  priority public.feedback_priority NOT NULL DEFAULT 'normal',
  screenshots text[] NOT NULL DEFAULT '{}',
  url text,
  device_info jsonb,
  is_pinned boolean NOT NULL DEFAULT false,
  upvote_count integer NOT NULL DEFAULT 0,
  comment_count integer NOT NULL DEFAULT 0,
  duplicate_of uuid REFERENCES public.feedback_reports(id) ON DELETE SET NULL,
  admin_note text,
  resolved_at timestamptz,
  resolved_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_feedback_status ON public.feedback_reports(status);
CREATE INDEX idx_feedback_category ON public.feedback_reports(category);
CREATE INDEX idx_feedback_created ON public.feedback_reports(created_at DESC);
CREATE INDEX idx_feedback_upvotes ON public.feedback_reports(upvote_count DESC);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.feedback_reports TO authenticated;
GRANT ALL ON public.feedback_reports TO service_role;

ALTER TABLE public.feedback_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated reads reports"
  ON public.feedback_reports FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users create own reports"
  ON public.feedback_reports FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = author_id AND NOT public.is_user_banned(auth.uid()));

CREATE POLICY "Users update own open reports"
  ON public.feedback_reports FOR UPDATE TO authenticated
  USING (auth.uid() = author_id AND status = 'open')
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors delete own reports"
  ON public.feedback_reports FOR DELETE TO authenticated
  USING (auth.uid() = author_id);

CREATE POLICY "Admins manage reports"
  ON public.feedback_reports FOR ALL TO authenticated
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- Comments
CREATE TABLE public.feedback_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id uuid NOT NULL REFERENCES public.feedback_reports(id) ON DELETE CASCADE,
  author_id uuid NOT NULL,
  text text NOT NULL,
  is_admin_response boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_feedback_comments_report ON public.feedback_comments(report_id, created_at);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.feedback_comments TO authenticated;
GRANT ALL ON public.feedback_comments TO service_role;

ALTER TABLE public.feedback_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Read comments" ON public.feedback_comments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Insert own comment" ON public.feedback_comments FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = author_id AND NOT public.is_user_banned(auth.uid()));
CREATE POLICY "Delete own or admin" ON public.feedback_comments FOR DELETE TO authenticated
  USING (auth.uid() = author_id OR public.is_admin(auth.uid()));

-- Votes
CREATE TABLE public.feedback_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id uuid NOT NULL REFERENCES public.feedback_reports(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (report_id, user_id)
);

GRANT SELECT, INSERT, DELETE ON public.feedback_votes TO authenticated;
GRANT ALL ON public.feedback_votes TO service_role;

ALTER TABLE public.feedback_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Read votes" ON public.feedback_votes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Insert own vote" ON public.feedback_votes FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Delete own vote" ON public.feedback_votes FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Counters
CREATE OR REPLACE FUNCTION public.bump_feedback_vote_count()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.feedback_reports SET upvote_count = upvote_count + 1 WHERE id = NEW.report_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.feedback_reports SET upvote_count = GREATEST(upvote_count - 1, 0) WHERE id = OLD.report_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END $$;

CREATE TRIGGER trg_feedback_vote_count
AFTER INSERT OR DELETE ON public.feedback_votes
FOR EACH ROW EXECUTE FUNCTION public.bump_feedback_vote_count();

CREATE OR REPLACE FUNCTION public.bump_feedback_comment_count()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.feedback_reports SET comment_count = comment_count + 1 WHERE id = NEW.report_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.feedback_reports SET comment_count = GREATEST(comment_count - 1, 0) WHERE id = OLD.report_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END $$;

CREATE TRIGGER trg_feedback_comment_count
AFTER INSERT OR DELETE ON public.feedback_comments
FOR EACH ROW EXECUTE FUNCTION public.bump_feedback_comment_count();

CREATE TRIGGER trg_feedback_updated_at
BEFORE UPDATE ON public.feedback_reports
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
