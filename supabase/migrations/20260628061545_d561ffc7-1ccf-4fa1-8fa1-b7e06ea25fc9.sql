
-- Add phone, city, interests, and profile completion flag to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS phone_verified boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS city text,
  ADD COLUMN IF NOT EXISTS interests text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS display_name text,
  ADD COLUMN IF NOT EXISTS profile_completed boolean NOT NULL DEFAULT false;

-- Unique phone (case-insensitive, ignoring blanks)
CREATE UNIQUE INDEX IF NOT EXISTS profiles_phone_unique
  ON public.profiles ((lower(phone))) WHERE phone IS NOT NULL AND phone <> '';
