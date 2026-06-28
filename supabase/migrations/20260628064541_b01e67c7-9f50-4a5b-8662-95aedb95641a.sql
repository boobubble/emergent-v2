
-- 1) Allow authenticated users to read reactions on approved confessions
CREATE POLICY "Read reactions on approved confessions"
  ON public.confession_reactions
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.confessions c
      WHERE c.id = confession_reactions.confession_id
        AND c.status = 'approved'
    )
  );

-- 2) Move phone/phone_verified out of the public profiles table into an owner-only table
CREATE TABLE IF NOT EXISTS public.user_phones (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  phone text,
  phone_verified boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_phones TO authenticated;
GRANT ALL ON public.user_phones TO service_role;

ALTER TABLE public.user_phones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner reads own phone"
  ON public.user_phones FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Owner writes own phone"
  ON public.user_phones FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Owner updates own phone"
  ON public.user_phones FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Owner deletes own phone"
  ON public.user_phones FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Migrate existing data from profiles
INSERT INTO public.user_phones (user_id, phone, phone_verified)
SELECT id, phone, COALESCE(phone_verified, false)
FROM public.profiles
WHERE phone IS NOT NULL
ON CONFLICT (user_id) DO NOTHING;

-- Replace get_my_phone to read from new table
CREATE OR REPLACE FUNCTION public.get_my_phone()
RETURNS TABLE (phone text, phone_verified boolean)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT phone, phone_verified
  FROM public.user_phones
  WHERE user_id = auth.uid();
$$;

-- Trigger to capture phone from auth signup metadata into the new table
CREATE OR REPLACE FUNCTION public.handle_new_user_phone()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.raw_user_meta_data ? 'phone' AND NULLIF(NEW.raw_user_meta_data->>'phone','') IS NOT NULL THEN
    INSERT INTO public.user_phones (user_id, phone)
    VALUES (NEW.id, NEW.raw_user_meta_data->>'phone')
    ON CONFLICT (user_id) DO UPDATE SET phone = EXCLUDED.phone, updated_at = now();
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS on_auth_user_created_phone ON auth.users;
CREATE TRIGGER on_auth_user_created_phone
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_phone();

-- Drop phone columns from profiles entirely (data preserved in user_phones)
ALTER TABLE public.profiles DROP COLUMN IF EXISTS phone;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS phone_verified;

-- 3) Encrypt webhook signing secrets at rest. Drop plaintext column.
ALTER TABLE public.webhook_endpoints ADD COLUMN IF NOT EXISTS secret_ciphertext text;
ALTER TABLE public.webhook_endpoints DROP COLUMN IF EXISTS secret;
