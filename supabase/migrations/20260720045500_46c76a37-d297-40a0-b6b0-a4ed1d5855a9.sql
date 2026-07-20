
-- 1. Add 'wow' to reaction_type enum
ALTER TYPE public.reaction_type ADD VALUE IF NOT EXISTS 'wow';

-- 2. Extend target_type check to permit 'mehfil_poem'
ALTER TABLE public.reactions DROP CONSTRAINT IF EXISTS reactions_target_type_check;
ALTER TABLE public.reactions ADD CONSTRAINT reactions_target_type_check
  CHECK (target_type = ANY (ARRAY['post'::text, 'comment'::text, 'mehfil_poem'::text, 'confession'::text, 'confession_reply'::text]));

-- 3. Public read policy for reactions on published mehfil poems
DROP POLICY IF EXISTS "Anon can read reactions on published mehfil poems" ON public.reactions;
CREATE POLICY "Anon can read reactions on published mehfil poems"
  ON public.reactions FOR SELECT
  USING (
    target_type = 'mehfil_poem'
    AND EXISTS (
      SELECT 1 FROM public.mehfil_poems mp
      WHERE mp.id = reactions.target_id
        AND mp.status = 'published'
    )
  );
