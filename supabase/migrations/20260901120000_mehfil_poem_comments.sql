-- Poetry Hub comments. Isolated from feed `comments` (which FKs to posts).

CREATE TABLE IF NOT EXISTS public.mehfil_poem_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poem_id UUID NOT NULL REFERENCES public.mehfil_poems(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_comment_id UUID REFERENCES public.mehfil_poem_comments(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT mehfil_poem_comments_text_len CHECK (char_length(btrim(text)) BETWEEN 1 AND 2000)
);

CREATE INDEX IF NOT EXISTS mehfil_poem_comments_poem_idx
  ON public.mehfil_poem_comments (poem_id, created_at);
CREATE INDEX IF NOT EXISTS mehfil_poem_comments_parent_idx
  ON public.mehfil_poem_comments (parent_comment_id);

GRANT SELECT ON public.mehfil_poem_comments TO anon, authenticated;
GRANT INSERT, DELETE ON public.mehfil_poem_comments TO authenticated;
GRANT ALL ON public.mehfil_poem_comments TO service_role;

ALTER TABLE public.mehfil_poem_comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "mehfil_poem_comments public read" ON public.mehfil_poem_comments;
CREATE POLICY "mehfil_poem_comments public read"
  ON public.mehfil_poem_comments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.mehfil_poems p
      WHERE p.id = poem_id AND p.status = 'published'
    )
    OR author_id = auth.uid()
    OR public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'moderator')
  );

DROP POLICY IF EXISTS "mehfil_poem_comments insert own" ON public.mehfil_poem_comments;
CREATE POLICY "mehfil_poem_comments insert own"
  ON public.mehfil_poem_comments FOR INSERT
  TO authenticated
  WITH CHECK (
    author_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.mehfil_poems p
      WHERE p.id = poem_id AND p.status = 'published'
    )
    AND (
      parent_comment_id IS NULL
      OR EXISTS (
        SELECT 1 FROM public.mehfil_poem_comments c
        WHERE c.id = parent_comment_id AND c.poem_id = poem_id
      )
    )
  );

DROP POLICY IF EXISTS "mehfil_poem_comments delete own" ON public.mehfil_poem_comments;
CREATE POLICY "mehfil_poem_comments delete own"
  ON public.mehfil_poem_comments FOR DELETE
  TO authenticated
  USING (author_id = auth.uid());

DROP POLICY IF EXISTS "mehfil_poem_comments staff delete" ON public.mehfil_poem_comments;
CREATE POLICY "mehfil_poem_comments staff delete"
  ON public.mehfil_poem_comments FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));

CREATE OR REPLACE FUNCTION public.bump_mehfil_poem_comment_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.mehfil_poems SET comment_count = comment_count + 1 WHERE id = NEW.poem_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.mehfil_poems SET comment_count = GREATEST(comment_count - 1, 0) WHERE id = OLD.poem_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS mehfil_poem_comments_count ON public.mehfil_poem_comments;
CREATE TRIGGER mehfil_poem_comments_count
AFTER INSERT OR DELETE ON public.mehfil_poem_comments
FOR EACH ROW EXECUTE FUNCTION public.bump_mehfil_poem_comment_count();

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.mehfil_poem_comments;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
