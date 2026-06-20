ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS about_me text;
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_about_me_length;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_about_me_length CHECK (about_me IS NULL OR char_length(about_me) <= 1000);