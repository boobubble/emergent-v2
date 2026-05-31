
-- ============ Enums ============
DO $$ BEGIN
  CREATE TYPE public.confession_kind AS ENUM ('text','poll','image','question','advice');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.confession_status AS ENUM ('pending','approved','rejected');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.confession_display_mode AS ENUM ('fully_anonymous','random_id','random_avatar','username');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.confession_reaction_type AS ENUM ('like','funny','shock','sad','hot','love');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============ confessions ============
CREATE TABLE public.confessions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id       uuid NOT NULL,
  display_mode    public.confession_display_mode NOT NULL DEFAULT 'fully_anonymous',
  alias           text,
  avatar_emoji    text,
  category        text NOT NULL DEFAULT 'secrets',
  kind            public.confession_kind NOT NULL DEFAULT 'text',
  text            text NOT NULL DEFAULT '',
  image_url       text,
  poll            jsonb,
  status          public.confession_status NOT NULL DEFAULT 'approved',
  is_pinned       boolean NOT NULL DEFAULT false,
  is_featured     boolean NOT NULL DEFAULT false,
  like_count      integer NOT NULL DEFAULT 0,
  reply_count     integer NOT NULL DEFAULT 0,
  expires_at      timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX confessions_created_at_idx  ON public.confessions (created_at DESC);
CREATE INDEX confessions_category_idx    ON public.confessions (category);
CREATE INDEX confessions_status_idx      ON public.confessions (status);
CREATE INDEX confessions_author_idx      ON public.confessions (author_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.confessions TO authenticated;
GRANT ALL ON public.confessions TO service_role;

ALTER TABLE public.confessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Read visible confessions"
  ON public.confessions FOR SELECT TO authenticated
  USING (
    (status = 'approved' AND (expires_at IS NULL OR expires_at > now()))
    OR author_id = auth.uid()
    OR public.is_admin(auth.uid())
  );

CREATE POLICY "Insert own confession"
  ON public.confessions FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = author_id AND NOT public.is_user_banned(auth.uid()));

CREATE POLICY "Update own confession"
  ON public.confessions FOR UPDATE TO authenticated
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Admins manage confessions"
  ON public.confessions FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Delete own confession"
  ON public.confessions FOR DELETE TO authenticated
  USING (auth.uid() = author_id);

CREATE TRIGGER confessions_updated_at
  BEFORE UPDATE ON public.confessions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ confession_reactions ============
CREATE TABLE public.confession_reactions (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  confession_id  uuid NOT NULL REFERENCES public.confessions(id) ON DELETE CASCADE,
  user_id        uuid NOT NULL,
  type           public.confession_reaction_type NOT NULL,
  created_at     timestamptz NOT NULL DEFAULT now(),
  UNIQUE (confession_id, user_id, type)
);

CREATE INDEX confession_reactions_confession_idx ON public.confession_reactions (confession_id);

GRANT SELECT, INSERT, DELETE ON public.confession_reactions TO authenticated;
GRANT ALL ON public.confession_reactions TO service_role;

ALTER TABLE public.confession_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Read reactions"
  ON public.confession_reactions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Insert own reaction"
  ON public.confession_reactions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Delete own reaction"
  ON public.confession_reactions FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Bump/decrement like_count on the parent confession
CREATE OR REPLACE FUNCTION public.bump_confession_like_count()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.confessions SET like_count = like_count + 1 WHERE id = NEW.confession_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.confessions SET like_count = GREATEST(like_count - 1, 0) WHERE id = OLD.confession_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END $$;

CREATE TRIGGER confession_reactions_count
  AFTER INSERT OR DELETE ON public.confession_reactions
  FOR EACH ROW EXECUTE FUNCTION public.bump_confession_like_count();

-- ============ confession_replies ============
CREATE TABLE public.confession_replies (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  confession_id  uuid NOT NULL REFERENCES public.confessions(id) ON DELETE CASCADE,
  author_id      uuid NOT NULL,
  alias          text,
  avatar_emoji   text,
  is_anonymous   boolean NOT NULL DEFAULT true,
  text           text NOT NULL DEFAULT '',
  created_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX confession_replies_confession_idx ON public.confession_replies (confession_id, created_at);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.confession_replies TO authenticated;
GRANT ALL ON public.confession_replies TO service_role;

ALTER TABLE public.confession_replies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Read replies on visible confessions"
  ON public.confession_replies FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.confessions c
    WHERE c.id = confession_replies.confession_id
      AND (c.status = 'approved' OR c.author_id = auth.uid() OR public.is_admin(auth.uid()))
  ));

CREATE POLICY "Insert own reply"
  ON public.confession_replies FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = author_id AND NOT public.is_user_banned(auth.uid()));

CREATE POLICY "Delete own reply"
  ON public.confession_replies FOR DELETE TO authenticated
  USING (auth.uid() = author_id OR public.is_admin(auth.uid()));

CREATE OR REPLACE FUNCTION public.bump_confession_reply_count()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.confessions SET reply_count = reply_count + 1 WHERE id = NEW.confession_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.confessions SET reply_count = GREATEST(reply_count - 1, 0) WHERE id = OLD.confession_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END $$;

CREATE TRIGGER confession_replies_count
  AFTER INSERT OR DELETE ON public.confession_replies
  FOR EACH ROW EXECUTE FUNCTION public.bump_confession_reply_count();
