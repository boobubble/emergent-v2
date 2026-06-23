CREATE TABLE public.testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body text NOT NULL CHECK (char_length(btrim(body)) BETWEEN 1 AND 500),
  approved boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT testimonials_no_self CHECK (author_id <> target_user_id),
  CONSTRAINT testimonials_unique_pair UNIQUE (author_id, target_user_id)
);

CREATE INDEX testimonials_target_idx ON public.testimonials (target_user_id, created_at DESC);
CREATE INDEX testimonials_author_idx ON public.testimonials (author_id, created_at DESC);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.testimonials TO authenticated;
GRANT ALL ON public.testimonials TO service_role;

ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can read approved testimonials; author/target can see their own regardless
CREATE POLICY "Read approved or own testimonials" ON public.testimonials
  FOR SELECT TO authenticated
  USING (
    approved = true
    OR author_id = auth.uid()
    OR target_user_id = auth.uid()
  );

-- Authors can write a testimonial about someone else
CREATE POLICY "Authors can create testimonials" ON public.testimonials
  FOR INSERT TO authenticated
  WITH CHECK (author_id = auth.uid() AND author_id <> target_user_id);

-- Authors can edit their own
CREATE POLICY "Authors can update own testimonials" ON public.testimonials
  FOR UPDATE TO authenticated
  USING (author_id = auth.uid())
  WITH CHECK (author_id = auth.uid());

-- Authors or the target can delete
CREATE POLICY "Author or target can delete" ON public.testimonials
  FOR DELETE TO authenticated
  USING (author_id = auth.uid() OR target_user_id = auth.uid());

CREATE TRIGGER update_testimonials_updated_at
  BEFORE UPDATE ON public.testimonials
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
