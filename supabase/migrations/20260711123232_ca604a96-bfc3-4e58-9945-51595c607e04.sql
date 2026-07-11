GRANT SELECT ON public.profiles TO authenticated, anon;
GRANT ALL ON public.profiles TO service_role;

-- Ensure anon can view public (non-private) profiles via the same intent as the authenticated policy.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename='profiles' AND policyname='Public profiles visible to anon'
  ) THEN
    CREATE POLICY "Public profiles visible to anon"
      ON public.profiles
      FOR SELECT
      TO anon
      USING (COALESCE(is_private, false) = false);
  END IF;
END $$;